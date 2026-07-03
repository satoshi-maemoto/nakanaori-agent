#!/usr/bin/env bash
# Copyright 2026 Satoshi Maemoto
# SPDX-License-Identifier: Apache-2.0


#
# One-time / maintenance: prepend Apache-2.0 headers to project source files.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MARKER="SPDX-License-Identifier: Apache-2.0"

add_header() {
  local file="$1"
  local kind="$2"
  if grep -q "$MARKER" "$file" 2>/dev/null; then
    return 0
  fi
  local header tmp body
  if [[ "$kind" == "sh" ]]; then
    header="# Copyright 2026 Satoshi Maemoto
"
    tmp="$(mktemp)"
    if head -n 1 "$file" | grep -q '^#!'; then
      head -n 1 "$file" > "$tmp"
      printf '%s\n' "$header" >> "$tmp"
      tail -n +2 "$file" >> "$tmp"
    else
      printf '%s\n%s' "#!/usr/bin/env bash" "$header" > "$tmp"
      cat "$file" >> "$tmp"
    fi
    mv "$tmp" "$file"
  else
    header="// Copyright 2026 Satoshi Maemoto
// SPDX-License-Identifier: Apache-2.0

"
    tmp="$(mktemp)"
    printf '%s' "$header" > "$tmp"
    cat "$file" >> "$tmp"
    mv "$tmp" "$file"
  fi
  echo "header: $file"
}

while IFS= read -r -d '' file; do
  add_header "$file" "ts"
done < <(find "$ROOT/packages" "$ROOT/services" -type f \( -name '*.ts' -o -name '*.tsx' \) ! -path '*/node_modules/*' ! -path '*/dist/*' -print0)

while IFS= read -r -d '' file; do
  add_header "$file" "sh"
done < <(find "$ROOT/scripts" -type f -name '*.sh' -print0)

echo "Done."
