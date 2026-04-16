import * as vscode from 'vscode';
import { buildSettingsTree } from './settings-schema-reader';

export class SettingsWebviewProvider implements vscode.WebviewViewProvider {
  constructor(private readonly _extensionUri: vscode.Uri) {}

  resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ): void {
    webviewView.webview.options = { enableScripts: true };
    try {
      const tree = buildSettingsTree(vscode.ConfigurationTarget.Global);
      webviewView.webview.html = this._getHtml(webviewView.webview, tree);

      // Handle messages from the webview
      webviewView.webview.onDidReceiveMessage(async (msg) => {
        if (msg.type === 'updateSetting') {
          try {
            const config = vscode.workspace.getConfiguration();
            const value = msg.value === '__undefined__' ? undefined : msg.value;
            await config.update(msg.key, value, vscode.ConfigurationTarget.Global);
            webviewView.webview.postMessage({
              type: 'settingUpdated', key: msg.key, success: true,
            });
          } catch (err: any) {
            webviewView.webview.postMessage({
              type: 'settingError', key: msg.key, error: err.message,
            });
          }
        }
      });
    } catch (err: any) {
      webviewView.webview.html = `<pre style="color:red;padding:8px;">${err?.stack || err}</pre>`;
    }
  }

  private _getHtml(webview: vscode.Webview, tree: any[]): string {
    const nonce = getNonce();
    const treeJson = JSON.stringify(tree);

    return /*html*/ `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy"
    content="default-src 'none'; style-src ${webview.cspSource} 'nonce-${nonce}'; script-src 'nonce-${nonce}';">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style nonce="${nonce}">
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
      color: var(--vscode-foreground);
      background: var(--vscode-sideBar-background);
    }
    .tree { padding: 4px 0; user-select: none; }

    /* Groups */
    .group { cursor: pointer; }
    .group-header {
      display: flex; align-items: center;
      height: 26px; padding: 0 8px; gap: 4px;
    }
    .group-header:hover { background: var(--vscode-list-hoverBackground); }
    .arrow {
      width: 16px; text-align: center; font-size: 10px;
      flex-shrink: 0;
    }
    .group.collapsed > .children { display: none; }
    .group-label { font-weight: 600; }
    .badge { margin-left: auto; font-size: 10px; opacity: 0.5; }
    .children { padding-left: 16px; }

    /* Section headers and separators */
    .section-header {
      padding: 12px 8px 4px 8px; font-size: 12px; font-weight: 700;
      opacity: 0.8;
    }
    .separator {
      height: 1px; margin: 8px 8px;
      background: var(--vscode-sideBarSectionHeader-border, var(--vscode-panel-border));
    }

    h2 {
      padding: 8px; font-size: 11px; font-weight: 600;
      text-transform: uppercase; letter-spacing: 0.5px;
      opacity: 0.6;
      border-bottom: 1px solid var(--vscode-sideBarSectionHeader-border, var(--vscode-panel-border));
    }

    /* Search bar */
    .search-bar {
      display: flex; align-items: center;
      padding: 4px 8px; gap: 4px;
      border-bottom: 1px solid var(--vscode-sideBarSectionHeader-border, var(--vscode-panel-border));
    }
    .search-input {
      flex: 1;
      background: var(--vscode-input-background, #3c3c3c);
      color: var(--vscode-input-foreground, #ccc);
      border: 1px solid var(--vscode-input-border, #555);
      padding: 3px 6px; font-size: 12px;
      border-radius: 2px;
    }
    .search-input:focus {
      outline: none;
      border-color: var(--vscode-focusBorder, #0078d4);
    }
    .search-input::placeholder { opacity: 0.5; }
    .search-clear {
      background: none; border: none; color: var(--vscode-foreground);
      font-size: 14px; cursor: pointer; opacity: 0.5;
      padding: 0 4px; line-height: 1;
    }
    .search-clear:hover { opacity: 1; }
    .search-clear.hidden { visibility: hidden; }
    .search-count {
      font-size: 10px; opacity: 0.5; white-space: nowrap;
    }
    .search-count.hidden { display: none; }
    .hidden-by-search { display: none !important; }

    /* Tooltip */
    .tooltip {
      position: fixed;
      max-width: 350px;
      padding: 8px 12px;
      background: var(--vscode-editorHoverWidget-background, #2d2d30);
      color: var(--vscode-editorHoverWidget-foreground, #ccc);
      border: 1px solid var(--vscode-editorHoverWidget-border, #454545);
      border-radius: 3px;
      font-size: 12px;
      line-height: 1.5;
      z-index: 1000;
      pointer-events: none;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      display: none;
    }
    .tooltip.visible { display: block; }
    .tooltip-key {
      font-family: var(--vscode-editor-font-family, monospace);
      font-size: 11px;
      opacity: 0.6;
      margin-bottom: 4px;
      word-break: break-all;
    }
    .tooltip-desc { }
    .tooltip-type {
      margin-top: 4px;
      font-size: 11px;
      opacity: 0.5;
    }
    .tooltip-default {
      margin-top: 2px;
      font-size: 11px;
      opacity: 0.5;
    }

    /* Leaf settings */
    .setting {
      padding: 6px 8px 6px 28px;
      border-left: 3px solid transparent;
      position: relative;
    }
    .setting:hover { background: var(--vscode-list-hoverBackground); }
    .setting.modified { border-left-color: var(--vscode-settings-modifiedItemIndicator, #0078d4); }

    .setting-header {
      display: flex; align-items: center; gap: 6px;
      margin-bottom: 2px;
    }
    .setting-label {
      font-weight: 500;
      cursor: default;
    }
    .setting-reset {
      font-size: 12px; cursor: pointer; opacity: 0.5;
      display: none;
    }
    .setting-reset:hover { opacity: 1; }
    .setting.modified .setting-reset { display: inline; }

    .setting-description {
      font-size: 11px; opacity: 0.7;
      margin-bottom: 4px;
      line-height: 1.4;
      max-height: 2.8em;
      overflow: hidden;
    }

    .setting-control { display: flex; align-items: center; gap: 6px; }

    /* Checkbox for booleans */
    .setting-checkbox {
      width: 16px; height: 16px; cursor: pointer;
      accent-color: var(--vscode-settings-checkboxForeground, #0078d4);
    }
    .setting-checkbox-label { font-size: 12px; cursor: pointer; }

    /* Select for enums */
    .setting-select {
      background: var(--vscode-dropdown-background, #3c3c3c);
      color: var(--vscode-dropdown-foreground, #ccc);
      border: 1px solid var(--vscode-dropdown-border, #555);
      padding: 2px 4px; font-size: 12px;
      border-radius: 2px;
      max-width: 200px;
    }

    /* Text/number inputs */
    .setting-input {
      background: var(--vscode-input-background, #3c3c3c);
      color: var(--vscode-input-foreground, #ccc);
      border: 1px solid var(--vscode-input-border, #555);
      padding: 2px 6px; font-size: 12px;
      border-radius: 2px;
      width: 120px;
    }
    .setting-input:focus {
      outline: none;
      border-color: var(--vscode-focusBorder, #0078d4);
    }
    .setting-input.invalid {
      border-color: var(--vscode-inputValidation-errorBorder, #f44);
    }

    /* Validation error */
    .setting-error {
      font-size: 10px; color: var(--vscode-errorForeground, #f44);
      margin-top: 2px; display: none;
    }
    .setting-error.visible { display: block; }
  </style>
</head>
<body>
  <h2>Settings Explorer</h2>
  <div id="stats" style="padding: 4px 8px; font-size: 11px; opacity: 0.5;"></div>
  <div class="search-bar">
    <input type="text" class="search-input" id="searchInput" placeholder="Search settings..." />
    <span class="search-count hidden" id="searchCount"></span>
    <button class="search-clear hidden" id="searchClear" title="Clear search">✕</button>
  </div>
  <div class="tree" id="tree"></div>
  <div class="tooltip" id="tooltip">
    <div class="tooltip-key" id="tooltipKey"></div>
    <div class="tooltip-desc" id="tooltipDesc"></div>
    <div class="tooltip-type" id="tooltipType"></div>
    <div class="tooltip-default" id="tooltipDefault"></div>
  </div>
  <script nonce="${nonce}">
    const vscodeApi = acquireVsCodeApi();
    const tree = ${treeJson};

    // Listen for messages from the extension host
    window.addEventListener('message', (event) => {
      const msg = event.data;
      if (msg.type === 'settingUpdated' && msg.success) {
        const el = document.querySelector('[data-key="' + CSS.escape(msg.key) + '"]');
        if (el) el.classList.add('modified');
      } else if (msg.type === 'settingError') {
        console.error('Setting update failed:', msg.key, msg.error);
      }
    });

    function countAllLeaves(nodes) {
      let c = 0;
      for (const n of nodes) {
        if (n.children && n.children.length > 0) c += countAllLeaves(n.children);
        else if (n.key !== '__separator__' && n.key !== '__header__') c++;
      }
      return c;
    }
    document.getElementById('stats').textContent = countAllLeaves(tree) + ' settings found';

    function updateSetting(key, value) {
      vscodeApi.postMessage({ type: 'updateSetting', key: key, value: value });
    }

    function resetSetting(key) {
      vscodeApi.postMessage({ type: 'updateSetting', key: key, value: '__undefined__' });
    }

    function render(nodes, container) {
      for (const node of nodes) {
        if (node.key === '__separator__') {
          const sep = document.createElement('div');
          sep.className = 'separator';
          container.appendChild(sep);
          continue;
        }
        if (node.key === '__header__') {
          const hdr = document.createElement('div');
          hdr.className = 'section-header';
          hdr.textContent = node.label;
          container.appendChild(hdr);
          continue;
        }
        if (node.children && node.children.length > 0) {
          renderGroup(node, container);
        } else {
          renderSetting(node, container);
        }
      }
    }

    function renderGroup(node, container) {
      const group = document.createElement('div');
      group.className = 'group collapsed';

      const header = document.createElement('div');
      header.className = 'group-header';
      const leafCount = countLeaves(node);
      header.innerHTML =
        '<span class="arrow">▶</span>' +
        '<span class="group-label">' + esc(node.label) + '</span>' +
        '<span class="badge">' + leafCount + '</span>';
      header.addEventListener('click', () => {
        group.classList.toggle('collapsed');
        header.querySelector('.arrow').textContent =
          group.classList.contains('collapsed') ? '▶' : '▼';
      });

      const kids = document.createElement('div');
      kids.className = 'children';
      render(node.children, kids);

      group.appendChild(header);
      group.appendChild(kids);
      container.appendChild(group);
    }

    function renderSetting(node, container) {
      const setting = document.createElement('div');
      setting.className = 'setting' + (node.isModified ? ' modified' : '');
      setting.setAttribute('data-key', node.key);

      // Header row: label + reset button
      const headerRow = document.createElement('div');
      headerRow.className = 'setting-header';

      const label = document.createElement('span');
      label.className = 'setting-label';
      label.textContent = node.label;
      headerRow.appendChild(label);

      const reset = document.createElement('span');
      reset.className = 'setting-reset';
      reset.textContent = '↩';
      reset.title = 'Reset to default';
      reset.addEventListener('click', (e) => {
        e.stopPropagation();
        resetSetting(node.key);
        setting.classList.remove('modified');
        restoreDefault(node, setting);
      });
      headerRow.appendChild(reset);

      setting.appendChild(headerRow);

      // Hover tooltip
      setting.addEventListener('mouseenter', (e) => showTooltip(node, e));
      setting.addEventListener('mousemove', (e) => {
        if (tooltip.classList.contains('visible')) {
          const x = Math.min(e.clientX + 12, window.innerWidth - 370);
          const y = e.clientY + 16;
          tooltip.style.left = Math.max(4, x) + 'px';
          tooltip.style.top = (y + tooltip.offsetHeight > window.innerHeight
            ? e.clientY - tooltip.offsetHeight - 8 : y) + 'px';
        }
      });
      setting.addEventListener('mouseleave', hideTooltip);

      // Description inline (if available)
      if (node.description) {
        const desc = document.createElement('div');
        desc.className = 'setting-description';
        desc.textContent = node.description;
        setting.appendChild(desc);
      }

      // Control
      const control = document.createElement('div');
      control.className = 'setting-control';
      const error = document.createElement('div');
      error.className = 'setting-error';

      const currentVal = node.currentValue !== undefined ? node.currentValue : node.default;

      if (node.type === 'boolean') {
        renderBooleanControl(node, currentVal, control, setting);
      } else if (node.enum && node.enum.length > 0) {
        renderEnumControl(node, currentVal, control, setting);
      } else if (node.type === 'number' || node.type === 'integer') {
        renderNumberControl(node, currentVal, control, error, setting);
      } else if (node.type === 'array' || node.type === 'object') {
        renderJsonControl(node, currentVal, control, error, setting);
      } else {
        renderStringControl(node, currentVal, control, setting);
      }

      setting.appendChild(control);
      setting.appendChild(error);
      container.appendChild(setting);
    }

    function renderBooleanControl(node, currentVal, control, setting) {
      const id = 'cb-' + node.key.replace(/[^a-zA-Z0-9]/g, '-');
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.className = 'setting-checkbox';
      cb.id = id;
      cb.checked = !!currentVal;
      cb.addEventListener('change', () => {
        updateSetting(node.key, cb.checked);
        setting.classList.add('modified');
      });

      const lbl = document.createElement('label');
      lbl.className = 'setting-checkbox-label';
      lbl.htmlFor = id;
      lbl.textContent = cb.checked ? 'Enabled' : 'Disabled';
      cb.addEventListener('change', () => {
        lbl.textContent = cb.checked ? 'Enabled' : 'Disabled';
      });

      control.appendChild(cb);
      control.appendChild(lbl);
    }

    function renderEnumControl(node, currentVal, control, setting) {
      const sel = document.createElement('select');
      sel.className = 'setting-select';
      for (let i = 0; i < node.enum.length; i++) {
        const opt = document.createElement('option');
        opt.value = node.enum[i];
        opt.textContent = node.enum[i];
        if (node.enumDescriptions && node.enumDescriptions[i]) {
          opt.title = node.enumDescriptions[i];
        }
        if (String(currentVal) === String(node.enum[i])) {
          opt.selected = true;
        }
        sel.appendChild(opt);
      }
      sel.addEventListener('change', () => {
        let val = sel.value;
        // Try to preserve original type
        if (node.type === 'number' || node.type === 'integer') val = Number(val);
        else if (val === 'true') val = true;
        else if (val === 'false') val = false;
        updateSetting(node.key, val);
        setting.classList.add('modified');
      });
      control.appendChild(sel);
    }

    function renderNumberControl(node, currentVal, control, error, setting) {
      const input = document.createElement('input');
      input.type = 'number';
      input.className = 'setting-input';
      input.value = currentVal !== undefined && currentVal !== null ? String(currentVal) : '';
      if (node.minimum !== undefined) input.min = String(node.minimum);
      if (node.maximum !== undefined) input.max = String(node.maximum);
      if (node.type === 'integer') input.step = '1';

      input.addEventListener('change', () => {
        const val = input.value.trim();
        if (val === '') {
          error.textContent = '';
          error.classList.remove('visible');
          input.classList.remove('invalid');
          return;
        }
        const num = Number(val);
        if (isNaN(num)) {
          error.textContent = 'Must be a number';
          error.classList.add('visible');
          input.classList.add('invalid');
          return;
        }
        if (node.type === 'integer' && !Number.isInteger(num)) {
          error.textContent = 'Must be an integer';
          error.classList.add('visible');
          input.classList.add('invalid');
          return;
        }
        if (node.minimum !== undefined && num < node.minimum) {
          error.textContent = 'Minimum: ' + node.minimum;
          error.classList.add('visible');
          input.classList.add('invalid');
          return;
        }
        if (node.maximum !== undefined && num > node.maximum) {
          error.textContent = 'Maximum: ' + node.maximum;
          error.classList.add('visible');
          input.classList.add('invalid');
          return;
        }
        error.textContent = '';
        error.classList.remove('visible');
        input.classList.remove('invalid');
        updateSetting(node.key, num);
        setting.classList.add('modified');
      });
      control.appendChild(input);
    }

    function renderJsonControl(node, currentVal, control, error, setting) {
      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'setting-input';
      input.style.width = '200px';
      input.value = currentVal !== undefined && currentVal !== null
        ? JSON.stringify(currentVal)
        : '';
      input.placeholder = node.type === 'array' ? '[]' : '{}';

      input.addEventListener('change', () => {
        const val = input.value.trim();
        if (val === '') return;
        try {
          const parsed = JSON.parse(val);
          error.textContent = '';
          error.classList.remove('visible');
          input.classList.remove('invalid');
          updateSetting(node.key, parsed);
          setting.classList.add('modified');
        } catch (e) {
          error.textContent = 'Invalid JSON';
          error.classList.add('visible');
          input.classList.add('invalid');
        }
      });
      control.appendChild(input);
    }

    function renderStringControl(node, currentVal, control, setting) {
      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'setting-input';
      input.style.width = '200px';
      input.value = currentVal !== undefined && currentVal !== null ? String(currentVal) : '';

      input.addEventListener('change', () => {
        updateSetting(node.key, input.value);
        setting.classList.add('modified');
      });
      control.appendChild(input);
    }

    function restoreDefault(node, settingEl) {
      const control = settingEl.querySelector('.setting-control');
      if (!control) return;
      const defaultVal = node.default;

      if (node.type === 'boolean') {
        const cb = control.querySelector('input[type="checkbox"]');
        if (cb) {
          cb.checked = !!defaultVal;
          const lbl = control.querySelector('.setting-checkbox-label');
          if (lbl) lbl.textContent = cb.checked ? 'Enabled' : 'Disabled';
        }
      } else if (node.enum) {
        const sel = control.querySelector('select');
        if (sel) sel.value = String(defaultVal);
      } else if (node.type === 'number' || node.type === 'integer') {
        const input = control.querySelector('input');
        if (input) input.value = defaultVal !== undefined ? String(defaultVal) : '';
      } else if (node.type === 'array' || node.type === 'object') {
        const input = control.querySelector('input');
        if (input) input.value = defaultVal !== undefined ? JSON.stringify(defaultVal) : '';
      } else {
        const input = control.querySelector('input');
        if (input) input.value = defaultVal !== undefined ? String(defaultVal) : '';
      }

      const error = settingEl.querySelector('.setting-error');
      if (error) { error.textContent = ''; error.classList.remove('visible'); }
    }

    function countLeaves(node) {
      if (!node.children) return 1;
      let c = 0;
      for (const ch of node.children) c += countLeaves(ch);
      return c;
    }

    function esc(s) {
      const d = document.createElement('div');
      d.textContent = s;
      return d.innerHTML;
    }

    render(tree, document.getElementById('tree'));

    // --- Tooltip ---
    const tooltip = document.getElementById('tooltip');
    const tooltipKey = document.getElementById('tooltipKey');
    const tooltipDesc = document.getElementById('tooltipDesc');
    const tooltipType = document.getElementById('tooltipType');
    const tooltipDefault = document.getElementById('tooltipDefault');
    let tooltipTimeout = null;

    function showTooltip(node, event) {
      clearTimeout(tooltipTimeout);
      tooltipTimeout = setTimeout(() => {
        tooltipKey.textContent = node.key;
        tooltipDesc.textContent = node.description || 'No description available';
        tooltipType.textContent = node.type ? 'Type: ' + node.type : '';
        const defVal = node.default !== undefined ? JSON.stringify(node.default) : 'none';
        tooltipDefault.textContent = 'Default: ' + defVal;

        tooltip.classList.add('visible');

        // Position near the mouse but keep on screen
        const x = Math.min(event.clientX + 12, window.innerWidth - 370);
        const y = event.clientY + 16;
        tooltip.style.left = Math.max(4, x) + 'px';
        tooltip.style.top = (y + tooltip.offsetHeight > window.innerHeight
          ? event.clientY - tooltip.offsetHeight - 8 : y) + 'px';
      }, 400);
    }

    function hideTooltip() {
      clearTimeout(tooltipTimeout);
      tooltip.classList.remove('visible');
    }

    // --- Search / Filter ---
    const searchInput = document.getElementById('searchInput');
    const searchClear = document.getElementById('searchClear');
    const searchCount = document.getElementById('searchCount');

    let searchTimeout = null;
    searchInput.addEventListener('input', () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => filterTree(searchInput.value), 150);
    });

    searchClear.addEventListener('click', () => {
      searchInput.value = '';
      filterTree('');
      searchInput.focus();
    });

    function filterTree(query) {
      const term = query.trim().toLowerCase();
      const show = term.length > 0;

      searchClear.classList.toggle('hidden', !show);
      searchCount.classList.toggle('hidden', !show);

      const treeEl = document.getElementById('tree');

      if (!show) {
        // Clear all search state — restore collapsed groups, remove hidden-by-search
        treeEl.querySelectorAll('.hidden-by-search').forEach(el => el.classList.remove('hidden-by-search'));
        treeEl.querySelectorAll('.group').forEach(g => {
          g.classList.add('collapsed');
          const arrow = g.querySelector('.arrow');
          if (arrow) arrow.textContent = '▶';
        });
        searchCount.textContent = '';
        return;
      }

      let matchCount = 0;

      // Walk all settings — show/hide based on match
      treeEl.querySelectorAll('.setting').forEach(el => {
        const key = (el.getAttribute('data-key') || '').toLowerCase();
        const label = (el.querySelector('.setting-label')?.textContent || '').toLowerCase();
        const desc = (el.querySelector('.setting-description')?.textContent || '').toLowerCase();
        const matches = key.includes(term) || label.includes(term) || desc.includes(term);
        el.classList.toggle('hidden-by-search', !matches);
        if (matches) matchCount++;
      });

      // Walk groups bottom-up: hide groups with no visible children, expand those with matches
      const groups = Array.from(treeEl.querySelectorAll('.group'));
      // Process innermost groups first (reverse DOM order approximates bottom-up)
      groups.reverse().forEach(g => {
        const children = g.querySelector('.children');
        if (!children) return;

        // Check if any direct child is visible
        const hasVisible = Array.from(children.children).some(child => {
          return !child.classList.contains('hidden-by-search') &&
                 child.style.display !== 'none';
        });

        // Also check group label match
        const groupLabel = (g.querySelector('.group-label')?.textContent || '').toLowerCase();
        const groupMatches = groupLabel.includes(term);

        if (hasVisible || groupMatches) {
          g.classList.remove('hidden-by-search');
          // Expand matched groups
          g.classList.remove('collapsed');
          const arrow = g.querySelector('.arrow');
          if (arrow) arrow.textContent = '▼';
          if (groupMatches && !hasVisible) {
            // Group name matches — show all its children
            children.querySelectorAll('.hidden-by-search').forEach(el => el.classList.remove('hidden-by-search'));
          }
        } else {
          g.classList.add('hidden-by-search');
        }
      });

      // Hide separators and headers when searching
      treeEl.querySelectorAll('.separator, .section-header').forEach(el => {
        el.classList.toggle('hidden-by-search', show);
      });

      searchCount.textContent = matchCount + ' found';
    }
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
