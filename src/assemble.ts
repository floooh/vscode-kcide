import {
    workspace,
    ExtensionContext,
    Uri,
} from 'vscode';
import { Project } from './types';
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
    getOutputKccFileUri,
    writeBinaryFile,
    readTextFile
} from './filesystem';
import { requireWasiEnv } from './wasi';
import { hexToKcc } from './filetypes';

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
};

type AssembleResult = {
    listingUri?: Uri,
    objectUri?: Uri,
    stdout: string,
    stderr: string,
    exitCode: number,
};

export async function assemble(ext: ExtensionContext, project: Project, options: AssembleOptions): Promise<AssembleResult> {
    const { genListingFile, genObjectFile, genMapFile } = options;
    await ensureBuildDir(project);
    const srcDirUri = getSourceDirUri(project);
    if (!(await dirExists(srcDirUri))) {
        throw new Error(`Project source directory '${srcDirUri.path}' not found!`);
    }
    const mainSrcUri = getMainSourceUri(project);
    if (!(await fileExists(mainSrcUri))) {
        throw new Error(`Project main file '${mainSrcUri.path}' not found!`);
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
    const kcc = hexToKcc(hexData, withAutoStart);
    const uri = getOutputKccFileUri(project);
    await writeBinaryFile(uri, kcc);
    return uri;
}
