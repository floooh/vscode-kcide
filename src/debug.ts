import {
    ExtensionContext,
    Uri,
    ProviderResult,
    DebugAdapterDescriptor,
    WorkspaceFolder,
    DebugConfiguration,
    CancellationToken,
} from 'vscode';
import {
    DebugSession,
    InitializedEvent,
    StoppedEvent,
    Breakpoint,
    ContinuedEvent,
    TerminatedEvent,
    Scope,
    Thread,
    Source,
} from '@vscode/debugadapter';
import { DebugProtocol } from '@vscode/debugprotocol';
import * as vscode from 'vscode';
// @ts-ignore
import { Subject } from 'await-notify';
import { CPU } from './types';
import { readBinaryFile, readTextFile, getOutputMapFileUri, getOutputKccFileUri } from './filesystem';
import { loadProject, requireProjectUri } from './project';
import * as emu from './emu';

interface ILaunchRequestArguments extends DebugProtocol.LaunchRequestArguments {
    stopOnEntry: boolean,
};

interface IAttachRequestArguments extends ILaunchRequestArguments { };

interface ISourceRuntimeBreakpoint {
    id: number,
    path: string,
    workspaceRelativePath: string,
    source: Source,
    line: number,
    addr?: number,    // maybe undefined if breakpoint address is not in source map
    verified: boolean,
};

interface IInstructionRuntimeBreakpoint {
    id: number,
    path?: string,
    workspaceRelativePath?: string,
    source?: Source,
    line?: number,
    addr: number,
};

function toUint8String(val: number, noPrefix?: boolean): string {
    const str = val.toString(16).padStart(2, '0').toUpperCase();
    return noPrefix ? str : `0x${str}`;
}

function toUint16String(val: number, noPrefix?: boolean): string {
    const str = val.toString(16).padStart(4, '0').toUpperCase();
    return noPrefix ? str: `0x${str}`;
}

export function activate(ext: ExtensionContext) {
    ext.subscriptions.push(
        vscode.debug.registerDebugAdapterDescriptorFactory('kcide', new KCIDEDebugAdapterFactory()),
    );
}

export function start(noDebug: boolean) {
    vscode.debug.startDebugging(undefined, {
        type: 'kcide',
        name: 'Debug',
        request: 'launch',
        stopOnEntry: !noDebug,
    },
    {
        noDebug
    });
}

class KCIDEDebugAdapterFactory implements vscode.DebugAdapterDescriptorFactory {
    createDebugAdapterDescriptor(_session: vscode.DebugSession): ProviderResult<DebugAdapterDescriptor> {
        return new vscode.DebugAdapterInlineImplementation(new KCIDEDebugSession());
    }
}

export class KCIDEDebugSession extends DebugSession {

    private static self: KCIDEDebugSession | undefined = undefined;
    private static readonly wasmFsRoot = '/workspace/';
    private static readonly threadId = 1;
    private nativeFsRoot = '';
    private curStackFrameId: number = 1;
    private configurationDone = new Subject();
    private mapSourceToAddr: Record<string, Array<number>> = {};
    private mapAddrToSource: Array<{ source: string, line: number }> = [];
    private sourceBreakpoints: Array<ISourceRuntimeBreakpoint> = [];
    private instrBreakpoints: Array<IInstructionRuntimeBreakpoint> = [];
    private breakpointId: number = 1;
    private curAddr: number | undefined = undefined;

    public constructor() {
        super();
        KCIDEDebugSession.self = this;
        this.nativeFsRoot = requireProjectUri().path + '/';
    }

    public static onEmulatorMessage(msg: any) {
        console.log(`KCIDEDebugSession.onEmulatorMessage: ${JSON.stringify(msg)}`);
        if (KCIDEDebugSession.self === undefined) {
            console.log('KCIDEDebugRuntime.onEmulatorMessage: self is undefined');
            return;
        }
        // see media/shell.js/init()
        switch (msg.command) {
            case 'emu_stopped':
                KCIDEDebugSession.self.onEmulatorStopped(msg.stopReason, msg.addr);
                break;
            case 'emu_continued':
                KCIDEDebugSession.self.onEmulatorContinued();
                break;
        }
    }

    protected initializeRequest(response: DebugProtocol.InitializeResponse, _args: DebugProtocol.InitializeRequestArguments) {
        console.log('=> KCIDEDebugSession.initializeRequest');
        response.body = response.body ?? {};
        response.body.supportsDisassembleRequest = true;
        response.body.supportsInstructionBreakpoints = true;
        response.body.supportsConfigurationDoneRequest = true;
        response.body.supportTerminateDebuggee = true;
        this.sendResponse(response);
    }

    protected configurationDoneRequest(response: DebugProtocol.ConfigurationDoneResponse, args: DebugProtocol.ConfigurationDoneArguments): void {
        super.configurationDoneRequest(response, args);
        this.configurationDone.notify();
    }

    protected async disconnectRequest(response: DebugProtocol.DisconnectResponse, args: DebugProtocol.DisconnectArguments, _request?: DebugProtocol.Request) {
        console.log(`=> KCIDEDebugSession.disconnectRequest suspend: ${args.suspendDebuggee}, terminate: ${args.terminateDebuggee}`);
        await emu.dbgDisconnect();
        this.sendResponse(response);
    }

    protected async attachRequest(response: DebugProtocol.AttachResponse, args: IAttachRequestArguments) {
        console.log('=> KCIDEDebugSession.attachRequest');
        await this.launchRequest(response, args);
    }

    protected async launchRequest(response: DebugProtocol.LaunchResponse, args: ILaunchRequestArguments) {
        console.log('=> KCIDEDebugSession.launchRequest');
        try {
            const project = await loadProject();
            const kccUri = getOutputKccFileUri(project);
            const mapUri = getOutputMapFileUri(project);
            await this.loadMapFile(mapUri);
            await emu.ensureEmulator(project);
            await emu.waitReady(5000);
            await emu.dbgConnect();
            // we're ready to receive breakpoints now
            this.sendEvent(new InitializedEvent());
            // wait until breakpoints are configured
            await this.configurationDone.wait();
            const kcc = await readBinaryFile(kccUri);
            await emu.loadKcc(kcc, true, args.stopOnEntry);
        } catch (err) {
            const msg = `Failed to launch debug session (${err})`;
            vscode.window.showErrorMessage(msg);
            response.success = false;
            response.message = msg;
        }
        this.sendResponse(response);
    }

    protected async setBreakPointsRequest(
        response: DebugProtocol.SetBreakpointsResponse,
        args: DebugProtocol.SetBreakpointsArguments,
        _request?: DebugProtocol.Request | undefined
    ) {
        console.log('=> KCIDEDebugSession.setBreakpointsRequest');
        const path = Uri.file(args.source.path!).path;
        const clearedBreakpoints = this.clearSourceBreakpointsByPath(path);
        const clientLines = args.breakpoints!.map((bp) => bp.line);
        const debugProtocolBreakpoints = clientLines.map<DebugProtocol.Breakpoint>((l) => {
            const bp = this.addSourceBreakpoint(path, l);
            const source = this.sourceFromPath(bp.path);
            const protocolBreakpoint = new Breakpoint(bp.verified, bp.line, 0, source) as DebugProtocol.Breakpoint;
            protocolBreakpoint.id = bp.id;
            return bp;
        });
        response.body = { breakpoints: debugProtocolBreakpoints };
        const removeAddrs = clearedBreakpoints.filter((bp) => (bp.addr !== undefined)).map((bp) => bp.addr!);
        const addAddrs = this.getSourceBreakpointsByPath(path).filter((bp) => (bp.addr !== undefined)).map((bp) => bp.addr!);
        await emu.dbgUpdateBreakpoints(removeAddrs, addAddrs);
        this.sendResponse(response);
    }

    protected async setInstructionBreakpointsRequest(
        response: DebugProtocol.SetInstructionBreakpointsResponse,
        args: DebugProtocol.SetInstructionBreakpointsArguments,
        _request?: DebugProtocol.Request | undefined
    ) {
        console.log('=> KCIDEDebugSession.setInstructionBreakpointsRequest');
        const clearedBreakpoints = this.clearInstructionBreakpoints();
        const debugProtocolBreakpoints = args.breakpoints.map((ibp) => {
            const bp = this.addInstructionBreakpoint(ibp.instructionReference, ibp.offset ?? 0);
            const source = this.sourceFromPathOptional(bp.path);
            const protocolBreakpoint = new Breakpoint(true, bp.line, 0, source) as DebugProtocol.Breakpoint;
            protocolBreakpoint.id = bp.id;
            if (bp.addr !== undefined) {
                protocolBreakpoint.instructionReference = toUint16String(bp.addr);
            }
            return protocolBreakpoint;
        });
        response.body = { breakpoints: debugProtocolBreakpoints };
        const removeAddrs = clearedBreakpoints.filter((bp) => (bp.addr !== 0)).map((bp) => bp.addr!);
        const addAddrs = this.instrBreakpoints.map((bp) => bp.addr!);
        await emu.dbgUpdateBreakpoints(removeAddrs, addAddrs);
        this.sendResponse(response);
    }

    protected async pauseRequest(
        response: DebugProtocol.PauseResponse,
        _args: DebugProtocol.PauseArguments,
        _request?: DebugProtocol.Request | undefined
    ) {
        console.log('=> KCIDEDebugSession.pauseRequest');
        await emu.dbgPause();
        this.sendResponse(response);
    }

    protected async continueRequest(response: DebugProtocol.ContinueResponse, _args: DebugProtocol.ContinueArguments) {
        console.log('=> KCIDEDebugSession.continueRequest');
        await emu.dbgContinue();
        this.sendResponse(response);
    }

    protected async nextRequest(response: DebugProtocol.NextResponse, _args: DebugProtocol.NextArguments) {
        console.log('=> KCIDEDebugSession.nextRequest');
        await emu.dbgStep();
        this.sendResponse(response);
    }

    protected async stepInRequest(
        response: DebugProtocol.StepInResponse,
        _args: DebugProtocol.StepInArguments,
        _request?: DebugProtocol.Request | undefined
    ) {
        console.log('=> KCIDEDebusSession.stepInRequest');
        await emu.dbgStepIn();
        this.sendResponse(response);
    }

    protected async stepOutRequest(response: DebugProtocol.StepOutResponse, _args: DebugProtocol.StepOutArguments) {
        console.log('=> KCIDEDebugSession.stepOutRequest');
        // FIXME: stepOut is not implemented, just do a regular step instead
        await emu.dbgStep();
        this.sendResponse(response);
    }

    protected threadsRequest(response: DebugProtocol.ThreadsResponse): void {
        console.log('=> KCIDEDebugSession.threadsRequest');
        response.body = {
            threads: [
                new Thread(KCIDEDebugSession.threadId, 'Thread 1'),
            ]
        };
        this.sendResponse(response);
    }

    protected stackTraceRequest(
        response: DebugProtocol.StackTraceResponse,
        _args: DebugProtocol.StackTraceArguments,
        _request?: DebugProtocol.Request | undefined
    ) {
        console.log('=> KCIDEDebugSession.stackTraceRequest');
        const curLocation = this.getCurrentLocation();
        if (curLocation === undefined) {
            this.curStackFrameId += 1;
            const addrStr = toUint16String(this.curAddr!);
            response.body = {
                stackFrames: [
                    {
                        id: this.curStackFrameId,
                        name: addrStr,
                        source: new Source('Unknown Source'),
                        line: 0,
                        column: 0,
                        instructionPointerReference: addrStr,
                        presentationHint: 'subtle',
                    }
                ],
                totalFrames: 1,
            };
        } else {
            this.curStackFrameId += 1;
            const addrStr = toUint16String(curLocation.addr);
            response.body = {
                stackFrames: [
                    {
                        id: this.curStackFrameId,
                        name: addrStr,
                        source: this.sourceFromPathOptional(curLocation.path),
                        line: curLocation.line,
                        instructionPointerReference: addrStr,
                        column: 0,
                    },
                ],
                totalFrames: 1,
            };
        }
        this.sendResponse(response);
    }

    protected async scopesRequest(response: DebugProtocol.ScopesResponse, _args: DebugProtocol.ScopesArguments) {
        console.log('=> KCIDEDebugSession.scopesRequest');
        response.body = {
            scopes: [
                new Scope('CPU', 1, false)
            ]
        };
        this.sendResponse(response);
        await this.openDisassemblyViewIfStoppedInUnmappedLocation();
    }

    protected async variablesRequest(
        response: DebugProtocol.VariablesResponse,
        _args: DebugProtocol.VariablesArguments,
        _request?: DebugProtocol.Request
    ) {
        console.log('=> KCIDEDebugSession.variablesRequest');
        const cpuState = await emu.dbgCpuState();
        const toUint16Var = (name: string, val: number): DebugProtocol.Variable => ({
            name,
            value: toUint16String(val),
            variablesReference: 0,
        });
        const toUint8Var = (name: string, val: number): DebugProtocol.Variable => ({
            name,
            value: toUint8String(val),
            variablesReference: 0,
        });
        const toBoolVar = (name: string, val: number): DebugProtocol.Variable => ({
            name,
            value: (val !== 0) ? 'true' : 'false',
            variablesReference: 0,
        });
        const toCpuFlags = (name: string, val: number): DebugProtocol.Variable => {
            const f = val & 0xFF;
            const z80Flags = (f: number): string => {
                return [
                    (f & (1<<7)) ? 'S' : '-',
                    (f & (1<<6)) ? 'Z' : '-',
                    (f & (1<<5)) ? 'Y' : '-',
                    (f & (1<<4)) ? 'H' : '-',
                    (f & (1<<3)) ? 'X' : '-',
                    (f & (1<<2)) ? 'V' : '-',
                    (f & (1<<1)) ? 'N' : '-',
                    (f & (1<<0)) ? 'C' : '-',
                ].join('');
            };
            /*
            const m6502Flags = (f: number): string => {
                return [
                    (f & (1<<7)) ? 'N' : '-',
                    (f & (1<<6)) ? 'V' : '-',
                    (f & (1<<5)) ? 'X' : '-',
                    (f & (1<<4)) ? 'B' : '-',
                    (f & (1<<3)) ? 'D' : '-',
                    (f & (1<<2)) ? 'I' : '-',
                    (f & (1<<1)) ? 'Z' : '-',
                    (f & (1<<0)) ? 'C' : '-',
                ].join('');
            };
            */
            // FIXME: Z80 vs 6502
            return {
                name,
                value: z80Flags(f),
                variablesReference: 0,
            };
        };
        if (cpuState.type === CPU.Z80) {
            // try/catch just in case cpuState isn't actually a proper CPUState object
            try {
                response.body = {
                    variables: [
                        toCpuFlags('Flags', cpuState.z80.af),
                        toUint16Var('AF', cpuState.z80.af),
                        toUint16Var('BC', cpuState.z80.bc),
                        toUint16Var('DE', cpuState.z80.de),
                        toUint16Var('HL', cpuState.z80.hl),
                        toUint16Var('IX', cpuState.z80.ix),
                        toUint16Var('IY', cpuState.z80.iy),
                        toUint16Var('SP', cpuState.z80.sp),
                        toUint16Var('PC', cpuState.z80.pc),
                        toUint16Var('AF\'', cpuState.z80.af2),
                        toUint16Var('BC\'', cpuState.z80.bc2),
                        toUint16Var('DE\'', cpuState.z80.de2),
                        toUint16Var('HL\'', cpuState.z80.hl2),
                        toUint8Var('IM', cpuState.z80.im),
                        toUint8Var('I', (cpuState.z80.ir & 0xFF00)>>8),
                        toUint8Var('R', cpuState.z80.ir & 0xFF),
                        toBoolVar('IFF1', cpuState.z80.iff & 1),
                        toBoolVar('IFF2', cpuState.z80.iff & 2)
                    ]
                };
            } catch (err) {
                response.body = { variables: [] };
            }
        } else {
            response.body = { variables: [] };
        }
        this.sendResponse(response);
    }

    protected async disassembleRequest(
        response: DebugProtocol.DisassembleResponse,
        args: DebugProtocol.DisassembleArguments,
        _request?: DebugProtocol.Request | undefined
    ) {
        const cursorAddr = parseInt(args.memoryReference);
        const offset = args.instructionOffset ?? 0;
        const count = args.instructionCount;
        const disasmLines = await emu.requestDisassembly(cursorAddr, offset, count);
        const instructions = disasmLines.map<DebugProtocol.DisassembledInstruction>((line) => {
            const loc = this.getLocationByAddr(line.addr);
            return {
                // NOTE: make sure the address string starts with `0x`, otherwise the
                // VSCode debugger view will get confused and skip those lines
                address: toUint16String(line.addr),
                instructionBytes: line.bytes.map((byte) => toUint8String(byte, true)).join(' '),
                instruction: line.chars,
                location: this.sourceFromPathOptional(loc?.path),
                line: (loc === undefined) ? undefined : loc.line,
            };
        });
        response.body = { instructions };
        this.sendResponse(response);
    }

    private async loadMapFile(uri: Uri) {
        const lines = await readTextFile(uri);
        const wasmFsRootIndex = KCIDEDebugSession.wasmFsRoot.length;
        lines.split('\n').forEach((line) => {
            const parts = line.trim().split(':');
            if (parts.length !== 3) {
                return;
            }
            // removing leading '/workspace/'
            const pathStr = parts[0].slice(wasmFsRootIndex);
            const lineNr = parseInt(parts[1]);
            const addr = parseInt(parts[2]);
            if (this.mapSourceToAddr[pathStr] === undefined) {
                this.mapSourceToAddr[pathStr] = [];
            }
            if (this.mapSourceToAddr[pathStr][lineNr] === undefined) {
                this.mapSourceToAddr[pathStr][lineNr] = addr;
            }
            this.mapAddrToSource[addr] = { source: pathStr, line: lineNr };
        });
    }

    private getLocationByAddr(addr: number): { path: string, line: number, addr: number } | undefined {
        const loc = this.mapAddrToSource[addr];
        if (loc === undefined) {
            return undefined;
        }
        return {
            path: this.nativeFsRoot + loc.source,
            line: loc.line,
            addr,
        };
    }

    private getWorkspaceRelativePath(path: string): string {
        // Windows is inconsistant with device letter casing
        if (path.toLowerCase().startsWith(this.nativeFsRoot.toLowerCase())) {
            return path.slice(this.nativeFsRoot.length);
        } else {
            // FIXME: should this be a hard error?
            console.log(`KCIDEDebugSession.getWorkspaceRelative(): incoming path ${path} doesn't start with ${this.nativeFsRoot}`);
            return path;
        }
    }

    private sourceFromPath(path: string): Source {
        const name = this.getWorkspaceRelativePath(path);
        return new Source(name, path, 0);
    }

    private sourceFromPathOptional(path: string | undefined): Source | undefined {
        if (path === undefined) {
            return undefined;
        }
        return this.sourceFromPath(path);
    }

    private getCurrentLocation(): { path: string, line: number, addr: number } | undefined {
        if (this.curAddr === undefined) {
            return undefined;
        }
        return this.getLocationByAddr(this.curAddr);
    }

    private clearSourceBreakpointsByPath(path: string): ISourceRuntimeBreakpoint[] {
        const clearedBreakpoints = this.sourceBreakpoints.filter((bp) => (bp.path === path));
        this.sourceBreakpoints = this.sourceBreakpoints.filter((bp) => (bp.path !== path));
        return clearedBreakpoints;
    }

    private getSourceBreakpointsByPath(path: string): ISourceRuntimeBreakpoint[] {
        return this.sourceBreakpoints.filter((bp) => (bp.path === path));
    }

    private addSourceBreakpoint(path: string, line: number): ISourceRuntimeBreakpoint {
        const workspaceRelativePath = this.getWorkspaceRelativePath(path);
        let addr = undefined;
        if (this.mapSourceToAddr[workspaceRelativePath] !== undefined) {
            addr = this.mapSourceToAddr[workspaceRelativePath][line] ?? undefined;
        }
        const bp: ISourceRuntimeBreakpoint = {
            verified: addr !== undefined,
            path,
            workspaceRelativePath,
            source: this.sourceFromPath(path),
            line,
            addr,
            id: this.breakpointId++
        };
        this.sourceBreakpoints.push(bp);
        return bp;
    }

    private clearInstructionBreakpoints(): IInstructionRuntimeBreakpoint[] {
        const clearedBreakpoints = this.instrBreakpoints;
        this.instrBreakpoints = [];
        return clearedBreakpoints;
    }

    private addInstructionBreakpoint(instructionReference: string, offset: number): IInstructionRuntimeBreakpoint {
        const addr = parseInt(instructionReference) + offset;
        let workspaceRelativePath;
        let path;
        let line;
        if (this.mapAddrToSource[addr]) {
            workspaceRelativePath = this.mapAddrToSource[addr].source;
            path = this.nativeFsRoot + workspaceRelativePath,
            line = this.mapAddrToSource[addr].line;
        }
        const bp: IInstructionRuntimeBreakpoint = {
            path,
            workspaceRelativePath,
            source: this.sourceFromPathOptional(path),
            line,
            addr,
            id: this.breakpointId++,
        };
        this.instrBreakpoints.push(bp);
        return bp;
    }

    private onEmulatorStopped(stopReason: number, addr: number) {
        this.curAddr = addr;
        switch (stopReason) {
            case 1: // WEBAPI_STOPREASON_BREAK
                this.sendEvent(new StoppedEvent('pause', KCIDEDebugSession.threadId));
                break;
            case 2: // WEBAPI_STOPREASON_BREAKPOINT
                this.sendEvent(new StoppedEvent('breakpoint', KCIDEDebugSession.threadId));
                break;
            case 3: // WEBAPI_STOPREASON_STEP
                this.sendEvent(new StoppedEvent('step', KCIDEDebugSession.threadId));
                break;
            case 4: // WEBAPI_STOPREASON_ENTRY
                this.sendEvent(new StoppedEvent('entry', KCIDEDebugSession.threadId));
                break;
            case 5: // WEBAPI_STOPREASON_EXIT
                this.sendEvent(new TerminatedEvent());
                break;
        }
    }

    private onEmulatorContinued() {
        this.sendEvent(new ContinuedEvent(KCIDEDebugSession.threadId));
    }

    // this is a bit of a hack to automatically open the disassembly view when the debugger
    // is stopped in an unknown location
    private async openDisassemblyViewIfStoppedInUnmappedLocation() {
        if ((this.curAddr !== undefined) && (this.mapAddrToSource[this.curAddr] === undefined)) {
            await vscode.commands.executeCommand('debug.action.openDisassemblyView');
            const tabs = vscode.window.tabGroups.all.map(tg => tg.tabs).flat();
            const index = tabs.findIndex((tab) => tab.label === 'Unknown Source');
            if (index !== -1) {
                await vscode.window.tabGroups.close(tabs[index]);
            }
        }
    }
}
