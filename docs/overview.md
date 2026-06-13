---
summary: vsc-settings — VS Code extension for browsing and configuring all VS Code settings through a clickable tree GUI
stack: TypeScript, VS Code Extension API, webview, Node.js
status: active — early development (v0.1.0)
---

# vsc-settings

"VSC Settings Explorer" is a VS Code extension that lets you discover and
configure VS Code's 2,000+ settings entirely by point-and-click, with no
typing or prior knowledge required. It renders settings as a collapsible tree
organized by dot-delimited namespace, where the hierarchy itself is the
navigation, and exposes commands `vscSettings.open` and
`vscSettings.dumpSettings` plus a sidebar webview panel.

It is a TypeScript extension (`engines.vscode ^1.85.0`); build with
`npm run compile` (`tsc`), package with `vsce`. Source lives in `src/`
(entry `extension.ts`, plus schema reader, webview providers, and the
curated category/grouping modules `custom-categories.ts`, `top-level-groups.ts`,
`subnode-assignments.ts`, `settings-toc.ts`). Helper scripts under `scripts/`
export curation to TypeScript and import settings to Postgres.

**Full detail:** see this repo's `docs/`.
