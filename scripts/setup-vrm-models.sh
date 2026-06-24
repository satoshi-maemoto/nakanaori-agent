#!/usr/bin/env bash
# Copy VRM/GLB avatar models from sibling CharaTomo-Web repo.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="${CHARATOMO_MODELS:-$ROOT/../AIxR-CharaTomo-Web/src/static/models}"
DEST="$ROOT/services/web/public/models"

if [[ ! -d "$SRC" ]]; then
  echo "ERROR: CharaTomo models not found at: $SRC" >&2
  echo "Set CHARATOMO_MODELS to the directory containing *.glb" >&2
  exit 1
fi

mkdir -p "$DEST"
cp -f "$SRC"/8329890252317737768.glb "$SRC"/8590256991748008892.glb "$DEST/"
echo "Copied VRM models to $DEST"
ls -lh "$DEST"/*.glb
