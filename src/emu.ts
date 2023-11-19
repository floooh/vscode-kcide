import {
    window,
    ExtensionContext,
    WebviewPanel,
    ViewColumn,
    Uri,
} from 'vscode';
import { KCIDEDebugSession } from './debug';
import { System, Project } from './types';
import { readTextFile } from './filesystem';

interface State {
    panel: WebviewPanel;
    system: System;
};

let state: State | null = null;

async function setupEmulator(ext: ExtensionContext, project: Project): Promise<State> {
    const rootUri = Uri.joinPath(ext.extensionUri, 'media');
    const panel = window.createWebviewPanel(
        project.emulator.system, // type
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
    return { panel, system: project.emulator.system };
}

function discardEmulator() {
    if (state) {
        state.panel.dispose();
        // state is now set to null because onDidDispose callback has been called
    }
}

export async function ensureEmulator(ext: ExtensionContext, project: Project) {
    if (state === null) {
        state = await setupEmulator(ext, project);
    } else {
        if (state.system !== project.emulator.system) {
            discardEmulator();
            state = await setupEmulator(ext, project);
        }
        state.panel.reveal(ViewColumn.Two, true);
    }
}

export async function init(ext: ExtensionContext, project: Project) {
    await ensureEmulator(ext, project);
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

export async function dbgAddBreakpoint(addr: number) {
    await state!.panel.webview.postMessage({ cmd: 'addBreakpoint', addr });
}

export async function dbgRemoveBreakpoint(addr: number) {
    await state!.panel.webview.postMessage({ cmd: 'removeBreakpoint', addr });
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
