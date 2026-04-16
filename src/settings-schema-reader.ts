import * as vscode from 'vscode';
import { settingsTOC, TOCEntry } from './settings-toc';

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
  return tree;
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
        callback(fullKey);
      } else {
        extractKeysFromObject(v, fullKey, callback);
      }
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
  for (const entry of entries) {
    const nodeKey = inferNodeKey(entry);
    if (nodeKey) {
      map.set(nodeKey, entry.label);
    }
    if (entry.children) {
      for (const child of entry.children) {
        const childKey = inferNodeKey(child);
        if (childKey) {
          map.set(childKey, child.label);
        }
      }
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
