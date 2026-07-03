#!/usr/bin/env bash
# Copyright 2026 Satoshi Maemoto
# SPDX-License-Identifier: Apache-2.0


# Check agent TypeScript sources for forbidden judgment labels.
# Prompt .md files may list forbidden terms in "Forbidden" sections — excluded.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
AGENTS_SRC="$ROOT/packages/agents/src"

FORBIDDEN=(
  '悪い子'
  '悪い方'
  '有罪'
  'guilty_party'
  'verdict'
  'at_fault'
  'punishment_recommendation'
)

found=0

while IFS= read -r -d '' file; do
  for pattern in "${FORBIDDEN[@]}"; do
    if grep -n "$pattern" "$file" 2>/dev/null; then
      echo "ERROR: Forbidden pattern '$pattern' in $file"
      found=1
    fi
  done
done < <(find "$AGENTS_SRC" -type f -name '*.ts' -print0)

if [[ $found -ne 0 ]]; then
  echo "Prompt check FAILED"
  exit 1
fi

echo "Prompt check passed"
