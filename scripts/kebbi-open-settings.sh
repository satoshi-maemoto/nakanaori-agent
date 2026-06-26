#!/usr/bin/env bash
# Open Kebbi settings screen on a connected device (hides robot face overlay first).
set -euo pipefail

PKG="com.nakanaori.kebbi"
ACTIVITY="${PKG}/com.nakanaori.kebbi.ui.SettingsActivity"

if ! adb devices | grep -qE '[[:space:]]device$'; then
  echo "[kebbi-open-settings] ERROR: No Android device connected (adb devices)." >&2
  exit 1
fi

echo "[kebbi-open-settings] launching SettingsActivity"
adb shell am start -n "$ACTIVITY" -a android.intent.action.VIEW
