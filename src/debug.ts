import { ExtensionContext, Uri, ProviderResult, DebugAdapterDescriptor } from 'vscode';
import { DebugSession, InitializedEvent, StoppedEvent, BreakpointEvent, Breakpoint, Thread, Scope } from '@vscode/debugadapter';
import { DebugProtocol } from '@vscode/debugprotocol';
import * as vscode from 'vscode';
import { EventEmitter } from 'events';
// @ts-ignore
import { Subject } from 'await-notify';
import { Project } from './types';
import { readBinaryFile, getOutputMapFileUri } from './filesystem';
import * as emu from './emu';

interface ILaunchRequestArguments extends DebugProtocol.LaunchRequestArguments {
    /** absolute path to KCC file */
    program: 'string',
    /** absolute path to map file */
    mapFile: 'string',
    /** whether to stop at entry */
    stopOnEntry: boolean,
};

interface IAttachRequestArguments extends ILaunchRequestArguments { };

interface IRuntimeBreakpoint {
    id: number,
    path: string,
    line: number,
    addr: number,
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

class KCIDEDebugSession extends DebugSession {

    private static threadId = 1;
    private configurationDone = new Subject();
    private runtime: KCIDEDebugRuntime;

    public constructor() {
        super();
        this.runtime = new KCIDEDebugRuntime();
        this.runtime.on('stopOnEntry', () => {
            this.sendEvent(new StoppedEvent('entry', KCIDEDebugSession.threadId));
        });
        this.runtime.on('stopOnStep', () => {
            this.sendEvent(new StoppedEvent('step', KCIDEDebugSession.threadId));
        });
        this.runtime.on('stopOnBreakpoint', () => {
            this.sendEvent(new StoppedEvent('breakpoint', KCIDEDebugSession.threadId));
        });
        this.runtime.on('breakpointValidated', (bp: IRuntimeBreakpoint) => {
            this.sendEvent(new BreakpointEvent('changed', { verified: bp.verified, id: bp.id }));
        });
        // FIXME?
        this.setDebuggerLinesStartAt1(true);
        this.setDebuggerColumnsStartAt1(true);
    }

    protected initializeRequest(response: DebugProtocol.InitializeResponse, _args: DebugProtocol.InitializeRequestArguments): void {
        console.log('=> KCIDEDebugSession.initializeRequest');

        response.body = response.body ?? {};
        response.body.supportsConfigurationDoneRequest = true;
        response.body.supportsCancelRequest = true;
        response.body.supportSuspendDebuggee = true;
        response.body.supportTerminateDebuggee = true;
        this.sendResponse(response);
        this.sendEvent(new InitializedEvent());
    }

    protected configurationDoneRequest(response: DebugProtocol.ConfigurationDoneResponse, args: DebugProtocol.ConfigurationDoneArguments): void {
        super.configurationDoneRequest(response, args);
        // @ts-ignore
        this.configurationDone.notify();
    }

    protected disconnectRequest(_response: DebugProtocol.DisconnectResponse, args: DebugProtocol.DisconnectArguments, _request?: DebugProtocol.Request): void {
        console.log(`=> KCIDEDebugSession.disconnectRequest suspend: ${args.suspendDebuggee}, terminate: ${args.terminateDebuggee}`);
    }

    protected async attachRequest(response: DebugProtocol.AttachResponse, args: IAttachRequestArguments): Promise<void> {
        console.log('=> KCIDEDebugSession.attachRequest');
        await this.launchRequest(response, args);
    }

    protected async launchRequest(response: DebugProtocol.LaunchResponse, args: ILaunchRequestArguments): Promise<void> {
        console.log('=> KCIDEDebugSession.launchRequest');
        // @ts-ignore
        await this.configurationDone.wait();
        await this.runtime.start(args);
        this.sendResponse(response);
    }

    // eslint-disable-next-line require-await
    protected async setBreakPointsRequest(
        response: DebugProtocol.SetBreakpointsResponse,
        args: DebugProtocol.SetBreakpointsArguments,
        _request?: DebugProtocol.Request | undefined
    ): Promise<void> {
        console.log('=> KCIDEDebugSession.setBreakpointsRequest');
        const path = args.source.path!;
        const clientLines = args.lines ?? [];
        this.runtime.clearBreakpoints(path);
        const actualBreakpoints = clientLines.map((l) => {
            const { verified, line, id } = this.runtime.setBreakpoint(path, this.convertClientLineToDebugger(l));
            const bp = new Breakpoint(verified, this.convertDebuggerLineToClient(line)) as DebugProtocol.Breakpoint;
            bp.id = id;
            return bp;
        });
        response.body = { breakpoints: actualBreakpoints };
        this.sendResponse(response);
    }

    protected continueRequest(response: DebugProtocol.ContinueResponse, _args: DebugProtocol.ContinueArguments): void {
        console.log('=> KCIDE.continueRequest');
        this.runtime.continue();
        this.sendResponse(response);
    }

    protected nextRequest(response: DebugProtocol.NextResponse, _args: DebugProtocol.NextArguments): void {
        console.log('=> KCIDE.nextRequest');
        this.runtime.step();
        this.sendResponse(response);
    }

    protected stepInRequest(
        response: DebugProtocol.StepInResponse,
        _args: DebugProtocol.StepInArguments,
        _request?: DebugProtocol.Request | undefined
    ): void {
        console.log('=> KCIDE.stepInRequest');
        this.sendResponse(response);
    }

    protected stepOutRequest(response: DebugProtocol.StepOutResponse, _args: DebugProtocol.StepOutArguments): void {
        console.log('=> KCIDE.stepOutRequest');
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
        response.body.stackFrames = [];
        this.sendResponse(response);
    }

    protected scopesRequest(response: DebugProtocol.ScopesResponse, args: DebugProtocol.ScopesArguments): void {
        console.log('=> KCIDEDebugSession.scopesRequest');
        response.body = {
            scopes: [
                // FIXME
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
            // FIXME
            variables: []
        };
        this.sendResponse(response);
    }
}

class KCIDEDebugRuntime extends EventEmitter {

    private breakpoints: Array<IRuntimeBreakpoint> = [];
    private breakpointId: number = 1;

    public async start(args: ILaunchRequestArguments): Promise<void> {
        const kcc = await readBinaryFile(Uri.file(args.program));
        await emu.loadKcc(kcc, true, args.stopOnEntry);
        if (!args.noDebug) {
            this.verifyBreakpoints();
            if (args.stopOnEntry) {
                this.sendEvent('stopOnEntry');
            } else {
                this.continue();
            }
        } else {
            this.continue();
        }
    }

    public continue() {
        // FIXME
    }

    public step() {
        this.sendEvent('stopOnStep');
    }

    public stepIn() {
        this.sendEvent('stopOnStep');
    }

    public stepOut() {
        this.sendEvent('stopOnStep');
    }

    public setBreakpoint(path: string, line: number): IRuntimeBreakpoint {
        const bp: IRuntimeBreakpoint = {
            verified: false,
            path,
            line,
            addr: 0x200,    // FIXME: map path+line to address
            id: this.breakpointId++
        };
        this.breakpoints.push(bp);
        this.verifyBreakpoints();
        return bp;
    }

    public clearBreakpoint(path: string, line: number): IRuntimeBreakpoint | undefined {
        const index = this.breakpoints.findIndex((item) => (item.path === path) && (item.line === line));
        if (index >= 0) {
            const bp = this.breakpoints[index];
            this.breakpoints.splice(index, 1);
            return bp;
        } else {
            return undefined;
        }
    }

    public clearBreakpoints(path: string): void {
        this.breakpoints = this.breakpoints.filter((item) => (item.path !== path));
    }

    private verifyBreakpoints(): void {
        this.breakpoints.forEach((bp) => {
            bp.verified = true;
            this.sendEvent('breakpointValidated', bp);
        });
    }

    private sendEvent(event: string, ...args: any[]): void {
        setTimeout(() => {
            this.emit(event, ...args);
        }, 0);
    }
}