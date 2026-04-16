import * as vscode from 'vscode';
import { SettingsWebviewProvider } from './settings-webview-provider-mvp';

export function activate(context: vscode.ExtensionContext) {
  const provider = new SettingsWebviewProvider(context.extensionUri);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('vscSettings.panel', provider)
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('vscSettings.open', () => {
      vscode.commands.executeCommand('vscSettings.panel.focus');
    })
  );

  // Move to the secondary (right) sidebar after a short delay to let the view register
  const delay = (globalThis as any).setTimeout;
  delay(() => {
    vscode.commands.executeCommand('vscSettings.panel.focus').then(() => {
      vscode.commands.executeCommand('vscode.moveViews', {
        viewIds: ['vscSettings.panel'],
        destinationId: 'workbench.view.extension.auxiliarybar'
      });
    });
  }, 1500);
}

export function deactivate() {}
