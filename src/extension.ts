import * as vscode from 'vscode';
import * as commands from './commands';
import { loadProject } from './project';
import * as emu from './emu';

export async function activate(ext: vscode.ExtensionContext) {
    console.log('vscode-kcide: activate() called');
    try {
        ext.subscriptions.push(vscode.commands.registerCommand('floooh.kcide.build', async () => {
            await commands.asmBuild(ext);
        }));
        ext.subscriptions.push(vscode.commands.registerCommand('floooh.kcide.check', async () => {
            await commands.asmCheck(ext);
        }));
        ext.subscriptions.push(vscode.commands.registerCommand('floooh.kcide.run', async () => {
            await commands.asmRun(ext);
        }));
        ext.subscriptions.push(vscode.commands.registerCommand('floooh.kcide.openEmulator', async () => {
            await commands.openEmulator(ext);
        }));
        ext.subscriptions.push(vscode.commands.registerCommand('floooh.kcide.bootEmulator', async () => {
            await commands.bootEmulator(ext);
        }));
        ext.subscriptions.push(vscode.commands.registerCommand('floooh.kcide.resetEmulator', async () => {
            await commands.resetEmulator(ext);
        }));
        // keep this at the end since it may fail when VSCode has no folder opened
        const project = await loadProject();
        await emu.init(ext, project);
    } catch (err) {
        vscode.window.showErrorMessage((err as Error).message);
    }
}

// This method is called when your extension is deactivated
export function deactivate() {}
