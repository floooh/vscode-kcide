import * as vscode from 'vscode';
import * as commands from './commands';
import * as kcide from './kcide';
import * as emu from './emu';

export async function activate(ext: vscode.ExtensionContext) {

    console.log('vscode-kcide: activate() called');
    try {
        const ctx = await kcide.start(ext);
        const project = await kcide.loadProject(ctx);
        await emu.init(ext, ctx, project);
        console.log('vscode-kcide: started');
        const cmdBuild = vscode.commands.registerCommand('floooh.kcide.build', async () => {
            await commands.asmBuild(ctx);
        });
        const cmdCheck = vscode.commands.registerCommand('floooh.kcide.check', async () => {
            await commands.asmCheck(ctx);
        });
        const cmdRun = vscode.commands.registerCommand('floooh.kcide.run', async () => {
            await commands.asmRun(ext, ctx);
        });
        const cmdOpenEmulator = vscode.commands.registerCommand('floooh.kcide.openEmulator', async () => {
            await commands.openEmulator(ext, ctx);
        });
        const cmdBootEmulator = vscode.commands.registerCommand('floooh.kcide.bootEmulator', async () => {
            await commands.bootEmulator(ext, ctx);
        });
        const cmdResetEmulator = vscode.commands.registerCommand('floooh.kcide.resetEmulator', async () => {
            await commands.resetEmulator(ext, ctx);
        });
        ext.subscriptions.push(cmdBuild, cmdCheck, cmdOpenEmulator, cmdBootEmulator, cmdResetEmulator);
    } catch (err) {
        vscode.window.showErrorMessage((err as Error).message);
    }
}

// This method is called when your extension is deactivated
export function deactivate() {}
