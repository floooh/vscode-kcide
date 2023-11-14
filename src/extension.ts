import * as vscode from 'vscode';
import { start, assemble } from './kcide';

export async function activate(ext: vscode.ExtensionContext) {

	console.log('vscode-kcide: activate() called');
	try {
		const ctx = await start(ext);
		console.log('vscode-kcide: started');

		ext.subscriptions.push(vscode.commands.registerCommand('floooh.kcide.assemble', async () => {
			await assemble(ext, ctx);
		}));
	} catch (err) {
		vscode.window.showErrorMessage(`Failed to setup KCIDE extension (${(err as Error).message}`);
	}
}

// This method is called when your extension is deactivated
export function deactivate() {}
