import { ExtensionContext, window } from 'vscode';
import { assemble, writeOutputFile } from './assemble';
import { loadProject } from './project';
import { updateDiagnosticsFromStderr } from './diagnostics';
import * as emu from './emu';
import * as debug from './debug';
import { readBinaryFile } from './filesystem';

export async function asmBuild(ext: ExtensionContext) {
    try {
        const project = await loadProject();
        const result = await assemble(ext, project, { genListingFile: true, genObjectFile: true, genMapFile: true });
        const diagnostics = updateDiagnosticsFromStderr(project.uri, result.stderr);
        if (diagnostics.numErrors === 0) {
            const uri = await writeOutputFile(project, result.objectUri!, true);
            window.showInformationMessage(`Output written to ${uri.path}`);
        } else {
            window.showErrorMessage(`Build failed with ${diagnostics.numErrors} error(s)`);
        }
    } catch (err) {
        window.showErrorMessage((err as Error).message);
    }
}

export async function asmCheck(ext: ExtensionContext) {
    try {
        const project = await loadProject();
        const result = await assemble(ext, project, {
            genListingFile: false,
            genObjectFile: false,
            genMapFile: false,
            saveAll: false,
        });
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
        const project = await loadProject();
        const result = await assemble(ext, project, { genListingFile: true, genObjectFile: true, genMapFile: true });
        const diagnostics = updateDiagnosticsFromStderr(project.uri, result.stderr);
        if (diagnostics.numErrors === 0) {
            await writeOutputFile(project, result.objectUri!, true);
            debug.start(false);
        } else {
            window.showErrorMessage('Assembler returned with errors');
        }
    } catch (err) {
        window.showErrorMessage((err as Error).message);
    }
}

export async function openEmulator() {
    try {
        const project = await loadProject();
        await emu.ensureEmulator(project);
    } catch (err) {
        window.showErrorMessage((err as Error).message);
    }
}

export async function bootEmulator() {
    try {
        const project = await loadProject();
        await emu.ensureEmulator(project);
        await emu.bootEmulator();
    } catch (err) {
        window.showErrorMessage((err as Error).message);
    }
}

export async function resetEmulator() {
    try {
        const project = await loadProject();
        await emu.ensureEmulator(project);
        await emu.resetEmulator();
    } catch (err) {
        window.showErrorMessage((err as Error).message);
    }
}
