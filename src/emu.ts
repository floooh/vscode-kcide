import {
    window,
    ExtensionContext,
    WebviewPanel,
    ViewColumn,
    Uri,
} from 'vscode';
import { System, Context, Project } from './types';
import { readTextFile } from './filesystem';

interface State {
    panel: WebviewPanel;
    system: System;
};

let state: State | null = null;

async function setupEmulator(ext: ExtensionContext, _ctx: Context, project: Project): Promise<State> {
    const rootUri = Uri.joinPath(ext.extensionUri, 'media');
    const panel = window.createWebviewPanel(
        project.system, // type
        project.system, // title
        {
            viewColumn: ViewColumn.Two,
            preserveFocus: true,
        },
        {
            enableScripts: true,
            retainContextWhenHidden: true,
            localResourceRoots: [ rootUri ], 
        }
    );
    panel.onDidDispose(() => {
        state = null;
    });

    let emuFilename;
    switch (project.system) {
        case System.KC853: emuFilename = 'kc853-ui.js'; break;
        default:           emuFilename = 'kc854-ui.js'; break;
    }
    const emuUri = panel.webview.asWebviewUri(Uri.joinPath(rootUri, emuFilename));
    const shellUri = panel.webview.asWebviewUri(Uri.joinPath(rootUri, 'shell.js'));
    const templ = await readTextFile(Uri.joinPath(rootUri, 'shell.html'));
    const html = templ.replace('{{{emu}}}', emuUri.toString()).replace('{{{shell}}}', shellUri.toString());
    panel.webview.html = html;
    return { panel, system: project.system };
}

function discardEmulator() {
    if (state) {
        state.panel.dispose();
        // state is now set to null because onDidDispose callback has been called
    }
}

export async function ensureEmulator(ext: ExtensionContext, ctx: Context, project: Project) {
    if (state === null) {
        state = await setupEmulator(ext, ctx, project);
    } else {
        if (state.system !== project.system) {
            discardEmulator();
            state = await setupEmulator(ext, ctx, project);
        }
        state.panel.reveal(ViewColumn.Two, true);
    }
}

export async function init(ext: ExtensionContext, ctx: Context, project: Project) {
    await ensureEmulator(ext, ctx, project);
}

export async function loadKcc(kcc: Uint8Array) {
    await state!.panel.webview.postMessage({ cmd: 'loadkcc', kcc: kcc.buffer });
}

export async function bootEmulator() {
    await state!.panel.webview.postMessage({ cmd: 'boot' });
}

export async function resetEmulator() {
    await state!.panel.webview.postMessage({ cmd: 'reset' });
}
    