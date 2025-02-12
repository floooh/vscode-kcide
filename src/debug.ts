import {
    ExtensionContext,
    Uri,
    ProviderResult,
    DebugAdapterDescriptor,
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
import { CPU, SourceMap } from './types';
import { readBinaryFile, readTextFile, getOutputMapFileUri, getOutputBinFileUri } from './filesystem';
import { loadProject, requireProjectUri } from './project';
import { loadSourceMap } from './assembler';
import * as emu from './emu';

interface ILaunchRequestArguments extends DebugProtocol.LaunchRequestArguments {
    stopOnEntry: boolean,
};

interface IAttachRequestArguments extends ILaunchRequestArguments { };

interface ISourceRuntimeBreakpoint {
    id: number,
    uri: Uri,
    workspaceRelativePath: string,
    source: Source,
    line: number,
    addr?: number,    // maybe undefined if breakpoint address is not in source map
    verified: boolean,
};

interface IInstructionRuntimeBreakpoint {
    id: number,
    uri?: Uri,
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

function uriEqual(uri0: Uri, uri1: Uri): boolean {
    return String(uri0).toLowerCase() === String(uri1).toLowerCase();
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
    private nativeFsRoot: Uri;
    private curStackFrameId: number = 1;
    private configurationDone = new Subject();
    private sourceMap: SourceMap | undefined = undefined;
    private sourceBreakpoints: Array<ISourceRuntimeBreakpoint> = [];
    private instrBreakpoints: Array<IInstructionRuntimeBreakpoint> = [];
    private breakpointId: number = 1;
    private curAddr: number | undefined = undefined;

    public constructor() {
        super();
        KCIDEDebugSession.self = this;
        this.nativeFsRoot = requireProjectUri();
        console.log(`debug: nativeFsRoot is ${this.nativeFsRoot}`);
    }

    public static onEmulatorMessage(msg: any) {
        console.log(`KCIDEDebugSession.onEmulatorMessage: ${JSON.stringify(msg)}`);
        if (KCIDEDebugSession.self === undefined) {
            console.log('KCIDEDebugRuntime.onEmulatorMessage: self is undefined (not an error)');
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
            case 'emu_reboot':
                KCIDEDebugSession.self.onEmulatorReboot();
                break;
            case 'emu_reset':
                KCIDEDebugSession.self.onEmulatorReset();
                break;

        }
    }

    protected initializeRequest(response: DebugProtocol.InitializeResponse, _args: DebugProtocol.InitializeRequestArguments) {
        console.log('=> KCIDEDebugSession.initializeRequest');
        response.body = response.body ?? {};
        response.body.supportsReadMemoryRequest = true;
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
        try {
            await emu.dbgDisconnect();
        } catch (err) {
            vscode.window.showErrorMessage(String(err));
        }
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
            const binUri = getOutputBinFileUri(project);
            this.sourceMap = await loadSourceMap(project, KCIDEDebugSession.wasmFsRoot.length);
            await emu.ensureEmulator(project);
            await emu.waitReady(5000);
            await emu.dbgConnect();
            // we're ready to receive breakpoints now
            this.sendEvent(new InitializedEvent());
            // wait until breakpoints are configured
            await this.configurationDone.wait();
            const binData = await readBinaryFile(binUri);
            await emu.load(project, binData, true, args.stopOnEntry);
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
        console.log(`=> KCIDEDebugSession.setBreakpointsRequest: args.source.path=${args.source.path}`);
        try {
            // ugly Windows specific hack: if the source path starts with a drive
            // letter, force file:// URL
            const p = args.source.path!;
            let uri;
            if (p.slice(1).startsWith(':\\')) {
                uri = Uri.file(p);
            } else {
                uri = Uri.parse(p, false);
            }
            const clearedBreakpoints = this.clearSourceBreakpointsByUri(uri);
            const clientLines = args.breakpoints!.map((bp) => bp.line);
            const debugProtocolBreakpoints = clientLines.map<DebugProtocol.Breakpoint>((l) => {
                const bp = this.addSourceBreakpoint(uri, l);
                const source = this.sourceFromUri(bp.uri);
                const protocolBreakpoint = new Breakpoint(bp.verified, bp.line, 0, source) as DebugProtocol.Breakpoint;
                protocolBreakpoint.id = bp.id;
                return bp;
            });
            response.body = { breakpoints: debugProtocolBreakpoints };
            const removeAddrs = clearedBreakpoints.filter((bp) => (bp.addr !== undefined)).map((bp) => bp.addr!);
            const addAddrs = this.getSourceBreakpointsByUri(uri).filter((bp) => (bp.addr !== undefined)).map((bp) => bp.addr!);
            await emu.dbgUpdateBreakpoints(removeAddrs, addAddrs);
        } catch(err) {
            vscode.window.showErrorMessage(String(err));
        }
        this.sendResponse(response);
    }

    protected async setInstructionBreakpointsRequest(
        response: DebugProtocol.SetInstructionBreakpointsResponse,
        args: DebugProtocol.SetInstructionBreakpointsArguments,
        _request?: DebugProtocol.Request | undefined
    ) {
        console.log('=> KCIDEDebugSession.setInstructionBreakpointsRequest');
        try {
            const clearedBreakpoints = this.clearInstructionBreakpoints();
            const debugProtocolBreakpoints = args.breakpoints.map((ibp) => {
                const bp = this.addInstructionBreakpoint(ibp.instructionReference, ibp.offset ?? 0);
                const source = this.sourceFromUriOptional(bp.uri);
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
        } catch (err) {
            vscode.window.showErrorMessage(String(err));
        }
        this.sendResponse(response);
    }

    protected async pauseRequest(
        response: DebugProtocol.PauseResponse,
        _args: DebugProtocol.PauseArguments,
        _request?: DebugProtocol.Request | undefined
    ) {
        console.log('=> KCIDEDebugSession.pauseRequest');
        try {
            await emu.dbgPause();
        } catch (err) {
            vscode.window.showErrorMessage(String(err));
        }
        this.sendResponse(response);
    }

    protected async continueRequest(response: DebugProtocol.ContinueResponse, _args: DebugProtocol.ContinueArguments) {
        console.log('=> KCIDEDebugSession.continueRequest');
        try {
            await emu.dbgContinue();
        } catch (err) {
            vscode.window.showErrorMessage(String(err));
        }
        this.sendResponse(response);
    }

    protected async nextRequest(response: DebugProtocol.NextResponse, _args: DebugProtocol.NextArguments) {
        console.log('=> KCIDEDebugSession.nextRequest');
        try {
            await emu.dbgStep();
        } catch (err) {
            vscode.window.showErrorMessage(String(err));
        }
        this.sendResponse(response);
    }

    protected async stepInRequest(
        response: DebugProtocol.StepInResponse,
        _args: DebugProtocol.StepInArguments,
        _request?: DebugProtocol.Request | undefined
    ) {
        console.log('=> KCIDEDebusSession.stepInRequest');
        try {
            await emu.dbgStepIn();
        } catch (err) {
            vscode.window.showErrorMessage(String(err));
        }
        this.sendResponse(response);
    }

    protected async stepOutRequest(response: DebugProtocol.StepOutResponse, _args: DebugProtocol.StepOutArguments) {
        console.log('=> KCIDEDebugSession.stepOutRequest');
        try {
            // FIXME: stepOut is not implemented, just do a regular step instead
            await emu.dbgStep();
        } catch (err) {
            vscode.window.showErrorMessage(String(err));
        }
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
                        source: this.sourceFromUriOptional(curLocation.uri),
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
            memoryReference: toUint16String(val),
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
            return {
                name,
                value: (cpuState.type === CPU.Z80) ? z80Flags(f) : m6502Flags(f),
                variablesReference: 0,
            };
        };
        try {
            // try/catch just in case cpuState isn't actually a proper CPUState object
            if (cpuState.type === CPU.Z80) {
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
            } else if (cpuState.type === CPU.M6502) {
                response.body = {
                    variables: [
                        toCpuFlags('Flags', cpuState.m6502.p),
                        toUint8Var('A', cpuState.m6502.a),
                        toUint8Var('X', cpuState.m6502.x),
                        toUint8Var('Y', cpuState.m6502.y),
                        toUint8Var('S', cpuState.m6502.s),
                        toUint8Var('P', cpuState.m6502.p),
                        toUint16Var('PC', cpuState.m6502.pc),
                    ]
                };
            } else {
                response.body = { variables: [] };
            }
        } catch (err) {
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
                location: this.sourceFromUriOptional(loc?.uri),
                line: (loc === undefined) ? undefined : loc.line,
            };
        });
        response.body = { instructions };
        this.sendResponse(response);
    }

    protected async readMemoryRequest(
        response: DebugProtocol.ReadMemoryResponse,
        args: DebugProtocol.ReadMemoryArguments,
        _request?: DebugProtocol.Request | undefined
    ) {
        const addr = parseInt(args.memoryReference);
        const offset = args.offset ?? 0;
        const numBytes = args.count;
        const bytes = await emu.readMemory(addr, offset, numBytes);
        response.body = {
            address: toUint16String(bytes.addr),
            data: bytes.base64Data,
        };
        this.sendResponse(response);
    }

    private getLocationByAddr(addr: number): { uri: Uri, line: number, addr: number } | undefined {
        if (this.sourceMap === undefined) {
            throw new Error('No source map loaded!');
        }
        const loc = this.sourceMap.addrToSource[addr];
        if (loc === undefined) {
            return undefined;
        }
        return {
            uri: Uri.joinPath(this.nativeFsRoot, loc.source),
            line: loc.line,
            addr,
        };
    }

    private getWorkspaceRelativePath(uri: Uri): string {
        console.log(`KCIDEDebugSession.getWorkspaceRelativePath(${uri})`);
        const path = uri.path;
        const rootPath = this.nativeFsRoot.path;
        console.log(`KCIDEDebugSession.getWorkspaceRelativePath(): path=${path}, rootPath=${rootPath}`);
        // Windows is inconsistant with device letter casing
        if (path.toLowerCase().startsWith(rootPath.toLowerCase())) {
            return path.slice(rootPath.length + 1);
        } else {
            // FIXME: should this be a hard error?
            console.log(`KCIDEDebugSession.getWorkspaceRelativePath(): incoming uri path ${path} doesn't start with ${rootPath}`);
            return path;
        }
    }

    private sourceFromUri(uri: Uri): Source {
        console.log(`KCIDEDebugSession.sourceFromUri(${uri})`);
        const name = this.getWorkspaceRelativePath(uri);
        return new Source(name, String(uri), 0);
    }

    private sourceFromUriOptional(uri: Uri | undefined): Source | undefined {
        if (uri === undefined) {
            return undefined;
        }
        return this.sourceFromUri(uri);
    }

    private getCurrentLocation(): { uri: Uri, line: number, addr: number } | undefined {
        if (this.curAddr === undefined) {
            return undefined;
        }
        return this.getLocationByAddr(this.curAddr);
    }

    private clearSourceBreakpointsByUri(uri: Uri): ISourceRuntimeBreakpoint[] {
        const clearedBreakpoints = this.sourceBreakpoints.filter((bp) => uriEqual(bp.uri, uri));
        this.sourceBreakpoints = this.sourceBreakpoints.filter((bp) => !uriEqual(bp.uri, uri));
        return clearedBreakpoints;
    }

    private getSourceBreakpointsByUri(uri: Uri): ISourceRuntimeBreakpoint[] {
        return this.sourceBreakpoints.filter((bp) => uriEqual(bp.uri, uri));
    }

    private addSourceBreakpoint(uri: Uri, line: number): ISourceRuntimeBreakpoint {
        if (this.sourceMap === undefined) {
            throw new Error('No source map loaded!');
        }
        const workspaceRelativePath = this.getWorkspaceRelativePath(uri);
        let addr = undefined;
        if (this.sourceMap.sourceToAddr[workspaceRelativePath] !== undefined) {
            addr = this.sourceMap.sourceToAddr[workspaceRelativePath][line] ?? undefined;
        }
        const bp: ISourceRuntimeBreakpoint = {
            verified: addr !== undefined,
            uri,
            workspaceRelativePath,
            source: this.sourceFromUri(uri),
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
        if (this.sourceMap === undefined) {
            throw new Error('No source map loaded!');
        }
        const addr = parseInt(instructionReference) + offset;
        let workspaceRelativePath;
        let uri;
        let line;
        if (this.sourceMap.addrToSource[addr]) {
            workspaceRelativePath = this.sourceMap.addrToSource[addr].source;
            uri = Uri.joinPath(this.nativeFsRoot, workspaceRelativePath);
            line = this.sourceMap.addrToSource[addr].line;
        }
        const bp: IInstructionRuntimeBreakpoint = {
            uri,
            workspaceRelativePath,
            source: this.sourceFromUriOptional(uri),
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

    private onEmulatorReboot() {
        this.sendEvent(new TerminatedEvent());
    }

    private onEmulatorReset() {
        this.sendEvent(new TerminatedEvent());
    }

    // this is a bit of a hack to automatically open the disassembly view when the debugger
    // is stopped in an unknown location
    private async openDisassemblyViewIfStoppedInUnmappedLocation() {
        if (this.sourceMap === undefined) {
            throw new Error('No source map loaded!');
        }
        if ((this.curAddr !== undefined) && (this.sourceMap.addrToSource[this.curAddr] === undefined)) {
            await vscode.commands.executeCommand('debug.action.openDisassemblyView');
            const tabs = vscode.window.tabGroups.all.map(tg => tg.tabs).flat();
            const index = tabs.findIndex((tab) => tab.label === 'Unknown Source');
            if (index !== -1) {
                await vscode.window.tabGroups.close(tabs[index]);
            }
        }
    }
}
