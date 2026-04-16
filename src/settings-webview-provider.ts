import * as vscode from 'vscode';
import { buildSettingsTree, SettingNode } from './settings-schema-reader';

export class SettingsWebviewProvider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView;
  private _configListener?: vscode.Disposable;

  constructor(private readonly _extensionUri: vscode.Uri) {}

  resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ): void {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._getHtml(webviewView.webview);

    // Send initial settings data once the webview is ready
    webviewView.webview.onDidReceiveMessage((msg) => {
      switch (msg.type) {
        case 'ready':
          this._sendSettings(vscode.ConfigurationTarget.Global);
          break;

        case 'updateSetting': {
          const scope = msg.scope === 'workspace'
            ? vscode.ConfigurationTarget.Workspace
            : vscode.ConfigurationTarget.Global;
          const parts = msg.key.split('.');
          const section = parts.slice(0, -1).join('.');
          const leaf = parts[parts.length - 1];
          const config = vscode.workspace.getConfiguration(section);
          config.update(leaf, msg.value, scope);
          break;
        }

        case 'resetSetting': {
          const scope = msg.scope === 'workspace'
            ? vscode.ConfigurationTarget.Workspace
            : vscode.ConfigurationTarget.Global;
          const parts = msg.key.split('.');
          const section = parts.slice(0, -1).join('.');
          const leaf = parts[parts.length - 1];
          const config = vscode.workspace.getConfiguration(section);
          config.update(leaf, undefined, scope);
          break;
        }

        case 'exportSettings': {
          const scope = msg.scope === 'workspace'
            ? vscode.ConfigurationTarget.Workspace
            : vscode.ConfigurationTarget.Global;
          this._exportSettings(scope, msg.format);
          break;
        }
      }
    });

    // Keep webview in sync when settings change externally
    this._configListener = vscode.workspace.onDidChangeConfiguration(() => {
      if (this._view?.visible) {
        this._sendSettings(vscode.ConfigurationTarget.Global);
      }
    });

    webviewView.onDidDispose(() => {
      this._configListener?.dispose();
    });
  }

  private _sendSettings(scope: vscode.ConfigurationTarget): void {
    const tree = buildSettingsTree(scope);
    this._view?.webview.postMessage({
      type: 'init',
      settings: tree,
      scope: scope === vscode.ConfigurationTarget.Workspace ? 'workspace' : 'user',
    });
  }

  private _exportSettings(scope: vscode.ConfigurationTarget, format: string): void {
    const tree = buildSettingsTree(scope);
    const modified: Record<string, any> = {};

    const collect = (nodes: SettingNode[]) => {
      for (const node of nodes) {
        if (node.children) {
          collect(node.children);
        } else if (format === 'all' || node.isModified) {
          modified[node.key] = node.currentValue;
        }
      }
    };
    collect(tree);

    const json = JSON.stringify(modified, null, 4);
    this._view?.webview.postMessage({ type: 'exportResult', json });
  }

  private _getHtml(webview: vscode.Webview): string {
    const nonce = getNonce();

    return /*html*/ `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy"
    content="default-src 'none'; style-src ${webview.cspSource} 'nonce-${nonce}'; script-src 'nonce-${nonce}';">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style nonce="${nonce}">
    :root {
      --indent: 16px;
      --row-height: 28px;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
      color: var(--vscode-foreground);
      background: var(--vscode-sideBar-background);
      overflow-x: hidden;
    }

    /* Toolbar */
    .toolbar {
      position: sticky; top: 0; z-index: 10;
      background: var(--vscode-sideBar-background);
      padding: 6px 8px;
      display: flex; gap: 4px; flex-wrap: wrap;
      border-bottom: 1px solid var(--vscode-sideBarSectionHeader-border, var(--vscode-panel-border));
    }
    .chip {
      display: inline-flex; align-items: center;
      padding: 2px 8px; border-radius: 12px;
      font-size: 11px; cursor: pointer;
      background: var(--vscode-badge-background);
      color: var(--vscode-badge-foreground);
      border: 1px solid transparent;
      user-select: none;
    }
    .chip:hover { opacity: 0.85; }
    .chip.active {
      border-color: var(--vscode-focusBorder);
      background: var(--vscode-list-activeSelectionBackground);
      color: var(--vscode-list-activeSelectionForeground);
    }
    .chip-count {
      margin-left: 4px; font-weight: bold;
    }

    /* Tree */
    .tree { padding: 4px 0; }

    /* Group node (folder) */
    .group {
      cursor: pointer;
      user-select: none;
    }
    .group-header {
      display: flex; align-items: center;
      height: var(--row-height);
      padding: 0 8px;
      gap: 4px;
    }
    .group-header:hover { background: var(--vscode-list-hoverBackground); }
    .group-arrow {
      width: 16px; text-align: center;
      font-size: 10px; flex-shrink: 0;
      transition: transform 0.1s;
    }
    .group.collapsed > .group-header .group-arrow { transform: rotate(-90deg); }
    .group.collapsed > .group-children { display: none; }
    .group-label { font-weight: 600; }
    .group-badge {
      margin-left: auto;
      font-size: 10px; opacity: 0.6;
    }
    .group-children { padding-left: var(--indent); }

    /* Leaf setting */
    .setting {
      padding: 6px 8px 6px calc(8px + 16px + 4px);
      border-bottom: 1px solid var(--vscode-list-hoverBackground);
    }
    .setting:hover { background: var(--vscode-list-hoverBackground); }
    .setting.modified { border-left: 2px solid var(--vscode-inputValidation-infoBorder, #007acc); }
    .setting-row {
      display: flex; align-items: center; gap: 8px;
    }
    .setting-label {
      font-weight: 500; flex-shrink: 0;
    }
    .setting-control { margin-left: auto; display: flex; align-items: center; gap: 4px; }
    .setting-desc {
      font-size: 11px; opacity: 0.7;
      margin-top: 2px;
      line-height: 1.3;
    }
    .setting-meta {
      font-size: 10px; opacity: 0.5;
      margin-top: 2px;
    }

    /* Controls */
    input[type="checkbox"] { cursor: pointer; width: 16px; height: 16px; accent-color: var(--vscode-focusBorder); }
    select {
      background: var(--vscode-dropdown-background);
      color: var(--vscode-dropdown-foreground);
      border: 1px solid var(--vscode-dropdown-border);
      padding: 2px 4px; border-radius: 2px;
      font-size: 12px; cursor: pointer;
      max-width: 180px;
    }
    .stepper {
      display: inline-flex; align-items: center; gap: 0;
      border: 1px solid var(--vscode-input-border);
      border-radius: 2px;
      overflow: hidden;
    }
    .stepper-btn {
      background: var(--vscode-button-secondaryBackground);
      color: var(--vscode-button-secondaryForeground);
      border: none; cursor: pointer;
      width: 22px; height: 22px;
      font-size: 14px; line-height: 1;
      display: flex; align-items: center; justify-content: center;
    }
    .stepper-btn:hover { background: var(--vscode-button-secondaryHoverBackground); }
    .stepper-val {
      min-width: 36px; text-align: center;
      font-size: 12px; padding: 0 4px;
      background: var(--vscode-input-background);
      color: var(--vscode-input-foreground);
    }

    /* Reset button */
    .reset-btn {
      background: none; border: none; cursor: pointer;
      color: var(--vscode-descriptionForeground);
      font-size: 12px; padding: 2px 4px;
      border-radius: 2px; opacity: 0.6;
    }
    .reset-btn:hover { opacity: 1; background: var(--vscode-toolbar-hoverBackground); }
    .reset-btn.hidden { display: none; }

    /* Export bar */
    .export-bar {
      position: sticky; bottom: 0;
      background: var(--vscode-sideBar-background);
      border-top: 1px solid var(--vscode-sideBarSectionHeader-border, var(--vscode-panel-border));
      padding: 6px 8px;
      display: flex; gap: 4px;
    }
    .export-btn {
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      border: none; border-radius: 2px;
      padding: 4px 10px; cursor: pointer;
      font-size: 11px;
    }
    .export-btn:hover { background: var(--vscode-button-hoverBackground); }
    .export-btn.secondary {
      background: var(--vscode-button-secondaryBackground);
      color: var(--vscode-button-secondaryForeground);
    }
    .export-btn.secondary:hover { background: var(--vscode-button-secondaryHoverBackground); }

    /* Loading */
    .loading { padding: 20px; text-align: center; opacity: 0.6; }
  </style>
</head>
<body>
  <div class="toolbar" id="toolbar">
    <span class="chip active" data-filter="all">All</span>
    <span class="chip" data-filter="modified">Modified <span class="chip-count" id="modifiedCount">0</span></span>
  </div>
  <div class="tree" id="tree">
    <div class="loading">Loading settings…</div>
  </div>
  <div class="export-bar">
    <button class="export-btn" id="exportModified">Copy Modified JSON</button>
    <button class="export-btn secondary" id="exportAll">Copy All JSON</button>
  </div>

  <script nonce="${nonce}">
    const vscode = acquireVsCodeApi();
    let allSettings = [];
    let activeFilter = 'all';

    // ---- Message handling ----
    window.addEventListener('message', (e) => {
      const msg = e.data;
      if (msg.type === 'init') {
        allSettings = msg.settings;
        render();
      } else if (msg.type === 'exportResult') {
        // Copy to clipboard by posting back isn't available; use a textarea trick
        const ta = document.createElement('textarea');
        ta.value = msg.json;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
    });

    // Tell the extension we're ready
    vscode.postMessage({ type: 'ready' });

    // ---- Rendering ----
    function render() {
      const tree = document.getElementById('tree');
      tree.innerHTML = '';

      let modCount = 0;
      const countModified = (nodes) => {
        for (const n of nodes) {
          if (n.children) countModified(n.children);
          else if (n.isModified) modCount++;
        }
      };
      countModified(allSettings);
      document.getElementById('modifiedCount').textContent = modCount;

      const filtered = activeFilter === 'modified' ? filterModified(allSettings) : allSettings;

      for (const node of filtered) {
        tree.appendChild(renderNode(node, 0));
      }
    }

    function filterModified(nodes) {
      const result = [];
      for (const node of nodes) {
        if (node.children) {
          const filteredChildren = filterModified(node.children);
          if (filteredChildren.length > 0) {
            result.push({ ...node, children: filteredChildren });
          }
        } else if (node.isModified) {
          result.push(node);
        }
      }
      return result;
    }

    function renderNode(node, depth) {
      if (node.children && node.children.length > 0) {
        return renderGroup(node, depth);
      }
      return renderSetting(node);
    }

    function renderGroup(node, depth) {
      const div = document.createElement('div');
      div.className = 'group collapsed';

      const header = document.createElement('div');
      header.className = 'group-header';

      const arrow = document.createElement('span');
      arrow.className = 'group-arrow';
      arrow.textContent = '▼';

      const label = document.createElement('span');
      label.className = 'group-label';
      label.textContent = node.label;

      const badge = document.createElement('span');
      badge.className = 'group-badge';
      const leafCount = countLeaves(node);
      badge.textContent = leafCount;

      header.appendChild(arrow);
      header.appendChild(label);
      header.appendChild(badge);

      header.addEventListener('click', () => {
        div.classList.toggle('collapsed');
      });

      const children = document.createElement('div');
      children.className = 'group-children';
      for (const child of node.children) {
        children.appendChild(renderNode(child, depth + 1));
      }

      div.appendChild(header);
      div.appendChild(children);
      return div;
    }

    function countLeaves(node) {
      if (!node.children) return 1;
      let c = 0;
      for (const ch of node.children) c += countLeaves(ch);
      return c;
    }

    function renderSetting(node) {
      const div = document.createElement('div');
      div.className = 'setting' + (node.isModified ? ' modified' : '');

      const row = document.createElement('div');
      row.className = 'setting-row';

      const label = document.createElement('span');
      label.className = 'setting-label';
      label.textContent = node.label;

      const controlWrap = document.createElement('span');
      controlWrap.className = 'setting-control';
      controlWrap.appendChild(buildControl(node, div));

      const resetBtn = document.createElement('button');
      resetBtn.className = 'reset-btn' + (node.isModified ? '' : ' hidden');
      resetBtn.textContent = '↺';
      resetBtn.title = 'Reset to default';
      resetBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        vscode.postMessage({ type: 'resetSetting', key: node.key, scope: 'user' });
      });
      controlWrap.appendChild(resetBtn);

      row.appendChild(label);
      row.appendChild(controlWrap);
      div.appendChild(row);

      if (node.description) {
        const desc = document.createElement('div');
        desc.className = 'setting-desc';
        desc.textContent = stripMarkdown(node.description);
        div.appendChild(desc);
      }

      const meta = document.createElement('div');
      meta.className = 'setting-meta';
      const parts = [];
      if (node.type) parts.push(node.type);
      if (node.default !== undefined) parts.push('default: ' + JSON.stringify(node.default));
      meta.textContent = parts.join(' · ');
      div.appendChild(meta);

      return div;
    }

    function buildControl(node, settingDiv) {
      // Boolean → checkbox
      if (node.type === 'boolean') {
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.checked = !!node.currentValue;
        cb.addEventListener('change', () => {
          vscode.postMessage({ type: 'updateSetting', key: node.key, value: cb.checked, scope: 'user' });
        });
        return cb;
      }

      // Enum → dropdown
      if (node.enum && node.enum.length > 0) {
        const sel = document.createElement('select');
        for (let i = 0; i < node.enum.length; i++) {
          const opt = document.createElement('option');
          opt.value = node.enum[i];
          opt.textContent = node.enum[i];
          if (node.enumDescriptions && node.enumDescriptions[i]) {
            opt.title = node.enumDescriptions[i];
          }
          if (node.currentValue === node.enum[i]) opt.selected = true;
          sel.appendChild(opt);
        }
        sel.addEventListener('change', () => {
          vscode.postMessage({ type: 'updateSetting', key: node.key, value: sel.value, scope: 'user' });
        });
        return sel;
      }

      // Number → stepper
      if (node.type === 'number' || node.type === 'integer') {
        const wrap = document.createElement('span');
        wrap.className = 'stepper';

        const minus = document.createElement('button');
        minus.className = 'stepper-btn';
        minus.textContent = '−';

        const val = document.createElement('span');
        val.className = 'stepper-val';
        val.textContent = node.currentValue ?? node.default ?? 0;

        const plus = document.createElement('button');
        plus.className = 'stepper-btn';
        plus.textContent = '+';

        const step = node.type === 'integer' ? 1 : (node.maximum && node.maximum <= 1 ? 0.1 : 1);

        const update = (delta) => {
          let v = parseFloat(val.textContent) + delta;
          if (node.minimum !== undefined) v = Math.max(node.minimum, v);
          if (node.maximum !== undefined) v = Math.min(node.maximum, v);
          if (node.type === 'integer') v = Math.round(v);
          else v = Math.round(v * 100) / 100;
          val.textContent = v;
          vscode.postMessage({ type: 'updateSetting', key: node.key, value: v, scope: 'user' });
        };

        minus.addEventListener('click', () => update(-step));
        plus.addEventListener('click', () => update(step));

        wrap.appendChild(minus);
        wrap.appendChild(val);
        wrap.appendChild(plus);
        return wrap;
      }

      // Fallback: show current value as static text
      const span = document.createElement('span');
      span.style.fontSize = '11px';
      span.style.opacity = '0.7';
      const v = node.currentValue ?? node.default;
      span.textContent = typeof v === 'object' ? JSON.stringify(v).substring(0, 60) : String(v ?? '');
      return span;
    }

    function stripMarkdown(text) {
      return text.replace(/\`([^\`]+)\`/g, '$1').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/#/g, '');
    }

    // ---- Filter chips ----
    document.getElementById('toolbar').addEventListener('click', (e) => {
      const chip = e.target.closest('.chip');
      if (!chip) return;
      document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeFilter = chip.dataset.filter;
      render();
    });

    // ---- Export ----
    document.getElementById('exportModified').addEventListener('click', () => {
      vscode.postMessage({ type: 'exportSettings', format: 'modified', scope: 'user' });
    });
    document.getElementById('exportAll').addEventListener('click', () => {
      vscode.postMessage({ type: 'exportSettings', format: 'all', scope: 'user' });
    });
  </script>
</body>
</html>`;
  }
}

function getNonce(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let nonce = '';
  for (let i = 0; i < 32; i++) {
    nonce += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return nonce;
}
