import { ExtensionContext, window } from 'vscode';
import { Context } from './types';
import { loadProject, assemble, parseDiagnostics, writeOutputFile } from './kcide';
import * as emu from './emu';
import { readBinaryFile } from './filesystem';

export async function asmBuild(ctx: Context) {
    try {
        const project = await loadProject(ctx);
        const result = await assemble(ctx, project, { genListingFile: true, genObjectFile: true });
        ctx.diagnostics.clear();
        const diagnostics = parseDiagnostics(ctx, result.stderr);
        ctx.diagnostics.set(diagnostics.diagnostics);
        if (diagnostics.numErrors === 0) {
            const uri = await writeOutputFile(ctx, project, result.objectUri!);
            window.showInformationMessage(`Output written to ${uri.path}`);
        }
    } catch (err) {
        window.showErrorMessage((err as Error).message);
    }
}

export async function asmCheck(ctx: Context) {
    try {
        const project = await loadProject(ctx);
        const result = await assemble(ctx, project, { genListingFile: false, genObjectFile: false });
        ctx.diagnostics.clear();
        ctx.diagnostics.set(parseDiagnostics(ctx, result.stderr).diagnostics);
    } catch (err) {
        window.showErrorMessage((err as Error).message);
    }
}

export async function asmRun(ext: ExtensionContext, ctx: Context) {
    try {
        const project = await loadProject(ctx);
        const result = await assemble(ctx, project, { genListingFile: true, genObjectFile: true });
        ctx.diagnostics.clear();
        const diagnostics = parseDiagnostics(ctx, result.stderr);
        ctx.diagnostics.set(diagnostics.diagnostics);
        if (diagnostics.numErrors === 0) {
            const uri = await writeOutputFile(ctx, project, result.objectUri!);
            const kcc = await readBinaryFile(uri);
            await emu.ensureEmulator(ext, ctx, project);
            await emu.loadKcc(kcc);
        } else {
            window.showErrorMessage('Assembler returned with errors');
        }
    } catch (err) {
        window.showErrorMessage((err as Error).message);
    }
}

export async function openEmulator(ext: ExtensionContext, ctx: Context) {
    try {
        const project = await loadProject(ctx);
        await emu.ensureEmulator(ext, ctx, project);
    } catch (err) {
        window.showErrorMessage((err as Error).message);
    }
}

export async function bootEmulator(ext: ExtensionContext, ctx: Context) {
    try {
        const project = await loadProject(ctx);
        await emu.ensureEmulator(ext, ctx, project);
        await emu.bootEmulator();
    } catch (err) {
        window.showErrorMessage((err as Error).message);
    }
}

export async function resetEmulator(ext: ExtensionContext, ctx: Context) {
    try {
        const project = await loadProject(ctx);
        await emu.ensureEmulator(ext, ctx, project);
        await emu.resetEmulator();
    } catch (err) {
        window.showErrorMessage((err as Error).message);
    }
}