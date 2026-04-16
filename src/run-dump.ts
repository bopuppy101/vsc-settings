/**
 * Test runner that dumps all settings and exits.
 * Invoked via: code --extensionDevelopmentPath=. --extensionTestsPath=./out/run-dump
 */
import * as fs from 'fs';
import * as path from 'path';
import { dumpAllSettings } from './settings-schema-reader';
import * as vscode from 'vscode';

export function run(): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const settings = dumpAllSettings(vscode.ConfigurationTarget.Global);
      const outPath = path.join(__dirname, '..', 'settings-dump.json');
      fs.writeFileSync(outPath, JSON.stringify(settings, null, 2), 'utf-8');
      console.log(`[Settings Explorer] Dumped ${settings.length} settings to ${outPath}`);
      resolve();
    } catch (err) {
      reject(err);
    }
  });
}
