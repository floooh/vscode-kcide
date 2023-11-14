import {
    workspace,
    window,
    languages,
    ExtensionContext,
    Uri,
    DiagnosticCollection,
    Diagnostic,
    DiagnosticSeverity,
    Range,
    Terminal,
} from 'vscode';
import {
    RootFileSystem,
    Wasm,
    WasmPseudoterminal
} from '@vscode/wasm-wasi';

export interface State {
    wasm: Wasm,
    fs: RootFileSystem,
    pty: WasmPseudoterminal,
    terminal: Terminal, 
    diagnostics: DiagnosticCollection,
    module: WebAssembly.Module,
};

async function findMainSource(): Promise<string | undefined> {
    const uris = await workspace.findFiles('src/main.asm', null, 1);
    return (uris.length === 1) ? uris[0].fsPath : undefined;
}

export async function start(context: ExtensionContext): Promise<State> {
    const wasm = await Wasm.load();
    const fs = await wasm.createRootFileSystem([ { kind: 'workspaceFolder' }]);
    const pty = wasm.createPseudoterminal();
    const terminal = window.createTerminal({ name: 'kcide', pty, isTransient: true });
    const diagnostics = languages.createDiagnosticCollection('kcide');
    const bits = await workspace.fs.readFile(Uri.joinPath(context.extensionUri, 'media/asmx.wasm'));
    const module = await WebAssembly.compile(bits);
    return { wasm, fs, pty, terminal, diagnostics, module };
}

export async function run(_context: ExtensionContext, state: State, args: string[]) {
    try {
        state.terminal.show(true);
        const process = await state.wasm.createProcess('asmx', state.module, {
            rootFileSystem: state.fs,
            stdio: state.pty.stdio,
            args,
        });
        const exitCode = await process.run();
    } catch (err) {
        window.showErrorMessage((err as Error).message);
    }
}

export async function assemble(context: ExtensionContext, state: State) {
    console.log('Assemble called!');
    state.diagnostics.clear();
    const src = await findMainSource();
    if (src === undefined) {
        window.showErrorMessage('No project main file found (must be "src/main.asm")');
        return;
    }
    console.log(`assembling: ${src}`);
    await run(context, state, [ '-l', '-o', '-w', '-e', '-C', 'z80', '/workspace/src/main.asm' ]);
    console.log('done.');

    const uri = (await workspace.findFiles('src/main.asm'))[0];
    state.diagnostics.set(uri, [ new Diagnostic(new Range(2, 0, 2, 80), 'Bla bla bla', DiagnosticSeverity.Error )]);
}