import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { SettingsWebviewProvider } from './settings-webview-provider-mvp';
import { dumpAllSettings } from './settings-schema-reader';

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

  context.subscriptions.push(
    vscode.commands.registerCommand('vscSettings.dumpSettings', async () => {
      try {
        const settings = dumpAllSettings(vscode.ConfigurationTarget.Global);
        const workspaceFolders = vscode.workspace.workspaceFolders;
        const outDir = workspaceFolders?.[0]?.uri.fsPath ?? require('os').homedir();
        const outPath = path.join(outDir, 'settings-dump.json');
        fs.writeFileSync(outPath, JSON.stringify(settings, null, 2), 'utf-8');
        vscode.window.showInformationMessage(
          `Dumped ${settings.length} settings to ${outPath}`
        );
      } catch (err: any) {
        vscode.window.showErrorMessage(`Settings dump failed: ${err.message}`);
      }
    })
  );

  // Auto-dump settings on activation for data pipeline
  try {
    const settings = dumpAllSettings(vscode.ConfigurationTarget.Global);
    const extPath = context.extensionPath;
    const outPath = path.join(extPath, 'settings-dump.json');
    fs.writeFileSync(outPath, JSON.stringify(settings, null, 2), 'utf-8');
    console.log(`[Settings Explorer] Dumped ${settings.length} settings to ${outPath}`);
  } catch (err: any) {
    console.error(`[Settings Explorer] Auto-dump failed: ${err.message}`);
  }

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
