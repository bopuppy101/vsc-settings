# Category Curation for VS Code Settings

## The Problem

VS Code has 2700+ settings. The built-in settings editor (Cmd+,) presents them as a searchable flat list or a shallow Table of Contents (TOC) with 7 top-level groups. There is no deep organizational hierarchy that allows a user to browse and discover settings intuitively.

The result: settings pile up. 90 git settings dumped under a single node. 71 terminal settings under another. 136 editor settings in a flat list. A user looking for "how to configure branch protection" has to scroll through 90 entries or already know the exact setting name to search for. This is the settings organization that Microsoft ships with VS Code.

VS Code's dot-segment naming convention (e.g., `github.copilot.chat.anthropic.tools.websearch.enabled`) encodes up to 7 levels of hierarchy in the setting key itself. But VS Code's settings UI ignores this hierarchy. Settings Explorer uses it.

## What Curation Means

**Curation** is the process of creating meaningful, human-understandable categories for settings that VS Code left unorganized. It is intellectual work, not mechanical work. Every setting must be read, understood, and placed into a category that a user would intuitively look for.

For example, the 90 settings under `git` were curated into 11 categories: Commit, Staging & Changes, Stash, Branching, Remote (with subcategories for Fetch/Pull/Sync, Push, Clone, Authentication), Repository Detection, Warnings, UI & Display, Setup, and Performance. A user looking for "how do I enable commit signing" would open git → Commit → Signing & Identity and find it immediately.

This is what Microsoft should have done but didn't. We did it for them.

## The Three Curation States

Every setting in the database has a `curation_status` field with one of three values:

### `accepted` (1,186 settings)

VS Code's existing dot-segment hierarchy already organizes this setting well. No additional curation needed. For example, `editor.minimap.enabled` sits under `editor` → `minimap` → `enabled` — three meaningful levels. We accept that hierarchy and don't touch it.

These are settings where the key naming convention already provides enough organizational depth. Typically settings with 3-7 dot segments, where each segment adds meaningful context.

### `needs_curation` (0 remaining — was 942)

This setting was identified as being in a **dense node** — a tree node where too many settings (more than ~15-20) cluster as flat leaves with no further organization. These settings needed to be read, understood, and assigned to a meaningful custom category.

When we started, 942 settings were in this state. The curation process worked through them all. When `needs_curation` count hits zero, the curation pass is complete.

### `curated` (942 settings)

This setting has been read, understood, and assigned to a custom category that we authored. The custom category exists because VS Code's hierarchy left this setting in an unorganized pile. Now it lives in a category that makes sense to a human.

For example, `git.enableCommitSigning` was in the flat list of 90 git settings. After curation, it lives in git → Commit → Signing & Identity. The `curation_status` changed from `needs_curation` to `curated` when the assignment was made.

## The Solution: Three Layers of Organization

Settings Explorer builds a clickable, browsable tree using three layers:

### Layer 1: VS Code's Dot-Segment Hierarchy (never modified)

Every dot in a setting key creates a tree level. `editor.suggest.showIcons` becomes three levels: `editor` → `suggest` → `showIcons`. This hierarchy was authored by whoever named the setting keys. It works well for settings with 3-7 segments. We use it as-is and never modify it.

### Layer 2: VS Code's TOC Labels (applied as-is)

VS Code defines 7 top-level groups in its Table of Contents (`settingsLayout.ts`): Text Editor, Workbench, Window, Chat, Features, Application, Security. These group the top-level namespaces. We apply these labels exactly as VS Code defined them. We never re-curate this level.

### Layer 3: Custom Categories (our curation — only where needed)

For dense nodes where Layer 1 leaves too many settings in a flat list, we add our own categories. These are the 175 custom categories across 25 dense nodes. This is the only layer we author, and it only applies where VS Code's organization falls short.

## Guiding Principles

1. **Never re-curate what VS Code already organized.** VS Code's hierarchy and TOC are the foundation. We only add structure where VS Code left settings in flat, dense lists. Settings marked `accepted` are never touched.

2. **No synthetic grouping.** No alphabetical ranges ("a-h"), no camelCase prefix extraction, no "Other" or "Miscellaneous" junk drawers. Every category must be meaningful to a human looking for a specific setting.

3. **Understand before assigning.** Every setting's description must be read and understood before placing it in a category. Wrong placement makes a setting harder to find, not easier. This is why automated approaches (like what GitHub Copilot attempted with alphabetical grouping) fail.

4. **Density threshold is a guideline.** Target: no category with more than ~15 settings, no category with fewer than 2. But a node with 24 settings split into groups of 12, 6, and 6 is fine. A node with 14 settings that reads well is fine as-is. Judgment overrides numbers.

5. **Track curation state.** The `curation_status` field on every setting is the work queue. It tells you exactly what's been done and what hasn't. When `needs_curation` count is zero, the curation pass is complete.

## The Curation Process

### Phase 1: Data Pipeline

Settings are discovered at runtime by VS Code and exported for analysis:

```
VS Code Runtime → settings-dump.json → Postgres
```

1. Settings Explorer's `dumpAllSettings()` function collects every setting from two sources:
   - **Extension-contributed settings** — reads `vscode.extensions.all`, extracting keys, types, descriptions, and defaults from each extension's `package.json`
   - **Core settings** — probes `vscode.workspace.getConfiguration()` for known prefixes (`editor`, `workbench`, `terminal`, etc.) to discover settings not contributed by any extension

2. The dump command writes `settings-dump.json` — a flat array of every setting with its key, type, description, default value, and source (core or extension name).

3. The import script (`scripts/import-settings-to-postgres.sh`) reads the JSON, splits each key into `category1` through `category7` columns, computes `depth`, `parent_node`, `leaf_name`, and inserts into Postgres.

### Phase 2: Density Analysis

With all settings in Postgres, we identify **dense nodes** — tree nodes where too many settings cluster as flat leaves without further organization.

```sql
SELECT parent_node, COUNT(*) as leaves
FROM vscode_categories.settings
GROUP BY parent_node
HAVING COUNT(*) > 15
ORDER BY COUNT(*) DESC;
```

This query identified 25 dense nodes containing 942 settings that needed curation. The remaining 1,186 settings were marked `accepted` — their dot-segment hierarchy already organized them into small, browsable groups.

### Phase 3: Semantic Curation

This is the core intellectual work. For each dense node, starting with the densest:

1. **Query all settings** in the node with their descriptions:
   ```sql
   SELECT key, leaf_name, description
   FROM vscode_categories.settings
   WHERE parent_node = 'git' AND curation_status = 'needs_curation'
   ORDER BY leaf_name;
   ```

2. **Read and understand** every setting. What does `git.useForcePushWithLease` do? It uses `--force-with-lease` instead of `--force` when force pushing. That belongs in a "Push" category.

3. **Design categories** that a user would intuitively look for. Categories are named after what the user wants to do, not after how the setting key is spelled:
   - "Commit" not "commitSettings"
   - "Code Completion / Suggestions" not "suggest"
   - "Fetch, Pull & Sync" not "remoteFetchPull"

4. **Multi-level nesting** where a single level produces too many categories. For `git` (90 settings), one level gave 16 categories — still too many to scan. Adding a second level (Commit → Workflow/Message/Signing, Remote → Fetch/Push/Clone/Auth) reduced the top level to 11.

5. **Insert categories and assign settings** in Postgres:
   ```sql
   INSERT INTO custom_categories (parent_node, group_name, level, sort_order)
   VALUES ('git', 'Commit', 3, 1);

   INSERT INTO custom_settings (setting_key, group_id)
   SELECT key, (SELECT id FROM custom_categories WHERE group_name = 'Workflow' ...)
   FROM settings WHERE key IN ('git.enableSmartCommit', 'git.verboseCommit', ...);
   ```

6. **Update curation status**:
   ```sql
   UPDATE settings SET curation_status = 'curated'
   WHERE key IN (SELECT setting_key FROM custom_settings);
   ```

7. **Validate** — check that no category exceeds ~15 settings, no category has fewer than 2, and every category name makes sense to a human.

### Phase 4: Export to TypeScript

The curation data in Postgres is exported to `src/custom-categories.ts` for use at runtime:

```bash
./scripts/export-curation-to-typescript.sh
```

This produces a TypeScript map that the tree builder consumes:

```typescript
export const customCategories: Record<string, CustomCategory[]> = {
  "git": [
    {
      categoryName: "Commit",
      settingKeys: [],
      children: [
        { categoryName: "Workflow", settingKeys: ["git.allowNoVerifyCommit", ...] },
        { categoryName: "Message", settingKeys: ["git.inputValidation", ...] },
        { categoryName: "Signing & Identity", settingKeys: ["git.enableCommitSigning", ...] },
      ],
    },
    { categoryName: "Staging & Changes", settingKeys: ["git.untrackedChanges", ...] },
    ...
  ],
};
```

Sub-node assignments (which VS Code dot-segment sub-nodes go inside which custom category) are maintained separately in `src/subnode-assignments.ts`.

### Phase 5: Tree Builder Integration

At runtime, Settings Explorer builds the tree through a pipeline of passes:

1. **`buildDeepTree()`** — creates the tree from dot-segment hierarchy. Every dot creates a level.
2. **`applyTOCLabels()`** — renames nodes using VS Code's TOC display names (e.g., `editor` → "Text Editor").
3. **`applyCustomCategories()`** — at each node with custom categories, creates category group nodes and moves matching settings (both flat leaves and dot-segment sub-nodes) into them. This is where the curation data becomes visible in the tree.
4. **`applyTopLevelGroups()`** — wraps top-level namespaces into VS Code's TOC groups. Core groups (Commonly Used) come first, extension groups (Others) come after a separator.
5. **`sweepLooseLeaves()`** — catches any remaining flat settings that coexist with group nodes and sweeps them into an "Other" group. Prevents orphaned settings from appearing to belong to the wrong category.
6. **`resortTree()`** — final sort at every level. Uppercase-labeled items (VS Code's named features and our categories) sort before lowercase items (raw camelCase setting keys).

### Phase 6: Packaging and Distribution

```bash
npm run compile          # TypeScript → JavaScript
npx vsce package         # Creates .vsix file
code --install-extension vsc-settings-0.1.0.vsix
```

The `.vsix` file is a self-contained package. No npm or build tools needed on the target machine — just install and restart VS Code.

## Database Schema

### Postgres Infrastructure

- **Docker container**: `dude-shorts-db`, user `ds`, port `5433`
- **Database**: `vscode_settings`, schema `vscode_categories`
- **Connect**: `docker exec dude-shorts-db psql -U ds -d vscode_settings`

### Tables

**`settings`** — every discovered VS Code setting

| Column | Purpose |
|---|---|
| `key` (PK) | Full dotted key, e.g. `editor.wordWrap` |
| `namespace` | Top-level segment: `editor`, `workbench`, `github` |
| `category1`–`category7` | Individual category levels from the setting key (nullable). Enables `GROUP BY` at any depth. |
| `dot_path` | All segments as text array |
| `depth` | Number of segments in the key |
| `parent_node` | Immediate parent path (e.g., `editor.suggest` for `editor.suggest.showIcons`) |
| `leaf_name` | Last segment of the key |
| `type` | boolean, string, number, etc. |
| `description` | What the setting does |
| `default_value` | Default value as string |
| `source` | `core` or the extension name that contributes it |
| `curation_status` | `accepted`, `needs_curation`, or `curated` — the work queue |

**`custom_categories`** — the categories we authored for dense nodes

| Column | Purpose |
|---|---|
| `id` (PK) | Serial |
| `parent_node` | Which dense node this category lives under (e.g., `git`, `editor`) |
| `group_name` | Display name seen by the user (e.g., "Commit", "Staging", "Remote") |
| `level` | Tree depth of this category |
| `sort_order` | Display order within the parent |
| `parent_category_id` (FK → self) | If set, this category is nested inside another custom category. Enables multi-level hierarchies (e.g., git → Commit → Workflow). |

**`custom_settings`** — maps each curated setting to its custom category

| Column | Purpose |
|---|---|
| `setting_key` (PK, FK → settings) | The setting being assigned |
| `group_id` (FK → custom_categories) | Which custom category it belongs to |

## Curation Results

### Summary

| Metric | Count |
|---|---|
| Total settings discovered | 2,128+ |
| Settings accepted (VS Code's hierarchy is fine) | 1,186 |
| Settings curated (assigned to custom categories) | 942 |
| Custom categories created | 175 |
| Dense nodes curated | 25 |
| Nodes with multi-level nesting | 7 |

### What "Accepted" Means in Practice

The 1,186 accepted settings are organized well enough by VS Code's dot-segment hierarchy. For example:

- `editor.minimap.enabled` → `editor` → `minimap` → `enabled` (3 levels, clear)
- `github.copilot.chat.agent.autoFix` → `github` → `copilot` → `chat` → `agent` → `autoFix` (5 levels, clear)
- `workbench.colorTheme` → `workbench` → `colorTheme` (2 levels, but `workbench` has few enough direct leaves)

These settings don't need additional categories. The key naming already tells you where to find them.

### What "Curated" Means in Practice

The 942 curated settings were in dense, flat lists. After curation:

- `git.enableCommitSigning` moved from a flat list of 90 → git → Commit → Signing & Identity
- `editor.cursorBlinking` moved from a flat list of 136 → Text Editor → Appearance → Cursor
- `terminal.integrated.fontFamily` moved from a flat list of 71 → terminal.integrated → Appearance → Font & Text
- `notebook.cellExecutionTimeVerbosity` moved from a flat list of 40 → notebook → Cell Behavior

Each of these settings is now reachable in 3-4 clicks through categories that describe what the setting does.

### Dense Nodes Curated

| Node | Settings | Categories | Nesting |
|---|---|---|---|
| `editor` | 136 | 13 top-level | Appearance (4 sub), Input & Editing (5 sub) |
| `git` | 90 | 11 top-level | Commit (3 sub), Remote (4 sub) |
| `terminal.integrated` | 71 | 11 top-level | Appearance (3 sub) |
| `markdown-preview-enhanced` | 62 | 11 flat | — |
| `python.analysis` | 61 | 9 top-level | Type System (2 sub) |
| `workbench.editor` | 49 | 8 top-level | Tabs (4 sub) |
| `editor.suggest` | 42 | 3 top-level | Completion Types (4 sub) |
| `notebook` | 40 | 5 flat | — |
| `accessibility.signals` | 35 | 7 flat | — |
| `breadcrumbs` | 32 | 3 top-level | Symbol Visibility (4 sub) |
| `window` | 29 | 5 flat | — |
| `debug` | 21 | 4 flat | — |
| `search` | 21 | 5 flat | — |
| `css/scss/less.lint` | 20 each | 5 flat each | — |
| `scm` | 20 | 4 flat | — |
| `accessibility.verbosity` | 19 | 4 flat | — |
| `js/ts/typescript/javascript.format` | 18-19 each | 3 flat each | — |
| `terminal` | 18 | 3 flat | — |
| `github.copilot.chat` | 18 | 4 flat | — |
| `files` | 18 | 4 flat | — |
| `explorer` | 18 | 5 flat | — |

### Example: git (90 settings → 11 categories)

Before curation: 90 settings in a flat list under `git`.

After curation:

```
git/
├── Commit/                         (19 settings)
│   ├── Workflow                    (11) — smart commit, post-commit, save before commit
│   ├── Message                     (4)  — input validation, subject length
│   └── Signing & Identity          (4)  — GPG signing, co-author, sign-off
├── Staging & Changes               (5)  — untracked files, discard to trash, count badge
├── Stash                           (3)  — auto-stash, stash message
├── Diff & Merge                    (4)  — merge editor, similarity threshold
├── Remote/                         (20 settings)
│   ├── Fetch, Pull & Sync         (10) — auto-fetch, prune, rebase on sync
│   ├── Push                        (5)  — force push, push notifications
│   ├── Clone                       (2)  — default directory, open after clone
│   └── Authentication              (3)  — GitHub auth, ask-pass
├── Branching                       (9)  — prefix, protection, sort order, validation
├── Repository Detection            (12) — auto-detect, scan depth, submodules, worktrees
├── Warnings                        (5)  — suppress various git warnings
├── UI & Display                    (5)  — action buttons, progress, reference details
├── Setup                           (4)  — enable/disable, git path, logging
└── Performance                     (4)  — auto-refresh, optimistic update, status limit
```

## Key Source Files

| File | Role |
|---|---|
| `src/settings-schema-reader.ts` | Core tree builder — collects settings, builds hierarchy, applies all transformation passes |
| `src/custom-categories.ts` | Auto-generated from Postgres — the TypeScript map of all 175 custom categories and their 942 setting assignments |
| `src/subnode-assignments.ts` | Hand-maintained — maps VS Code's dot-segment sub-nodes to custom categories (e.g., `editor.minimap` → Appearance) |
| `src/top-level-groups.ts` | Top-level grouping — core groups mirror VS Code's TOC exactly, extension groups are our curation |
| `src/settings-toc.ts` | VS Code's own TOC definitions with glob patterns — we apply these as-is, never modify |
| `src/settings-webview-provider-mvp.ts` | Webview — renders the tree with interactive controls, search, and hover tooltips |
| `src/extension.ts` | Extension entry point — registers commands, handles setting update messages from webview |
| `scripts/import-settings-to-postgres.sh` | Data pipeline: JSON dump → Postgres import |
| `scripts/export-curation-to-typescript.sh` | Data pipeline: Postgres → TypeScript export |

## Maintaining Curation Over Time

VS Code updates add new settings. New extensions bring more. The curation process is designed to be repeatable.

### When New Settings Appear

1. **Generate a fresh settings dump** from VS Code (the dump command runs on extension activation, or manually via the command palette).

2. **Import to Postgres** — the import script uses `ON CONFLICT DO NOTHING`, so existing settings are preserved and only new ones are added:
   ```bash
   ./scripts/import-settings-to-postgres.sh settings-dump.json
   ```

3. **Check for new uncurated settings**:
   ```sql
   SELECT curation_status, COUNT(*)
   FROM vscode_categories.settings
   GROUP BY curation_status;
   ```
   If `needs_curation` is greater than zero, there's work to do.

4. **Find which nodes have new dense spots**:
   ```sql
   SELECT parent_node, COUNT(*) as leaves
   FROM vscode_categories.settings
   WHERE curation_status = 'needs_curation'
   GROUP BY parent_node
   ORDER BY COUNT(*) DESC;
   ```

5. **Curate** — read each new setting, assign it to an existing custom category or create a new one if needed.

6. **Export and rebuild**:
   ```bash
   ./scripts/export-curation-to-typescript.sh
   npm run compile
   npx vsce package
   ```

### When to Create New Categories

- An existing category grows beyond ~15 settings → split it
- New settings don't fit any existing category → create a new one
- A new extension adds a dense node (20+ settings under one parent) → curate the whole node

### When NOT to Change Anything

- A setting is already `accepted` and sits in a well-organized dot-segment path → leave it
- VS Code reorganizes their TOC → update `src/settings-toc.ts` and `src/top-level-groups.ts` to match, but don't fight it
- A category has 16 settings but they all clearly belong together → the threshold is a guideline, not a rule

## Lessons Learned

1. **Naming matters.** We renamed `segment1`-`segment7` to `category1`-`category7` and `custom_semantic_groups` to `custom_categories` because the original names described parsing mechanics, not what the data represents. A database schema that reads well is a database schema that survives.

2. **VS Code's hierarchy is the foundation.** Early attempts to invent our own top-level groupings (moving `files` out of Text Editor, creating a "Remote & Network" group that didn't match the TOC) created confusion and bugs. The fix was simple: mirror VS Code's TOC exactly for core settings, only add structure within dense nodes.

3. **Curation requires understanding.** GitHub Copilot attempted this same task using the same AI model (Opus 4.6) and produced alphabetical ranges, camelCase prefix groups, and "Miscellaneous" junk drawers. The difference was not intelligence — it was approach. Every setting must be read and understood before placement. Mechanical grouping produces unfindable categories.

4. **Multi-level nesting reduces cognitive load.** For `git` (90 settings), one level of categories produced 16 siblings — still too many to scan. Adding a second level (Commit → Workflow/Message/Signing, Remote → Fetch/Push/Clone/Auth) reduced the top level to 11. The rule: if a category has subcategories, the user should be able to pick the right one without reading all of them.

5. **Sub-nodes must move with leaves.** When custom categories are applied, VS Code's dot-segment sub-nodes (like `editor.suggest`, `editor.minimap`) must be moved into the appropriate custom category alongside the flat leaf settings. Leaving them as orphaned siblings makes the tree confusing — items appear to belong to the category above them when they don't.

6. **The `curation_status` field is the work queue.** It tells you at a glance: how many settings are organized (`accepted` + `curated`), how many aren't (`needs_curation`), and exactly which ones need attention. When `needs_curation` hits zero, you're done. When VS Code adds new settings, the count goes back up and you know exactly what to work on.
