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

    .leaf {
      display: flex; align-items: center;
      height: 26px; padding: 0 8px 0 28px; gap: 8px;
    }
    .leaf:hover { background: var(--vscode-list-hoverBackground); }
    .leaf-label { flex: 1; }
    .leaf-type {
      font-size: 10px; opacity: 0.4;
      background: var(--vscode-badge-background);
      color: var(--vscode-badge-foreground);
      padding: 1px 5px; border-radius: 8px;
    }

    h2 {
      padding: 8px; font-size: 11px; font-weight: 600;
      text-transform: uppercase; letter-spacing: 0.5px;
      opacity: 0.6;
      border-bottom: 1px solid var(--vscode-sideBarSectionHeader-border, var(--vscode-panel-border));
    }
  </style>
</head>
<body>
  <h2>Settings Explorer</h2>
  <div id="stats" style="padding: 4px 8px; font-size: 11px; opacity: 0.5;"></div>
  <div class="tree" id="tree"></div>
  <script nonce="${nonce}">
    const tree = ${treeJson};

    function countAllLeaves(nodes) {
      let c = 0;
      for (const n of nodes) {
        if (n.children && n.children.length > 0) c += countAllLeaves(n.children);
        else c++;
      }
      return c;
    }
    document.getElementById('stats').textContent = countAllLeaves(tree) + ' settings found';

    function render(nodes, container) {
      for (const node of nodes) {
        if (node.children && node.children.length > 0) {
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
        } else {
          const leaf = document.createElement('div');
          leaf.className = 'leaf';
          leaf.title = node.description || '';
          leaf.innerHTML =
            '<span class="leaf-label">' + esc(node.label) + '</span>' +
            '<span class="leaf-type">' + esc(node.type || '') + '</span>';
          container.appendChild(leaf);
        }
      }
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
