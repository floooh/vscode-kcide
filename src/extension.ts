import * as vscode from 'vscode';
import { start, build, check } from './kcide';

export async function activate(ext: vscode.ExtensionContext) {

    console.log('vscode-kcide: activate() called');
    try {
        const ctx = await start(ext);
        console.log('vscode-kcide: started');

        const cmdBuild = vscode.commands.registerCommand('floooh.kcide.build', async() => {
            await build(ctx);
        });
        const cmdCheck = vscode.commands.registerCommand('floooh.kcide.check', async() => {
            await check(ctx);
        });
        ext.subscriptions.push(cmdBuild, cmdCheck);
    } catch (err) {
        vscode.window.showErrorMessage((err as Error).message);
    }
}

// This method is called when your extension is deactivated
export function deactivate() {}
