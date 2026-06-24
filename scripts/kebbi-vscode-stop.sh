#!/usr/bin/env bash
# Stop prior Kebbi VS Code / Cursor tasks before re-launching (idempotent).
set -uo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
KEBBI="${NAKANAORI_KEBBI_ROOT:-$ROOT/../nakanaori-kebbi}"

echo "[kebbi-vscode-stop] stopping prior Kebbi tasks…"

stop_pattern() {
  local label="$1"
  local pattern="$2"
  if pkill -f "$pattern" 2>/dev/null; then
    echo "[kebbi-vscode-stop] stopped $label"
  fi
}

stop_pattern "logcat" "[s]cripts/kebbi-logcat.sh"
stop_pattern "deploy" "[s]cripts/kebbi-deploy.sh"
stop_pattern "status" "[s]cripts/kebbi-status.sh"

if [[ -d "$KEBBI" ]]; then
  stop_pattern "gradle" "$KEBBI.*gradlew"
  (cd "$KEBBI" && ./gradlew --stop >/dev/null 2>&1) || true
fi

echo "[kebbi-vscode-stop] ready"
