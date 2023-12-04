import {
    window,
    WebviewPanel,
    ViewColumn,
    Uri,
} from 'vscode';
import { KCIDEDebugSession } from './debug';
import { System, Project, CPUState, DisasmLine } from './types';
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
        if (msg.command === 'emu_cpustate') {
            cpuStateResolved(msg.state as CPUState);
        } else if (msg.command === 'emu_disassembly') {
            disassemblyResolved(msg.result as DisasmLine[]);
        } else if (msg.command === 'emu_memory') {
            readMemoryResolved(msg.result as ReadMemoryResult);
        } else if (msg.command === 'emu_ready') {
            if (state) {
                state.ready = msg.isReady;
            }
        } else {
            KCIDEDebugSession.onEmulatorMessage(msg);
        }
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

function wait(ms: number): Promise<void> {
    return new Promise<void>(resolve => setTimeout(resolve, ms));
}

export async function focusEmulator(delayMs?: number): Promise<void> {
    if (state) {
        if (delayMs !== undefined) {
            await wait(delayMs);
        }
        if (!state.panel.active) {
            state.panel.reveal();
        }
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

export async function waitReady(timeoutMs: number): Promise<boolean> {
    if (state !== null) {
        state.ready = false;
    }
    let t = 0;
    const dt = 100;
    while (t < timeoutMs) {
        // give the webview some time to come up
        await wait(dt);
        if (state && state.ready) {
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
    if (state) {
        await state.panel.webview.postMessage({ cmd: 'loadkcc', kcc: kcc.buffer, start, stopOnEntry});
    }
}

export async function bootEmulator() {
    if (state) {
        await state.panel.webview.postMessage({ cmd: 'boot' });
    }
}

export async function resetEmulator() {
    if (state) {
        await state.panel.webview.postMessage({ cmd: 'reset' });
    }
}

export async function dbgConnect() {
    if (state) {
        await state.panel.webview.postMessage({ cmd: 'connect' });
    }
}

export async function dbgDisconnect() {
    if (state) {
        await state.panel.webview.postMessage({ cmd: 'disconnect' });
    }
}

export async function dbgUpdateBreakpoints(removeAddrs: number[], addAddrs: number[]) {
    if (state) {
        await state.panel.webview.postMessage({ cmd: 'updateBreakpoints', removeAddrs, addAddrs });
    }
}

export async function dbgPause() {
    if (state) {
        await state.panel.webview.postMessage({ cmd: 'pause' });
    }
}

export async function dbgContinue() {
    if (state) {
        await state.panel.webview.postMessage({ cmd: 'continue' });
    }
}

export async function dbgStep() {
    if (state) {
        await state.panel.webview.postMessage({ cmd: 'step' });
    }
}

export async function dbgStepIn() {
    if (state) {
        await state.panel.webview.postMessage({ cmd: 'stepIn' });
    }
}

let cpuStateResolved: (value: CPUState) => void;

export async function dbgCpuState(): Promise<CPUState> {
    await state!.panel.webview.postMessage({ cmd: 'cpuState' });
    return new Promise<CPUState>((resolve) => {
        cpuStateResolved = resolve;
    });
}

let disassemblyResolved: (value: DisasmLine[]) => void;

export async function requestDisassembly(addr: number, offsetLines: number, numLines: number): Promise<DisasmLine[]> {
    await state!.panel.webview.postMessage({ cmd: 'disassemble', addr, offsetLines, numLines });
    return new Promise<DisasmLine[]>((resolve) => {
        disassemblyResolved = resolve;
    });
}

let readMemoryResolved: (value: ReadMemoryResult) => void;

export type ReadMemoryResult = {
    addr: number,
    base64Data: string,
};

export async function readMemory(addr: number, offset: number, numBytes: number): Promise<ReadMemoryResult> {
    const resolvedAddr = (addr + offset) & 0xFFFF;
    await state!.panel.webview.postMessage({ cmd: 'readMemory', addr: resolvedAddr, numBytes });
    return new Promise<ReadMemoryResult>((resolve) => {
        readMemoryResolved = resolve;
    });
}
