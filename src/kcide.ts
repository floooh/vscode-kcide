import {
    workspace,
    languages,
    ExtensionContext,
    Uri,
    Diagnostic,
    DiagnosticSeverity,
    Range,
} from 'vscode';
import { Wasm, } from '@vscode/wasm-wasi';
import {
    Context,
    Project,
    CPU,
    System,
    FileType,
    isValidString,
    isValidCpu,
    isValidSystem,
    isValidFileType
} from './types';
import {
    uriToWasmPath,
    getMainSourceUri,
    getOutputListFileUri,
    getOutputObjectFileUri,
    getOutputKccFileUri,
    writeBinaryFile,
    readTextFile
} from './filesystem';
import { hexToKcc } from './filetypes';

export const projectDefaults: Project = {
    mainFile: 'src/main.asm',
    cpu: CPU.Z80,
    system: System.KC854,
    output: {
        dir: 'build',
        type: FileType.KCC,
        basename: 'out',
    },
};

export async function loadProject(ctx: Context): Promise<Project> {
    const projectJsonUri = Uri.joinPath(ctx.projectUri, 'kcide.project.json');
    const projectJsonContent = await readTextFile(projectJsonUri);
    if (projectJsonContent === undefined) {
        return projectDefaults;
    }
    const anyProject = JSON.parse(projectJsonContent);
    const mainFile = isValidString(anyProject.mainFile) ? anyProject.mainFile : projectDefaults.mainFile;
    const cpu = isValidCpu(anyProject.cpu) ? anyProject.cpu : projectDefaults.cpu;
    const system = isValidSystem(anyProject.system) ? anyProject.system : projectDefaults.system;
    const dir = isValidString(anyProject.output?.dir) ? anyProject.output.dir : projectDefaults.output.dir;
    const type = isValidFileType(anyProject.output?.type) ? anyProject.output.type : projectDefaults.output.type;
    const basename = isValidString(anyProject.output?.basename) ? anyProject.output.basename : projectDefaults.output.basename;
    return { mainFile, cpu, system, output: { dir, type, basename } };
}

export async function start(ext: ExtensionContext): Promise<Context> {
    if (workspace.workspaceFolders === undefined) {
        throw new Error('Cannot determine project folder (workspace.workspaceFolders is undefined)');
    }
    const projectUri = workspace.workspaceFolders[0].uri;
    const wasm = await Wasm.load();
    const fs = await wasm.createRootFileSystem([ { kind: 'workspaceFolder' } ]);
    const diagnostics = languages.createDiagnosticCollection('kcide');
    const bits = await workspace.fs.readFile(Uri.joinPath(ext.extensionUri, 'media/asmx.wasm'));
    const asmx = await WebAssembly.compile(bits);
    const ctx = { projectUri, wasm, fs, diagnostics, asmx };
    return ctx;
}

export interface RunAsmxResult {
    exitCode: number,
    stdout?: string,
    stderr?: string,
};

export async function runAsmx(ctx: Context, args: string[]): Promise<RunAsmxResult> {
    const process = await ctx.wasm.createProcess('asmx', ctx.asmx, {
        rootFileSystem: ctx.fs,
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

type DiagnosticsTuple = [Uri, readonly Diagnostic[] | undefined];
type DiagnosticsArray = ReadonlyArray<DiagnosticsTuple>;
type ParseDiagnosticsResult = {
    diagnostics: DiagnosticsArray;
    numErrors: number,
    numWarnings: number,
};

export function parseDiagnostics(ctx: Context, stderr: string | undefined): ParseDiagnosticsResult {
    if (stderr === undefined) {
        return { diagnostics: [], numErrors: 0, numWarnings: 0 };
    }
    const pathPrefix = ctx.projectUri.fsPath;
    let numErrors = 0;
    let numWarnings = 0;
    const diagnostics: DiagnosticsArray = stderr.split('\n').filter((line) => (line.includes('*** Error:') || line.includes('*** Warning:'))).map((item) => {
        const parts = item.split(':');
        const srcPath = parts[0].replace('/workspace', pathPrefix);
        const lineNr = Number(parts[1]) - 1;
        const type = parts[2];
        const msg = parts[3].slice(2, -4);
        const severity = type === ' *** Error' ? DiagnosticSeverity.Error : DiagnosticSeverity.Warning;
        if (severity === DiagnosticSeverity.Error) {
            numErrors += 1;
        } else {
            numWarnings += 1;
        }
        return [Uri.file(srcPath), [new Diagnostic(new Range(lineNr, 0, lineNr, 256), msg, severity)]];
    });
    return { diagnostics, numErrors, numWarnings };
}

type AssembleOptions = {
    genListingFile: boolean,
    genObjectFile: boolean,
};

type AssembleResult = {
    listingUri?: Uri,
    objectUri?: Uri,
    stdout: string,
    stderr: string,
    exitCode: number,
};

export async function assemble(ctx: Context, project: Project, options: AssembleOptions): Promise<AssembleResult> {
    const { genListingFile, genObjectFile } = options;
    const mainSrcUri = await getMainSourceUri(ctx, project);
    if (mainSrcUri === undefined) {
        throw new Error(`Project main file '${project.mainFile}' not found!`);
    }
    const lstUri = await getOutputListFileUri(ctx, project);
    if (genListingFile) {
        try { await workspace.fs.delete(lstUri); } catch (err) {};
    }
    const objUri = await getOutputObjectFileUri(ctx, project);
    if (genObjectFile) {
        try { await workspace.fs.delete(objUri); } catch (err) {};
    }
    const [ srcPath, objPath, lstPath ] = await Promise.all([
        uriToWasmPath(ctx, mainSrcUri),
        uriToWasmPath(ctx, objUri),
        uriToWasmPath(ctx, lstUri),
    ]);
    const stdArgs = [ '-w', '-e', '-C', project.cpu, srcPath ];
    const lstArgs = genListingFile ? [ '-l', lstPath ] : [];
    const objArgs = genObjectFile ? [ '-o', objPath ] : [];
    const result = await runAsmx(ctx, [ ...lstArgs, ...objArgs, ...stdArgs ]);
    return {
        listingUri: genListingFile ? lstUri: undefined,
        objectUri: genObjectFile ? objUri : undefined,
        stdout: result.stdout ?? '',
        stderr: result.stderr ?? '',
        exitCode: result.exitCode,
    };
}

export async function writeOutputFile(ctx: Context, project: Project, hexUri: Uri) {
    const hexData = await readTextFile(hexUri);
    const kcc = hexToKcc(hexData, true);
    const uri = await getOutputKccFileUri(ctx, project);
    await writeBinaryFile(uri, kcc);
    return uri;
}
