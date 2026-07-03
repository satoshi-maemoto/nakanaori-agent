#!/usr/bin/env bash
# Copyright 2026 Satoshi Maemoto
# SPDX-License-Identifier: Apache-2.0


# Build, install debug APK on connected Kebbi, and launch MainActivity.
# Usage: bash scripts/kebbi-deploy.sh [local|staging]
# Default target: KEBBI_TARGET from .env / config/kebbi-targets.env (staging)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
KEBBI="${NAKANAORI_KEBBI_ROOT:-$ROOT/../nakanaori-kebbi}"
export JAVA_HOME="${JAVA_HOME:-/Applications/Android Studio.app/Contents/jbr/Contents/Home}"

TARGET="${KEBBI_TARGET:-staging}"
if [[ "${1:-}" == "local" || "${1:-}" == "staging" ]]; then
  TARGET="$1"
  shift
fi

if [[ ! -d "$KEBBI" ]]; then
  echo "[kebbi-deploy] ERROR: Kebbi repo not found: $KEBBI" >&2
  echo "Set NAKANAORI_KEBBI_ROOT or clone nakanaori-kebbi next to nakanaori-agent." >&2
  exit 1
fi

if ! adb devices | grep -qE '[[:space:]]device$'; then
  echo "[kebbi-deploy] ERROR: No Android device connected (adb devices)." >&2
  exit 1
fi

bash "$ROOT/scripts/kebbi-ensure-sdk.sh"

cd "$KEBBI"
echo "[kebbi-deploy] installDebug → $KEBBI"
./gradlew :app:installDebug

echo "[kebbi-deploy] API target=$TARGET"
bash "$ROOT/scripts/kebbi-set-api-url.sh" "$TARGET"

echo "[kebbi-deploy] launching com.nakanaori.kebbi/.ui.MainActivity"
adb shell am start -n "com.nakanaori.kebbi/com.nakanaori.kebbi.ui.MainActivity"
