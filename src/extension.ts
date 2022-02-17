'use strict';

import * as vscode from 'vscode';
import { hlbDAP } from './hlbDAP';
import { hlbLSP } from './hlbLSP';

export function activate(context: vscode.ExtensionContext) {
	// Run the DAP server as a separate process.
	hlbDAP(context);

	// Run the LSP language server as a separate process.
	// hlbLSP(context);
}

export function deactivate() {
	// Nothing to do.
}
