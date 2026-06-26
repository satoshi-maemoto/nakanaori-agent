#!/usr/bin/env bash
# Point connected Kebbi at Mac dev-stack API (LAN IP :8080).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
exec bash "$ROOT/scripts/kebbi-set-api-url.sh" local
