import * as vscode from 'vscode';
import { start, assemble } from './kcide';

export async function activate(context: vscode.ExtensionContext) {

	console.log('vscode-kcide: activate() called');
	try {
		const state = await start(context);
		console.log('vscode-kcide: started');

		context.subscriptions.push(vscode.commands.registerCommand('floooh.kcide.assemble', async () => {
			await assemble(context, state);
		}));
	} catch (err) {
		vscode.window.showErrorMessage(`Failed to setup KCIDE extension (${(err as Error).message}`);
	}
}

// This method is called when your extension is deactivated
export function deactivate() {}
