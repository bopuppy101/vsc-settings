# VSC Settings — Architecture

## Delivery Model

**VS Code Extension with a Webview Panel.**

This is the optimal approach because:

- **Full GUI inside VS Code** — Webview panels render HTML/CSS/JS in a VS Code tab. The user never leaves the editor.
- **Direct Settings API access** — the extension host can call `vscode.workspace.getConfiguration()` to read settings and `.update()` to write them. No file copy/paste, no manual JSON editing.
- **Live schema from the running instance** — VS Code exposes the full settings schema (including all installed extension settings) at runtime via the `vscode.workspace.getConfiguration()` API and the internal default settings schema. No need to bundle or maintain a static schema file.
- **No Electron overhead** — VS Code *is* Electron; the extension runs inside it.
- **Marketplace distribution** — users install it like any other extension.

### Alternatives Considered

| Option | Why not |
|---|---|
| Standalone web app | No access to live settings; user must manually export/import JSON. |
| Electron app | Redundant — VS Code is already Electron. Extra install for the user. |
| CLI tool | Violates the core requirement of a GUI with checkboxes/dropdowns. |

## High-Level Architecture

```
┌─────────────────────────────────────────────────┐
│                  VS Code Host                    │
│                                                  │
│  ┌──────────────┐       ┌─────────────────────┐ │
│  │  Extension    │◄─────►│   Webview Panel     │ │
│  │  Host (Node)  │ msg   │   (HTML/CSS/JS)     │ │
│  │               │ pass  │                     │ │
│  │  - Read cfg   │       │  - Tree renderer    │ │
│  │  - Write cfg  │       │  - Input controls   │ │
│  │  - Get schema │       │  - Search/filter    │ │
│  │  - Scope mgmt │       │  - Export UI        │ │
│  └──────────────┘       └─────────────────────┘ │
└─────────────────────────────────────────────────┘
```

Two processes communicate via VS Code's **message passing** API:

1. **Extension Host (Node.js)** — the backend. Has access to the full VS Code API.
2. **Webview Panel (browser sandbox)** — the frontend GUI. Renders HTML, receives data from the extension host, sends user actions back.

## Extension Host Responsibilities

- **Activate** on command (e.g., `vscSettings.open`).
- **Extract the settings schema** — retrieve all registered setting keys, types, defaults, enums, and descriptions from the VS Code configuration registry.
- **Read current values** — call `vscode.workspace.getConfiguration()` for User and Workspace scopes.
- **Write values** — call `configuration.update(key, value, scope)` when the user changes a setting in the GUI.
- **Send data to the webview** — post the full settings tree (schema + current values) on open, and incremental updates on change.
- **Listen for external changes** — subscribe to `vscode.workspace.onDidChangeConfiguration` to keep the webview in sync if settings change outside the panel.

## Webview Responsibilities

- **Render the settings tree** — collapsible tree with namespace grouping.
- **Render input controls** — type-appropriate widgets per setting (see FR-3 in PRD).
- **Search/filter** — client-side filtering of the tree.
- **Send changes back** — when the user modifies a control, post a message to the extension host with the key, new value, and target scope.
- **Export** — generate JSON and offer copy-to-clipboard / download.

## Message Protocol

Messages between the extension host and webview are JSON objects with a `type` field.

### Extension → Webview

| Type | Payload | When |
|---|---|---|
| `init` | `{ settings: SettingNode[], scope: string }` | Panel opens |
| `settingChanged` | `{ key: string, value: any }` | External change detected |

### Webview → Extension

| Type | Payload | When |
|---|---|---|
| `updateSetting` | `{ key: string, value: any, scope: string }` | User changes a control |
| `resetSetting` | `{ key: string, scope: string }` | User resets to default |
| `exportSettings` | `{ format: 'modified' \| 'all' }` | User clicks export |

## Data Model

### SettingNode (tree node)

```typescript
interface SettingNode {
  key: string;                    // e.g., "editor.fontSize"
  label: string;                  // e.g., "fontSize"
  type: 'boolean' | 'string' | 'number' | 'integer' | 'array' | 'object';
  description: string;
  default: any;
  currentValue: any;
  enum?: string[];                // allowed values for dropdowns
  enumDescriptions?: string[];
  minimum?: number;
  maximum?: number;
  isModified: boolean;            // currentValue !== default
  children?: SettingNode[];       // sub-namespace nodes
}
```

Top-level nodes like `editor`, `workbench`, `terminal` have `children` but no `type` — they are purely grouping nodes. Leaf nodes have `type` and input metadata but no `children`.

## Tech Stack

| Layer | Technology |
|---|---|
| Extension host | TypeScript, VS Code Extension API |
| Webview | HTML, CSS, vanilla JS (or lightweight framework if needed) |
| Build | `vsce` for packaging, `esbuild` or `webpack` for bundling |
| Schema source | `vscode.workspace.getConfiguration` + VS Code's internal configuration registry |

## File Structure (Planned)

```
vsc-settings/
├── docs/
│   ├── prd.md
│   └── architecture.md
├── src/
│   ├── extension.ts              # Extension entry point, activation, commands
│   ├── settings-schema-reader.ts # Extract schema from VS Code configuration registry
│   ├── webview-provider.ts       # Creates and manages the Webview panel
│   └── webview/
│       ├── index.html            # Webview HTML shell
│       ├── settings-tree.js      # Tree rendering and interaction logic
│       ├── settings-controls.js  # Input control factory (checkbox, dropdown, etc.)
│       ├── settings-search.js    # Search/filter logic
│       └── styles.css            # Webview styles
├── package.json                  # Extension manifest (contributes commands, activation events)
├── tsconfig.json
└── README.md
```

## Schema Extraction Strategy

VS Code does not have a single public API call that returns the full settings schema with metadata. The approach:

1. **Read `vscode.workspace.getConfiguration()`** — gives access to all current values and defaults.
2. **Access the configuration registry** — VS Code internally maintains a registry of all contributed settings with their JSON Schema metadata. This can be accessed via:
   - The default settings JSON (available at `defaultSettings:` URI scheme internally).
   - Parsing the `configurationDefaults` and `configuration` contribution points from all extensions' `package.json` manifests.
3. **Extension `package.json` scanning** — each installed extension declares its settings in `contributes.configuration`. The extension host can read all installed extensions via `vscode.extensions.all` and extract their configuration schemas.

The most reliable approach for Phase 1: scan `vscode.extensions.all` for configuration contributions and merge with VS Code's built-in configuration schema.

## Security

Webviews in VS Code run in a sandboxed iframe. The extension follows VS Code's Content Security Policy (CSP) best practices:

- No inline scripts — all JS loaded from files.
- CSP header set with nonce-based script loading.
- No external resource loading — everything bundled locally.
- Message passing is the only communication channel between webview and extension host.

## Distribution

The extension is packaged as a `.vsix` file — a self-contained zip archive that includes all compiled code, the extension manifest, and any bundled assets. No external dependencies are fetched at install time.

### Building the `.vsix`

1. Run `npx @vscode/vsce package` from the project root.
2. This produces a file like `vsc-settings-0.1.0.vsix`.

### Installing offline (behind firewalls)

The `.vsix` file can be emailed or transferred to any machine. The recipient installs it with one of:

- **Drag and drop** the `.vsix` file onto the VS Code window.
- **Extensions sidebar** → `...` menu → "Install from VSIX..." → select the file.
- **Command line**: `code --install-extension vsc-settings-0.1.0.vsix`

No internet connection or marketplace access is required. The extension is fully self-contained.

