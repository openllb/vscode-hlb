'use strict';

import * as vscode from 'vscode';
import { WorkspaceFolder, DebugConfiguration, ProviderResult } from 'vscode';

export function hlbDAP(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.commands.registerCommand('hlb.run.file', (resource: vscode.Uri) => {
			let targetResource = resource;
			if (!targetResource && vscode.window.activeTextEditor) {
				targetResource = vscode.window.activeTextEditor.document.uri;
			}
			if (targetResource) {
				vscode.debug.startDebugging(undefined, {
					type: 'hlb',
					name: 'Run File',
					request: 'launch',
					module: targetResource.fsPath,
					target: 'default'
				});
			}
		}),
		vscode.commands.registerCommand('hlb.debug.file', (resource: vscode.Uri) => {
			let targetResource = resource;
			if (!targetResource && vscode.window.activeTextEditor) {
				targetResource = vscode.window.activeTextEditor.document.uri;
			}
			if (targetResource) {
				vscode.debug.startDebugging(undefined, {
					type: 'hlb',
					name: 'Debug File',
					request: 'launch',
					module: targetResource.fsPath,
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
	if ('dispose' in factory) {
		context.subscriptions.push(factory);
	}
}

class HLBConfigurationProvider implements vscode.DebugConfigurationProvider {
	resolveDebugConfiguration(
		folder: WorkspaceFolder | undefined,
		config: DebugConfiguration
		// token?: CancellationToken
	): ProviderResult<DebugConfiguration> {
		if (!config.type && !config.request && !config.name) {
			const editor = vscode.window.activeTextEditor;
			if (editor && editor.document.languageId === 'hlb') {
				config.type = 'hlb';
				config.name = 'Launch';
				config.request = 'launch';
				config.module = '${file}';
				config.target = 'default';
				config.stopOnEntry = true;
			}
		}

		if (!config.module) {
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
		// Allow overriding executable.
		if (!executable) {
			const command = '/home/edgarl/go/bin/hlb';
			const args = ['run', '--dap'];
			const options = {
				cwd: '/home/edgarl/code/vscode-hlb',
				env: { BUILDKIT_HOST: 'docker-container://buildkitd' }
			};
			executable = new vscode.DebugAdapterExecutable(command, args, options);
		}

		return executable;
	}
}
