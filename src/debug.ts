import {
    ExtensionContext,
    Uri,
    ProviderResult,
    DebugAdapterDescriptor
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
import { Project } from './types';
import { readBinaryFile, readTextFile, getOutputMapFileUri } from './filesystem';
import { requireProjectUri } from './project';
import * as emu from './emu';

interface ILaunchRequestArguments extends DebugProtocol.LaunchRequestArguments {
    /** absolute path to KCC file */
    program: 'string',
    /** absolute path to map file */
    mapFile: 'string',
    /** whether to stop on entry */
    stopOnEntry: boolean,
};

interface IAttachRequestArguments extends ILaunchRequestArguments { };

interface IRuntimeBreakpoint {
    id: number,
    path: string,
    workspaceRelativePath: string,
    line: number,
    addr: number | null,
    verified: boolean,
};

export function activate(ext: ExtensionContext) {
    //const configProvider = new DebugConfigurationProvider();
    //ext.subscriptions.push(vscode.debug.registerDebugConfigurationProvider('kcide', configProvider));
    ext.subscriptions.push(vscode.debug.registerDebugAdapterDescriptorFactory('kcide', new KCIDEDebugAdapterFactory()));
}

export async function start(ext: ExtensionContext, project: Project, kccUri: Uri, noDebug: boolean) {
    await emu.ensureEmulator(ext, project);
    vscode.debug.startDebugging(undefined, {
        type: 'kcide',
        name: 'Debug',
        request: 'launch',
        program: kccUri.fsPath,
        mapFile: getOutputMapFileUri(project).path,
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
        await this.loadMapFile(Uri.file(args.mapFile));
        // debug adapter can start sending breakpoints now
        this.sendEvent(new InitializedEvent());
        // wait until breakpoints are configured
        // @ts-ignore
        await this.configurationDone.wait();
        const kcc = await readBinaryFile(Uri.file(args.program));
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
        const path = args.source.path!;
        const clientLines = args.lines ?? [];
        await this.clearBreakpointsByPath(path);
        const actualBreakpoints = new Array<DebugProtocol.Breakpoint>();
        for (const l of clientLines) {
            const { verified, line, id } = await this.setBreakpoint(path, this.convertClientLineToDebugger(l));
            const bp = new Breakpoint(verified, this.convertDebuggerLineToClient(line)) as DebugProtocol.Breakpoint;
            bp.id = id;
            actualBreakpoints.push(bp);
        }
        response.body = { breakpoints: actualBreakpoints };
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

    protected scopesRequest(response: DebugProtocol.ScopesResponse, _args: DebugProtocol.ScopesArguments): void {
        console.log('=> KCIDEDebugSession.scopesRequest');
        response.body = {
            scopes: [
                new Scope('Registers', 1, true)
            ]
        };
        this.sendResponse(response);
    }

    protected variablesRequest(
        response: DebugProtocol.VariablesResponse,
        _args: DebugProtocol.VariablesArguments,
        _request?: DebugProtocol.Request
    ): void {
        console.log('=> KCIDEDebugSession.variablesRequest');
        response.body = {
            // FIXME request registers
            variables: []
        };
        this.sendResponse(response);
    }

    private async loadMapFile(uri: Uri) {
        this.nativeFsRoot = requireProjectUri().path + '/';
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

    private async clearBreakpointsByPath(path: string): Promise<void> {
        for (const bp of this.breakpoints) {
            if ((bp.path === path) && (bp.addr !== null)) {
                await emu.dbgRemoveBreakpoint(bp.addr);
            }
        }
        this.breakpoints = this.breakpoints.filter((item) => (item.path !== path));
    }

    private async setBreakpoint(path: string, line: number): Promise<IRuntimeBreakpoint> {
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
            addr, // may be null
            id: this.breakpointId++
        };
        this.breakpoints.push(bp);
        if (addr !== null) {
            await emu.dbgAddBreakpoint(addr);
        }
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
