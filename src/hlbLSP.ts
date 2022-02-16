'use strict';

import * as vscode from 'vscode';
import { LanguageClient } from 'vscode-languageclient/node';
import * as npmWhich from 'npm-which';

export function hlbLSP(context: vscode.ExtensionContext) {
	const languageServerToolPath = npmWhich.sync('hlb', { cwd: context.extensionPath });
	const client = new LanguageClient(
		'hlb',
		{
			command: languageServerToolPath,
			args: ['langserver'],
			options: {}
		},
		{
			initializationOptions: {},
			documentSelector: [
				// Files.
				{ language: 'hlb', scheme: 'file' },
				// Unsaved files.
				{ language: 'hlb', scheme: 'untitled' }
			]
		}
	);

	// This enables handling Semantic Highlighting.
	client.registerProposedFeatures();

	client.onReady().then(() => {
		const capabilities = client.initializeResult && client.initializeResult.capabilities;
		if (!capabilities) {
			return vscode.window.showErrorMessage(
				'The language server is not able to serve any features at the moment.'
			);
		}
	});

	const disposable = client.start();
	context.subscriptions.push(disposable);
}
