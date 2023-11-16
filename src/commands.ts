import { ExtensionContext, window } from 'vscode';
import { assemble, writeOutputFile } from './assemble';
import { loadProject } from './project';
import { updateDiagnosticsFromStderr } from './diagnostics';
import * as emu from './emu';
import { readBinaryFile } from './filesystem';

export async function asmBuild(ext: ExtensionContext) {
    try {
        const project = await loadProject();
        const result = await assemble(ext, project, { genListingFile: true, genObjectFile: true });
        const diagnostics = updateDiagnosticsFromStderr(project.uri, result.stderr);
        if (diagnostics.numErrors=== 0) {
            const uri = await writeOutputFile(project, result.objectUri!);
            window.showInformationMessage(`Output written to ${uri.path}`);
        }
    } catch (err) {
        window.showErrorMessage((err as Error).message);
    }
}

export async function asmCheck(ext: ExtensionContext) {
    try {
        const project = await loadProject();
        const result = await assemble(ext, project, { genListingFile: false, genObjectFile: false });
        updateDiagnosticsFromStderr(project.uri, result.stderr);
    } catch (err) {
        window.showErrorMessage((err as Error).message);
    }
}

export async function asmRun(ext: ExtensionContext) {
    try {
        const project = await loadProject();
        const result = await assemble(ext, project, { genListingFile: true, genObjectFile: true });
        const diagnostics = updateDiagnosticsFromStderr(project.uri, result.stderr);
        if (diagnostics.numErrors === 0) {
            const uri = await writeOutputFile(project, result.objectUri!);
            const kcc = await readBinaryFile(uri);
            await emu.ensureEmulator(ext, project);
            await emu.loadKcc(kcc);
        } else {
            window.showErrorMessage('Assembler returned with errors');
        }
    } catch (err) {
        window.showErrorMessage((err as Error).message);
    }
}

export async function openEmulator(ext: ExtensionContext) {
    try {
        const project = await loadProject();
        await emu.ensureEmulator(ext, project);
    } catch (err) {
        window.showErrorMessage((err as Error).message);
    }
}

export async function bootEmulator(ext: ExtensionContext) {
    try {
        const project = await loadProject();
        await emu.ensureEmulator(ext, project);
        await emu.bootEmulator();
    } catch (err) {
        window.showErrorMessage((err as Error).message);
    }
}

export async function resetEmulator(ext: ExtensionContext) {
    try {
        const project = await loadProject();
        await emu.ensureEmulator(ext, project);
        await emu.resetEmulator();
    } catch (err) {
        window.showErrorMessage((err as Error).message);
    }
}