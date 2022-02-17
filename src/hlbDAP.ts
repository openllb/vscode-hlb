'use strict';

import * as vscode from 'vscode';
import { WorkspaceFolder, DebugConfiguration, ProviderResult, CancellationToken } from 'vscode';

export function hlbDAP(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.commands.registerCommand('extension.hlb.runEditorContents', (resource: vscode.Uri) => {
			let targetResource = resource;
			if (!targetResource && vscode.window.activeTextEditor) {
				targetResource = vscode.window.activeTextEditor.document.uri;
			}
			if (targetResource) {
				vscode.debug.startDebugging(undefined, {
					type: 'hlb',
					name: 'Run File',
					request: 'launch',
					program: targetResource.fsPath,
					target: 'default'
				}, { noDebug: true });
			}
		}),
		vscode.commands.registerCommand('extension.hlb.debugEditorContents', (resource: vscode.Uri) => {
			let targetResource = resource;
			if (!targetResource && vscode.window.activeTextEditor) {
				targetResource = vscode.window.activeTextEditor.document.uri;
			}
			if (targetResource) {
				vscode.debug.startDebugging(undefined, {
					type: 'hlb',
					name: 'Debug File',
					request: 'launch',
					program: targetResource.fsPath,
					target: 'default'
				});
			}
		})
	);

	// register a configuration provider for 'hlb' debug type
	const provider = new HLBConfigurationProvider();
	context.subscriptions.push(vscode.debug.registerDebugConfigurationProvider('hlb', provider));

	const factory = new DebugAdapterExecutableFactory();
	context.subscriptions.push(vscode.debug.registerDebugAdapterDescriptorFactory('hlb', factory));
}

class HLBConfigurationProvider implements vscode.DebugConfigurationProvider {
	resolveDebugConfiguration(
		folder: WorkspaceFolder | undefined,
		config: DebugConfiguration,
		token?: CancellationToken
	): ProviderResult<DebugConfiguration> {
		if (!config.type && !config.request && !config.name) {
			const editor = vscode.window.activeTextEditor;
			if (editor && editor.document.languageId === 'hlb') {
				config.type = 'hlb';
				config.name = 'Launch';
				config.request = 'launch';
				config.program = '${file}';
				config.target = 'default';
			}
		}

		if (!config.program) {
			return vscode.window.showInformationMessage('Cannot find a program to debug').then(() => {
				// Abort launch.
				return undefined;
			});
		}

		return config;
	}
}

class DebugAdapterExecutableFactory implements vscode.DebugAdapterDescriptorFactory {
	createDebugAdapterDescriptor(
		_session: vscode.DebugSession,
		executable: vscode.DebugAdapterExecutable | undefined
	): ProviderResult<vscode.DebugAdapterDescriptor> {
		console.log(_session.configuration);
		// Allow overriding executable.
		if (!executable) {
			const command = 'hlb';
			let args = ['run', '--dap'];

			const config = _session.configuration;
			if (!config.noDebug) {
				args.push('--debug');
				console.log("debug");
			}
			if (config.program) {
				args.push(config.program);
			}

			const options = {
				cwd: _session.workspaceFolder.uri.fsPath,
				env: { BUILDKIT_HOST: 'docker-container://buildkitd' }
			};
			console.log(options.cwd);

			executable = new vscode.DebugAdapterExecutable(command, args, options);
		}

		return executable;
	}
}
