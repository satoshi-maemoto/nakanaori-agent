#!/usr/bin/env bash
# Run a Kebbi helper script after stopping any prior VS Code task instance.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SCRIPT="${1:-}"

if [[ -z "$SCRIPT" ]]; then
  echo "[kebbi-vscode-run] usage: kebbi-vscode-run.sh <deploy|status|logcat>" >&2
  exit 1
fi

bash "$ROOT/scripts/kebbi-vscode-stop.sh"
exec bash "$ROOT/scripts/kebbi-${SCRIPT}.sh" "${@:2}"
