import { workspace, Uri, FileType } from 'vscode';
import { Context, Project } from './types';

const decoder = new TextDecoder('utf-8');

export async function uriToWasmPath(ctx: Context, uri: Uri): Promise<string> {
    const uriPath = await ctx.fs.toWasm(uri);
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

export async function readTextFile(uri: Uri): Promise<string> {
    const data = await readBinaryFile(uri);
    return decoder.decode(data);
}

export async function getMainSourceUri(ctx: Context, project: Project): Promise<Uri | undefined> {
    const uri = Uri.joinPath(ctx.projectUri, project.mainFile);
    if (await fileExists(uri)) {
        return uri;
    } else {
        return undefined;
    }
}

export async function ensureBuildDir(ctx: Context, project: Project): Promise<Uri> {
    const uri = Uri.joinPath(ctx.projectUri, project.output.dir);
    const exists = await dirExists(uri);
    if (!exists) {
        await workspace.fs.createDirectory(uri);
    }
    return uri;
}

export async function getOutputFileUri(ctx: Context, project: Project, filename: string): Promise<Uri> {
    const buildDirUri = await ensureBuildDir(ctx, project);
    return Uri.joinPath(buildDirUri, filename);
}

export async function getOutputObjectFileUri(ctx: Context, project: Project): Promise<Uri> {
    return await getOutputFileUri(ctx, project, `${project.output.basename}.hex`);
}

export async function getOutputListFileUri(ctx: Context, project: Project): Promise<Uri> {
    return await getOutputFileUri(ctx, project, `${project.output.basename}.lst`);
}

export async function getOutputKccFileUri(ctx: Context, project: Project): Promise<Uri> {
    return await getOutputFileUri(ctx, project, `${project.output.basename}.kcc`);
}
