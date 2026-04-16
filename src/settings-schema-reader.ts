import * as vscode from 'vscode';
import { settingsTOC, TOCEntry } from './settings-toc';
import { customCategories, CustomCategory } from './custom-categories';
import { topLevelGroups, fallbackGroupName } from './top-level-groups';
import { subnodeAssignments } from './subnode-assignments';

export interface SettingNode {
  key: string;
  label: string;
  type?: 'boolean' | 'string' | 'number' | 'integer' | 'array' | 'object';
  description?: string;
  default?: any;
  currentValue?: any;
  enum?: string[];
  enumDescriptions?: string[];
  minimum?: number;
  maximum?: number;
  isModified?: boolean;
  children?: SettingNode[];
}

interface ConfigProperty {
  type?: string;
  description?: string;
  default?: any;
  enum?: string[];
  enumDescriptions?: string[];
  minimum?: number;
  maximum?: number;
}

interface FlatSetting {
  key: string;
  prop: ConfigProperty;
  currentValue: any;
  defaultValue: any;
  isModified: boolean;
}

/**
 * Build the settings tree. Dot segments are the hierarchy — nothing else.
 * TOC provides display labels for well-known nodes.
 */
export function buildSettingsTree(scope: vscode.ConfigurationTarget): SettingNode[] {
  const config = vscode.workspace.getConfiguration();
  const allSettings = collectAllSettings(config, scope);
  const tree = buildDeepTree(allSettings);
  applyTOCLabels(tree, settingsTOC);
  applyCustomCategories(tree, '');
  const grouped = applyTopLevelGroups(tree);
  sweepLooseLeaves(grouped);
  resortTree(grouped);
  return grouped;
}

/**
 * Export every discovered setting as a flat JSON array for analysis.
 * Each entry has the full key, type, description, default value, and source.
 * Used to populate the Postgres vscode_categories.settings table.
 */
export interface DumpedSetting {
  key: string;
  type: string | undefined;
  description: string;
  defaultValue: any;
  source: string;
}

export function dumpAllSettings(scope: vscode.ConfigurationTarget): DumpedSetting[] {
  const config = vscode.workspace.getConfiguration();
  const seen = new Set<string>();
  const dumped: DumpedSetting[] = [];

  // Source 1: Extension-contributed settings
  for (const ext of vscode.extensions.all) {
    const configs = ext.packageJSON?.contributes?.configuration;
    if (!configs) continue;

    const extName = ext.packageJSON?.displayName ?? ext.packageJSON?.name ?? ext.id;
    const configArray = Array.isArray(configs) ? configs : [configs];
    for (const cfgBlock of configArray) {
      if (!cfgBlock.properties) continue;
      for (const [key, prop] of Object.entries(cfgBlock.properties)) {
        if (seen.has(key)) continue;
        seen.add(key);
        const p = prop as ConfigProperty;
        const inspect = config.inspect(key);
        dumped.push({
          key,
          type: normalizeType(p.type) ?? (inspect?.defaultValue !== undefined ? typeof inspect.defaultValue : undefined),
          description: p.description ?? '',
          defaultValue: inspect?.defaultValue ?? p.default,
          source: extName,
        });
      }
    }
  }

  // Source 2: Core settings probed by prefix
  const corePrefixes = [
    'editor', 'workbench', 'window', 'files', 'search', 'debug',
    'terminal', 'explorer', 'problems', 'output', 'scm', 'extensions',
    'breadcrumbs', 'diffEditor', 'multiDiffEditor', 'testing',
    'comments', 'remote', 'timeline', 'notebook', 'interactiveWindow',
    'mergeEditor', 'zenmode', 'screencastMode', 'accessibility',
    'security', 'application', 'update', 'telemetry', 'settingsSync',
    'http', 'keyboard', 'network', 'task', 'launch', 'chat',
    'inlineChat', 'mcp'
  ];

  for (const prefix of corePrefixes) {
    const section = vscode.workspace.getConfiguration(prefix);
    const raw = JSON.parse(JSON.stringify(section));
    if (typeof raw === 'object' && raw !== null) {
      extractKeysFromObject(raw, prefix, (key) => {
        if (seen.has(key)) return;
        seen.add(key);
        const inspect = config.inspect(key);
        if (inspect) {
          dumped.push({
            key,
            type: inspect.defaultValue !== undefined ? typeof inspect.defaultValue : undefined,
            description: '',
            defaultValue: inspect.defaultValue,
            source: 'core',
          });
        }
      });
    }
  }

  return dumped;
}

// ---------- Collection ----------

function collectAllSettings(
  config: vscode.WorkspaceConfiguration,
  scope: vscode.ConfigurationTarget
): FlatSetting[] {
  const seen = new Set<string>();
  const settings: FlatSetting[] = [];

  function addSetting(key: string, prop: ConfigProperty) {
    if (seen.has(key)) return;
    seen.add(key);

    const inspect = config.inspect(key);
    const currentValue = scope === vscode.ConfigurationTarget.Workspace
      ? inspect?.workspaceValue
      : inspect?.globalValue;
    const defaultValue = inspect?.defaultValue ?? prop.default;

    settings.push({
      key,
      prop: {
        type: prop.type ?? (inspect?.defaultValue !== undefined ? typeof inspect.defaultValue : undefined),
        description: prop.description ?? '',
        default: defaultValue,
        enum: prop.enum,
        enumDescriptions: prop.enumDescriptions,
        minimum: prop.minimum,
        maximum: prop.maximum,
      },
      currentValue: currentValue !== undefined ? currentValue : defaultValue,
      defaultValue,
      isModified: currentValue !== undefined &&
        JSON.stringify(currentValue) !== JSON.stringify(defaultValue),
    });
  }

  // Source 1: Extension-contributed settings (includes built-in extensions)
  for (const ext of vscode.extensions.all) {
    const configs = ext.packageJSON?.contributes?.configuration;
    if (!configs) continue;

    const configArray = Array.isArray(configs) ? configs : [configs];
    for (const cfgBlock of configArray) {
      if (!cfgBlock.properties) continue;
      for (const [key, prop] of Object.entries(cfgBlock.properties)) {
        addSetting(key, prop as ConfigProperty);
      }
    }

    const defaults = ext.packageJSON?.contributes?.configurationDefaults;
    if (defaults && typeof defaults === 'object') {
      for (const key of Object.keys(defaults)) {
        if (!seen.has(key)) {
          addSetting(key, { default: defaults[key] });
        }
      }
    }
  }

  // Source 2: Probe core setting prefixes (not from any extension)
  const corePrefixes = [
    'editor', 'workbench', 'window', 'files', 'search', 'debug',
    'terminal', 'explorer', 'problems', 'output', 'scm', 'extensions',
    'breadcrumbs', 'diffEditor', 'multiDiffEditor', 'testing',
    'comments', 'remote', 'timeline', 'notebook', 'interactiveWindow',
    'mergeEditor', 'zenmode', 'screencastMode', 'accessibility',
    'security', 'application', 'update', 'telemetry', 'settingsSync',
    'http', 'keyboard', 'network', 'task', 'launch', 'chat',
    'inlineChat', 'mcp'
  ];

  for (const prefix of corePrefixes) {
    const section = vscode.workspace.getConfiguration(prefix);
    const raw = JSON.parse(JSON.stringify(section));
    if (typeof raw === 'object' && raw !== null) {
      extractKeysFromObject(raw, prefix, (key) => {
        if (!seen.has(key)) {
          const inspect = config.inspect(key);
          if (inspect) {
            addSetting(key, {
              default: inspect.defaultValue,
              description: '',
            });
          }
        }
      });
    }
  }

  return settings;
}

function extractKeysFromObject(
  obj: any,
  prefix: string,
  callback: (key: string) => void
): void {
  for (const [k, v] of Object.entries(obj)) {
    const fullKey = `${prefix}.${k}`;
    if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
      const inspect = vscode.workspace.getConfiguration().inspect(fullKey);
      if (inspect && inspect.defaultValue !== undefined) {
        callback(fullKey); // emit object-typed settings (e.g. editor.codeActionsOnSave)
      }
      // Always recurse into objects to discover sub-settings
      // (e.g. editor.suggest contains editor.suggest.showIcons, etc.)
      extractKeysFromObject(v, fullKey, callback);
    } else {
      callback(fullKey);
    }
  }
}

// ---------- Tree building ----------

function buildDeepTree(settings: FlatSetting[]): SettingNode[] {
  interface Bucket {
    setting?: FlatSetting;
    children: Map<string, Bucket>;
  }

  const root: Map<string, Bucket> = new Map();

  for (const s of settings) {
    const parts = s.key.split('.');
    let level = root;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!level.has(part)) {
        level.set(part, { children: new Map() });
      }
      level = level.get(part)!.children;
    }
    const leaf = parts[parts.length - 1];
    if (!level.has(leaf)) {
      level.set(leaf, { setting: s, children: new Map() });
    } else {
      level.get(leaf)!.setting = s;
    }
  }

  function toNodes(buckets: Map<string, Bucket>): SettingNode[] {
    const nodes: SettingNode[] = [];
    for (const [label, bucket] of buckets) {
      if (bucket.setting && bucket.children.size === 0) {
        nodes.push(toLeafNode(bucket.setting));
      } else if (bucket.children.size > 0) {
        const children = toNodes(bucket.children);
        if (bucket.setting) {
          children.unshift(toLeafNode(bucket.setting));
        }
        nodes.push({
          key: label,
          label,
          children: sortNodes(children),
        });
      }
    }
    return sortNodes(nodes);
  }

  return toNodes(root);
}

// ---------- TOC label pass ----------

function applyTOCLabels(nodes: SettingNode[], tocEntries: TOCEntry[]): void {
  const labelMap = buildLabelMap(tocEntries);
  applyLabelsRecursive(nodes, '');

  function applyLabelsRecursive(children: SettingNode[], parentPath: string): void {
    for (const node of children) {
      if (!node.children || node.children.length === 0) continue;
      const nodePath = parentPath ? `${parentPath}.${node.key}` : node.key;
      const tocLabel = labelMap.get(nodePath) ?? labelMap.get(node.key);
      if (tocLabel) {
        node.label = tocLabel;
      }
      applyLabelsRecursive(node.children, nodePath);
    }
  }
}

function buildLabelMap(entries: TOCEntry[]): Map<string, string> {
  const map = new Map<string, string>();
  // Process children first, then parents — parent labels take precedence
  // when a child's glob pattern (e.g. editor.*suggest*) infers the same
  // key as its parent (editor).
  for (const entry of entries) {
    if (entry.children) {
      for (const child of entry.children) {
        const childKey = inferNodeKey(child);
        if (childKey) {
          map.set(childKey, child.label);
        }
      }
    }
    const nodeKey = inferNodeKey(entry);
    if (nodeKey) {
      map.set(nodeKey, entry.label);
    }
  }
  return map;
}

function inferNodeKey(entry: TOCEntry): string | undefined {
  if (entry.patterns.length === 0) return undefined;
  const first = entry.patterns[0];
  const cleaned = first.replace(/\*.*$/, '').replace(/\.$/, '');
  return cleaned || undefined;
}

// ---------- Top-level grouping pass ----------

/**
 * Wrap top-level namespace nodes into meaningful groups.
 * Core features come first, then extensions by domain.
 * Namespaces not in any defined group go into "Other Extensions."
 */
function applyTopLevelGroups(tree: SettingNode[]): SettingNode[] {
  // Build a lookup: namespace key → which group it belongs to
  const namespaceToGroup = new Map<string, string>();
  for (const group of topLevelGroups) {
    for (const ns of group.namespaces) {
      namespaceToGroup.set(ns, group.groupName);
    }
  }

  // Index existing top-level nodes by key
  const nodeByKey = new Map<string, SettingNode>();
  for (const node of tree) {
    nodeByKey.set(node.key, node);
  }

  // Build core groups (from VS Code's TOC) and extension groups separately
  const coreGroups: SettingNode[] = [];
  const extGroups: SettingNode[] = [];
  const claimed = new Set<string>();

  for (const group of topLevelGroups) {
    const children: SettingNode[] = [];
    for (const ns of group.namespaces) {
      const node = nodeByKey.get(ns);
      if (node) {
        children.push(node);
        claimed.add(ns);
      }
    }
    if (children.length > 0) {
      const groupNode: SettingNode = {
        key: group.groupName,
        label: group.groupName,
        children: sortNodes(children),
      };
      if (group.isCore !== false) {
        coreGroups.push(groupNode);
      } else {
        extGroups.push(groupNode);
      }
    }
  }

  // Collect unclaimed nodes into fallback group
  const unclaimed: SettingNode[] = [];
  for (const node of tree) {
    if (!claimed.has(node.key)) {
      unclaimed.push(node);
    }
  }
  if (unclaimed.length > 0) {
    extGroups.push({
      key: fallbackGroupName,
      label: fallbackGroupName,
      children: sortNodes(unclaimed),
    });
  }

  // Combine: "Commonly Used" header, core groups, separator, "Extensions" header, extension groups
  const result: SettingNode[] = [
    { key: '__header__', label: 'Commonly Used' } as SettingNode,
    ...coreGroups,
    { key: '__separator__', label: '__separator__' } as SettingNode,
    { key: '__header__', label: 'Others' } as SettingNode,
    ...extGroups,
  ];

  return result;
}

// ---------- Custom category pass ----------

/**
 * Walk the tree and insert custom category nodes at dense nodes.
 * For each node that has custom categories defined, create category group nodes
 * and move matching leaves AND sub-nodes into them.
 * Sub-nodes appear first within each category (commonly used features),
 * then curated flat settings follow.
 * Unmatched items stay as direct children.
 */
function applyCustomCategories(nodes: SettingNode[], parentPath: string): void {
  for (const node of nodes) {
    if (!node.children || node.children.length === 0) continue;

    const nodePath = parentPath ? `${parentPath}.${node.key}` : node.key;

    // Recurse first so child nodes get their custom categories applied
    applyCustomCategories(node.children, nodePath);

    // Check if this node has custom categories
    const categories = customCategories[nodePath];
    if (!categories) continue;

    // Collect all setting keys claimed by custom categories (and their children)
    const allCategoryKeys = new Set<string>();
    function collectKeys(cats: CustomCategory[]) {
      for (const cat of cats) {
        for (const key of cat.settingKeys) allCategoryKeys.add(key);
        if (cat.children) collectKeys(cat.children);
      }
    }
    collectKeys(categories);

    // Get explicit sub-node assignments for this path
    const subAssignments = subnodeAssignments[nodePath] ?? {};
    const claimedSubKeys = new Set(Object.keys(subAssignments));

    // Build a reverse map: category name → explicitly assigned sub-node keys
    const explicitSubNodes = new Map<string, string[]>();
    for (const [subKey, catName] of Object.entries(subAssignments)) {
      if (!explicitSubNodes.has(catName)) explicitSubNodes.set(catName, []);
      explicitSubNodes.get(catName)!.push(subKey);
    }

    // Separate children into sub-nodes and leaves, index by key
    const subNodeMap = new Map<string, SettingNode>();
    const leafMap = new Map<string, SettingNode>();

    for (const child of node.children) {
      if (child.children && child.children.length > 0) {
        subNodeMap.set(child.key, child);
      } else {
        leafMap.set(child.key, child);
      }
    }

    // For setting keys: a key might match a leaf OR a sub-node at runtime.
    // Build a reverse map: category name → sub-node keys found via settingKeys
    const settingKeySubNodes = new Map<string, string[]>();
    function mapSettingKeysToSubNodes(cats: CustomCategory[]) {
      for (const cat of cats) {
        for (const key of cat.settingKeys) {
          // Check if this setting key corresponds to a sub-node (by matching the last segment)
          const subNode = subNodeMap.get(key);
          if (subNode) {
            if (!settingKeySubNodes.has(cat.categoryName)) settingKeySubNodes.set(cat.categoryName, []);
            settingKeySubNodes.get(cat.categoryName)!.push(key);
          }
        }
        if (cat.children) mapSettingKeysToSubNodes(cat.children);
      }
    }
    mapSettingKeysToSubNodes(categories);

    // A sub-node is claimed if it's in explicit assignments OR found via settingKeys
    const allClaimedSubKeys = new Set([
      ...claimedSubKeys,
      ...[...settingKeySubNodes.values()].flat(),
    ]);

    // Determine unclaimed items
    const unclaimedSubNodes: SettingNode[] = [];
    const unclaimedLeaves: SettingNode[] = [];

    for (const [key, node_] of subNodeMap) {
      if (!allClaimedSubKeys.has(key)) unclaimedSubNodes.push(node_);
    }
    for (const [key, node_] of leafMap) {
      if (!allCategoryKeys.has(key)) unclaimedLeaves.push(node_);
    }

    // Merge explicit + settingKey sub-node assignments per category
    const mergedSubNodes = new Map<string, string[]>();
    for (const [catName, keys] of explicitSubNodes) {
      mergedSubNodes.set(catName, [...keys]);
    }
    for (const [catName, keys] of settingKeySubNodes) {
      if (!mergedSubNodes.has(catName)) mergedSubNodes.set(catName, []);
      for (const k of keys) {
        if (!mergedSubNodes.get(catName)!.includes(k)) mergedSubNodes.get(catName)!.push(k);
      }
    }

    // Build category nodes
    const categoryNodes: SettingNode[] = categories.map(cat =>
      buildCategoryNode(cat, leafMap, subNodeMap, mergedSubNodes)
    );

    // Any unclaimed items go into an "Other" catch-all category
    const unclaimed = [...sortNodes(unclaimedSubNodes), ...unclaimedLeaves];
    if (unclaimed.length > 0) {
      categoryNodes.push({
        key: 'Other',
        label: 'Other',
        children: unclaimed,
      });
    }

    node.children = categoryNodes;
  }
}

function buildCategoryNode(
  cat: CustomCategory,
  leafMap: Map<string, SettingNode>,
  subNodeMap: Map<string, SettingNode>,
  categorySubNodes: Map<string, string[]>
): SettingNode {
  const subNodes: SettingNode[] = [];
  const leafNodes: SettingNode[] = [];

  if (cat.children && cat.children.length > 0) {
    // Parent category — build child category nodes
    for (const childCat of cat.children) {
      leafNodes.push(buildCategoryNode(childCat, leafMap, subNodeMap, categorySubNodes));
    }
  } else {
    // Leaf category — collect matching settings
    for (const key of cat.settingKeys) {
      const leaf = leafMap.get(key);
      if (leaf) leafNodes.push(leaf);
    }
  }

  // Collect sub-nodes assigned to this category (appear first)
  const assignedSubKeys = categorySubNodes.get(cat.categoryName) ?? [];
  for (const subKey of assignedSubKeys) {
    const subNode = subNodeMap.get(subKey);
    if (subNode) subNodes.push(subNode);
  }

  return {
    key: cat.categoryName,
    label: cat.categoryName,
    children: [
      ...sortNodes(subNodes),    // VS Code's sub-nodes first (commonly used)
      ...sortNodes(leafNodes),    // Our curated leaves after
    ],
  };
}

// ---------- Sweep loose leaves ----------

/**
 * Final sweep: anywhere a node has BOTH group children (sub-nodes or categories)
 * AND flat leaf children as siblings, move the flat leaves into an "Other" group.
 * This prevents flat settings from appearing to belong to the category above them.
 */
function sweepLooseLeaves(nodes: SettingNode[]): void {
  for (const node of nodes) {
    if (!node.children || node.children.length === 0) continue;

    // Recurse first
    sweepLooseLeaves(node.children);

    const groups: SettingNode[] = [];
    const leaves: SettingNode[] = [];

    for (const child of node.children) {
      if (child.children && child.children.length > 0) {
        groups.push(child);
      } else {
        leaves.push(child);
      }
    }

    // Only sweep if there are BOTH groups and leaves as siblings
    if (groups.length > 0 && leaves.length > 0) {
      node.children = [
        ...groups,
        {
          key: 'Other',
          label: 'Other',
          children: leaves,
        },
      ];
    }
  }
}

// ---------- Final sort pass ----------

/**
 * Re-sort the entire tree after all passes (TOC labels, custom categories,
 * top-level grouping) have changed labels and structure.
 * Skips the top level (index 0) to preserve intentional group ordering.
 */
function resortTree(nodes: SettingNode[], isTopLevel = true): void {
  for (const node of nodes) {
    if (node.children && node.children.length > 0) {
      resortTree(node.children, false);
    }
  }
  // Don't re-sort the top level — its order is intentional (core groups first, then extensions)
  if (!isTopLevel) {
    sortNodes(nodes);
  }
}

// ---------- Helpers ----------

function toLeafNode(s: FlatSetting): SettingNode {
  return {
    key: s.key,
    label: s.key.split('.').pop() || s.key,
    type: normalizeType(s.prop.type),
    description: s.prop.description ?? '',
    default: s.defaultValue,
    currentValue: s.currentValue,
    enum: s.prop.enum,
    enumDescriptions: s.prop.enumDescriptions,
    minimum: s.prop.minimum,
    maximum: s.prop.maximum,
    isModified: s.isModified,
  };
}

function sortNodes(nodes: SettingNode[]): SettingNode[] {
  return nodes.sort((a, b) => {
    const aIsGroup = !!a.children && a.children.length > 0;
    const bIsGroup = !!b.children && b.children.length > 0;
    if (aIsGroup && !bIsGroup) return -1;
    if (!aIsGroup && bIsGroup) return 1;

    // Uppercase labels first (VS Code's named features & our categories),
    // then lowercase (raw camelCase keys)
    const aFirst = (a.label ?? '')[0] ?? '';
    const bFirst = (b.label ?? '')[0] ?? '';
    const aIsUpper = aFirst !== '' && aFirst === aFirst.toUpperCase() && aFirst !== aFirst.toLowerCase();
    const bIsUpper = bFirst !== '' && bFirst === bFirst.toUpperCase() && bFirst !== bFirst.toLowerCase();
    if (aIsUpper && !bIsUpper) return -1;
    if (!aIsUpper && bIsUpper) return 1;

    return a.label.localeCompare(b.label);
  });
}

function normalizeType(type: any): SettingNode['type'] | undefined {
  if (Array.isArray(type)) {
    const filtered = type.filter((t: string) => t !== 'null');
    return filtered[0] as SettingNode['type'];
  }
  return typeof type === 'string' ? type as SettingNode['type'] : undefined;
}
