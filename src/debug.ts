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
    Scope,
    Thread,
} from '@vscode/debugadapter';
import { DebugProtocol } from '@vscode/debugprotocol';
import * as vscode from 'vscode';
// @ts-ignore
import { Subject } from 'await-notify';
import { Project, CPU, CPUState } from './types';
import { readBinaryFile, readTextFile, getOutputMapFileUri, getOutputKccFileUri } from './filesystem';
import { requireProjectUri, loadProject } from './project';
import * as emu from './emu';

interface ILaunchRequestArguments extends DebugProtocol.LaunchRequestArguments {
    /** whether to stop on entry */
    stopOnEntry: boolean,
};

interface IAttachRequestArguments extends ILaunchRequestArguments { };

interface IRuntimeBreakpoint {
    id: number,
    path: string,
    workspaceRelativePath: string,
    line: number,
    addr: number | null,    // maybe null if breakpoint address is not in source map
    verified: boolean,
};

export function activate(ext: ExtensionContext) {
    ext.subscriptions.push(
        vscode.debug.registerDebugAdapterDescriptorFactory('kcide', new KCIDEDebugAdapterFactory()),
        vscode.debug.registerDebugConfigurationProvider('kcide', {
            resolveDebugConfiguration(_folder: WorkspaceFolder | undefined, config: DebugConfiguration, _token?: CancellationToken): ProviderResult<DebugConfiguration> {
                // if launch.json is missing or empty and this is a kcide.project.json project
                // FIXME: should we check for kcide.project.json instead?
                if ((config.type === undefined) && (config.request === undefined) && (config.name === undefined)) {
                    const editor = vscode.window.activeTextEditor;
                    if (editor && (editor.document.languageId === 'asm')) {
                        config.type = 'kcide';
                        config.request = 'launch';
                        config.name = 'Debug (Stop on Entry)';
                        config.stopOnEntry = true;
                    }
                }
                return config;
            },
        }, vscode.DebugConfigurationProviderTriggerKind.Initial)
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

    private static self: KCIDEDebugSession | null = null;
    private static readonly wasmFsRoot = '/workspace/';
    private static readonly threadId = 1;
    private nativeFsRoot = '';
    private curStackFrameId: number = 1;
    private configurationDone = new Subject();
    private mapSourceToAddr: Record<string, Array<number>> = {};
    private mapAddrToSource: Array<{ source: string, line: number }> = [];
    private breakpoints: Array<IRuntimeBreakpoint> = [];
    private breakpointId: number = 1;
    private curAddr: number | null = null;

    public constructor() {
        super();
        KCIDEDebugSession.self = this;
        this.setDebuggerLinesStartAt1(true);
        this.setDebuggerColumnsStartAt1(true);
        this.nativeFsRoot = requireProjectUri().path + '/';
    }

    public static onEmulatorMessage(msg: any) {
        console.log(`KCIDEDebugSession.onEmulatorMessage: ${JSON.stringify(msg)}`);
        if (KCIDEDebugSession.self === null) {
            console.log('KCIDEDebugRuntime.onEmulatorMessage: self is null');
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
        response.body.supportsConfigurationDoneRequest = true;
        response.body.supportsCancelRequest = true;
        response.body.supportSuspendDebuggee = true;
        response.body.supportTerminateDebuggee = true;
        this.sendResponse(response);
    }

    protected configurationDoneRequest(response: DebugProtocol.ConfigurationDoneResponse, args: DebugProtocol.ConfigurationDoneArguments): void {
        super.configurationDoneRequest(response, args);
        // @ts-ignore
        this.configurationDone.notify();
    }

    protected disconnectRequest(_response: DebugProtocol.DisconnectResponse, args: DebugProtocol.DisconnectArguments, _request?: DebugProtocol.Request): void {
        console.log(`=> KCIDEDebugSession.disconnectRequest suspend: ${args.suspendDebuggee}, terminate: ${args.terminateDebuggee}`);
    }

    protected async attachRequest(response: DebugProtocol.AttachResponse, args: IAttachRequestArguments) {
        console.log('=> KCIDEDebugSession.attachRequest');
        await this.launchRequest(response, args);
    }

    protected async launchRequest(response: DebugProtocol.LaunchResponse, args: ILaunchRequestArguments) {
        console.log('=> KCIDEDebugSession.launchRequest');
        const project = await loadProject();
        const kccUri = getOutputKccFileUri(project);
        const mapUri = getOutputMapFileUri(project);
        await this.loadMapFile(mapUri);
        await emu.ensureEmulator(project);
        const res = await emu.waitReady(5000);
        // we're ready to receive breakpoints now
        this.sendEvent(new InitializedEvent());
        // wait until breakpoints are configured
        // @ts-ignore
        await this.configurationDone.wait();
        const kcc = await readBinaryFile(kccUri);
        await emu.loadKcc(kcc, true, args.stopOnEntry);
        this.sendResponse(response);
    }

    // eslint-disable-next-line require-await
    protected async setBreakPointsRequest(
        response: DebugProtocol.SetBreakpointsResponse,
        args: DebugProtocol.SetBreakpointsArguments,
        _request?: DebugProtocol.Request | undefined
    ) {
        console.log('=> KCIDEDebugSession.setBreakpointsRequest');
        const path = Uri.file(args.source.path!).path;
        const clearedBreakpoints = this.clearBreakpointsByPath(path);
        const debugProtocolBreakpoints = new Array<DebugProtocol.Breakpoint>();
        const clientLines = args.breakpoints!.map((bp) => bp.line);
        clientLines.forEach((l) => {
            const bp = this.addBreakpoint(path, this.convertClientLineToDebugger(l));
            const protocolBreakpoint = new Breakpoint(bp.verified, this.convertDebuggerLineToClient(bp.line)) as DebugProtocol.Breakpoint;
            protocolBreakpoint.id = bp.id;
            debugProtocolBreakpoints.push(bp);
        });
        response.body = { breakpoints: debugProtocolBreakpoints };
        const removeAddrs = clearedBreakpoints.filter((bp) => (bp.addr !== 0)).map((bp) => bp.addr!);
        const addAddrs = this.breakpoints.filter((bp) => ((bp.path === path) && (bp.addr !== null))).map((bp) => bp.addr!);
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

    protected stepOutRequest(response: DebugProtocol.StepOutResponse, _args: DebugProtocol.StepOutArguments): void {
        console.log('=> KCIDEDebugSession.stepOutRequest');
        // FIXME: not implemented
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
    ): void {
        console.log('=> KCIDEDebugSession.stackTraceRequest');
        const curLocation = this.getCurrentLocation();
        if (curLocation === undefined) {
            response.body = {
                stackFrames: [],
                totalFrames: 0,
            };
        } else {
            this.curStackFrameId += 1;
            response.body = {
                stackFrames: [
                    {
                        id: this.curStackFrameId,
                        name: '0x' + curLocation.addr.toString(16).padStart(4, '0'),
                        source: {
                            name: curLocation.source.split('/').pop(),
                            path: curLocation.source,
                        },
                        line: curLocation.line,
                        column: 0,
                    },
                ],
                totalFrames: 1,
            };
        }
        this.sendResponse(response);
    }

    protected scopesRequest(response: DebugProtocol.ScopesResponse, _args: DebugProtocol.ScopesArguments) {
        console.log('=> KCIDEDebugSession.scopesRequest');
        response.body = {
            scopes: [
                new Scope('CPU', 1, false)
            ]
        };
        this.sendResponse(response);
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
            value: `0x${val.toString(16).padStart(4, '0')}`,
            variablesReference: 0,
        });
        const toUint8Var = (name: string, val: number): DebugProtocol.Variable => ({
            name,
            value: `0x${val.toString(16).padStart(2, '0')}`,
            variablesReference: 0,
        });
        const toBoolVar = (name: string, val: number): DebugProtocol.Variable => ({
            name,
            value: (val !== 0) ? 'true' : 'false',
            variablesReference: 0,
        });
        if (cpuState.type === CPU.Z80) {
            // try/catch just in case cpuState isn't actually a proper CPUState object
            try {
                response.body = {
                    variables: [
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
            this.mapSourceToAddr[pathStr][lineNr] = addr;
            this.mapAddrToSource[addr] = { source: pathStr, line: lineNr };
        });
    }

    private getCurrentLocation(): { source: string, line: number, addr: number } | undefined {
        if (this.curAddr === null) {
            return undefined;
        }
        const loc = this.mapAddrToSource[this.curAddr];
        if (loc === undefined) {
            return undefined;
        }
        return {
            source: this.nativeFsRoot + loc.source,
            line: loc.line,
            addr: this.curAddr,
        };
    }

    private clearBreakpointsByPath(path: string): IRuntimeBreakpoint[] {
        const clearedBreakpoints = this.breakpoints.filter((bp) => (bp.path === path));
        this.breakpoints = this.breakpoints.filter((item) => (item.path !== path));
        return clearedBreakpoints;
    }

    private addBreakpoint(path: string, line: number): IRuntimeBreakpoint {
        let workspaceRelativePath;
        if (path.startsWith(this.nativeFsRoot)) {
            workspaceRelativePath = path.slice(this.nativeFsRoot.length);
        } else {
            console.log(`KCIDEDebugAdapter.setBreakpoint(): incoming path ${path} doesn't start with ${this.nativeFsRoot}`);
            workspaceRelativePath = path;
        }
        let addr = null;
        if (this.mapSourceToAddr[workspaceRelativePath] !== undefined) {
            addr = this.mapSourceToAddr[workspaceRelativePath][line] ?? null;
        }
        const bp: IRuntimeBreakpoint = {
            verified: addr !== null,
            path,
            workspaceRelativePath,
            line,
            addr,
            id: this.breakpointId++
        };
        this.breakpoints.push(bp);
        return bp;
    }

    private onEmulatorStopped(stopReason: number, addr: number) {
        this.curAddr = addr;
        switch (stopReason) {

            case 1: // UI_DBG_STOP_REASON_BREAK
                this.sendEvent(new StoppedEvent('pause', KCIDEDebugSession.threadId));
                break;
            case 2: // UI_DBG_STOP_REASON_BREAKPOINT
                this.sendEvent(new StoppedEvent('breakpoint', KCIDEDebugSession.threadId));
                break;
            default: // ...UI_DBG_STOP_REASON_STEP
                this.sendEvent(new StoppedEvent('step', KCIDEDebugSession.threadId));
                break;
        }
    }

    private onEmulatorContinued() {
        this.sendEvent(new ContinuedEvent(KCIDEDebugSession.threadId));
    }
}
