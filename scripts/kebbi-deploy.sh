#!/usr/bin/env bash
# Build, install debug APK on connected Kebbi, and launch MainActivity.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
KEBBI="${NAKANAORI_KEBBI_ROOT:-$ROOT/../nakanaori-kebbi}"
export JAVA_HOME="${JAVA_HOME:-/Applications/Android Studio.app/Contents/jbr/Contents/Home}"

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

echo "[kebbi-deploy] launching com.nakanaori.kebbi/.ui.MainActivity"
adb shell am start -n "com.nakanaori.kebbi/com.nakanaori.kebbi.ui.MainActivity"
