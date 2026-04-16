/**
 * Settings Table of Contents — mirrors VS Code's own settingsLayout.ts hierarchy.
 * Adapted from https://github.com/microsoft/vscode (MIT License).
 *
 * Each TOC entry has an id, label, optional children, and glob-style setting
 * patterns that determine which settings belong in that category.
 */

export interface TOCEntry {
  id: string;
  label: string;
  patterns: string[];          // e.g. ['editor.cursor*', 'editor.find.*']
  children?: TOCEntry[];
}

export const settingsTOC: TOCEntry[] = [
  {
    id: 'editor',
    label: 'Text Editor',
    patterns: ['editor.*'],
    children: [
      { id: 'editor/cursor', label: 'Cursor', patterns: ['editor.cursor*'] },
      { id: 'editor/find', label: 'Find', patterns: ['editor.find.*'] },
      { id: 'editor/font', label: 'Font', patterns: ['editor.font*'] },
      { id: 'editor/format', label: 'Formatting', patterns: ['editor.format*'] },
      { id: 'editor/diffEditor', label: 'Diff Editor', patterns: ['diffEditor.*'] },
      { id: 'editor/minimap', label: 'Minimap', patterns: ['editor.minimap.*'] },
      { id: 'editor/suggestions', label: 'Suggestions', patterns: ['editor.*suggest*'] },
      { id: 'editor/files', label: 'Files', patterns: ['files.*'] },
    ]
  },
  {
    id: 'workbench',
    label: 'Workbench',
    patterns: ['workbench.*'],
    children: [
      {
        id: 'workbench/appearance',
        label: 'Appearance',
        patterns: [
          'workbench.activityBar.*', 'workbench.*color*', 'workbench.fontAliasing',
          'workbench.iconTheme', 'workbench.sidebar.location', 'workbench.*.visible',
          'workbench.tips.enabled', 'workbench.tree.*', 'workbench.view.*'
        ]
      },
      { id: 'workbench/breadcrumbs', label: 'Breadcrumbs', patterns: ['breadcrumbs.*'] },
      { id: 'workbench/editor', label: 'Editor Management', patterns: ['workbench.editor.*'] },
      { id: 'workbench/settings', label: 'Settings Editor', patterns: ['workbench.settings.*'] },
      { id: 'workbench/zenmode', label: 'Zen Mode', patterns: ['zenmode.*'] },
      { id: 'workbench/screencastmode', label: 'Screencast Mode', patterns: ['screencastMode.*'] },
    ]
  },
  {
    id: 'window',
    label: 'Window',
    patterns: ['window.*'],
    children: [
      { id: 'window/newWindow', label: 'New Window', patterns: ['window.*newwindow*'] },
    ]
  },
  {
    id: 'chat',
    label: 'Chat',
    patterns: ['chat.*'],
    children: [
      {
        id: 'chat/agent',
        label: 'Agent',
        patterns: [
          'chat.agent.*', 'chat.checkpoints.*', 'chat.editRequests',
          'chat.requestQueuing.*', 'chat.undoRequests.*', 'chat.customAgentInSubagent.*',
          'chat.editing.autoAcceptDelay', 'chat.editing.confirmEditRequest*',
          'chat.planAgent.defaultModel'
        ]
      },
      {
        id: 'chat/appearance',
        label: 'Appearance',
        patterns: [
          'chat.editor.*', 'chat.fontFamily', 'chat.fontSize', 'chat.math.*',
          'chat.agentsControl.*', 'chat.alternativeToolAction.*', 'chat.codeBlock.*',
          'chat.editing.explainChanges.enabled', 'chat.editMode.hidden',
          'chat.editorAssociations', 'chat.extensionUnification.*',
          'chat.inlineReferences.*', 'chat.notifyWindow*', 'chat.statusWidget.*',
          'chat.tips.*', 'chat.unifiedAgentsBar.*'
        ]
      },
      { id: 'chat/sessions', label: 'Sessions', patterns: ['chat.sessions.*', 'chat.viewSessions.*', 'chat.restoreLastPanelSession'] },
      { id: 'chat/tools', label: 'Tools', patterns: ['chat.tools.*', 'chat.extensionTools.*'] },
      { id: 'chat/mcp', label: 'MCP', patterns: ['mcp', 'chat.mcp.*', 'mcp.*'] },
      {
        id: 'chat/context',
        label: 'Context',
        patterns: [
          'chat.detectParticipant.*', 'chat.implicitContext.*',
          'chat.promptFilesLocations', 'chat.instructionsFilesLocations',
          'chat.modeFilesLocations', 'chat.agentFilesLocations',
          'chat.agentSkillsLocations', 'chat.hookFilesLocations',
          'chat.useAgentsMdFile', 'chat.useNestedAgentsMdFiles',
          'chat.useAgentSkills', 'chat.useHooks', 'chat.useClaudeMdFile',
          'chat.includeApplyingInstructions', 'chat.includeReferencedInstructions',
          'chat.sendElementsToChat.*'
        ]
      },
      { id: 'chat/inlineChat', label: 'Inline Chat', patterns: ['inlineChat.*'] },
      { id: 'chat/miscellaneous', label: 'Miscellaneous', patterns: ['chat.disableAIFeatures', 'chat.allowAnonymousAccess'] },
    ]
  },
  {
    id: 'features',
    label: 'Features',
    patterns: [],
    children: [
      { id: 'features/accessibilitySignals', label: 'Accessibility Signals', patterns: ['accessibility.signal*'] },
      { id: 'features/accessibility', label: 'Accessibility', patterns: ['accessibility.*'] },
      { id: 'features/explorer', label: 'Explorer', patterns: ['explorer.*', 'outline.*'] },
      { id: 'features/search', label: 'Search', patterns: ['search.*'] },
      { id: 'features/debug', label: 'Debug', patterns: ['debug.*', 'launch'] },
      { id: 'features/testing', label: 'Testing', patterns: ['testing.*'] },
      { id: 'features/scm', label: 'Source Control', patterns: ['scm.*'] },
      { id: 'features/extensions', label: 'Extensions', patterns: ['extensions.*'] },
      { id: 'features/terminal', label: 'Terminal', patterns: ['terminal.*'] },
      { id: 'features/task', label: 'Task', patterns: ['task.*'] },
      { id: 'features/problems', label: 'Problems', patterns: ['problems.*'] },
      { id: 'features/output', label: 'Output', patterns: ['output.*'] },
      { id: 'features/comments', label: 'Comments', patterns: ['comments.*'] },
      { id: 'features/remote', label: 'Remote', patterns: ['remote.*'] },
      { id: 'features/timeline', label: 'Timeline', patterns: ['timeline.*'] },
      { id: 'features/notebook', label: 'Notebook', patterns: ['notebook.*', 'interactiveWindow.*'] },
      { id: 'features/mergeEditor', label: 'Merge Editor', patterns: ['mergeEditor.*'] },
    ]
  },
  {
    id: 'application',
    label: 'Application',
    patterns: ['application.*'],
    children: [
      { id: 'application/http', label: 'Proxy', patterns: ['http.*'] },
      { id: 'application/keyboard', label: 'Keyboard', patterns: ['keyboard.*'] },
      { id: 'application/update', label: 'Update', patterns: ['update.*'] },
      { id: 'application/telemetry', label: 'Telemetry', patterns: ['telemetry.*'] },
      { id: 'application/settingsSync', label: 'Settings Sync', patterns: ['settingsSync.*'] },
      { id: 'application/network', label: 'Network', patterns: ['network.*'] },
      { id: 'application/experimental', label: 'Experimental', patterns: ['application.experimental.*'] },
    ]
  },
  {
    id: 'security',
    label: 'Security',
    patterns: ['security.*'],
    children: [
      { id: 'security/workspace', label: 'Workspace', patterns: ['security.workspace.*'] },
    ]
  },
];

/**
 * Convert a TOC glob pattern like 'editor.cursor*' or 'editor.*suggest*'
 * into a RegExp that matches full setting keys.
 */
function patternToRegex(pattern: string): RegExp {
  // Escape dots, convert * to .*, anchor start and end
  const escaped = pattern
    .replace(/\./g, '\\.')
    .replace(/\*/g, '.*');
  return new RegExp('^' + escaped + '$');
}

interface CompiledTOCEntry {
  id: string;
  label: string;
  regexes: RegExp[];
  children?: CompiledTOCEntry[];
}

function compileTOC(entries: TOCEntry[]): CompiledTOCEntry[] {
  return entries.map(e => ({
    id: e.id,
    label: e.label,
    regexes: e.patterns.map(patternToRegex),
    children: e.children ? compileTOC(e.children) : undefined,
  }));
}

/**
 * Given a setting key, find the deepest TOC entry it belongs to.
 * Returns the path of TOC entry IDs, e.g. ['editor', 'editor/cursor'].
 * Returns null if the key doesn't match any TOC entry.
 */
export function classifySetting(key: string, toc?: CompiledTOCEntry[]): string[] | null {
  const compiled = toc ?? compiledTOC;
  for (const entry of compiled) {
    // Check children first (more specific match)
    if (entry.children) {
      const childMatch = classifyInChildren(key, entry, entry.children);
      if (childMatch) return childMatch;
    }
    // Then check this entry's own patterns
    if (matchesAny(key, entry.regexes)) {
      return [entry.id];
    }
  }
  return null;
}

function classifyInChildren(key: string, parent: CompiledTOCEntry, children: CompiledTOCEntry[]): string[] | null {
  for (const child of children) {
    // Recurse into grandchildren first
    if (child.children) {
      const grandMatch = classifyInChildren(key, child, child.children);
      if (grandMatch) return [parent.id, ...grandMatch];
    }
    if (matchesAny(key, child.regexes)) {
      return [parent.id, child.id];
    }
  }
  // If no child matched but the parent pattern matches, it belongs to the parent
  if (matchesAny(key, parent.regexes)) {
    return [parent.id];
  }
  return null;
}

function matchesAny(key: string, regexes: RegExp[]): boolean {
  return regexes.some(r => r.test(key));
}

// Pre-compiled for performance
const compiledTOC = compileTOC(settingsTOC);
