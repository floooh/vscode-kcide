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

    let jsFilename;
    switch (project.system) {
        case System.KC853: jsFilename = 'kc853-ui.js'; break;
        default:           jsFilename = 'kc854-ui.js'; break;
    }
    const jsUri = panel.webview.asWebviewUri(Uri.joinPath(rootUri, jsFilename));
    const templ = await readTextFile(Uri.joinPath(rootUri, 'shell.html'));
    const html = templ.replace('{{{url}}}', jsUri.toString());
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