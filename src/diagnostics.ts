import {
    languages,
    Uri,
    Range,
    Diagnostic,
    DiagnosticCollection,
    DiagnosticSeverity,
} from 'vscode';
import { Project, DiagnosticsInfo, DiagnosticsArray, SymbolMap } from './types';

let diagnosticCollection: DiagnosticCollection | null = null;

function requireDiagnosticCollection(): DiagnosticCollection {
    if (diagnosticCollection === null) {
        diagnosticCollection = languages.createDiagnosticCollection('kcide');
    }
    return diagnosticCollection;
}

function clearDiagnostics() {
    const diagnostics = requireDiagnosticCollection();
    diagnostics.clear();
}

export function updateDiagnostics(project: Project, stderr: string, symbolMap: SymbolMap): DiagnosticsInfo {
    clearDiagnostics();
    const diagnostics = requireDiagnosticCollection();
    const diagnosticsInfo = parseDiagnostics(project.uri, stderr);
    if (symbolMap['_start'] === undefined) {
        diagnosticsInfo.numErrors += 1;
        diagnosticsInfo.diagnostics = [
            ...diagnosticsInfo.diagnostics,
            [
                Uri.joinPath(project.uri, project.assembler.srcDir, project.assembler.mainSourceFile),
                [new Diagnostic(new Range(0, 0, 0, 255), 'Project is missing a \'_start\' label', DiagnosticSeverity.Error)],
            ]
        ];
    }
    diagnostics.set(diagnosticsInfo.diagnostics);
    return diagnosticsInfo;
}

function parseDiagnostics(projectUri: Uri, stderr: string): DiagnosticsInfo {
    const pathPrefix = projectUri.path;
    let numErrors = 0;
    let numWarnings = 0;
    const diagnostics: DiagnosticsArray = stderr.split('\n').filter((line) => (line.includes('*** Error:') || line.includes('*** Warning:'))).map((item) => {
        const parts = item.split(':');
        const srcPath = parts[0].replace('/workspace', pathPrefix);
        const lineNr = Number(parts[1]) - 1;
        const type = parts[2];
        const msg = parts[3].slice(2, -4);
        const severity = type === ' *** Error' ? DiagnosticSeverity.Error : DiagnosticSeverity.Warning;
        if (severity === DiagnosticSeverity.Error) {
            numErrors += 1;
        } else {
            numWarnings += 1;
        }
        return [Uri.file(srcPath), [new Diagnostic(new Range(lineNr, 0, lineNr, 256), msg, severity)]];
    });
    return { diagnostics, numErrors, numWarnings };
}
