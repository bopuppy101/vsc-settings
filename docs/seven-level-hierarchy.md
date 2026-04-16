# VS Code Settings: The Full Hierarchy

This document describes the hierarchy of **all** VS Code settings — core and extension — in one tree.

## The Rule

Every setting key is dot-delimited. Each dot segment = one level in the tree. This applies to every setting in VS Code, whether it's a core setting (`editor.suggest.insertMode`) or an extension setting (`github.copilot.chat.anthropic.tools.websearch.enabled`). Same algorithm, same tree.

- No synthetic grouping. No alphabetical ranges. No camelCase buckets. No junk drawers.
- The TOC from `settingsLayout.ts` is a **rename map** (e.g. `editor` → "Text Editor"), not a reorganization system.
- If a node has 30 direct leaves alongside sub-groups, that's the truth. Don't hide it.

Every setting has exactly one home, determined by its key. Nothing else.

## The 72 Top-Level Namespaces

### 37 Core Namespaces (registered internally by VS Code, not in any extension)

```
accessibility    editor          mergeEditor      search
application      explorer        multiDiffEditor  security
breadcrumbs      extensions      network          settingsSync
chat             files           notebook         screencastMode
comments         http            output           task
diffEditor       inlineChat      problems         telemetry
                 interactiveWindow  remote        terminal
                 keyboard        scm              testing
                 launch                           timeline
                 mcp                              update
                                                  window
                                                  workbench
                                                  zenmode
```

### 35 Extension Namespaces (from package.json contributes.configuration)

```
containers: 45      github-enterprise: 1    json: 9
css: 34             grunt: 1                jsts-chat-features: 1
debug: 12           gulp: 1                 less: 32
debugpy: 2          html: 25                markdown: 42
docker: 10          ipynb: 2                markdown-preview-enhanced: 62
emmet: 12           jake: 1                 mediaPreview: 2
git: 104            javascript: 52          merge-conflict: 4
github: 165         js/ts: 93               mermaid-chat: 1
github-authentication: 2                    microsoft-authentication: 1
                                            microsoft-sovereign-cloud: 2
                                            npm: 11
                                            php: 4
                                            python: 118
                                            python-envs: 8
                                            references: 1
                                            scss: 32
                                            simpleBrowser: 1
                                            typescript: 81
```

## How to Discover All Settings

One method for all settings — core and extension alike:

1. Call `vscode.workspace.getConfiguration(namespace)` for every namespace
2. `JSON.parse(JSON.stringify(section))` to get a plain object
3. Recursively walk the object, building dotted key paths
4. Each dot segment = one tree level

This works identically for core namespaces (`editor`, `workbench`, `terminal`) and extension namespaces (`github`, `python`, `docker`). The depth distribution and full tree must be measured this way — at runtime, from the same API, using the same algorithm. No separate counting methods.

**The depth distribution has not yet been measured uniformly.** Extension keys were counted from package.json (846 keys, depths 2–7). Core keys have not been counted the same way yet. The correct next step is to run one pass at activation time that probes all 72 namespaces, counts every key, and reports a single unified depth distribution.

## The Full Hierarchy (from actual keys)

Core settings first — these are the most important. Extension settings follow. Same tree, same algorithm.

```
editor                                              ← Level 1 (core)
├── fontSize                            [LEAF]      ← Level 2
├── tabSize                             [LEAF]      ← Level 2
├── wordWrap                            [LEAF]      ← Level 2
├── suggest                                         ← Level 2
│   ├── insertMode                      [LEAF]      ← Level 3
│   ├── snippetsPreventQuickSuggestions [LEAF]      ← Level 3
│   └── showWords                       [LEAF]      ← Level 3
├── minimap                                         ← Level 2
│   ├── enabled                         [LEAF]      ← Level 3
│   └── maxColumn                       [LEAF]      ← Level 3
└── tokenColorCustomizations            [LEAF]      ← Level 2

workbench                                           ← Level 1 (core)
├── colorTheme                          [LEAF]      ← Level 2
├── editor                                          ← Level 2
│   ├── closeOnFileDelete               [LEAF]      ← Level 3
│   └── enablePreview                   [LEAF]      ← Level 3
└── activityBar                                     ← Level 2
    └── visible                         [LEAF]      ← Level 3

terminal                                            ← Level 1 (core)
└── integrated                                      ← Level 2
    ├── profiles                                    ← Level 3
    │   ├── linux                                   ← Level 4
    │   │   └── (per-profile settings)   [LEAF]     ← Level 5
    │   ├── osx                                     ← Level 4
    │   │   └── (per-profile settings)   [LEAF]     ← Level 5
    │   └── windows                                 ← Level 4
    │       └── (per-profile settings)   [LEAF]     ← Level 5
    ├── shell                                       ← Level 3
    │   ├── linux                        [LEAF]     ← Level 4
    │   ├── osx                          [LEAF]     ← Level 4
    │   └── windows                      [LEAF]     ← Level 4
    └── env                                         ← Level 3
        ├── linux                        [LEAF]     ← Level 4
        ├── osx                          [LEAF]     ← Level 4
        └── windows                      [LEAF]     ← Level 4

github                                              ← Level 1 (extension)
└── copilot                                         ← Level 2
    └── chat                                        ← Level 3
        ├── agent                                   ← Level 4
        │   ├── autoFix                     [LEAF]
        │   ├── omitFileAttachmentContents  [LEAF]
        │   ├── temperature                 [LEAF]
        │   ├── currentEditorContext                 ← Level 5
        │   │   └── enabled                 [LEAF]  ← Level 6
        │   └── largeToolResultsToDisk               ← Level 5
        │       ├── enabled                 [LEAF]  ← Level 6
        │       └── thresholdBytes          [LEAF]  ← Level 6
        ├── agentDebugLog                            ← Level 4
        │   ├── enabled                     [LEAF]
        │   └── fileLogging                          ← Level 5
        │       ├── enabled                 [LEAF]  ← Level 6
        │       ├── flushIntervalMs         [LEAF]  ← Level 6
        │       ├── maxRetainedSessionLogs  [LEAF]  ← Level 6
        │       └── maxSessionLogSizeMB     [LEAF]  ← Level 6
        ├── anthropic                                ← Level 4
        │   ├── useMessagesApi              [LEAF]
        │   ├── contextEditing                       ← Level 5
        │   │   └── mode                    [LEAF]  ← Level 6
        │   ├── thinking                             ← Level 5
        │   │   └── budgetTokens            [LEAF]  ← Level 6
        │   ├── toolSearchTool                       ← Level 5
        │   │   ├── enabled                 [LEAF]  ← Level 6
        │   │   └── mode                    [LEAF]  ← Level 6
        │   └── tools                                ← Level 5
        │       └── websearch                        ← Level 6
        │           ├── allowedDomains      [LEAF]  ← Level 7
        │           ├── blockedDomains      [LEAF]  ← Level 7
        │           ├── enabled             [LEAF]  ← Level 7
        │           ├── maxUses             [LEAF]  ← Level 7
        │           └── userLocation        [LEAF]  ← Level 7
        ├── askAgent                                 ← Level 4
        │   ├── additionalTools             [LEAF]
        │   └── model                       [LEAF]
        ├── backgroundAgent                          ← Level 4
        │   └── enabled                     [LEAF]
        ├── claudeAgent                              ← Level 4
        │   └── allowDangerouslySkipPermissions [LEAF]
        ├── languageContext                           ← Level 4
        │   ├── fix                                  ← Level 5
        │   │   └── typescript                       ← Level 6
        │   │       └── enabled             [LEAF]  ← Level 7
        │   └── inline                               ← Level 5
        │       └── typescript                       ← Level 6
        │           └── enabled             [LEAF]  ← Level 7
        └── ... (30+ more Level 4 categories)
```

docker                                              ← Level 1 (extension)
└── languageserver                                  ← Level 2
    ├── diagnostics                                 ← Level 3
    │   ├── deprecatedMaintainer            [LEAF]  ← Level 4
    │   ├── directiveCasing                 [LEAF]  ← Level 4
    │   ├── emptyContinuationLine           [LEAF]  ← Level 4
    │   ├── instructionCasing               [LEAF]  ← Level 4
    │   ├── instructionCmdMultiple          [LEAF]  ← Level 4
    │   ├── instructionEntrypointMultiple   [LEAF]  ← Level 4
    │   ├── instructionHealthcheckMultiple  [LEAF]  ← Level 4
    │   ├── instructionJSONInSingleQuotes   [LEAF]  ← Level 4
    │   └── instructionWorkdirRelative      [LEAF]  ← Level 4
    └── formatter                                   ← Level 3
        └── ignoreMultilineInstructions     [LEAF]  ← Level 4

python                                              ← Level 1 (extension)
├── analysis                                        ← Level 2
│   ├── typeCheckingMode                    [LEAF]  ← Level 3
│   ├── diagnosticSeverityOverrides         [LEAF]  ← Level 3
│   └── ... (20+ settings at depth 3)
├── testing                                         ← Level 2
│   ├── pytestEnabled                       [LEAF]  ← Level 3
│   └── ...
└── formatting                                      ← Level 2
    └── provider                            [LEAF]  ← Level 3
```

Core settings (`editor`, `terminal`, `workbench`) and extension settings (`github`, `docker`, `python`) are all in the same tree. Same algorithm. Same depth rules. The "(core)" and "(extension)" labels above are for reader context only — the tree doesn't distinguish between them.
