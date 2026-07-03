#!/usr/bin/env bash
# Copyright 2026 Satoshi Maemoto
# SPDX-License-Identifier: Apache-2.0


# Follow logcat for nakanaori-kebbi (Ctrl+C to stop).
set -euo pipefail

PKG="com.nakanaori.kebbi"
TAG_APP="NakanaoriKebbi"
TAG_NUWA="NuwaSpeechHelper"

if ! adb devices | grep -qE '[[:space:]]device$'; then
  echo "[kebbi-logcat] ERROR: No Android device connected." >&2
  exit 1
fi

PID="$(adb shell pidof "$PKG" 2>/dev/null | tr -d '\r\n' || true)"

echo "[kebbi-logcat] package=$PKG"
if [[ -n "$PID" ]]; then
  echo "[kebbi-logcat] pid=$PID (filtering by process)"
  echo "[kebbi-logcat] Ctrl+C to stop"
  exec adb logcat -v time --pid="$PID"
else
  echo "[kebbi-logcat] app not running — filter by tags: $TAG_APP, $TAG_NUWA"
  echo "[kebbi-logcat] Ctrl+C to stop"
  exec adb logcat -v time "$TAG_APP":D "$TAG_NUWA":D OkHttp:D *:S
fi
