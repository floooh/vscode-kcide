import { ExtensionContext, window } from 'vscode';
import { assemble, writeOutputFile } from './assembler';
import { loadProject } from './project';
import * as emu from './emu';
import * as debug from './debug';

export async function asmBuild(ext: ExtensionContext) {
    try {
        const project = await loadProject();
        const result = await assemble(ext, project, { genListingFile: true, genObjectFile: true, genMapFile: true });
        if (result.diagnostics.numErrors === 0) {
            const uri = await writeOutputFile(project, result.objectUri!, true);
            window.showInformationMessage(`Output written to ${uri.path}`);
        } else {
            window.showErrorMessage(`Build failed with ${result.diagnostics.numErrors} error(s)`);
        }
    } catch (err) {
        window.showErrorMessage(String(err));
    }
}

export async function asmDebug(ext: ExtensionContext) {
    try {
        const project = await loadProject();
        const result = await assemble(ext, project, { genListingFile: true, genObjectFile: true, genMapFile: true });
        if (result.diagnostics.numErrors === 0) {
            await writeOutputFile(project, result.objectUri!, true);
            debug.start(false);
        } else {
            window.showErrorMessage(`Build failed with ${result.diagnostics.numErrors} error(s)`);
        }
    } catch (err) {
        window.showErrorMessage(String(err));
    }
}

export async function openEmulator() {
    try {
        const project = await loadProject();
        await emu.ensureEmulator(project);
    } catch (err) {
        window.showErrorMessage(String(err));
    }
}

export async function bootEmulator() {
    try {
        const project = await loadProject();
        await emu.ensureEmulator(project);
        await emu.bootEmulator();
    } catch (err) {
        window.showErrorMessage(String(err));
    }
}

export async function resetEmulator() {
    try {
        const project = await loadProject();
        await emu.ensureEmulator(project);
        await emu.resetEmulator();
    } catch (err) {
        window.showErrorMessage(String(err));
    }
}
