import { Uri, DiagnosticCollection } from 'vscode';
import { RootFileSystem, Wasm } from '@vscode/wasm-wasi';

export interface Context {
    projectUri: Uri,
    wasm: Wasm,
    fs: RootFileSystem,
    diagnostics: DiagnosticCollection,
    asmx: WebAssembly.Module,
};

// keep in sync with kcide.project.schema.json
export interface Project {
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
export enum System { KC852 = 'KC85/2', KC853 = 'KC85/3', KC854 = 'KC85/4' };
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
    return isValidString(val) && (val in CPU);
}

export function isValidSystem(val: unknown): val is System {
    return isValidString(val) && (val in System);
}

export function isValidFileType(val: unknown): val is FileType {
    return isValidString(val) && (val in FileType);
}
