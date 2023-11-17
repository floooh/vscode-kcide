import { workspace, ExtensionContext, Uri, FileType } from 'vscode';
import { Project } from './types';
import { requireWasiEnv } from './wasi';

const decoder = new TextDecoder('utf-8');

export async function uriToWasmPath(ext: ExtensionContext, uri: Uri): Promise<string> {
    const wasiEnv = await requireWasiEnv(ext);
    const uriPath = await wasiEnv.fs.toWasm(uri);
    if (uriPath === undefined) {
        throw new Error(`uriToWasmPath: ctx.fs.toWasm(${uriPath}) failed!`);
    }
    return uriPath;
}

export async function fileExists(uri: Uri): Promise<boolean> {
    try {
        return (await workspace.fs.stat(uri)).type === FileType.File;
    } catch (err) {
        return false;
    }
}

export async function dirExists(uri: Uri): Promise<boolean> {
    try {
        return (await workspace.fs.stat(uri)).type === FileType.Directory;
    } catch (err) {
        return false;
    }
}

export async function writeBinaryFile(uri: Uri, data: Uint8Array) {
    await workspace.fs.writeFile(uri, data);
}

export async function readBinaryFile(uri: Uri): Promise<Uint8Array> {
    const exists = await fileExists(uri);
    if (!exists) {
        throw new Error(`File not found: ${uri.fsPath}`);
    }
    return workspace.fs.readFile(uri);
}

export async function ensureBuildDir(project: Project): Promise<Uri> {
    const uri = Uri.joinPath(project.uri, project.assembler.outDir);
    const exists = await dirExists(uri);
    if (!exists) {
        await workspace.fs.createDirectory(uri);
    }
    return uri;
}

export async function readTextFile(uri: Uri): Promise<string> {
    const data = await readBinaryFile(uri);
    return decoder.decode(data);
}

export function getSourceDirUri(project: Project): Uri {
    return Uri.joinPath(project.uri, project.assembler.srcDir);
}

export function getMainSourceUri(project: Project): Uri {
    return Uri.joinPath(getSourceDirUri(project), project.assembler.mainSourceFile);
}

export function getOutDirUri(project: Project): Uri {
    return Uri.joinPath(project.uri, project.assembler.outDir);
}

export function getOutputFileUri(project: Project, filename: string): Uri {
    return Uri.joinPath(getOutDirUri(project), filename);
}

export function getOutputObjectFileUri(project: Project): Uri {
    return getOutputFileUri(project, `${project.assembler.outBaseFilename}.hex`);
}

export function getOutputListFileUri(project: Project): Uri {
    return getOutputFileUri(project, `${project.assembler.outBaseFilename}.lst`);
}

export function getOutputMapFileUri(project: Project): Uri {
    return getOutputFileUri(project, `${project.assembler.outBaseFilename}.map`);
}

export function getOutputKccFileUri(project: Project): Uri {
    return getOutputFileUri(project, `${project.assembler.outBaseFilename}.kcc`);
}
