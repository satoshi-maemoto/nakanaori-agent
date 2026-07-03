#!/usr/bin/env bash
# Copyright 2026 Satoshi Maemoto
# SPDX-License-Identifier: Apache-2.0

#
# Fail if project source files are missing Apache-2.0 SPDX headers.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MARKER="SPDX-License-Identifier: Apache-2.0"
failed=0

check_files() {
  local label="$1"
  shift
  while IFS= read -r -d '' file; do
    if ! head -n 5 "$file" | grep -q "$MARKER"; then
      echo "missing license header: $file" >&2
      failed=1
    fi
  done < <(find "$@" -type f \( -name '*.ts' -o -name '*.tsx' \) ! -path '*/node_modules/*' ! -path '*/dist/*' -print0)
}

check_files "ts" "$ROOT/packages" "$ROOT/services"
while IFS= read -r -d '' file; do
  if ! head -n 5 "$file" | grep -q "$MARKER"; then
    echo "missing license header: $file" >&2
    failed=1
  fi
done < <(find "$ROOT/scripts" -type f -name '*.sh' -print0)

if [[ "$failed" -ne 0 ]]; then
  echo "Run: bash scripts/add-license-headers.sh" >&2
  exit 1
fi

echo "License headers OK"
