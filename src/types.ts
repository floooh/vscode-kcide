import { Uri, DiagnosticCollection } from 'vscode';
import { RootFileSystem, Wasm } from '@vscode/wasm-wasi';

export type WasiEnv = {
    wasm: Wasm,
    fs: RootFileSystem,
    asmx: WebAssembly.Module,
};

// keep in sync with kcide.project.schema.json
export type Project = {
    uri: Uri,
    mainFile: string,
    cpu: CPU,
    system: System,
    output: {
        dir: string,
        type: FileType,
        basename: string,
    }
};

export enum CPU { Z80 = 'Z80', M6502 = '6502' };
export enum System { KC853 = 'KC85/3', KC854 = 'KC85/4' };
export enum FileType { KCC = 'KCC' };

export function isValidString(val: unknown): val is string {
    if (typeof val !== 'string') {
        return false;
    }
    if (val === '') {
        return false;
    }
    return true;
}

export function isValidCpu(val: unknown): val is CPU {
    return isValidString(val) && (Object.values(CPU).includes(val as CPU));
}

export function isValidSystem(val: unknown): val is System {
    return isValidString(val) && (Object.values(System).includes(val as System));
}

export function isValidFileType(val: unknown): val is FileType {
    return isValidString(val) && (Object.values(FileType).includes(val as FileType));
}
