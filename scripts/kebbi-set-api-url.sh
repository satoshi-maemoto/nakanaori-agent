#!/usr/bin/env bash
# Push Nakanaori API URL to Kebbi SharedPreferences (debug build).
# Usage: bash scripts/kebbi-set-api-url.sh [local|staging]
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck disable=SC1091
source "$ROOT/scripts/kebbi-target.sh"

TARGET="${1:-${KEBBI_TARGET:-staging}}"
PKG="com.nakanaori.kebbi"
PREFS_FILE="nakanaori_kebbi_settings.xml"
PREFS_PATH="shared_prefs/$PREFS_FILE"

if ! adb devices | grep -qE '[[:space:]]device$'; then
  echo "[kebbi-set-api-url] ERROR: No Android device connected (adb devices)." >&2
  exit 1
fi

API_URL="$(kebbi_resolve_api_url "$TARGET")"

TMP="$(mktemp)"
trap 'rm -f "$TMP"' EXIT

if adb exec-out "run-as $PKG cat $PREFS_PATH" > "$TMP" 2>/dev/null && [[ -s "$TMP" ]]; then
  :
else
  cat > "$TMP" <<'EOF'
<?xml version='1.0' encoding='utf-8' standalone='yes' ?>
<map>
    <boolean name="migrated_from_datastore" value="true" />
</map>
EOF
fi

python3 - "$API_URL" "$TMP" <<'PY'
import sys
import xml.etree.ElementTree as ET

url, path = sys.argv[1], sys.argv[2]
tree = ET.parse(path)
root = tree.getroot()
for el in list(root):
    if el.get("name") == "api_base":
        root.remove(el)
el = ET.SubElement(root, "string", name="api_base")
el.text = url.rstrip("/")
ET.indent(tree, space="    ")
tree.write(path, encoding="utf-8", xml_declaration=True)
PY

adb push "$TMP" "/data/local/tmp/$PREFS_FILE" >/dev/null
adb shell "run-as $PKG mkdir -p shared_prefs && cp /data/local/tmp/$PREFS_FILE $PREFS_PATH"

echo "[kebbi-set-api-url] target=$TARGET → $API_URL"
