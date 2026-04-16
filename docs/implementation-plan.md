# Settings Explorer — Implementation Plan

## Context

VS Code has 2000+ settings with up to 7 levels of category hierarchy already curated by setting authors. Settings Explorer uses that hierarchy as its tree. But many settings cluster as flat leaves under dense nodes (e.g. 90 under `git`, 71 under `terminal.integrated`). We need custom categories for those dense nodes so every setting is findable in a few clicks.

## Terminology

- **Settings Explorer** — the VS Code extension we are building (never call it "the extension").
- **Categories** — groupings based on what a setting *does*, not how it's spelled. VS Code's category hierarchy provides these by default. We only add custom ones where VS Code's are too dense.
- **Custom category** — a category we author ourselves because VS Code's hierarchy left too many leaves at one node. Stored in the `custom_categories` table.
- **Dense node** — any tree node with more than ~15-20 direct leaves. These need custom category subgrouping.
- **Category hierarchy** — the 1–7 levels of structure already encoded in setting key names (e.g. `github.copilot.chat.anthropic.tools.websearch.enabled`). Stored as `category1`–`category7` in the `settings` table.
- **Accepted** — a setting whose VS Code hierarchy is fine; no curation needed.
- **Needs curation** — a setting in a dense node, awaiting assignment to a custom category.
- **Curated** — a setting that has been assigned to a custom category.

## Design Decisions

1. **Use VS Code's category hierarchy as the primary tree.** Every dot = one tree level. This is already curated by whoever named the keys. Works perfectly for 3–7 level keys.
2. **Add custom categories only where the existing hierarchy produces dense nodes.** Of 1941 settings, 1200 are already well-organized. Only 741 need our curation work.
3. **No synthetic/mechanical grouping.** No alphabetical ranges ("a–h"), no camelCase prefix groups, no "Other"/"Miscellaneous" junk drawers. Every group must be meaningful to a human looking for that setting.
4. **Understand before assigning.** Every setting's description must be read and understood before placing it in a custom group. Wrong placement = unfindable setting.
5. **Density threshold is a guideline, not a hard rule.** Target: no group > ~15 leaves, no group < 2. But a node with 24 leaves split into groups of 12, 6, and 6 is fine. A node with 14 leaves that reads well is fine too.
6. **Track curation state on each setting.** Every setting has a `curation_status` field: `accepted`, `needs_curation`, or `curated`. This is the work queue — when `needs_curation` count hits zero, we're done.

## Infrastructure

### Postgres

- **Docker container**: `dude-shorts-db`, user `ds`, port `5433`
- **Database**: `vscode_settings`, schema `vscode_categories`
- **Connect**: `docker exec dude-shorts-db psql -U ds -d vscode_settings`

### Database Tables

**`settings`** — every discovered VS Code setting (1941 rows)
| Column | Purpose |
|---|---|
| `key` (PK) | Full dotted key, e.g. `editor.wordWrap` |
| `namespace` | Top-level segment: `editor`, `workbench`, `github` |
| `category1`–`category7` | Individual category levels from the setting key (nullable). For analysis: GROUP BY at any level |
| `dot_path` | All segments as text array |
| `depth` | Segment count |
| `parent_node` | Immediate parent path |
| `leaf_name` | Last segment |
| `type` | boolean, string, number, etc. |
| `description` | What the setting does |
| `default_value` | Default as string |
| `source` | `core` or extension name |
| `curation_status` | `accepted`, `needs_curation`, or `curated` |

**`custom_categories`** — our curated categories for dense nodes
| Column | Purpose |
|---|---|
| `id` (PK) | Serial |
| `parent_node` | Which dense node this category lives under |
| `group_name` | Display name, e.g. "Commit", "Staging", "Remote" |
| `level` | Tree depth of this category |
| `sort_order` | Display order within the parent |
| `parent_category_id` (FK → self) | If set, this category is a subcategory of another custom category. Enables multi-level custom hierarchies (e.g. git → Commit → Workflow) |

**`custom_settings`** — maps settings to our custom groups (child of `custom_categories`)
| Column | Purpose |
|---|---|
| `setting_key` (PK, FK → settings) | The setting being assigned |
| `group_id` (FK → custom_categories) | Which custom group it belongs to |

### Key Source Files

| File | Role |
|---|---|
| `src/settings-schema-reader.ts` | Collects all settings at runtime, builds dot-segment tree, applies TOC labels, JSON dump |
| `src/settings-toc.ts` | TOC category definitions with glob patterns (mirrors VS Code's settingsLayout.ts) |
| `src/settings-webview-provider-mvp.ts` | Webview panel that renders the tree |
| `src/extension.ts` | Settings Explorer entry point, command registration |
| `package.json` | Settings Explorer manifest — commands, views, activation |
| `scripts/import-settings-to-postgres.sh` | JSON dump → Postgres import script |

## What's Done

- [x] Postgres database `vscode_settings` with schema `vscode_categories`
- [x] Three tables: `settings`, `custom_categories`, `custom_settings`
- [x] `settings` table populated with 1941 settings (974 extension + 967 core)
- [x] `curation_status` column added: 1200 accepted, 741 needs_curation
- [x] `level` column added to `custom_categories`
- [x] Settings Explorer discovers all settings at runtime via `buildSettingsTree()`
- [x] Pure dot-segment tree builder works (`buildDeepTree`)
- [x] TOC label renaming works (`applyTOCLabels`)
- [x] Dump command registered: `Settings Explorer: Dump All Settings to JSON`
- [x] Import script: `scripts/import-settings-to-postgres.sh`
- [x] Density analysis complete: 23 dense nodes identified

## Phase 1: Data Pipeline — DONE

- [x] **Step 1** — Added dump command to Settings Explorer. Command: `Settings Explorer: Dump All Settings to JSON`.
- [x] **Step 2** — Import script (`scripts/import-settings-to-postgres.sh`) reads JSON dump, splits keys into category1–7, computes depth/parent_node/leaf_name.
- [x] **Step 3** — Generated settings dump from disk (extension package.json files + VS Code compiled bundle). 1941 settings imported.

## Phase 2: Density Analysis — DONE

- [x] Identified 23 dense nodes with >15 direct leaves.
- [x] Flagged 741 settings as `needs_curation`, 1200 as `accepted`.

### Dense Nodes (23 nodes, 741 settings to curate)

| Parent Node | Leaves | Depth |
|---|---|---|
| `git` | 90 | 2 |
| `terminal.integrated` | 71 | 3 |
| `markdown-preview-enhanced` | 62 | 2 |
| `python.analysis` | 60 | 3 |
| `workbench.editor` | 49 | 3 |
| `editor.suggest` | 42 | 3 |
| `accessibility.signals` | 35 | 3 |
| `breadcrumbs` | 32 | 2 |
| `window` | 29 | 2 |
| `debug` | 21 | 2 |
| `search` | 21 | 2 |
| `css.lint` / `scss.lint` / `less.lint` | 20 each | 3 |
| `scm` | 20 | 2 |
| `accessibility.verbosity` | 19 | 3 |
| `js/ts.format` / `typescript.format` / `javascript.format` | 18–19 each | 3 |
| `terminal` | 18 | 2 |
| `github.copilot.chat` | 18 | 4 |
| `files` | 18 | 2 |
| `explorer` | 18 | 2 |

### Progress Query

```sql
SELECT curation_status, COUNT(*)
FROM vscode_categories.settings
GROUP BY curation_status
ORDER BY curation_status;
```

## Phase 3: Semantic Curation — DONE

All 741 settings curated across 23 dense nodes. 148 custom categories created, 741 assignments made. Multi-level nesting used where warranted (e.g. git → Commit → Workflow/Message/Signing & Identity).

- [x] Query each node's `needs_curation` leaves with descriptions.
- [x] Read every description — understand what each setting does.
- [x] Create custom categories (`INSERT INTO custom_categories` with parent_node, group_name, level).
- [x] Assign each setting to a custom category (`INSERT INTO custom_settings`).
- [x] Update `curation_status` to `curated` for assigned settings.
- [x] Validate: no group > ~15 leaves, no group < 2, no junk drawers.

### Curation order (densest first)

1. [x] `git` (90) — 11 top-level categories, 2 parents (Commit, Remote) with subcategories
2. [x] `terminal.integrated` (71) — 11 top-level, 1 parent (Appearance) with subcategories
3. [x] `markdown-preview-enhanced` (62) — 11 flat categories
4. [x] `python.analysis` (61) — 9 top-level, 1 parent (Type System) with subcategories
5. [x] `workbench.editor` (49) — 8 top-level, 1 parent (Tabs) with subcategories
6. [x] `editor.suggest` (42) — 3 top-level, 1 parent (Completion Types) with subcategories
7. [x] `accessibility.signals` (35) — 7 flat categories
8. [x] `breadcrumbs` (32) — 3 top-level, 1 parent (Symbol Visibility) with subcategories
9. [x] `window` (29) — 5 flat categories
10. [x] `debug` (21) — 4 flat categories
11. [x] `search` (21) — 5 flat categories
12. [x] `css.lint` / `scss.lint` / `less.lint` (20 each) — 5 flat categories each (identical structure)
13. [x] `scm` (20) — 4 flat categories
14. [x] `accessibility.verbosity` (19) — 4 flat categories
15. [x] `js/ts.format` / `typescript.format` / `javascript.format` (18–19 each) — 3 flat categories each
16. [x] `terminal` (18) — 3 flat categories
17. [x] `github.copilot.chat` (18) — 4 flat categories
18. [x] `files` (18) — 4 flat categories
19. [x] `explorer` (18) — 5 flat categories

## Phase 4: Export to Code — DONE

- [x] Export `custom_categories` + `custom_settings` from Postgres into `src/custom-categories.ts`.
- [x] Format as a TypeScript map: parent_node → array of { categoryName, settingKeys[], children? }.
- [x] Export script: `scripts/export-curation-to-typescript.sh`

## Phase 5: Modify Tree Builder — DONE

- [x] Update `settings-schema-reader.ts`: after `buildDeepTree()`, call `applyCustomCategories()`.
- [x] At each node, check if custom categories exist for it.
- [x] If yes, create category nodes and move matching leaves into them.
- [x] Unmatched leaves stay as direct leaves. Existing category hierarchy nodes are never touched.
- [x] Supports nested custom categories (parent → child category nodes).
- [x] Clean compile — zero TypeScript errors.

## Phase 6: Verify

- [x] Compile Settings Explorer — zero errors.
- [ ] Run Settings Explorer in VS Code and confirm tree renders correctly.
- [ ] Confirm category hierarchy is intact for 3–7 level keys.
- [ ] Confirm dense nodes now show custom categories instead of 80+ flat leaves.
- [ ] Confirm every setting is reachable and in a group that makes intuitive sense.
- [ ] Confirm `needs_curation` count is zero.

## Files Modified/Created

| File | Action |
|---|---|
| `src/settings-schema-reader.ts` | Added `applyCustomCategories()` pass after `buildDeepTree()` |
| `src/custom-categories.ts` | New — exported curation data from Postgres (148 categories, 741 settings) |
| `scripts/import-settings-to-postgres.sh` | Done — JSON → Postgres import |
| `scripts/export-curation-to-typescript.sh` | New — Postgres → TypeScript export |
