#!/usr/bin/env bash
# Copyright 2026 Satoshi Maemoto
# SPDX-License-Identifier: Apache-2.0


# Resolve Kebbi API URL for local | staging (sourced by kebbi-set-api-url.sh / kebbi-deploy.sh).

kebbi_agent_root() {
  if [[ -n "${KEBBI_AGENT_ROOT:-}" ]]; then
    echo "$KEBBI_AGENT_ROOT"
    return 0
  fi
  local here
  here="$(cd "$(dirname "${BASH_SOURCE[1]:-${BASH_SOURCE[0]}}")/.." && pwd)"
  echo "$here"
}

kebbi_load_env() {
  local root
  root="$(kebbi_agent_root)"
  if [[ -f "$root/config/kebbi-targets.env" ]]; then
    # shellcheck disable=SC1091
    source "$root/config/kebbi-targets.env"
  fi
  if [[ -f "$root/.env" ]]; then
    set -a
    # shellcheck disable=SC1091
    source "$root/.env"
    set +a
  fi
}

kebbi_lan_ip() {
  local iface ip
  for iface in en0 en1 bridge0; do
    ip="$(ipconfig getifaddr "$iface" 2>/dev/null || true)"
    if [[ -n "$ip" ]]; then
      echo "$ip"
      return 0
    fi
  done
  return 1
}

kebbi_resolve_api_url() {
  local target="${1:-${KEBBI_TARGET:-staging}}"
  kebbi_load_env

  local web_url="${KEBBI_STAGING_WEB_URL:-https://nakanaori-web-370062202060.asia-northeast1.run.app}"
  web_url="${web_url%/}"

  case "$target" in
    staging|stage|cloud)
      if [[ -n "${KEBBI_STAGING_API_URL:-}" ]]; then
        echo "${KEBBI_STAGING_API_URL%/}"
      else
        echo "${web_url/nakanaori-web/nakanaori-api}"
      fi
      ;;
    local|dev|lan)
      local port="${KEBBI_LOCAL_PORT:-8080}"
      if [[ -n "${KEBBI_LOCAL_API_URL:-}" ]]; then
        echo "${KEBBI_LOCAL_API_URL%/}"
        return 0
      fi
      local ip
      if ! ip="$(kebbi_lan_ip)"; then
        echo "[kebbi-target] ERROR: LAN IP not found (connect Wi‑Fi / set KEBBI_LOCAL_API_URL)" >&2
        return 1
      fi
      echo "http://${ip}:${port}"
      ;;
    *)
      echo "[kebbi-target] ERROR: unknown target '$target' (use local or staging)" >&2
      return 1
      ;;
  esac
}
