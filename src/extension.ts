// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "smpl" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('smpl.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from smpl!');
	});

	context.subscriptions.push(disposable);

	const diagnostics = vscode.languages.createDiagnosticCollection("grammar");
	context.subscriptions.push(diagnostics);

	vscode.workspace.onDidSaveTextDocument((document) => {
		if (document.languageId === "smpl" || document.languageId === "cocci") { // Adjust language IDs as needed
			checkGrammar(document, diagnostics);
		}
	});
}

import { exec } from 'child_process';

function checkGrammar(document: vscode.TextDocument, diagnostics: vscode.DiagnosticCollection) {
	// Replace `your-command` with the actual command to run your grammar checker
	exec(`spatch --parse-cocci "${document.fileName}"`, (err, _, stderr) => {
		let diagnosticsArray: vscode.Diagnostic[] = [];

		if (err) {
			console.error(err);
			const errorLines = err.message.split('\n').filter(line => line.startsWith('error'));
			errorLines.forEach((line, index) => {
				const errorDiagnostic = new vscode.Diagnostic(
					new vscode.Range(index, 0, index, line.length),
					line,
					vscode.DiagnosticSeverity.Error
				);
				diagnosticsArray.push(errorDiagnostic);
			});
		}

		const lines = stderr.split('\n');
		lines.forEach((line, index) => {
			let severity;
			if (line.includes("PARSING")) {
				severity = vscode.DiagnosticSeverity.Information;
			}
			else if (line.startsWith('Warning') || line.startsWith('warning')) {
				severity = vscode.DiagnosticSeverity.Warning;
			} else if (line.startsWith('error:')) {
				severity = vscode.DiagnosticSeverity.Error;
			}

			if (severity !== undefined && severity == vscode.DiagnosticSeverity.Warning) {
				const diagnostic = new vscode.Diagnostic(
					new vscode.Range(index, 0, index, line.length),
					line,
					severity
				);
				diagnosticsArray.push(diagnostic);
			}
		});

		diagnostics.set(document.uri, diagnosticsArray);
	});
}

// This method is called when your extension is deactivated
export function deactivate() { }
