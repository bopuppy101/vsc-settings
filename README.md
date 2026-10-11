# VSC Settings Explorer

VSC Settings Explorer is an early-development VS Code extension for discovering settings in a collapsible, categorized tree. It gathers settings from installed extensions and selected core VS Code namespaces, then organizes them using dot-separated names and curated groups.

**The currently active interface is a read-only browser.** You can expand groups, inspect setting names and types, and export a settings catalog to JSON. Change settings using VS Code's built-in Settings editor, as described below. The repository also contains a richer webview with editing controls, but `src/extension.ts` loads `settings-webview-provider-mvp.ts`, so those controls are not available in this build.

## Prerequisites

- Desktop Visual Studio Code **1.85.0 or newer** within the supported 1.x range (`engines.vscode` is `^1.85.0`).
- Git to download the source.
- Node.js and npm to install dependencies and compile TypeScript. The repository does not pin a Node version; the committed dependency lockfile includes packages requiring **Node 20.18.1 or newer**. Use a supported Node release satisfying that requirement.
- Internet access for cloning and dependency installation; access to this repository if GitHub requests authentication.

Check the tools in a terminal:

```sh
git --version
node --version
npm --version
code --version
```

The `code` command is the VS Code command-line launcher. If it is unavailable, you can still open the downloaded folder through **File → Open Folder** and use the graphical loading instructions below.

## Download and build

Open a terminal in the directory where you keep projects, then run:

```sh
git clone --branch develop https://github.com/bopuppy101/vsc-settings.git
cd vsc-settings
npm ci
npm run compile
```

Use a new destination for the clone. If you already have a checkout, open that folder and inspect `git status` before updating it; do not overwrite local work.

`npm ci` installs the versions recorded in `package-lock.json` and replaces an existing `node_modules` directory. It can execute dependency installation scripts (including native tooling), so review and trust the dependencies before running it. `npm run compile` compiles `src/` to `out/`; VS Code loads `out/extension.js`.

For development, automatically recompile after source edits with:

```sh
npm run watch
```

Leave that terminal running and press **Ctrl+C** to stop watching. There is no `npm start`, `npm run build`, or `npm test` script in this repository.

## Load the extension in VS Code

### Option 1: Run from source

1. Complete the build steps above.
2. Open the repository folder in VS Code:

   ```sh
   code .
   ```

3. Open **Run and Debug**, select **Run Extension**, and press **F5**. The checked-in `.vscode/launch.json` starts an Extension Development Host and requests the `npm: compile` task first.
4. Use the new **Extension Development Host** window for the steps below. Stop debugging when finished.

If VS Code cannot find the automatic compile task, compile manually and launch the development host from a terminal in the repository folder (this syntax is for Bash/zsh):

```sh
npm run compile
code --new-window --extensionDevelopmentPath="$PWD"
```

A development host is not a settings backup. Before experimenting with settings, follow the backup directions below.

### Option 2: Build and install a local VSIX

A VSIX is a packaged extension file that you can install yourself. From the repository folder, run:

```sh
npm run compile
npm run package
```

Compile first: the package script runs only `vsce package`; there is no prepublish compile hook. Packaging may report metadata warnings or stop on validation errors; read its output before proceeding. No Marketplace publication is needed for a local installation.

For the current package version (`0.1.0`), a successful package operation produces `vsc-settings-0.1.0.vsix`. In VS Code, open **Extensions**, choose the **…** menu, select **Install from VSIX…**, and select that file. Alternatively:

```sh
code --install-extension ./vsc-settings-0.1.0.vsix
```

Use the filename actually produced if the version changes. Reload VS Code if prompted.

## Open and browse Settings Explorer

1. Open the Command Palette with **Ctrl+Shift+P** on Linux/Windows or **Cmd+Shift+P** on macOS.
2. Run **Open Settings Explorer** (`vscSettings.open`). The extension also contributes a **Settings Explorer** activity-bar container.
3. Look for the Settings Explorer view. On activation, the extension attempts to focus it and move it to the secondary/right sidebar after a short delay. If that move does not work in your VS Code version, use the command again and check the original sidebar.
4. Click a group name or its triangle to expand it. Groups start collapsed; expand nested groups until individual settings appear.
5. Setting rows show a short name and, when available, a type. Hover over a row for its description. Group badges show descendant counts.

The active view has no search field, value editor, reset button, scope selector, modified filter, or clipboard-export buttons. Clicking a setting row does not change the setting or open an editor.

## Change settings and recover safely

Use VS Code's built-in Settings editor to make changes:

1. Before editing, run **Preferences: Open User Settings (JSON)** from the Command Palette and save a separate copy of its contents outside the active settings file. If you will edit workspace settings, also back up the workspace's settings file (often `.vscode/settings.json`; multi-root workspaces can store settings in a `.code-workspace` file).
2. Run **Preferences: Open Settings (UI)** from the Command Palette.
3. Search for the setting by name. When you know its full key, an exact-ID search is useful; for example:

   ```text
   @id:editor.fontSize
   ```

4. Choose **User** for settings that apply to your user/profile, or **Workspace** for the current project. Change the value there. VS Code saves changes as you make them.
5. To undo one change, restore the previous value, or use the setting's gear menu → **Reset Setting** at the same scope. Reset removes that scope's explicit override; another scope may still determine the effective value.
6. If several changes need recovery, compare the affected JSON file with your backup and restore the affected entries. Keep a copy of the current file first so that newer unrelated changes are not lost. Do not replace the entire file unless that is intentional.

Disabling or uninstalling this extension does not undo settings changed through VS Code. Its active browser does not write settings. The JSON catalog described below is **not** a backup of your customized settings and cannot restore them.

## Export the settings catalog to JSON

Run **Settings Explorer: Dump All Settings to JSON** from the Command Palette (`vscSettings.dumpSettings`). A notification reports the number of entries and the output path.

The command writes `settings-dump.json`:

- In the **first workspace folder**, when a folder/workspace is open.
- In your **home directory**, when no workspace folder is open.

**An existing file at that path is overwritten without a Save As dialog.** Rename or copy an earlier dump before running the command again.

The output is a flat JSON array containing discovered setting keys, types, descriptions, default values, and sources. Some metadata can be empty or absent. It does **not** export your current custom values, and there is no import/restore command.

The extension also automatically writes a separate `settings-dump.json` in its own extension directory on activation (the repository folder when running from source). This can overwrite an earlier dump there. Manual dump failures appear as notifications; automatic dump failures are logged. Review generated files before committing or sharing them; `settings-dump.json` is not covered by this repository's `.gitignore`.

## Current limitations

- Discovery uses extension configuration contributions plus a fixed list of core prefixes; it is not guaranteed to discover every VS Code setting. Available settings depend on the VS Code version and installed extensions.
- Core settings may lack descriptions or have inferred types. The view shows short leaf names rather than full setting keys or current values.
- The tree is generated when the view resolves; there is no configuration-change listener or refresh button in the active provider. Reload the window if the catalog is stale.
- The displayed overall settings count includes internal section/header markers, so treat it as approximate.
- The active view is built using the global/user scope. It does not offer workspace, folder, remote, or language-specific scope editing, nor a complete view of effective values across scopes.
- The sidebar move uses an internal VS Code command and may behave differently across versions.
- Planning documents and `src/settings-webview-provider.ts` describe or contain richer features that are not wired into the active interface.

## Repository guide

| Path | Purpose |
| --- | --- |
| `src/extension.ts` | Registers commands and the active view; writes catalog dumps. |
| `src/settings-webview-provider-mvp.ts` | Active read-only tree interface. |
| `src/settings-webview-provider.ts` | Alternative, currently unused provider with editing/export controls. |
| `src/settings-schema-reader.ts` | Discovers settings, builds the tree, and creates catalog entries. |
| `src/settings-toc.ts`, `src/top-level-groups.ts`, `src/custom-categories.ts`, `src/subnode-assignments.ts` | Labels and curated grouping data. |
| `src/run-dump.ts` | VS Code extension-host dump helper; not a standalone Node program or general test suite. |
| `docs/` | Design, architecture, and implementation notes; some describe intended features. |

The scripts under `scripts/` are optional maintainer tools, not installation steps. Normal browsing needs neither Docker nor PostgreSQL. These scripts assume Python 3, Docker, an existing `dude-shorts-db` container, and a prepared `vscode_settings` database/schema with user `ds`. The import script **deletes existing rows** from curation/settings tables before importing a dump; the export script **overwrites `src/custom-categories.ts`**. Inspect and adapt them, and back up the database/source before using them. This repository does not provide a complete database setup procedure.
