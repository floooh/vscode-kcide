import { workspace, window, Uri } from 'vscode';
import { Project, CPU, System, FileType, isValidString, isValidCpu, isValidFileType, isValidSystem } from './types';
import { readTextFile } from './filesystem';

export const projectDefaults: Omit<Project, 'uri'> = {
    emulator: {
        system: System.KC854,
    },
    assembler: {
        srcDir: 'src',
        mainSourceFile: 'main.asm',
        cpu: CPU.Z80,
        outDir: 'build',
        outBaseFilename: 'out',
        outFiletype: FileType.KCC,
    }
};

function requireProjectUri(): Uri {
    if (workspace.workspaceFolders === undefined) {
        throw new Error('Please open a Folder!');
    }
    return workspace.workspaceFolders[0].uri;
}

export async function loadProject(): Promise<Project> {
    // may throw "please open a folder"
    const projectUri = requireProjectUri();
    const projectJsonUri = Uri.joinPath(projectUri, 'kcide.project.json');
    try {
        const projectJsonContent = await readTextFile(projectJsonUri);
        const anyProject = JSON.parse(projectJsonContent);
        const system = isValidSystem(anyProject.emulator?.system)
            ? anyProject.emulator.system
            : projectDefaults.emulator.system;
        const srcDir = isValidString(anyProject.assembler?.srcDir)
            ? anyProject.assembler.srcDir
            : projectDefaults.assembler.srcDir;
        const mainSourceFile = isValidString(anyProject.assembler?.mainSourceFile)
            ? anyProject.assembler.mainSourceFile
            : projectDefaults.assembler.mainSourceFile;
        const cpu = isValidCpu(anyProject.assembler.cpu)
            ? anyProject.assembler.cpu
            : projectDefaults.assembler.cpu;
        const outDir = isValidString(anyProject.assembler?.outDir)
            ? anyProject.assembler.outDir
            : projectDefaults.assembler.outDir;
        const outBaseFilename = isValidString(anyProject.assembler?.outBaseFilename)
            ? anyProject.assembler.outBaseFilename
            : projectDefaults.assembler.outBaseFilename;
        const outFiletype = isValidFileType(anyProject.assembler?.outFiletype)
            ? anyProject.assembler.outFiletype
            : projectDefaults.assembler.outFiletype;
        return {
            uri: projectUri,
            emulator: { system },
            assembler: { srcDir, mainSourceFile, cpu, outDir, outBaseFilename, outFiletype },
        };
    } catch (err) {
        // no or invalid kcide.project.json: return default project settings
        window.showWarningMessage('Please create a kcide.project.json file!');
        return { uri: projectUri, ...projectDefaults };
    }
}
