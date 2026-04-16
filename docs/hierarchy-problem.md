# The Hierarchy Problem

## Summary

VS Code settings keys encode up to 7 levels of hierarchy in their dot-separated names, but neither the built-in Settings UI nor our current implementation surfaces that depth. The result is the same flat dump that makes settings undiscoverable.

## The Data

VS Code has ~1,050+ settings. Their keys use dot segments to encode structure:

| Depth | Example Key | Count |
|-------|------------|-------|
| 2 | `editor.wordWrap` | 154 |
| 3 | `editor.suggest.insertMode` | 350 |
| 4 | `terminal.integrated.shell.linux` | 86 |
| 5 | `terminal.integrated.profiles.linux.bash` | 93 |
| 6 | `workbench.colorCustomizations.editor.background` | 39 |
| 7 | (deepest observed) | 7 |

**729 settings (levels 3–7) have hierarchy that the built-in UI throws away.** The built-in Cmd+, UI gives 2 levels (category → flat list), then dumps everything into a scrollable page.

## What We Built So Far

1. **TOC hierarchy** (from VS Code's `settingsLayout.ts`): 7 curated top-level categories (Text Editor, Workbench, Window, Chat, Features, Application, Security) with subcategories. Works well for the first 2 levels.

2. **`buildDeepTree()`**: Splits each setting key by `.` and creates a tree node per segment. This correctly produces the full 7-level hierarchy.

3. **Core settings discovery**: Probes `vscode.workspace.getConfiguration()` for known prefixes since core settings (editor.*, files.*, workbench.*) aren't in `vscode.extensions.all`.

## The Problem

The hierarchy exists in `buildDeepTree()` but gets destroyed or buried by three issues:

### Issue 1: Flat leaves under TOC categories

The TOC pattern `editor.*` matches ~200 settings. After `buildDeepTree()` splits them, the first dot segment (`editor`) is a single wrapper node. We unwrap it (since the TOC already says "Text Editor"), leaving ~40 second-level groups (`suggest`, `minimap`, `find`, etc.) plus ~80 flat leaves (`wordWrap`, `tabSize`, `fontSize`, etc.).

Those 80 flat leaves are 2-segment keys like `editor.wordWrap` — there's no third dot to create depth from. They flood the TOC category alongside curated subcategories.

### Issue 2: Auto-grouping breaks curated structure

We added `autoGroupExcessLeaves()` to handle the 80+ flat leaves. It tried:
- **camelCase prefix grouping** (`auto`, `word`, `render`, etc.) — created 30+ tiny groups, still too many
- **Alphabetical range grouping** (`a – d`, `e – k`) — destroyed the curated TOC hierarchy by running on TOC nodes
- **"Other" consolidation** — created bottomless junk drawers of 80+ miscellaneous settings

Each approach either produced too many groups, or collapsed meaningful structure into meaningless buckets.

### Issue 3: Extensions & Other is a black hole

~848 settings from extensions land in "Extensions & Other." They have good dot-segment hierarchy (e.g., `python.analysis.typeCheckingMode` → 3 levels), but there are so many top-level extension namespaces (~50+) that even with deep trees, the first level is overwhelming.

## The Core Tension

- **2-segment keys** (`editor.wordWrap`) have no inherent sub-hierarchy to exploit. After consuming the first segment as the TOC category, only the leaf name remains.
- **3–7 segment keys** (`terminal.integrated.profiles.linux.bash`) have rich hierarchy but are mixed in with the flat ones.
- **Auto-grouping is a band-aid.** camelCase prefixes and alphabetical ranges create synthetic hierarchy that doesn't match how users think about settings.

## What We Need

A strategy that:

1. **Preserves every dot-segment level** — never unwrap or flatten
2. **Keeps curated TOC categories untouched** — auto-grouping never reorganizes Cursor, Files, Suggestions, etc.
3. **Handles the flat-leaf problem** honestly — either accept that some TOC categories have 15–20 direct leaves, or find a grouping strategy that makes semantic sense (not alphabetical ranges)
4. **Tames Extensions & Other** — 848 settings need navigable structure, probably by extension name as the first level, then dot-segments within

## Current File Pair

| File | Role |
|------|------|
| `src/settings-schema-reader.ts` | Collects settings, builds TOC tree, builds deep tree, auto-groups |
| `src/settings-toc.ts` | TOC category definitions with glob patterns (mirrors VS Code's settingsLayout.ts) |

---

## Current State (Screenshot: `no-more-alpha-categories-use-only-vscode-categories.png`)

### What's visible

```
Text Editor (203)
  ▸ Cursor (7)
  ▸ Diff Editor (14)
  ▼ Files (28)
    ▼ files (28)            ← redundant wrapper, same as parent
      ▼ a – h (14)          ← WRONG: alphabetical range, not a VS Code category
          associations       object
        ▸ auto (5)           ← camelCase group
          candidateGuessEncodings  object
          defaultLanguage    string
          dialog             object
          enableTrash        boolean
          encoding           string
          eol                string
          exclude            object
          hotExit            string
      ▼ i – w (14)          ← WRONG: alphabetical range
          insertFinalNewline boolean
          participants       object
        ▸ readonly (3)
          refactoring        object
          restoreUndoStack   boolean
          saveConflictResolution  string
          simpleDialog       object
        ▸ trim (3)
          watcherExclude     object
          watcherInclude     object
  ▸ Font (5)
  ▸ Formatting (4)
  ▸ General (140)            ← 140 settings dumped here, useless
  ▸ Suggestions (5)
    Find                  —  ← 0 settings, should be hidden
    Minimap               —  ← 0 settings, should be hidden
  ▸ Workbench (81)
  ▸ Window (26)
  ▸ Chat (76)
```

### Specific bugs visible

1. **Alphabetical ranges ("a – h", "i – w")** — These are synthetic groupings that have no meaning. The user does not think about settings alphabetically. These must be removed entirely. Use only VS Code's own category structure.

2. **Redundant wrapper: Files → files** — The TOC says "Files", then `buildDeepTree` creates a "files" node from the dot segment. This is the same thing twice. The dot-segment node should be collapsed into the TOC node.

3. **Find (—) and Minimap (—)** — These TOC subcategories show 0 settings. They should be hidden (the `hasLeaves()` filter isn't catching them, or they have empty `children: []`).

4. **General (140)** — This is the junk drawer. 140 settings with no organization. This is exactly the problem we're trying to solve. These are the 2-segment `editor.*` keys that have no further dot hierarchy.

5. **1517 settings found** — Good, discovery is working. But organization is not.

### Root cause analysis

The fundamental issue is a **mismatch between two hierarchy systems**:

- **System A: VS Code's TOC** — curated categories with glob patterns. Defines 2 levels (category + subcategory). Everything within a subcategory is flat.
- **System B: Dot-segment tree** — mechanical splitting of setting keys by `.`. Produces up to 7 levels but doesn't know about TOC semantics.

We're layering System B inside System A, but:
- System A consumes the first 1–2 dot segments as category names
- System B then gets the remainder and tries to build a tree
- For 2-segment keys (154 settings), there's nothing left for System B — just a leaf
- For 3+ segment keys (729 settings), System B works beautifully
- The 154 flat leaves overwhelm the structured 729

### What must change

1. **No alphabetical ranges. Period.** The `alphaRangeGroup()` function must go. All grouping must use VS Code's own dot-segment hierarchy or VS Code's TOC categories.

2. **No camelCase synthetic groups.** The `camelCaseGroup()` function was a creative idea but produces groups that don't match how VS Code organizes settings.

3. **Preserve full dot depth.** The 7 levels that exist in the keys must appear in the tree. `buildDeepTree()` already does this correctly — stop interfering with its output.

4. **Accept that 2-segment keys are flat.** If `editor.wordWrap` has no sub-hierarchy, show it as a leaf. Don't invent fake hierarchy. If a TOC category has 20 direct leaves, that's OK — it's how VS Code defined them.

5. **Fix the redundant wrapper.** When a TOC pattern is `files.*` and `buildDeepTree` produces a node called `files`, collapse them — the TOC node IS the `files` node.

6. **Hide empty categories.** Find (0) and Minimap (0) should not appear.

7. **Extensions & Other needs per-extension grouping.** Group by extension name (first dot segment), then use `buildDeepTree` within each. This is natural, not synthetic — `python.*` settings belong under a "python" group.
