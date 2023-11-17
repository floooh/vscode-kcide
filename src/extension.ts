import * as vscode from 'vscode';
import * as commands from './commands';
import { loadProject } from './project';
import * as debug from './debug';
import * as emu from './emu';

export async function activate(ext: vscode.ExtensionContext) {
    try {
        ext.subscriptions.push(
            vscode.commands.registerCommand('floooh.kcide.build', async () => {
                await commands.asmBuild(ext);
            }),
            vscode.commands.registerCommand('floooh.kcide.check', async () => {
                await commands.asmCheck(ext);
            }),
            vscode.commands.registerCommand('floooh.kcide.run', async () => {
                await commands.asmRun(ext);
            }),
            vscode.commands.registerCommand('floooh.kcide.debug', async () => {
                await commands.asmDebug(ext);
            }),
            vscode.commands.registerCommand('floooh.kcide.openEmulator', async () => {
                await commands.openEmulator(ext);
            }),
            vscode.commands.registerCommand('floooh.kcide.bootEmulator', async () => {
                await commands.bootEmulator(ext);
            }),
            vscode.commands.registerCommand('floooh.kcide.resetEmulator', async () => {
                await commands.resetEmulator(ext);
            }),
        );
        debug.activate(ext);

        // keep this at the end since it may throw when no folder is opened, but this lets the
        // actual extension initialize properly
        const project = await loadProject();
        await emu.init(ext, project);
    } catch (err) {
        vscode.window.showErrorMessage((err as Error).message);
    }
}

// This method is called when your extension is deactivated
export function deactivate() {}
