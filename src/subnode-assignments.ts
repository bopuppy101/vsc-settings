/**
 * Sub-node assignments for dense nodes.
 *
 * When a node has custom categories AND dot-segment sub-nodes, this mapping
 * tells the tree builder which sub-nodes to move into which categories.
 * Sub-nodes appear first within their category (commonly used), then curated leaves.
 *
 * Key: parent path (e.g. "editor")
 * Value: map of sub-node key → category name it belongs to
 */
export const subnodeAssignments: Record<string, Record<string, string>> = {
  'editor': {
    // Appearance
    'minimap': 'Appearance',
    'guides': 'Appearance',
    'bracketPairColorization': 'Appearance',
    'semanticHighlighting': 'Appearance',
    'unicodeHighlight': 'Appearance',
    'padding': 'Appearance',

    // Input & Editing
    'smartSelect': 'Input & Editing',
    'snippets': 'Input & Editing',
    'pasteAs': 'Input & Editing',

    // Code Completion / Suggestions
    'suggest': 'Code Completion / Suggestions',
    'inlineSuggest': 'Code Completion / Suggestions',
    'quickSuggestions': 'Code Completion / Suggestions',
    'parameterHints': 'Code Completion / Suggestions',

    // Code Actions & Lens
    'codeActionWidget': 'Code Actions & Lens',
    'lightbulb': 'Code Actions & Lens',

    // Navigation
    'find': 'Navigation',
    'gotoLocation': 'Navigation',
    'rename': 'Navigation',

    // Scrolling
    'scrollbar': 'Scrolling',
    'stickyScroll': 'Scrolling',

    // Display & UI
    'hover': 'Display & UI',
    'inlayHints': 'Display & UI',
    'language': 'Display & UI',
    'Comments': 'Display & UI',

    // Performance
    'experimental': 'Performance',
  },

  'notebook': {
    // Cell Behavior
    'output': 'Cell Behavior',

    // Toolbar & UI
    'breadcrumbs': 'Toolbar & UI',
    'outline': 'Toolbar & UI',
    'navigation': 'Toolbar & UI',

    // Formatting & Code Actions
    'gotoSymbols': 'Formatting & Code Actions',

    // Display
    'markdown': 'Display',
    'markup': 'Display',
    'scrolling': 'Display',
    'stickyScroll': 'Display',

    // Editing & Interaction
    'find': 'Editing & Interaction',
    'diff': 'Editing & Interaction',
    'backup': 'Editing & Interaction',
    'experimental': 'Editing & Interaction',
  },
};
