import {
    workspace,
    ExtensionContext,
    Uri,
} from 'vscode';
import { Project, FileType, SourceMap } from './types';
import {
    uriToWasmPath,
    dirExists,
    fileExists,
    ensureBuildDir,
    getMainSourceUri,
    getSourceDirUri,
    getOutputListFileUri,
    getOutputMapFileUri,
    getOutputObjectFileUri,
    getOutputBinFileUri,
    writeBinaryFile,
    readTextFile
} from './filesystem';
import { requireWasiEnv } from './wasi';
import { hexToKCC, hexToPRG } from './filetypes';

export interface RunAsmxResult {
    exitCode: number,
    stdout?: string,
    stderr?: string,
};

export async function runAsmx(ext: ExtensionContext, args: string[]): Promise<RunAsmxResult> {
    const wasiEnv = await requireWasiEnv(ext);
    const process = await wasiEnv.wasm.createProcess('asmx', wasiEnv.asmx, {
        rootFileSystem: wasiEnv.fs,
        stdio: {
            out: { kind: 'pipeOut' },
            err: { kind: 'pipeOut' },
        },
        args,
    });
    const decoder = new TextDecoder('utf-8');
    let stderr = '';
    let stdout = '';
    process.stderr!.onData((data) => {
        stderr += decoder.decode(data);
    });
    process.stdout!.onData((data) => {
        stdout += decoder.decode(data);
    });
    const exitCode = await process.run();
    return { exitCode, stdout, stderr };
}

type AssembleOptions = {
    genListingFile: boolean,
    genObjectFile: boolean,
    genMapFile: boolean,
    saveAll?: boolean,
};

type AssembleResult = {
    listingUri?: Uri,
    objectUri?: Uri,
    stdout: string,
    stderr: string,
    exitCode: number,
};

export async function assemble(ext: ExtensionContext, project: Project, options: AssembleOptions): Promise<AssembleResult> {
    const { genListingFile, genObjectFile, genMapFile, saveAll = true } = options;
    if (saveAll) {
        workspace.saveAll(false);
    }
    await ensureBuildDir(project);
    const srcDirUri = getSourceDirUri(project);
    if (!(await dirExists(srcDirUri))) {
        throw new Error(`Project source directory '${srcDirUri}' not found!`);
    }
    const mainSrcUri = getMainSourceUri(project);
    if (!(await fileExists(mainSrcUri))) {
        throw new Error(`Project main file '${mainSrcUri}' not found!`);
    }
    const lstUri = getOutputListFileUri(project);
    if (genListingFile) {
        try { await workspace.fs.delete(lstUri); } catch (err) {};
    }
    const mapUri = getOutputMapFileUri(project);
    if (genMapFile) {
        try { await workspace.fs.delete(mapUri); } catch (err) {};
    }
    const objUri = getOutputObjectFileUri(project);
    if (genObjectFile) {
        try { await workspace.fs.delete(objUri); } catch (err) {};
    }
    const [ wasmSrcDir, wasmMainSrcPath, wasmObjPath, wasmLstPath, wasmMapPath ] = await Promise.all([
        uriToWasmPath(ext, srcDirUri),
        uriToWasmPath(ext, mainSrcUri),
        uriToWasmPath(ext, objUri),
        uriToWasmPath(ext, lstUri),
        uriToWasmPath(ext, mapUri),
    ]);
    const stdArgs = [ '-w', '-e', '-i', wasmSrcDir, '-C', project.assembler.cpu, wasmMainSrcPath ];
    const lstArgs = genListingFile ? [ '-l', wasmLstPath ] : [];
    const mapArgs = genMapFile ? [ '-m', wasmMapPath ] : [];
    const objArgs = genObjectFile ? [ '-o', wasmObjPath ] : [];
    const result = await runAsmx(ext, [ ...lstArgs, ...mapArgs, ...objArgs, ...stdArgs ]);
    return {
        listingUri: genListingFile ? lstUri: undefined,
        objectUri: genObjectFile ? objUri : undefined,
        stdout: result.stdout ?? '',
        stderr: result.stderr ?? '',
        exitCode: result.exitCode,
    };
}

export async function writeOutputFile(project: Project, hexUri: Uri, withAutoStart: boolean) {
    const hexData = await readTextFile(hexUri);
    let data;
    if (project.assembler.outFiletype === FileType.KCC) {
        data = hexToKCC(hexData, withAutoStart);
    } else if (project.assembler.outFiletype === FileType.PRG) {
        data = hexToPRG(hexData);
    } else {
        throw new Error('Unknown output filetype');
    }
    const uri = getOutputBinFileUri(project);
    await writeBinaryFile(uri, data);
    return uri;
}

export async function loadSourceMap(project: Project, fsRootLength: number): Promise<SourceMap> {
    const map: SourceMap = {
        sourceToAddr: {},
        addrToSource: [],
    };
    const uri = getOutputMapFileUri(project);
    const lines = await readTextFile(uri);
    lines.split('\n').forEach((line) => {
        const parts = line.trim().split(':');
        if (parts.length !== 3) {
            return;
        }
        // remove leading '/workspace/'
        const pathStr = parts[0].slice(fsRootLength);
        const lineNr = parseInt(parts[1]);
        const addr = parseInt(parts[2]);
        if (map.sourceToAddr[pathStr] === undefined) {
            map.sourceToAddr[pathStr] = [];
        }
        if (map.sourceToAddr[pathStr][lineNr] === undefined) {
            map.sourceToAddr[pathStr][lineNr] = addr;
        }
        map.addrToSource[addr] = { source: pathStr, line: lineNr };
    });
    return map;
}
