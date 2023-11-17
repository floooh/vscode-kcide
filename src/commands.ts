import { ExtensionContext, window } from 'vscode';
import { assemble, writeOutputFile } from './assemble';
import { loadProject } from './project';
import { updateDiagnosticsFromStderr } from './diagnostics';
import * as emu from './emu';
import * as debug from './debug';
import { readBinaryFile, getOutputMapFileUri } from './filesystem';

export async function asmBuild(ext: ExtensionContext) {
    try {
        const project = await loadProject();
        const result = await assemble(ext, project, { genListingFile: true, genObjectFile: true, genMapFile: true });
        const diagnostics = updateDiagnosticsFromStderr(project.uri, result.stderr);
        if (diagnostics.numErrors=== 0) {
            const uri = await writeOutputFile(project, result.objectUri!, true);
            window.showInformationMessage(`Output written to ${uri.path}`);
        }
    } catch (err) {
        window.showErrorMessage((err as Error).message);
    }
}

export async function asmCheck(ext: ExtensionContext) {
    try {
        const project = await loadProject();
        const result = await assemble(ext, project, { genListingFile: false, genObjectFile: false, genMapFile: true });
        updateDiagnosticsFromStderr(project.uri, result.stderr);
    } catch (err) {
        window.showErrorMessage((err as Error).message);
    }
}

export async function asmRun(ext: ExtensionContext) {
    try {
        const project = await loadProject();
        const result = await assemble(ext, project, { genListingFile: true, genObjectFile: true, genMapFile: true });
        const diagnostics = updateDiagnosticsFromStderr(project.uri, result.stderr);
        if (diagnostics.numErrors === 0) {
            const kccUri = await writeOutputFile(project, result.objectUri!, true);
            // start directly without debug session
            const kcc = await readBinaryFile(kccUri);
            await emu.loadKcc(kcc, true, false);
        } else {
            window.showErrorMessage('Assembler returned with errors');
        }
    } catch (err) {
        window.showErrorMessage((err as Error).message);
    }
}

export async function asmDebug(ext: ExtensionContext) {
    try {
        // FIXME FIXME FIXME
        const project = await loadProject();
        const result = await assemble(ext, project, { genListingFile: true, genObjectFile: true, genMapFile: true });
        const diagnostics = updateDiagnosticsFromStderr(project.uri, result.stderr);
        if (diagnostics.numErrors === 0) {
            const kccUri = await writeOutputFile(project, result.objectUri!, true);
            await debug.start(ext, project, kccUri, false);
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