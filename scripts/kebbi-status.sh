#!/usr/bin/env bash
# Show whether nakanaori-kebbi is running on the connected device.
set -euo pipefail

PKG="com.nakanaori.kebbi"

echo "=== adb devices ==="
adb devices

echo ""
echo "=== $PKG ==="
PID="$(adb shell pidof "$PKG" 2>/dev/null | tr -d '\r\n' || true)"
if [[ -z "$PID" ]]; then
  echo "Status: NOT RUNNING"
  exit 0
fi

echo "Status: RUNNING (pid=$PID)"
echo ""
echo "=== foreground activity ==="
adb shell dumpsys activity activities 2>/dev/null | rg -m 5 "mResumedActivity|nakanaori" || true

echo ""
echo "=== recent log (last 30 lines, tag NakanaoriKebbi) ==="
adb logcat -d -v time -t 30 NakanaoriKebbi:I *:S 2>/dev/null || echo "(no NakanaoriKebbi logs yet — redeploy after AppLog update)"
