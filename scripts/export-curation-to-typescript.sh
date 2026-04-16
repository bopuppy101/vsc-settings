#!/usr/bin/env bash
#
# export-curation-to-typescript.sh
#
# Reads custom_categories and custom_settings from Postgres and generates
# src/custom-categories.ts — the TypeScript map that Settings Explorer uses
# at runtime to insert custom category nodes into the settings tree.
#
# Usage:
#   ./scripts/export-curation-to-typescript.sh

set -euo pipefail

CONTAINER="dude-shorts-db"
DB_USER="ds"
DB_NAME="vscode_settings"
OUT_FILE="src/custom-categories.ts"

echo "Exporting curation data from Postgres..."

python3 -c "
import json, subprocess, sys

# Query all categories with their setting keys
sql = '''
SELECT json_agg(row_to_json(t) ORDER BY t.parent_node, t.sort_order)
FROM (
  SELECT
    cc.id,
    cc.parent_node,
    cc.group_name,
    cc.sort_order,
    cc.parent_category_id,
    COALESCE(
      (SELECT json_agg(cs.setting_key ORDER BY cs.setting_key)
       FROM vscode_categories.custom_settings cs
       WHERE cs.group_id = cc.id), '[]'::json
    ) as setting_keys
  FROM vscode_categories.custom_categories cc
  ORDER BY cc.parent_node, cc.sort_order
) t;
'''

proc = subprocess.run(
    ['docker', 'exec', '-i', '$CONTAINER', 'psql', '-U', '$DB_USER', '-d', '$DB_NAME', '-t', '-A'],
    input=sql, capture_output=True, text=True
)

if proc.returncode != 0:
    print('PSQL error:', proc.stderr, file=sys.stderr)
    sys.exit(1)

rows = json.loads(proc.stdout.strip())

# Build hierarchical structure: parent_node -> categories (with nested children)
# First, index by id
by_id = {r['id']: r for r in rows}

# Separate parents (no parent_category_id) from children
parents_by_node = {}  # parent_node -> list of top-level categories
children_by_parent = {}  # parent_category_id -> list of child categories

for r in rows:
    if r['parent_category_id'] is None:
        parents_by_node.setdefault(r['parent_node'], []).append(r)
    else:
        children_by_parent.setdefault(r['parent_category_id'], []).append(r)

# Generate TypeScript
lines = []
lines.append('/**')
lines.append(' * Custom categories for dense settings nodes.')
lines.append(' * Auto-generated from Postgres by scripts/export-curation-to-typescript.sh')
lines.append(' * DO NOT EDIT BY HAND — re-run the export script after changing curation data.')
lines.append(' */')
lines.append('')
lines.append('export interface CustomCategory {')
lines.append('  categoryName: string;')
lines.append('  settingKeys: string[];')
lines.append('  children?: CustomCategory[];')
lines.append('}')
lines.append('')
lines.append('/**')
lines.append(' * Map from parent_node (e.g. \"git\", \"terminal.integrated\") to its custom categories.')
lines.append(' * Each category contains the settings that belong to it.')
lines.append(' * Categories with children are purely organizational — their settingKeys will be empty.')
lines.append(' */')
lines.append('export const customCategories: Record<string, CustomCategory[]> = {')

sorted_nodes = sorted(parents_by_node.keys())
for node_idx, node in enumerate(sorted_nodes):
    cats = parents_by_node[node]
    # Sort by sort_order
    cats.sort(key=lambda c: c['sort_order'])

    lines.append(f'  {json.dumps(node)}: [')

    for cat_idx, cat in enumerate(cats):
        children = children_by_parent.get(cat['id'], [])
        children.sort(key=lambda c: c['sort_order'])
        trailing = ',' if cat_idx < len(cats) - 1 else ','

        if children:
            lines.append(f'    {{')
            lines.append(f'      categoryName: {json.dumps(cat[\"group_name\"])},')
            lines.append(f'      settingKeys: [],')
            lines.append(f'      children: [')
            for child_idx, child in enumerate(children):
                child_trailing = ',' if child_idx < len(children) - 1 else ','
                keys_str = json.dumps(child['setting_keys'])
                lines.append(f'        {{ categoryName: {json.dumps(child[\"group_name\"])}, settingKeys: {keys_str} }}{child_trailing}')
            lines.append(f'      ],')
            lines.append(f'    }}{trailing}')
        else:
            keys_str = json.dumps(cat['setting_keys'])
            lines.append(f'    {{ categoryName: {json.dumps(cat[\"group_name\"])}, settingKeys: {keys_str} }}{trailing}')

    node_trailing = ',' if node_idx < len(sorted_nodes) - 1 else ','
    lines.append(f'  ]{node_trailing}')

lines.append('};')
lines.append('')

with open('$OUT_FILE', 'w') as f:
    f.write('\n'.join(lines))

print(f'Wrote {len(sorted_nodes)} nodes to $OUT_FILE', file=sys.stderr)
"

echo "Export complete: $OUT_FILE"
echo "Categories: $(grep -c 'categoryName' "$OUT_FILE") entries"
