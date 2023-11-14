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
} from '@vscode/wasm-wasi';
import fs from 'fs';
import path from 'path';

export interface Context {
    projectUri: Uri,
    wasm: Wasm,
    fs: RootFileSystem,
    diagnostics: DiagnosticCollection,
    asmx: WebAssembly.Module,
};

enum CPU { Z80 = 'Z80', M6502 = '6502' };
enum System { KC852 = 'KC85/2', KC853 = 'KC85/3', KC854 = 'KC85/4' };
enum OutputFileType { KCC = 'KCC' };

// keep in sync with kcide.project.schema.json
interface Project {
    mainFile: string,
    cpu: CPU,
    system: System,
    output: {
        dir: string,
        type: OutputFileType,
        basename: string,
    }
};

interface RunResult {
    exitCode: number,
    stdout?: string,
    stderr?: string,
};

const projectDefaults: Project = {
    mainFile: 'src/main.asm',
    cpu: CPU.Z80,
    system: System.KC854,
    output: {
        dir: 'build',
        type: OutputFileType.KCC,
        basename: 'out',
    },
};

function isValidString(val: unknown): val is string {
    if (typeof val !== 'string') {
        return false;
    }
    if (val === '') {
        return false;
    }
    return true;
}

function isValidCpu(val: unknown): val is CPU {
    return isValidString(val) && (val in CPU);
}

function isValidSystem(val: unknown): val is System {
    return isValidString(val) && (val in System);
}

function isValidOutputFileType(val: unknown): val is OutputFileType {
    return isValidString(val) && (val in OutputFileType);
}

async function uriToWasmPath(ctx: Context, uri: Uri): Promise<string> {
    const uriPath = await ctx.fs.toWasm(uri);
    if (uriPath === undefined) {
        throw new Error(`uriToWasmPath: ctx.fs.toWasm(${uriPath}) failed!`);
    }
    return uriPath;
}

function loadProject(ctx: Context): Project {
    const projectJsonPath = path.join(ctx.projectUri.fsPath, 'kcide.project.json');
    if (!fs.statSync(projectJsonPath).isFile()) {
        return projectDefaults;
    }
    const projectJsonContent = fs.readFileSync(projectJsonPath, { encoding: 'utf8' });
    const anyProject = JSON.parse(projectJsonContent);
    return {
        mainFile: isValidString(anyProject.mainFile) ? anyProject.mainFile : projectDefaults.mainFile,
        cpu: isValidCpu(anyProject.cpu) ? anyProject.cpu : projectDefaults.cpu,
        system: isValidSystem(anyProject.system) ? anyProject.system : projectDefaults.system,
        output: {
            dir: isValidString(anyProject.output?.dir) ? anyProject.output.dir : projectDefaults.output.dir,
            type: isValidOutputFileType(anyProject.output?.type) ? anyProject.output.type : projectDefaults.output.type,
            basename: isValidString(anyProject.output?.basename) ? anyProject.output.basename : projectDefaults.output.basename
        }
    };
}

function getMainSourceUri(ctx: Context, project: Project): Uri | undefined {
    const filePath = path.join(ctx.projectUri.fsPath, project.mainFile);
    const stat = fs.statSync(filePath, { throwIfNoEntry: false });
    if ((stat !== undefined) && stat.isFile()) {
        return Uri.file(filePath);
    } else {
        return undefined;
    }
}

function ensureBuildDir(ctx: Context, project: Project): Uri {
    const dirPath = path.join(ctx.projectUri.fsPath, project.output.dir);
    const stat = fs.statSync(dirPath, { throwIfNoEntry: false });
    if ((stat === undefined) || (!stat.isDirectory())) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
    return Uri.file(dirPath);
}

function getOutputObjectFileUri(ctx: Context, project: Project): Uri {
    return Uri.file(path.join(ensureBuildDir(ctx, project).fsPath, `${project.output.basename}.hex`));
}

function getOutputListFileUri(ctx: Context, project: Project): Uri {
    return Uri.file(path.join(ensureBuildDir(ctx, project).fsPath, `${project.output.basename}.lst`));
}

function getOutputFileUri(ctx: Context, project: Project, filename: string): Uri {
    return Uri.file(path.join(ensureBuildDir(ctx, project).fsPath, filename));
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
    return { projectUri, wasm, fs, diagnostics, asmx };
}

export async function runAsmx(ctx: Context, project: Project, args: string[]): Promise<RunResult> {
    const stdoutUri = getOutputFileUri(ctx, project, 'stdout.txt');
    const stderrUri = getOutputFileUri(ctx, project, 'stderr.txt');
    try { await workspace.fs.delete(stdoutUri); } catch (err) {};
    try { await workspace.fs.delete(stderrUri); } catch (err) {};
    const [ stdoutWasmPath, stderrWasmPath ] = await Promise.all([
        uriToWasmPath(ctx, stdoutUri),
        uriToWasmPath(ctx, stderrUri)
    ]);
    const process = await ctx.wasm.createProcess('asmx', ctx.asmx, {
        rootFileSystem: ctx.fs,
        stdio: {
            out: { kind: 'file', path: stdoutWasmPath },
            err: { kind: 'file', path: stderrWasmPath },
        },
        args,
    });
    const exitCode = await process.run();
    const result: RunResult = { exitCode };
    try {
        result.stdout = fs.readFileSync(stdoutUri.fsPath, { encoding: 'utf8' });
    } catch (err) {
        console.warn(`runAsmx(): failed to read ${stdoutUri.fsPath }`);
    };
    try {
        result.stderr = fs.readFileSync(stderrUri.fsPath, { encoding: 'utf8' });
    } catch (err) {
        console.warn(`runAsmx(): failed to read ${stderrUri.fsPath }`);
    };
    return result;
}

function parseDiagnostics(ctx: Context, stderr: string | undefined): ReadonlyArray<[Uri, readonly Diagnostic[] | undefined]> {
    if (stderr === undefined) {
        return [];
    }
    const pathPrefix = ctx.projectUri.fsPath;
    return stderr.split('\n').filter((line) => line.includes('*** Error:') || line.includes('*** Warning:')).map((item) => {
        const parts = item.split(':');
        const srcPath = parts[0].replace('/workspace', pathPrefix);
        const lineNr = Number(parts[1]) - 1;
        const type = parts[2];
        const msg = parts[3].slice(2, -4);
        const severity = type === ' *** Error' ? DiagnosticSeverity.Error : DiagnosticSeverity.Warning;
        return [Uri.file(srcPath), [new Diagnostic(new Range(lineNr, 0, lineNr, 256), msg, severity)]];
    });
}

export async function assemble(_ext: ExtensionContext, ctx: Context) {
    console.log('=> assemble:');
    try {
        ctx.diagnostics.clear();
        const project = loadProject(ctx);
        console.log(`=> assemble: project file loaded: ${JSON.stringify(project, null, 2)}`);
        const mainSrcUri = getMainSourceUri(ctx, project);
        if (mainSrcUri === undefined) {
            window.showErrorMessage(`Project main file '${project.mainFile}' not found!`);
            return;
        }
        const [ srcPath, objPath, lstPath ] = await Promise.all([
            uriToWasmPath(ctx, mainSrcUri),
            uriToWasmPath(ctx, getOutputObjectFileUri(ctx, project)),
            uriToWasmPath(ctx, getOutputListFileUri(ctx, project)),
        ]);
        const args = [ '-l', lstPath, '-o', objPath, '-w', '-e', '-C', project.cpu, srcPath ];
        console.log(`=> assemble: asmx args: ${args.join(' ')}`);
        const result = await runAsmx(ctx, project, args);
        console.log(`=> assemble: asmx result: ${JSON.stringify(result, null, 2)}`);
        ctx.diagnostics.set(parseDiagnostics(ctx, result.stderr));
    } catch (err) {
        window.showErrorMessage(`assemble() failed with ${(err as Error).message}`);
    }
}