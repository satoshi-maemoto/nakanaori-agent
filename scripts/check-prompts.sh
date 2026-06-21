#!/usr/bin/env bash
# Check Nakanaori Python sources for forbidden judgment labels.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
AGENTS_DIR="$ROOT/agents/nakanaori"

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
done < <(find "$AGENTS_DIR" -type f -name '*.py' -print0)

if [[ $found -ne 0 ]]; then
  echo "Prompt check FAILED"
  exit 1
fi

echo "Prompt check passed"
