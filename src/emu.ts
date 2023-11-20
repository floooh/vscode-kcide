import {
    window,
    WebviewPanel,
    ViewColumn,
    Uri,
} from 'vscode';
import { KCIDEDebugSession } from './debug';
import { System, Project, CPUState } from './types';
import { readTextFile, getExtensionUri } from './filesystem';

interface State {
    panel: WebviewPanel;
    system: System;
    ready: false;
};

let state: State | null = null;

async function setupEmulator(project: Project): Promise<State> {
    const rootUri = Uri.joinPath(getExtensionUri(), 'media');
    const panel = window.createWebviewPanel(
        'kcide_emu', // type
        project.emulator.system, // title
        {
            viewColumn: ViewColumn.Two,
            preserveFocus: true,
        },
        {
            enableScripts: true,
            enableForms: false,
            retainContextWhenHidden: true,
            localResourceRoots: [ rootUri ],
        }
    );
    panel.iconPath = Uri.joinPath(rootUri, 'logo-small.png');
    panel.onDidDispose(() => {
        state = null;
    });
    panel.webview.onDidReceiveMessage((msg) => {
        console.log(`emu.ts: webpanel message received: ${JSON.stringify(msg)}`);
        if (msg.command === 'emu_cpustate') {
            cpuStateResolved(msg.state as CPUState);
        } else if (msg.command === 'emu_ready') {
            if (state) {
                state.ready = msg.isReady;
            }
        }
        KCIDEDebugSession.onEmulatorMessage(msg);
    });

    let emuFilename;
    switch (project.emulator.system) {
        case System.KC853: emuFilename = 'kc853-ui.js'; break;
        default:           emuFilename = 'kc854-ui.js'; break;
    }
    const emuUri = panel.webview.asWebviewUri(Uri.joinPath(rootUri, emuFilename));
    const shellUri = panel.webview.asWebviewUri(Uri.joinPath(rootUri, 'shell.js'));
    const templ = await readTextFile(Uri.joinPath(rootUri, 'shell.html'));
    const html = templ.replace('{{{emu}}}', emuUri.toString()).replace('{{{shell}}}', shellUri.toString());
    panel.webview.html = html;
    return { panel, system: project.emulator.system, ready: false };
}

function discardEmulator() {
    if (state) {
        state.panel.dispose();
        // state is now set to null because onDidDispose callback has been called
    }
}

export async function ensureEmulator(project: Project) {
    if (state === null) {
        state = await setupEmulator(project);
    } else {
        if (state.system !== project.emulator.system) {
            discardEmulator();
            state = await setupEmulator(project);
        }
        state.panel.reveal(ViewColumn.Two, true);
    }
}

function wait(ms: number): Promise<void> {
    return new Promise<void>(resolve => setTimeout(resolve, ms));
}

export async function waitReady(timeoutMs: number): Promise<boolean> {
    if (state !== null) {
        state.ready = false;
    }
    let t = 0;
    const dt = 100;
    while (t < timeoutMs) {
        // give the webview some time to come up
        await wait(dt);
        if (state && (state.ready)) {
            return true;
        }
        const webview = state?.panel?.webview;
        if (webview) {
            await webview.postMessage({ cmd: 'ready' });
        }
        t += dt;
    }
    return false;
}

export async function init(project: Project) {
    await ensureEmulator(project);
}

export async function loadKcc(kcc: Uint8Array, start: boolean, stopOnEntry: boolean) {
    await state!.panel.webview.postMessage({ cmd: 'loadkcc', kcc: kcc.buffer, start, stopOnEntry});
}

export async function bootEmulator() {
    await state!.panel.webview.postMessage({ cmd: 'boot' });
}

export async function resetEmulator() {
    await state!.panel.webview.postMessage({ cmd: 'reset' });
}

export async function dbgUpdateBreakpoints(removeAddrs: number[], addAddrs: number[]) {
    await state!.panel.webview.postMessage({ cmd: 'updateBreakpoints', removeAddrs, addAddrs });
}

export async function dbgPause() {
    await state!.panel.webview.postMessage({ cmd: 'pause' });
}

export async function dbgContinue() {
    await state!.panel.webview.postMessage({ cmd: 'continue' });
}

export async function dbgStep() {
    await state!.panel.webview.postMessage({ cmd: 'step' });
}

export async function dbgStepIn() {
    await state!.panel.webview.postMessage({ cmd: 'stepIn' });
}

let cpuStateResolved: (value: CPUState) => void;
let cpuStateRejected: (reason?: any) => void;

export async function dbgCpuState(): Promise<CPUState> {
    await state!.panel.webview.postMessage({ cmd: 'cpuState' });
    return new Promise<CPUState>((resolve) => {
        cpuStateResolved = resolve;
    });
}
