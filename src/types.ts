import { Uri, Diagnostic } from 'vscode';
import { RootFileSystem, Wasm } from '@vscode/wasm-wasi';

export type WasiEnv = {
    wasm: Wasm,
    fs: RootFileSystem,
    asmx: WebAssembly.Module,
};

// keep in sync with kcide.project.schema.json
export type Project = {
    uri: Uri,
    emulator: {
        system: System,
    },
    assembler: {
        srcDir: string,
        mainSourceFile: string,
        cpu: CPU,
        outDir: string,
        outBaseFilename: string,
        outFiletype: FileType,
    }
};

export enum CPU { Z80 = 'Z80', M6502 = '6502' };
export enum System { KC853 = 'KC85/3', KC854 = 'KC85/4', C64 = 'C64', CPC6128 = 'CPC6128' };
export enum FileType { KCC = 'KCC', PRG = 'PRG', CPC_BIN = 'CPC_BIN' };

export type CPUState = {
    type: CPU | 'unknown',
    z80: {
        af: number,
        bc: number,
        de: number,
        hl: number,
        ix: number,
        iy: number,
        sp: number,
        pc: number,
        af2: number,
        bc2: number,
        de2: number,
        hl2: number,
        im: number,
        ir: number,
        iff: number,
    },
    m6502: {
        a: number,
        x: number,
        y: number,
        s: number,
        p: number,
        pc: number,
    },
};

export type DisasmLine = {
    addr: number,
    bytes: number[],
    chars: string,
};

export type SourceMap = {
    sourceToAddr: Record<string, Array<number>>,
    addrToSource: Array<{ source: string, line: number}>;
};

export type SymbolMap = Record<string, number>;

export type DiagnosticsTuple = [Uri, readonly Diagnostic[] | undefined];
export type DiagnosticsArray = ReadonlyArray<DiagnosticsTuple>;
export type DiagnosticsInfo = {
    diagnostics: DiagnosticsArray;
    numErrors: number,
    numWarnings: number,
};

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
