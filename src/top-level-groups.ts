/**
 * Top-level grouping of settings namespaces.
 *
 * Core groups mirror VS Code's own TOC (settingsLayout.ts) exactly.
 * We do NOT re-curate what VS Code already organized.
 * Extension namespaces (not in VS Code's TOC) are grouped by domain.
 * Any namespace not listed here ends up in "Other Extensions."
 */

export interface TopLevelGroup {
  groupName: string;
  namespaces: string[];
  isCore: boolean;
}

export const topLevelGroups: TopLevelGroup[] = [
  // --- Core groups from VS Code's TOC (do not change) ---
  { groupName: 'Text Editor', namespaces: ['editor', 'diffEditor', 'files'], isCore: true },
  { groupName: 'Workbench', namespaces: ['workbench', 'breadcrumbs', 'zenmode', 'screencastMode'], isCore: true },
  { groupName: 'Window', namespaces: ['window'], isCore: true },
  { groupName: 'Chat', namespaces: ['chat', 'inlineChat'], isCore: true },
  { groupName: 'Features', namespaces: ['explorer', 'search', 'debug', 'testing', 'scm', 'extensions', 'terminal', 'task', 'problems', 'output', 'comments', 'remote', 'timeline', 'notebook', 'mergeEditor', 'accessibility'], isCore: true },
  { groupName: 'Application', namespaces: ['application', 'http', 'keyboard', 'update', 'telemetry', 'settingsSync', 'network'], isCore: true },
  { groupName: 'Security', namespaces: ['security'], isCore: true },

  // --- Extension groups (not in VS Code's TOC — our curation) ---
  { groupName: 'Languages', namespaces: ['javascript', 'typescript', 'js/ts', 'html', 'css', 'scss', 'less', 'json', 'markdown', 'php', 'emmet', 'references'], isCore: false },
  { groupName: 'Python', namespaces: ['python', 'python-envs', 'debugpy'], isCore: false },
  { groupName: 'GitHub & Copilot', namespaces: ['github', 'github-authentication', 'github-enterprise', 'jsts-chat-features', 'mermaid-chat'], isCore: false },
  { groupName: 'Source Control', namespaces: ['git', 'merge-conflict'], isCore: false },
  { groupName: 'Web Tools', namespaces: ['npm', 'grunt', 'gulp', 'jake'], isCore: false },
  { groupName: 'Containers', namespaces: ['containers', 'docker'], isCore: false },
];

// Any namespace not in the groups above lands here
export const fallbackGroupName = 'Other Extensions';
