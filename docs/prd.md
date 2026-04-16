# VSC Settings — Product Requirements Document

## Problem Statement

VS Code has 2,000+ configurable settings (including extension-contributed ones). Every existing approach to discovering and configuring them requires the user to **already know what they're looking for**:

- **Settings UI** (`Cmd+,`) is search-first — you type a keyword and scroll results. If you don't know the setting exists, you'll never find it. The category sidebar helps, but the categories are broad and the list within each is still flat and long.
- **Command Palette** (`Cmd+Shift+P`) can toggle some settings but is entirely search-driven. No browsing, no overview.
- **settings.json** requires knowing exact key names, types, and valid values.

None of these approaches let a user **discover settings by browsing**. There is no point-and-click interface where you can explore what's available without typing a single character. The result: most users never find or configure the vast majority of settings that would improve their workflow.

## Design Principle

**The hierarchy is the navigation.** The user should be able to reach any setting in a few clicks with zero prior knowledge. No typing, no searching, no memorizing key names. Click a category, click a subcategory, see the setting, change it. That's it.

This is a fundamentally different interaction model from VS Code's built-in settings UI. The built-in UI is optimized for people who already know what they want. This extension is optimized for people who want to **explore and discover** what's available.

## Solution

A VS Code extension that provides a GUI panel inside VS Code for browsing and configuring settings entirely through point-and-click interaction. Settings are presented as a **collapsible tree** organized by dot-delimited namespace (e.g., `editor` → `minimap` → `enabled`). The tree structure means any setting is reachable in 2–4 clicks from the root. Each leaf node renders the correct input control for its type (checkbox, dropdown, number spinner, text field, etc.). Changes are applied directly to VS Code settings — no copy/paste, no file editing, no typing required.

## Core User Flow

1. **Panel lives in the right sidebar** — the Settings Explorer opens as a dedicated vertical panel on the right side of VS Code (secondary sidebar), keeping the left sidebar and editor area unobstructed.
2. **Open the panel** by clicking the Settings Explorer icon in the activity bar. One click.
3. **Current settings are pre-loaded** — the user's existing configuration is reflected immediately.
3. **Browse the tree** — click to expand namespace groups (`editor` → `minimap` → `enabled`). A few clicks to any setting, no typing.
4. **Configure settings** by clicking the appropriate control — **no typing anywhere**:
   - **Boolean** → checkbox / toggle
   - **Enum** (string with allowed values) → dropdown / radio buttons
   - **Number** → clickable stepper (+ / − buttons), or dropdown of common values
   - **String (freeform)** → dropdown of common/suggested values where possible; fallback to a picker or preset list
   - **Array** → clickable list with add/remove buttons, items chosen from dropdowns
   - **Object** → structured clickable key-value controls
5. **Hover for details** — hover over any setting to see a tooltip with a verbose description of what it does, its type, default value, and allowed values.
6. **Changes take effect immediately** — settings are written directly to VS Code.
7. **Export** — the resulting `settings.json` is **derived from the clicked state** of all controls. Copy or download it.

## Functional Requirements

### FR-1: Settings Schema Ingestion
- Parse the VS Code settings schema to extract every setting's key, type, default value, enum options, description, and category.
- The schema is published by VS Code and is machine-readable JSON.
- Organize settings into a tree structure based on dot-delimited namespaces (e.g., `editor.fontSize` → `editor` → `fontSize`).

### FR-2: Tree-Based Point-and-Click Navigation
- Render settings as a collapsible/expandable tree that is the **primary and sufficient** way to find any setting.
- The user must be able to reach any setting by clicking only — no typing, no searching, no prior knowledge of what settings exist.
- Top-level nodes are namespace prefixes: `editor`, `workbench`, `terminal`, `files`, `search`, `debug`, etc.
- Sub-namespaces nest further: `editor.minimap`, `editor.suggest`, `editor.bracketPairColorization`.
- Any setting should be reachable in 2–4 clicks from the root.
- Leaf nodes are individual settings with their input controls.
- Expand/collapse all button at the top level.
- The tree hierarchy must be thorough enough that browsing feels fast and natural — the structure does the work, not the user.

### FR-3: Click-Only Input Controls
- **The entire UI is zero-typing.** Every setting is configured by clicking, not by typing into fields.
- Each setting renders a click-based control appropriate to its type:
  - `boolean` → checkbox or toggle switch
  - `string` with `enum` → dropdown or radio button group
  - `string` without enum → dropdown of common/suggested values (derived from VS Code defaults, popular configs, or the schema description)
  - `number` / `integer` → stepper with + / − buttons (respecting `minimum` / `maximum`), or a dropdown of sensible values
  - `array` → clickable list with add/remove; items selected from dropdowns, not typed
  - `object` → structured clickable key-value controls; no raw JSON editing
- Controls show the **current value** with the **default** clearly indicated.
- Modified (non-default) settings are visually highlighted.
- Every control has a one-click **reset to default** button.

### FR-4: Filter by Category
- Filter the tree by clicking category tags or filter chips (e.g., "Modified only", "Editor", "Terminal").
- No search box that requires typing — filtering is done by clicking.
- When filtering, auto-expand parent nodes of matching settings.

### FR-5: Live Settings Integration
- Read the user's current settings on panel open — all controls reflect the live state.
- Changes made via the GUI are applied immediately to VS Code (no manual save step).
- Support both **User** and **Workspace** scope, with a toggle to switch between them.

### FR-6: Export Settings (Derived Output)
- The `settings.json` is **derived entirely from the clicked state** of all controls — the JSON is an output, not something the user edits.
- Generate a clean `settings.json` containing **only modified (non-default) settings**.
- Option to include all settings (with defaults) if user prefers.
- Copy to clipboard button.
- Download as `.json` file button.
- Pretty-printed with 4-space indentation.

### FR-7: Setting Metadata Display (Bubble Help)
- Defaults and allowed values are **visible inline** — the controls themselves show them (the default is indicated on the control, enum options are the radio buttons/dropdown items, min/max are the stepper bounds). These are never repeated in a tooltip.
- Each setting has a **hover tooltip** (bubble help) that appears on mouseover. The tooltip's **only job** is to explain the **purpose** of the setting — what it does, why you'd change it, what it affects. Nothing else.
- The tooltip does **not** show defaults, allowed values, type, or anything already visible in the UI.
- No clicking required to see the description — just hover.

### FR-8: Diff / Changes View
- Show a summary of what's been changed from defaults.
- "N settings modified" counter.
- Quick-jump to modified settings.
- Option to reset individual settings back to default.

## Non-Functional Requirements

- **Runs inside VS Code** — no external app, browser, or server.
- **Fast** — the tree should render and filter responsively even with 2,000+ settings.
- **Offline-portable distribution** — the extension must be distributable as a single `.vsix` file that can be emailed to clients behind firewalls. No marketplace access, no internet connection, and no external dependencies required at install time. The recipient installs it locally via "Install from VSIX" or drag-and-drop.
- **Publishable** — also distributable via the VS Code Marketplace for public users.

## Scope

### Phase 1 (MVP)
- All VS Code built-in settings, plus installed extension settings.
- Tree navigation, type-appropriate controls, search, live read/write, export.
- User scope.

### Phase 2 (Future)
- Workspace vs. User scope toggle.
- VS Code profile support (multiple named configurations).
- Diff between two settings files.
- Favorites / pinned settings.
- Setting presets (e.g., "Minimal UI", "Max Performance").
- **Persistent task/todo panel** — a dedicated panel that Copilot (or any agent) can post task lists to, and the user can dismiss and re-open at will without asking the agent. Survives across messages and is always accessible via a UI control.
