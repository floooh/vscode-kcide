import { Wasm } from '@vscode/wasm-wasi/v1';
import { workspace, Uri, ExtensionContext } from 'vscode';
import { WasiEnv } from './types';

let wasiEnv: WasiEnv | null = null;

export async function requireWasiEnv(ext: ExtensionContext): Promise<WasiEnv> {
    if (wasiEnv === null) {
        const wasm = await Wasm.load();
        const fs = await wasm.createRootFileSystem([ { kind: 'workspaceFolder' } ]);
        const bits = await workspace.fs.readFile(Uri.joinPath(ext.extensionUri, 'media/asmx.wasm'));
        const asmx = await WebAssembly.compile(bits);
        wasiEnv = { wasm, fs, asmx };
    }
    return wasiEnv;
}