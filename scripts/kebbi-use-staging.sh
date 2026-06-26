#!/usr/bin/env bash
# Point connected Kebbi at Cloud Run staging API.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
exec bash "$ROOT/scripts/kebbi-set-api-url.sh" staging
