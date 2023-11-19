import {
    languages,
    Uri,
    Range,
    Diagnostic,
    DiagnosticCollection,
    DiagnosticSeverity,
} from 'vscode';

let diagnosticCollection: DiagnosticCollection | null = null;

type DiagnosticsTuple = [Uri, readonly Diagnostic[] | undefined];
type DiagnosticsArray = ReadonlyArray<DiagnosticsTuple>;

export type DiagnosticsInfo = {
    diagnostics: DiagnosticsArray;
    numErrors: number,
    numWarnings: number,
};

export function requireDiagnosticCollection(): DiagnosticCollection {
    if (diagnosticCollection === null) {
        diagnosticCollection = languages.createDiagnosticCollection('kcide');
    }
    return diagnosticCollection;
}

export function clearDiagnostics() {
    const diagnostics = requireDiagnosticCollection();
    diagnostics.clear();
}

export function updateDiagnosticsFromStderr(projectUri: Uri, stderr: string | undefined): DiagnosticsInfo {
    clearDiagnostics();
    const diagnostics = requireDiagnosticCollection();
    const parseResult = parseDiagnostics(projectUri, stderr);
    diagnostics.set(parseResult.diagnostics);
    return parseResult;
}

function parseDiagnostics(projectUri: Uri, stderr: string | undefined): DiagnosticsInfo {
    if (stderr === undefined) {
        return { diagnostics: [], numErrors: 0, numWarnings: 0 };
    }
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
