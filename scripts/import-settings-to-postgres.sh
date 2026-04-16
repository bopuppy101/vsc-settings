#!/usr/bin/env bash
#
# import-settings-to-postgres.sh
#
# Reads settings-dump.json (produced by Settings Explorer's "Dump All Settings to JSON"
# command) and inserts every setting into the vscode_categories.settings table in Postgres.
#
# Usage:
#   ./scripts/import-settings-to-postgres.sh [path/to/settings-dump.json]
#
# Defaults to ./settings-dump.json if no argument given.

set -euo pipefail

DUMP_FILE="${1:-./settings-dump.json}"
CONTAINER="dude-shorts-db"
DB_USER="ds"
DB_NAME="vscode_settings"
SCHEMA="vscode_categories"

if [ ! -f "$DUMP_FILE" ]; then
  echo "Error: $DUMP_FILE not found."
  echo "Run 'Settings Explorer: Dump All Settings to JSON' in VS Code first."
  exit 1
fi

echo "Reading $DUMP_FILE..."
COUNT=$(python3 -c "import json; print(len(json.load(open('$DUMP_FILE'))))")
echo "Found $COUNT settings."

# Clear existing data (setting_assignments depends on settings, so clear it first)
echo "Clearing existing data..."
docker exec "$CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -c "
  DELETE FROM ${SCHEMA}.setting_assignments;
  DELETE FROM ${SCHEMA}.custom_categories;
  DELETE FROM ${SCHEMA}.settings;
"

# Generate SQL inserts from JSON using Python
echo "Generating and importing..."
python3 -c "
import json, subprocess, sys

with open('$DUMP_FILE') as f:
    settings = json.load(f)

sql_lines = []
for s in settings:
    key = s['key']
    parts = key.split('.')
    depth = len(parts)
    namespace = parts[0]
    parent_node = '.'.join(parts[:-1]) if len(parts) > 1 else parts[0]
    leaf_name = parts[-1]

    # Pad segments to 7
    segments = parts[:7]
    while len(segments) < 7:
        segments.append(None)

    # Escape single quotes for SQL
    def esc(v):
        if v is None:
            return 'NULL'
        return \"'\" + str(v).replace(\"'\", \"''\") + \"'\"

    def esc_or_null(v):
        return 'NULL' if v is None else esc(v)

    # Build dot_path array literal
    dot_path = \"ARRAY[\" + \",\".join([esc(p) for p in parts]) + \"]\"

    # Segment values
    seg_vals = \",\".join([esc_or_null(seg) for seg in segments])

    # Default value as string
    dv = s.get('defaultValue')
    if dv is None:
        default_str = 'NULL'
    else:
        default_str = esc(json.dumps(dv))

    type_val = esc_or_null(s.get('type'))
    desc_val = esc(s.get('description', ''))
    source_val = esc(s.get('source', ''))

    sql_lines.append(
        f\"INSERT INTO ${SCHEMA}.settings \"
        f\"(key, namespace, category1, category2, category3, category4, category5, category6, category7, \"
        f\"dot_path, depth, parent_node, leaf_name, type, description, default_value, source) \"
        f\"VALUES ({esc(key)}, {esc(namespace)}, {seg_vals}, \"
        f\"{dot_path}, {depth}, {esc(parent_node)}, {esc(leaf_name)}, \"
        f\"{type_val}, {desc_val}, {default_str}, {source_val}) \"
        f\"ON CONFLICT (key) DO NOTHING;\"
    )

sql = '\n'.join(sql_lines)
print(f'Generated {len(sql_lines)} INSERT statements.', file=sys.stderr)

# Pipe to psql via docker exec
proc = subprocess.run(
    ['docker', 'exec', '-i', '$CONTAINER', 'psql', '-U', '$DB_USER', '-d', '$DB_NAME'],
    input=sql,
    capture_output=True,
    text=True
)

if proc.returncode != 0:
    print('PSQL errors:', proc.stderr, file=sys.stderr)
    sys.exit(1)
"

# Report
echo ""
docker exec "$CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -c "
  SELECT COUNT(*) as total_settings FROM ${SCHEMA}.settings;
"
docker exec "$CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -c "
  SELECT segment1 as namespace, COUNT(*) as settings
  FROM ${SCHEMA}.settings
  GROUP BY segment1
  ORDER BY settings DESC
  LIMIT 20;
"

echo "Import complete."
