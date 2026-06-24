#!/usr/bin/env bash
# Clear logcat buffer (optional before reproducing a bug).
set -euo pipefail
adb logcat -c
echo "[kebbi-logcat] logcat buffer cleared"
