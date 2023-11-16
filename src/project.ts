import { workspace, window, Uri } from 'vscode';
import { Project, CPU, System, FileType, isValidString, isValidCpu, isValidFileType, isValidSystem } from './types';
import { readTextFile } from './filesystem';

export const projectDefaults: Omit<Project, 'uri'> = {
    mainFile: 'src/main.asm',
    cpu: CPU.Z80,
    system: System.KC854,
    output: {
        dir: 'build',
        type: FileType.KCC,
        basename: 'out',
    },
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
        const mainFile = isValidString(anyProject.mainFile) ? anyProject.mainFile : projectDefaults.mainFile;
        const cpu = isValidCpu(anyProject.cpu) ? anyProject.cpu : projectDefaults.cpu;
        const system = isValidSystem(anyProject.system) ? anyProject.system : projectDefaults.system;
        const dir = isValidString(anyProject.output?.dir) ? anyProject.output.dir : projectDefaults.output.dir;
        const type = isValidFileType(anyProject.output?.type) ? anyProject.output.type : projectDefaults.output.type;
        const basename = isValidString(anyProject.output?.basename) ? anyProject.output.basename : projectDefaults.output.basename;
        return { uri: projectUri, mainFile, cpu, system, output: { dir, type, basename } };
    } catch (err) {
        // no or invalid kcide.project.json: return default project settings
        window.showWarningMessage('Please create a kcide.project.json file!');
        return { uri: projectUri, ...projectDefaults };
    }
}
