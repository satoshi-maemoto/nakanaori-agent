#!/usr/bin/env bash
# Copyright 2026 Satoshi Maemoto
# SPDX-License-Identifier: Apache-2.0


# Clear logcat buffer (optional before reproducing a bug).
set -euo pipefail
adb logcat -c
echo "[kebbi-logcat] logcat buffer cleared"
