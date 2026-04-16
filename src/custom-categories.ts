/**
 * Custom categories for dense settings nodes.
 * Auto-generated from Postgres by scripts/export-curation-to-typescript.sh
 * DO NOT EDIT BY HAND — re-run the export script after changing curation data.
 */

export interface CustomCategory {
  categoryName: string;
  settingKeys: string[];
  children?: CustomCategory[];
}

/**
 * Map from parent_node (e.g. "git", "terminal.integrated") to its custom categories.
 * Each category contains the settings that belong to it.
 * Categories with children are purely organizational — their settingKeys will be empty.
 */
export const customCategories: Record<string, CustomCategory[]> = {
  "accessibility.signals": [
    { categoryName: "Chat Signals", settingKeys: ["accessibility.signals.chatEditModifiedFile", "accessibility.signals.chatRequestSent", "accessibility.signals.chatResponseReceived", "accessibility.signals.chatUserActionRequired"] },
    { categoryName: "Diff Signals", settingKeys: ["accessibility.signals.diffLineDeleted", "accessibility.signals.diffLineInserted", "accessibility.signals.diffLineModified"] },
    { categoryName: "Editor Signals", settingKeys: ["accessibility.signals.codeActionApplied", "accessibility.signals.codeActionTriggered", "accessibility.signals.format", "accessibility.signals.lineHasBreakpoint", "accessibility.signals.lineHasError", "accessibility.signals.lineHasFoldedArea", "accessibility.signals.lineHasInlineSuggestion", "accessibility.signals.lineHasWarning", "accessibility.signals.noInlayHints", "accessibility.signals.positionHasError", "accessibility.signals.positionHasWarning"] },
    { categoryName: "Inline Edit Signals", settingKeys: ["accessibility.signals.editsKept", "accessibility.signals.editsUndone", "accessibility.signals.nextEditSuggestion"] },
    { categoryName: "Terminal Signals", settingKeys: ["accessibility.signals.terminalBell", "accessibility.signals.terminalCommandFailed", "accessibility.signals.terminalCommandSucceeded", "accessibility.signals.terminalQuickFix"] },
    { categoryName: "Task & Process Signals", settingKeys: ["accessibility.signals.notebookCellCompleted", "accessibility.signals.notebookCellFailed", "accessibility.signals.onDebugBreak", "accessibility.signals.taskCompleted", "accessibility.signals.taskFailed"] },
    { categoryName: "General Signals", settingKeys: ["accessibility.signals.clear", "accessibility.signals.progress", "accessibility.signals.save", "accessibility.signals.voiceRecordingStarted", "accessibility.signals.voiceRecordingStopped"] },
  ],
  "accessibility.verbosity": [
    { categoryName: "Editor", settingKeys: ["accessibility.verbosity.comments", "accessibility.verbosity.diffEditor", "accessibility.verbosity.diffEditorActive", "accessibility.verbosity.emptyEditorHint", "accessibility.verbosity.find", "accessibility.verbosity.hover"] },
    { categoryName: "Chat & AI", settingKeys: ["accessibility.verbosity.inlineChat", "accessibility.verbosity.inlineCompletions", "accessibility.verbosity.panelChat", "accessibility.verbosity.sessionsChat"] },
    { categoryName: "Views & Panels", settingKeys: ["accessibility.verbosity.debug", "accessibility.verbosity.keybindingsEditor", "accessibility.verbosity.notebook", "accessibility.verbosity.replEditor", "accessibility.verbosity.sourceControl"] },
    { categoryName: "Terminal & Notifications", settingKeys: ["accessibility.verbosity.notification", "accessibility.verbosity.terminal", "accessibility.verbosity.terminalChatOutput", "accessibility.verbosity.walkthrough"] },
  ],
  "breadcrumbs": [
    {
      categoryName: "Symbol Visibility",
      settingKeys: [],
      children: [
        { categoryName: "Type Symbols", settingKeys: ["breadcrumbs.showClasses", "breadcrumbs.showConstructors", "breadcrumbs.showEnumMembers", "breadcrumbs.showEnums", "breadcrumbs.showInterfaces", "breadcrumbs.showModules", "breadcrumbs.showStructs", "breadcrumbs.showTypeParameters"] },
        { categoryName: "Member Symbols", settingKeys: ["breadcrumbs.showConstants", "breadcrumbs.showEvents", "breadcrumbs.showFields", "breadcrumbs.showFunctions", "breadcrumbs.showMethods", "breadcrumbs.showOperators", "breadcrumbs.showProperties"] },
        { categoryName: "Value & Data Symbols", settingKeys: ["breadcrumbs.showArrays", "breadcrumbs.showBooleans", "breadcrumbs.showKeys", "breadcrumbs.showNull", "breadcrumbs.showNumbers", "breadcrumbs.showObjects"] },
        { categoryName: "Resource Symbols", settingKeys: ["breadcrumbs.showFiles", "breadcrumbs.showNamespaces", "breadcrumbs.showPackages", "breadcrumbs.showStrings", "breadcrumbs.showVariables"] },
      ],
    },
    { categoryName: "Navigation", settingKeys: ["breadcrumbs.symbolPath", "breadcrumbs.symbolPathSeparator", "breadcrumbs.symbolSortOrder"] },
    { categoryName: "Display", settingKeys: ["breadcrumbs.enabled", "breadcrumbs.filePath", "breadcrumbs.icons"] },
  ],
  "css.lint": [
    { categoryName: "Properties & Values", settingKeys: ["css.lint.duplicateProperties", "css.lint.hexColorLength", "css.lint.propertyIgnoredDueToDisplay", "css.lint.unknownProperties", "css.lint.validProperties", "css.lint.zeroUnits"] },
    { categoryName: "Layout & Box Model", settingKeys: ["css.lint.boxModel", "css.lint.float", "css.lint.fontFaceProperties"] },
    { categoryName: "Selectors & Importance", settingKeys: ["css.lint.idSelector", "css.lint.important", "css.lint.universalSelector"] },
    { categoryName: "Vendor & Compatibility", settingKeys: ["css.lint.compatibleVendorPrefixes", "css.lint.ieHack", "css.lint.unknownVendorSpecificProperties", "css.lint.vendorPrefix"] },
    { categoryName: "Syntax & Imports", settingKeys: ["css.lint.argumentsInColorFunction", "css.lint.emptyRules", "css.lint.importStatement", "css.lint.unknownAtRules"] },
  ],
  "debug": [
    { categoryName: "Breakpoints", settingKeys: ["debug.allowBreakpointsEverywhere", "debug.gutterMiddleClickAction", "debug.showBreakpointsInOverviewRuler", "debug.showInlineBreakpointCandidates"] },
    { categoryName: "Variables & Values", settingKeys: ["debug.autoExpandLazyVariables", "debug.inlineValues", "debug.showVariableTypes"] },
    { categoryName: "Session Behavior", settingKeys: ["debug.closeReadonlyTabsOnEnd", "debug.confirmOnExit", "debug.focusEditorOnBreak", "debug.focusWindowOnBreak", "debug.hideSlowPreLaunchWarning", "debug.onTaskErrors", "debug.saveBeforeStart"] },
    { categoryName: "UI & Layout", settingKeys: ["debug.enableStatusBarColor", "debug.hideLauncherWhileDebugging", "debug.openDebug", "debug.openExplorerOnEnd", "debug.showInStatusBar", "debug.showSubSessionsInToolBar", "debug.toolBarLocation"] },
  ],
  "editor": [
    {
      categoryName: "Appearance",
      settingKeys: [],
      children: [
        { categoryName: "Font & Typography", settingKeys: ["editor.allowVariableFonts", "editor.allowVariableFontsInAccessibilityMode", "editor.allowVariableLineHeights", "editor.fontFamily", "editor.fontLigatures", "editor.fontSize", "editor.fontVariations", "editor.fontWeight", "editor.letterSpacing", "editor.lineHeight"] },
        { categoryName: "Cursor", settingKeys: ["editor.cursorBlinking", "editor.cursorHeight", "editor.cursorSmoothCaretAnimation", "editor.cursorStyle", "editor.cursorSurroundingLines", "editor.cursorSurroundingLinesStyle", "editor.cursorWidth", "editor.overtypeCursorStyle"] },
        { categoryName: "Line Display", settingKeys: ["editor.lineNumbers", "editor.renderControlCharacters", "editor.renderFinalNewline", "editor.renderLineHighlight", "editor.renderLineHighlightOnlyWhenFocus", "editor.renderWhitespace", "editor.rulers"] },
        { categoryName: "Color & Tokens", settingKeys: ["editor.colorDecorators", "editor.colorDecoratorsActivatedOn", "editor.colorDecoratorsLimit", "editor.defaultColorDecorators", "editor.semanticTokenColorCustomizations", "editor.tokenColorCustomizations"] },
      ],
    },
    {
      categoryName: "Input & Editing",
      settingKeys: [],
      children: [
        { categoryName: "Indentation & Tabs", settingKeys: ["editor.autoIndent", "editor.autoIndentOnPaste", "editor.autoIndentOnPasteWithinString", "editor.detectIndentation", "editor.indentSize", "editor.insertSpaces", "editor.stickyTabStops", "editor.tabSize", "editor.useTabStops"] },
        { categoryName: "Auto-closing & Brackets", settingKeys: ["editor.autoClosingBrackets", "editor.autoClosingComments", "editor.autoClosingDelete", "editor.autoClosingOvertype", "editor.autoClosingQuotes", "editor.autoSurround", "editor.matchBrackets"] },
        { categoryName: "Word Wrap", settingKeys: ["editor.wordWrap", "editor.wordWrapColumn", "editor.wrapOnEscapedLineFeeds", "editor.wrappingIndent", "editor.wrappingStrategy"] },
        { categoryName: "Selection & Multi-cursor", settingKeys: ["editor.columnSelection", "editor.doubleClickSelectsBlock", "editor.multiCursorLimit", "editor.multiCursorMergeOverlapping", "editor.multiCursorModifier", "editor.multiCursorPaste"] },
        { categoryName: "Copy, Paste & Drag", settingKeys: ["editor.copyWithSyntaxHighlighting", "editor.dragAndDrop", "editor.dropIntoEditor", "editor.emptySelectionClipboard", "editor.overtypeOnPaste"] },
      ],
    },
    { categoryName: "Code Completion / Suggestions", settingKeys: ["editor.acceptSuggestionOnCommitCharacter", "editor.acceptSuggestionOnEnter", "editor.quickSuggestionsDelay", "editor.snippetSuggestions", "editor.suggestFontSize", "editor.suggestLineHeight", "editor.suggestOnTriggerCharacters", "editor.suggestSelection", "editor.tabCompletion", "editor.wordBasedSuggestions"] },
    { categoryName: "Code Actions & Lens", settingKeys: ["editor.codeActions", "editor.codeActionsOnSave", "editor.codeLens", "editor.codeLensFontFamily", "editor.codeLensFontSize"] },
    { categoryName: "Formatting", settingKeys: ["editor.defaultFormatter", "editor.formatOnPaste", "editor.formatOnSave", "editor.formatOnSaveMode", "editor.formatOnType"] },
    { categoryName: "Scrolling", settingKeys: ["editor.fastScrollSensitivity", "editor.inertialScroll", "editor.mouseWheelScrollSensitivity", "editor.mouseWheelZoom", "editor.scrollBeyondLastColumn", "editor.scrollBeyondLastLine", "editor.scrollOnMiddleClick", "editor.scrollPredominantAxis", "editor.smoothScrolling"] },
    { categoryName: "Folding", settingKeys: ["editor.defaultFoldingRangeProvider", "editor.folding", "editor.foldingHighlight", "editor.foldingImportsByDefault", "editor.foldingMaximumRegions", "editor.foldingStrategy", "editor.showFoldingControls", "editor.unfoldOnClickAfterEndOfLine"] },
    { categoryName: "Highlighting", settingKeys: ["editor.occurrencesHighlight", "editor.occurrencesHighlightDelay", "editor.selectionHighlight", "editor.selectionHighlightMaxLength", "editor.selectionHighlightMultiline"] },
    { categoryName: "Navigation", settingKeys: ["editor.definitionLinkOpensInPeek", "editor.linkedEditing", "editor.links", "editor.peekWidgetDefaultFocus", "editor.renameOnType", "editor.stablePeek"] },
    { categoryName: "Word & Whitespace", settingKeys: ["editor.trimAutoWhitespace", "editor.trimWhitespaceOnDelete", "editor.unusualLineTerminators", "editor.wordBreak", "editor.wordSegmenterLocales", "editor.wordSeparators"] },
    { categoryName: "Accessibility", settingKeys: ["editor.accessibilityPageSize", "editor.accessibilitySupport", "editor.inlineCompletionsAccessibilityVerbose", "editor.renderRichScreenReaderContent", "editor.screenReaderAnnounceInlineSuggestion", "editor.tabFocusMode"] },
    { categoryName: "Display & UI", settingKeys: ["editor.glyphMargin", "editor.hideCursorInOverviewRuler", "editor.mouseMiddleClickAction", "editor.overviewRulerBorder", "editor.roundedSelection", "editor.showDeprecated", "editor.showUnused"] },
    { categoryName: "Performance", settingKeys: ["editor.aiStats", "editor.editContext", "editor.experimentalGpuAcceleration", "editor.experimentalWhitespaceRendering", "editor.largeFileOptimizations", "editor.maxTokenizationLineLength"] },
  ],
  "editor.suggest": [
    {
      categoryName: "Completion Types",
      settingKeys: [],
      children: [
        { categoryName: "Type Symbols", settingKeys: ["editor.suggest.filteredTypes", "editor.suggest.showClasses", "editor.suggest.showConstructors", "editor.suggest.showEnumMembers", "editor.suggest.showEnums", "editor.suggest.showInterfaces", "editor.suggest.showModules", "editor.suggest.showStructs", "editor.suggest.showTypeParameters"] },
        { categoryName: "Member Symbols", settingKeys: ["editor.suggest.showConstants", "editor.suggest.showEvents", "editor.suggest.showFields", "editor.suggest.showFunctions", "editor.suggest.showKeywords", "editor.suggest.showMethods", "editor.suggest.showOperators", "editor.suggest.showProperties"] },
        { categoryName: "Value Symbols", settingKeys: ["editor.suggest.showColors", "editor.suggest.showCustomcolors", "editor.suggest.showUnits", "editor.suggest.showValues", "editor.suggest.showVariables", "editor.suggest.showWords"] },
        { categoryName: "Resource Symbols", settingKeys: ["editor.suggest.showDeprecated", "editor.suggest.showFiles", "editor.suggest.showFolders", "editor.suggest.showIssues", "editor.suggest.showReferences", "editor.suggest.showSnippets", "editor.suggest.showUsers"] },
      ],
    },
    { categoryName: "Display", settingKeys: ["editor.suggest.maxVisibleSuggestions", "editor.suggest.showIcons", "editor.suggest.showInlineDetails", "editor.suggest.showStatusBar"] },
    { categoryName: "Behavior", settingKeys: ["editor.suggest.filterGraceful", "editor.suggest.insertMode", "editor.suggest.localityBonus", "editor.suggest.matchOnWordStartOnly", "editor.suggest.preview", "editor.suggest.selectionMode", "editor.suggest.shareSuggestSelections", "editor.suggest.snippetsPreventQuickSuggestions"] },
  ],
  "explorer": [
    { categoryName: "Confirmations", settingKeys: ["explorer.confirmDelete", "explorer.confirmDragAndDrop", "explorer.confirmPasteNative", "explorer.confirmUndo"] },
    { categoryName: "Drag & Drop", settingKeys: ["explorer.autoOpenDroppedFile", "explorer.enableDragAndDrop", "explorer.enableUndo"] },
    { categoryName: "Display & Layout", settingKeys: ["explorer.autoReveal", "explorer.autoRevealExclude", "explorer.compactFolders", "explorer.excludeGitIgnore", "explorer.expandSingleFolderWorkspaces"] },
    { categoryName: "Sorting", settingKeys: ["explorer.sortOrder", "explorer.sortOrderLexicographicOptions", "explorer.sortOrderReverse"] },
    { categoryName: "Clipboard & Naming", settingKeys: ["explorer.copyPathSeparator", "explorer.copyRelativePathSeparator", "explorer.incrementalNaming"] },
  ],
  "files": [
    { categoryName: "Auto Save", settingKeys: ["files.autoSave", "files.autoSaveDelay", "files.autoSaveWhenNoErrors", "files.autoSaveWorkspaceFilesOnly"] },
    { categoryName: "Encoding", settingKeys: ["files.autoGuessEncoding", "files.candidateGuessEncodings", "files.encoding", "files.eol"] },
    { categoryName: "Save Behavior", settingKeys: ["files.insertFinalNewline", "files.saveConflictResolution", "files.trimFinalNewlines", "files.trimTrailingWhitespace", "files.trimTrailingWhitespaceInRegexAndStrings"] },
    { categoryName: "Setup", settingKeys: ["files.defaultLanguage", "files.enableTrash", "files.restoreUndoStack", "files.watcherExclude", "files.watcherInclude"] },
  ],
  "git": [
    {
      categoryName: "Commit",
      settingKeys: [],
      children: [
        { categoryName: "Workflow", settingKeys: ["git.allowNoVerifyCommit", "git.confirmEmptyCommits", "git.confirmNoVerifyCommit", "git.enableSmartCommit", "git.postCommitCommand", "git.promptToSaveFilesBeforeCommit", "git.rememberPostCommitCommand", "git.smartCommitChanges", "git.suggestSmartCommit", "git.useEditorAsCommitInput", "git.verboseCommit"] },
        { categoryName: "Message", settingKeys: ["git.inputValidation", "git.inputValidationLength", "git.inputValidationSubjectLength", "git.showCommitInput"] },
        { categoryName: "Signing & Identity", settingKeys: ["git.addAICoAuthor", "git.alwaysSignOff", "git.enableCommitSigning", "git.requireGitUserConfig"] },
      ],
    },
    { categoryName: "Staging & Changes", settingKeys: ["git.alwaysShowStagedChangesResourceGroup", "git.confirmCommittedDelete", "git.countBadge", "git.discardUntrackedChangesToTrash", "git.untrackedChanges"] },
    { categoryName: "Stash", settingKeys: ["git.autoStash", "git.promptToSaveFilesBeforeStash", "git.useCommitInputAsStashMessage"] },
    { categoryName: "Diff & Merge", settingKeys: ["git.closeDiffOnOperation", "git.mergeEditor", "git.openDiffOnClick", "git.similarityThreshold"] },
    {
      categoryName: "Remote",
      settingKeys: [],
      children: [
        { categoryName: "Fetch, Pull & Sync", settingKeys: ["git.autofetch", "git.autofetchPeriod", "git.confirmSync", "git.enableStatusBarSync", "git.fetchOnPull", "git.followTagsWhenSync", "git.pruneOnFetch", "git.pullTags", "git.rebaseWhenSync", "git.replaceTagsWhenPull"] },
        { categoryName: "Push", settingKeys: ["git.allowForcePush", "git.confirmForcePush", "git.showPushSuccessNotification", "git.useForcePushIfIncludes", "git.useForcePushWithLease"] },
        { categoryName: "Clone", settingKeys: ["git.defaultCloneDirectory", "git.openAfterClone"] },
        { categoryName: "Authentication", settingKeys: ["git.githubAuthentication", "git.terminalAuthentication", "git.useIntegratedAskPass"] },
      ],
    },
    { categoryName: "Branching", settingKeys: ["git.branchPrefix", "git.branchProtection", "git.branchProtectionPrompt", "git.branchSortOrder", "git.branchValidationRegex", "git.branchWhitespaceChar", "git.checkoutType", "git.defaultBranchName", "git.pullBeforeCheckout"] },
    { categoryName: "Repository Detection", settingKeys: ["git.autoRepositoryDetection", "git.detectSubmodules", "git.detectSubmodulesLimit", "git.detectWorktrees", "git.detectWorktreesLimit", "git.ignoreSubmodules", "git.ignoredRepositories", "git.openRepositoryInParentFolders", "git.repositoryScanIgnoredFolders", "git.repositoryScanMaxDepth", "git.scanRepositories", "git.worktreeIncludeFiles"] },
    { categoryName: "Warnings", settingKeys: ["git.ignoreLegacyWarning", "git.ignoreLimitWarning", "git.ignoreMissingGitWarning", "git.ignoreRebaseWarning", "git.ignoreWindowsGit27Warning"] },
    { categoryName: "UI & Display", settingKeys: ["git.commitShortHashLength", "git.showActionButton", "git.showInlineOpenFileAction", "git.showProgress", "git.showReferenceDetails"] },
    { categoryName: "Setup", settingKeys: ["git.commandsToLog", "git.enabled", "git.path", "git.terminalGitEditor"] },
    { categoryName: "Performance", settingKeys: ["git.autorefresh", "git.optimisticUpdate", "git.statusLimit", "git.supportCancellation"] },
  ],
  "github.copilot.chat": [
    { categoryName: "Agent & History", settingKeys: ["github.copilot.chat.agentHistorySummarizationInline", "github.copilot.chat.agentHistorySummarizationMode", "github.copilot.chat.omitBaseAgentInstructions", "github.copilot.chat.summarizeAgentConversationHistoryThreshold"] },
    { categoryName: "API & Model", settingKeys: ["github.copilot.chat.completionsFetcher", "github.copilot.chat.gpt5AlternativePatch", "github.copilot.chat.nesFetcher", "github.copilot.chat.responsesApiReasoningSummary", "github.copilot.chat.useResponsesApiTruncation"] },
    { categoryName: "Instructions & Context", settingKeys: ["github.copilot.chat.additionalReadAccessPaths", "github.copilot.chat.customInstructionsInSystemMessage", "github.copilot.chat.useProjectTemplates"] },
    { categoryName: "Behavior & UI", settingKeys: ["github.copilot.chat.debugTerminalCommandPatterns", "github.copilot.chat.enableUserPreferences", "github.copilot.chat.localeOverride", "github.copilot.chat.rateLimitAutoSwitchToAuto", "github.copilot.chat.scopeSelection", "github.copilot.chat.terminalChatLocation"] },
  ],
  "javascript.format": [
    { categoryName: "Spacing", settingKeys: ["javascript.format.insertSpaceAfterCommaDelimiter", "javascript.format.insertSpaceAfterConstructor", "javascript.format.insertSpaceAfterFunctionKeywordForAnonymousFunctions", "javascript.format.insertSpaceAfterKeywordsInControlFlowStatements", "javascript.format.insertSpaceAfterOpeningAndBeforeClosingEmptyBraces", "javascript.format.insertSpaceAfterOpeningAndBeforeClosingJsxExpressionBraces", "javascript.format.insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces", "javascript.format.insertSpaceAfterOpeningAndBeforeClosingNonemptyBrackets", "javascript.format.insertSpaceAfterOpeningAndBeforeClosingNonemptyParenthesis", "javascript.format.insertSpaceAfterOpeningAndBeforeClosingTemplateStringBraces", "javascript.format.insertSpaceAfterSemicolonInForStatements", "javascript.format.insertSpaceBeforeAndAfterBinaryOperators", "javascript.format.insertSpaceBeforeFunctionParenthesis"] },
    { categoryName: "Braces & Indentation", settingKeys: ["javascript.format.indentSwitchCase", "javascript.format.placeOpenBraceOnNewLineForControlBlocks", "javascript.format.placeOpenBraceOnNewLineForFunctions"] },
    { categoryName: "General", settingKeys: ["javascript.format.enable", "javascript.format.semicolons"] },
  ],
  "js/ts.format": [
    { categoryName: "Spacing", settingKeys: ["js/ts.format.insertSpaceAfterCommaDelimiter", "js/ts.format.insertSpaceAfterConstructor", "js/ts.format.insertSpaceAfterFunctionKeywordForAnonymousFunctions", "js/ts.format.insertSpaceAfterKeywordsInControlFlowStatements", "js/ts.format.insertSpaceAfterOpeningAndBeforeClosingEmptyBraces", "js/ts.format.insertSpaceAfterOpeningAndBeforeClosingJsxExpressionBraces", "js/ts.format.insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces", "js/ts.format.insertSpaceAfterOpeningAndBeforeClosingNonemptyBrackets", "js/ts.format.insertSpaceAfterOpeningAndBeforeClosingNonemptyParenthesis", "js/ts.format.insertSpaceAfterOpeningAndBeforeClosingTemplateStringBraces", "js/ts.format.insertSpaceAfterSemicolonInForStatements", "js/ts.format.insertSpaceAfterTypeAssertion", "js/ts.format.insertSpaceBeforeAndAfterBinaryOperators", "js/ts.format.insertSpaceBeforeFunctionParenthesis"] },
    { categoryName: "Braces & Indentation", settingKeys: ["js/ts.format.indentSwitchCase", "js/ts.format.placeOpenBraceOnNewLineForControlBlocks", "js/ts.format.placeOpenBraceOnNewLineForFunctions"] },
    { categoryName: "General", settingKeys: ["js/ts.format.enabled", "js/ts.format.semicolons"] },
  ],
  "less.lint": [
    { categoryName: "Properties & Values", settingKeys: ["less.lint.duplicateProperties", "less.lint.hexColorLength", "less.lint.propertyIgnoredDueToDisplay", "less.lint.unknownProperties", "less.lint.validProperties", "less.lint.zeroUnits"] },
    { categoryName: "Layout & Box Model", settingKeys: ["less.lint.boxModel", "less.lint.float", "less.lint.fontFaceProperties"] },
    { categoryName: "Selectors & Importance", settingKeys: ["less.lint.idSelector", "less.lint.important", "less.lint.universalSelector"] },
    { categoryName: "Vendor & Compatibility", settingKeys: ["less.lint.compatibleVendorPrefixes", "less.lint.ieHack", "less.lint.unknownVendorSpecificProperties", "less.lint.vendorPrefix"] },
    { categoryName: "Syntax & Imports", settingKeys: ["less.lint.argumentsInColorFunction", "less.lint.emptyRules", "less.lint.importStatement", "less.lint.unknownAtRules"] },
  ],
  "markdown-preview-enhanced": [
    { categoryName: "Preview", settingKeys: ["markdown-preview-enhanced.alwaysShowBacklinksInPreview", "markdown-preview-enhanced.automaticallyShowPreviewOfMarkdownBeingEdited", "markdown-preview-enhanced.disableAutoPreviewForUriSchemes", "markdown-preview-enhanced.enablePreviewZenMode", "markdown-preview-enhanced.liveUpdate", "markdown-preview-enhanced.liveUpdateDebounceMs", "markdown-preview-enhanced.previewMode", "markdown-preview-enhanced.scrollSync"] },
    { categoryName: "Theme & Appearance", settingKeys: ["markdown-preview-enhanced.codeBlockTheme", "markdown-preview-enhanced.hideDefaultVSCodeMarkdownPreviewButtons", "markdown-preview-enhanced.previewColorScheme", "markdown-preview-enhanced.previewTheme", "markdown-preview-enhanced.revealjsTheme"] },
    { categoryName: "Markdown Parsing", settingKeys: ["markdown-preview-enhanced.breakOnSingleNewLine", "markdown-preview-enhanced.enableCriticMarkupSyntax", "markdown-preview-enhanced.enableEmojiSyntax", "markdown-preview-enhanced.enableExtendedTableSyntax", "markdown-preview-enhanced.enableLinkify", "markdown-preview-enhanced.enableTypographer", "markdown-preview-enhanced.frontMatterRenderingOption"] },
    { categoryName: "Math & LaTeX", settingKeys: ["markdown-preview-enhanced.latexEngine", "markdown-preview-enhanced.mathBlockDelimiters", "markdown-preview-enhanced.mathInlineDelimiters", "markdown-preview-enhanced.mathRenderingOnlineService", "markdown-preview-enhanced.mathRenderingOption", "markdown-preview-enhanced.mathjaxV3ScriptSrc"] },
    { categoryName: "Diagrams", settingKeys: ["markdown-preview-enhanced.krokiServer", "markdown-preview-enhanced.mermaidTheme", "markdown-preview-enhanced.plantumlJarPath", "markdown-preview-enhanced.plantumlServer", "markdown-preview-enhanced.webSequenceDiagramsApiKey", "markdown-preview-enhanced.webSequenceDiagramsServer"] },
    { categoryName: "Wiki Links", settingKeys: ["markdown-preview-enhanced.enableWikiLinkSyntax", "markdown-preview-enhanced.useGitHubStylePipedLink", "markdown-preview-enhanced.wikiLinkTargetFileExtension", "markdown-preview-enhanced.wikiLinkTargetFileNameChangeCase"] },
    { categoryName: "HTML5 Embed", settingKeys: ["markdown-preview-enhanced.HTML5EmbedAudioAttributes", "markdown-preview-enhanced.HTML5EmbedIsAllowedHttp", "markdown-preview-enhanced.HTML5EmbedUseImageSyntax", "markdown-preview-enhanced.HTML5EmbedUseLinkSyntax", "markdown-preview-enhanced.HTML5EmbedVideoAttributes", "markdown-preview-enhanced.enableHTML5Embed"] },
    { categoryName: "Pandoc", settingKeys: ["markdown-preview-enhanced.pandocArguments", "markdown-preview-enhanced.pandocMarkdownFlavor", "markdown-preview-enhanced.pandocPath", "markdown-preview-enhanced.usePandocParser"] },
    { categoryName: "Images & Upload", settingKeys: ["markdown-preview-enhanced.imageFolderPath", "markdown-preview-enhanced.imageMagickPath", "markdown-preview-enhanced.imageUploader", "markdown-preview-enhanced.qiniuAccessKey", "markdown-preview-enhanced.qiniuBucket", "markdown-preview-enhanced.qiniuDomain", "markdown-preview-enhanced.qiniuSecretKey"] },
    { categoryName: "Export", settingKeys: ["markdown-preview-enhanced.chromePath", "markdown-preview-enhanced.printBackground", "markdown-preview-enhanced.puppeteerArgs", "markdown-preview-enhanced.puppeteerWaitForTimeout"] },
    { categoryName: "Setup & Security", settingKeys: ["markdown-preview-enhanced.configPath", "markdown-preview-enhanced.enableScriptExecution", "markdown-preview-enhanced.jsdelivrCdnHost", "markdown-preview-enhanced.markdownFileExtensions", "markdown-preview-enhanced.protocolsWhiteList"] },
  ],
  "notebook": [
    { categoryName: "Cell Behavior", settingKeys: ["notebook.cellExecutionTimeVerbosity", "notebook.cellFailureDiagnostics", "notebook.cellFocusIndicator", "notebook.confirmDeleteRunningCell", "notebook.inlineValues", "notebook.showCellStatusBar", "notebook.variablesView"] },
    { categoryName: "Toolbar & UI", settingKeys: ["notebook.cellToolbarLocation", "notebook.cellToolbarVisibility", "notebook.consolidatedOutputButton", "notebook.consolidatedRunButton", "notebook.globalToolbar", "notebook.globalToolbarShowLabel"] },
    { categoryName: "Formatting & Code Actions", settingKeys: ["notebook.codeActionsOnSave", "notebook.defaultFormatter", "notebook.formatOnCellExecution", "notebook.formatOnSave", "notebook.insertFinalNewline"] },
    { categoryName: "Display", settingKeys: ["notebook.compactView", "notebook.displayOrder", "notebook.editorOptionsCustomizations", "notebook.insertToolbarLocation", "notebook.lineNumbers", "notebook.showFoldingControls"] },
    { categoryName: "Editing & Interaction", settingKeys: ["notebook.dragAndDropEnabled", "notebook.multiCursor", "notebook.undoRedoPerCell"] },
  ],
  "python.analysis": [
    { categoryName: "Diagnostics", settingKeys: ["python.analysis.diagnosticMode", "python.analysis.diagnosticSeverityOverrides", "python.analysis.diagnosticsSource", "python.analysis.disableTaggedHints", "python.analysis.displayEnglishDiagnostics", "python.analysis.enableTroubleshootMissingImports", "python.analysis.ignore"] },
    {
      categoryName: "Type System",
      settingKeys: [],
      children: [
        { categoryName: "Type Checking & Stubs", settingKeys: ["python.analysis.generateWithTypeAnnotation", "python.analysis.stubPath", "python.analysis.typeCheckingMode", "python.analysis.typeshedPaths", "python.analysis.useLibraryCodeForTypes"] },
        { categoryName: "Type Server", settingKeys: ["python.analysis.enableExternalTypeServer", "python.analysis.enableMangleName", "python.analysis.nodeArguments", "python.analysis.nodeExecutable", "python.analysis.typeServerArguments", "python.analysis.typeServerExecutable"] },
      ],
    },
    { categoryName: "Imports & Completions", settingKeys: ["python.analysis.autoImportCompletions", "python.analysis.completeFunctionParens", "python.analysis.enableEditableInstalls", "python.analysis.extraCommitChars", "python.analysis.importFormat", "python.analysis.includeAliasesFromUserFiles", "python.analysis.showOnlyDirectDependenciesInAutoImport"] },
    { categoryName: "Indexing", settingKeys: ["python.analysis.enableParallelIndexing", "python.analysis.indexing", "python.analysis.packageIndexDepths", "python.analysis.persistAllIndices", "python.analysis.regenerateStdLibIndices", "python.analysis.userFileIndexingLimit"] },
    { categoryName: "Code Editing", settingKeys: ["python.analysis.autoFormatStrings", "python.analysis.autoIndent", "python.analysis.autoSplitStrings", "python.analysis.autoTranslateDocstrings", "python.analysis.supportDocstringTemplate", "python.analysis.supportRestructuredText"] },
    { categoryName: "Search Paths & Scope", settingKeys: ["python.analysis.autoSearchPaths", "python.analysis.exclude", "python.analysis.extraPaths", "python.analysis.include", "python.analysis.includeExtraPathSymbolsInSymbolSearch", "python.analysis.includeVenvInWorkspaceSymbols"] },
    { categoryName: "IntelliSense", settingKeys: ["python.analysis.aiCodeActions", "python.analysis.aiHoverSummaries", "python.analysis.enableColorPicker", "python.analysis.fixAll", "python.analysis.gotoDefinitionInStringLiteral", "python.analysis.referencesCodeLens"] },
    { categoryName: "Setup", settingKeys: ["python.analysis.enablePytestSupport", "python.analysis.languageServerMode", "python.analysis.logLevel", "python.analysis.pyrightVersion", "python.analysis.supportAllPythonDocuments", "python.analysis.useNearestConfiguration"] },
    { categoryName: "Performance & Telemetry", settingKeys: ["python.analysis.cacheLSPData", "python.analysis.enableAsyncProgram", "python.analysis.enablePerfTelemetry", "python.analysis.enableSnippetExtraTelemetry", "python.analysis.findRefsInBackgroundThread", "python.analysis.reportExtraTelemetry"] },
  ],
  "scm": [
    { categoryName: "Diff Decorations", settingKeys: ["scm.diffDecorations", "scm.diffDecorationsGutterAction", "scm.diffDecorationsGutterPattern", "scm.diffDecorationsGutterVisibility", "scm.diffDecorationsGutterWidth", "scm.diffDecorationsIgnoreTrimWhitespace"] },
    { categoryName: "Commit Input", settingKeys: ["scm.inputFontFamily", "scm.inputFontSize", "scm.inputMaxLineCount", "scm.inputMinLineCount"] },
    { categoryName: "View & Display", settingKeys: ["scm.alwaysShowActions", "scm.alwaysShowRepositories", "scm.autoReveal", "scm.compactFolders", "scm.defaultViewMode", "scm.defaultViewSortKey", "scm.showActionButton"] },
    { categoryName: "Badges & Actions", settingKeys: ["scm.countBadge", "scm.providerCountBadge", "scm.showInputActionButton"] },
  ],
  "scss.lint": [
    { categoryName: "Properties & Values", settingKeys: ["scss.lint.duplicateProperties", "scss.lint.hexColorLength", "scss.lint.propertyIgnoredDueToDisplay", "scss.lint.unknownProperties", "scss.lint.validProperties", "scss.lint.zeroUnits"] },
    { categoryName: "Layout & Box Model", settingKeys: ["scss.lint.boxModel", "scss.lint.float", "scss.lint.fontFaceProperties"] },
    { categoryName: "Selectors & Importance", settingKeys: ["scss.lint.idSelector", "scss.lint.important", "scss.lint.universalSelector"] },
    { categoryName: "Vendor & Compatibility", settingKeys: ["scss.lint.compatibleVendorPrefixes", "scss.lint.ieHack", "scss.lint.unknownVendorSpecificProperties", "scss.lint.vendorPrefix"] },
    { categoryName: "Syntax & Imports", settingKeys: ["scss.lint.argumentsInColorFunction", "scss.lint.emptyRules", "scss.lint.importStatement", "scss.lint.unknownAtRules"] },
  ],
  "search": [
    { categoryName: "Search Engine", settingKeys: ["search.maintainFileSearchCache", "search.usePCRE2", "search.useRipgrep"] },
    { categoryName: "Search Behavior", settingKeys: ["search.maxResults", "search.searchOnType", "search.searchOnTypeDebouncePeriod", "search.seedOnFocus", "search.seedWithNearestWord", "search.smartCase"] },
    { categoryName: "File Filtering", settingKeys: ["search.followSymlinks", "search.useGlobalIgnoreFiles", "search.useIgnoreFiles", "search.useParentIgnoreFiles"] },
    { categoryName: "Results Display", settingKeys: ["search.actionsPosition", "search.collapseResults", "search.showLineNumbers", "search.sortOrder", "search.useReplacePreview"] },
    { categoryName: "UI & Layout", settingKeys: ["search.defaultViewMode", "search.globalFindClipboard", "search.location"] },
  ],
  "terminal": [
    { categoryName: "Standard Colors", settingKeys: ["terminal.ansiBlack", "terminal.ansiBlue", "terminal.ansiCyan", "terminal.ansiGreen", "terminal.ansiMagenta", "terminal.ansiRed", "terminal.ansiWhite", "terminal.ansiYellow"] },
    { categoryName: "Bright Colors", settingKeys: ["terminal.ansiBrightBlack", "terminal.ansiBrightBlue", "terminal.ansiBrightCyan", "terminal.ansiBrightGreen", "terminal.ansiBrightMagenta", "terminal.ansiBrightRed", "terminal.ansiBrightWhite", "terminal.ansiBrightYellow"] },
    { categoryName: "View Integration", settingKeys: ["terminal.explorerKind", "terminal.sourceControlRepositoriesKind"] },
  ],
  "terminal.integrated": [
    {
      categoryName: "Appearance",
      settingKeys: [],
      children: [
        { categoryName: "Font & Text", settingKeys: ["terminal.integrated.customGlyphs", "terminal.integrated.fontFamily", "terminal.integrated.fontSize", "terminal.integrated.fontWeight", "terminal.integrated.fontWeightBold", "terminal.integrated.letterSpacing", "terminal.integrated.lineHeight", "terminal.integrated.rescaleOverlappingGlyphs"] },
        { categoryName: "Cursor", settingKeys: ["terminal.integrated.cursorBlinking", "terminal.integrated.cursorStyle", "terminal.integrated.cursorStyleInactive", "terminal.integrated.cursorWidth"] },
        { categoryName: "Rendering", settingKeys: ["terminal.integrated.drawBoldTextInBrightColors", "terminal.integrated.enableImages", "terminal.integrated.gpuAcceleration", "terminal.integrated.tabStopWidth", "terminal.integrated.textBlinking", "terminal.integrated.unicodeVersion"] },
      ],
    },
    { categoryName: "Scrolling", settingKeys: ["terminal.integrated.fastScrollSensitivity", "terminal.integrated.mouseWheelScrollSensitivity", "terminal.integrated.mouseWheelZoom", "terminal.integrated.scrollback", "terminal.integrated.smoothScrolling"] },
    { categoryName: "Keyboard", settingKeys: ["terminal.integrated.allowChords", "terminal.integrated.allowMnemonics", "terminal.integrated.enableKittyKeyboardProtocol", "terminal.integrated.enableWin32InputMode", "terminal.integrated.macOptionIsMeta", "terminal.integrated.sendKeybindingsToShell"] },
    { categoryName: "Mouse & Selection", settingKeys: ["terminal.integrated.altClickMovesCursor", "terminal.integrated.copyOnSelection", "terminal.integrated.enableMultiLinePasteWarning", "terminal.integrated.ignoreBracketedPasteMode", "terminal.integrated.macOptionClickForcesSelection", "terminal.integrated.middleClickBehavior", "terminal.integrated.rightClickBehavior", "terminal.integrated.wordSeparators"] },
    { categoryName: "Shell & Environment", settingKeys: ["terminal.integrated.autoReplies", "terminal.integrated.cwd", "terminal.integrated.detectLocale", "terminal.integrated.environmentChangesRelaunch", "terminal.integrated.inheritEnv", "terminal.integrated.splitCwd", "terminal.integrated.useWslProfiles", "terminal.integrated.windowsUseConptyDll"] },
    { categoryName: "Session Persistence", settingKeys: ["terminal.integrated.enablePersistentSessions", "terminal.integrated.persistentSessionReviveProcess", "terminal.integrated.persistentSessionScrollback"] },
    { categoryName: "Links", settingKeys: ["terminal.integrated.allowedLinkSchemes", "terminal.integrated.enableFileLinks", "terminal.integrated.showLinkHover"] },
    { categoryName: "Notifications & Bell", settingKeys: ["terminal.integrated.bellDuration", "terminal.integrated.enableBell", "terminal.integrated.enableNotifications", "terminal.integrated.enableVisualBell"] },
    { categoryName: "Local Echo", settingKeys: ["terminal.integrated.localEchoEnabled", "terminal.integrated.localEchoExcludePrograms", "terminal.integrated.localEchoLatencyThreshold", "terminal.integrated.localEchoStyle"] },
    { categoryName: "Panel Behavior", settingKeys: ["terminal.integrated.allowInUntrustedWorkspace", "terminal.integrated.confirmOnExit", "terminal.integrated.confirmOnKill", "terminal.integrated.defaultLocation", "terminal.integrated.focusAfterRun", "terminal.integrated.hideOnLastClosed", "terminal.integrated.hideOnStartup", "terminal.integrated.ignoreProcessNames", "terminal.integrated.showExitAlert"] },
    { categoryName: "Accessibility", settingKeys: ["terminal.integrated.accessibleViewFocusOnCommandExecution", "terminal.integrated.accessibleViewPreserveCursorPosition", "terminal.integrated.initialHint", "terminal.integrated.minimumContrastRatio"] },
  ],
  "typescript.format": [
    { categoryName: "Spacing", settingKeys: ["typescript.format.insertSpaceAfterCommaDelimiter", "typescript.format.insertSpaceAfterConstructor", "typescript.format.insertSpaceAfterFunctionKeywordForAnonymousFunctions", "typescript.format.insertSpaceAfterKeywordsInControlFlowStatements", "typescript.format.insertSpaceAfterOpeningAndBeforeClosingEmptyBraces", "typescript.format.insertSpaceAfterOpeningAndBeforeClosingJsxExpressionBraces", "typescript.format.insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces", "typescript.format.insertSpaceAfterOpeningAndBeforeClosingNonemptyBrackets", "typescript.format.insertSpaceAfterOpeningAndBeforeClosingNonemptyParenthesis", "typescript.format.insertSpaceAfterOpeningAndBeforeClosingTemplateStringBraces", "typescript.format.insertSpaceAfterSemicolonInForStatements", "typescript.format.insertSpaceAfterTypeAssertion", "typescript.format.insertSpaceBeforeAndAfterBinaryOperators", "typescript.format.insertSpaceBeforeFunctionParenthesis"] },
    { categoryName: "Braces & Indentation", settingKeys: ["typescript.format.indentSwitchCase", "typescript.format.placeOpenBraceOnNewLineForControlBlocks", "typescript.format.placeOpenBraceOnNewLineForFunctions"] },
    { categoryName: "General", settingKeys: ["typescript.format.enable", "typescript.format.semicolons"] },
  ],
  "window": [
    { categoryName: "Title Bar & Menu", settingKeys: ["window.commandCenter", "window.customMenuBarAltFocus", "window.customTitleBarVisibility", "window.enableMenuBarMnemonics", "window.menuBarVisibility", "window.menuStyle", "window.title", "window.titleBarStyle", "window.titleSeparator"] },
    { categoryName: "Window Style", settingKeys: ["window.border", "window.clickThroughInactive", "window.controlsStyle", "window.dialogStyle", "window.systemColorTheme"] },
    { categoryName: "Opening Windows", settingKeys: ["window.newWindowDimensions", "window.newWindowProfile", "window.openFilesInNewWindow", "window.openFoldersInNewWindow", "window.openWithoutArgumentsInNewWindow"] },
    { categoryName: "Closing & Restoring", settingKeys: ["window.closeWhenEmpty", "window.confirmBeforeClose", "window.confirmSaveUntitledWorkspace", "window.doubleClickIconToClose", "window.restoreFullscreen", "window.restoreWindows"] },
    { categoryName: "Display & Zoom", settingKeys: ["window.nativeFullScreen", "window.nativeTabs", "window.zoomLevel", "window.zoomPerWindow"] },
  ],
  "workbench.editor": [
    {
      categoryName: "Tabs",
      settingKeys: [],
      children: [
        { categoryName: "Tab Appearance", settingKeys: ["workbench.editor.highlightModifiedTabs", "workbench.editor.labelFormat", "workbench.editor.showIcons", "workbench.editor.showTabIndex", "workbench.editor.showTabs", "workbench.editor.tabSizing", "workbench.editor.tabSizingFixedMaxWidth", "workbench.editor.tabSizingFixedMinWidth", "workbench.editor.wrapTabs"] },
        { categoryName: "Tab Actions", settingKeys: ["workbench.editor.scrollToSwitchTabs", "workbench.editor.tabActionCloseVisibility", "workbench.editor.tabActionLocation", "workbench.editor.tabActionUnpinVisibility"] },
        { categoryName: "Pinned Tabs", settingKeys: ["workbench.editor.pinnedTabSizing", "workbench.editor.pinnedTabsOnSeparateRow", "workbench.editor.preventPinnedEditorClose"] },
        { categoryName: "Title Bar", settingKeys: ["workbench.editor.alwaysShowEditorActions", "workbench.editor.editorActionsLocation", "workbench.editor.titleScrollbarSizing", "workbench.editor.titleScrollbarVisibility"] },
      ],
    },
    { categoryName: "Editor Groups & Layout", settingKeys: ["workbench.editor.autoLockGroups", "workbench.editor.centeredLayoutAutoResize", "workbench.editor.centeredLayoutFixedWidth", "workbench.editor.closeEmptyGroups", "workbench.editor.doubleClickTabToToggleEditorGroupSizes", "workbench.editor.splitInGroupLayout", "workbench.editor.splitOnDragAndDrop", "workbench.editor.splitSizing"] },
    { categoryName: "Preview Mode", settingKeys: ["workbench.editor.enablePreview", "workbench.editor.enablePreviewFromCodeNavigation", "workbench.editor.enablePreviewFromQuickOpen"] },
    { categoryName: "Opening Behavior", settingKeys: ["workbench.editor.closeOnFileDelete", "workbench.editor.defaultBinaryEditor", "workbench.editor.dragToOpenWindow", "workbench.editor.openPositioning", "workbench.editor.openSideBySideDirection", "workbench.editor.revealIfOpen", "workbench.editor.useModal"] },
    { categoryName: "Navigation", settingKeys: ["workbench.editor.focusRecentEditorAfterClose", "workbench.editor.mouseBackForwardToNavigate", "workbench.editor.navigationScope", "workbench.editor.swipeToNavigate"] },
    { categoryName: "Language Detection", settingKeys: ["workbench.editor.historyBasedLanguageDetection", "workbench.editor.languageDetection", "workbench.editor.languageDetectionHints", "workbench.editor.preferHistoryBasedLanguageDetection"] },
    { categoryName: "Session Restore", settingKeys: ["workbench.editor.restoreEditors", "workbench.editor.restoreViewState", "workbench.editor.sharedViewState"] },
  ],
};
