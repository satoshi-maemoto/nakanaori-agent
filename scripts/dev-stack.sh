#!/usr/bin/env bash
# Start API (:8080) + Vite (:5173) for local dev / browser verify.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ -f "$ROOT/.env" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "$ROOT/.env"
  set +a
  echo "[dev-stack] loaded .env"
fi

cleanup() {
  jobs -p | xargs kill 2>/dev/null || true
}
trap cleanup EXIT INT TERM

echo "[dev-stack] building agents + api..."
npm run build --workspace=@nakanaori/agents --silent
npm run build --workspace=nakanaori-api --silent

if [[ ! -f services/web/public/models/8329890252317737768.glb ]]; then
  echo "[dev-stack] VRM models missing — running setup-vrm-models.sh..."
  bash scripts/setup-vrm-models.sh
fi

echo "[dev-stack] starting API on :8080..."
npm run dev --workspace=nakanaori-api &

echo "[dev-stack] waiting for API..."
for _ in $(seq 1 60); do
  if curl -sf "http://127.0.0.1:8080/health" >/dev/null 2>&1; then
    break
  fi
  sleep 0.5
done
if ! curl -sf "http://127.0.0.1:8080/health" >/dev/null 2>&1; then
  echo "[dev-stack] ERROR: API did not become ready" >&2
  exit 1
fi

echo "[dev-stack] starting Web on :5173..."
npm run dev --workspace=nakanaori-web -- --host 127.0.0.1 --port 5173 &

echo "[dev-stack] waiting for Web..."
for _ in $(seq 1 60); do
  if curl -sf "http://127.0.0.1:5173/" >/dev/null 2>&1; then
    echo "[dev-stack] Nakanaori dev stack ready"
    echo "  API:  http://127.0.0.1:8080/health"
    echo "  Web:  http://127.0.0.1:5173/"
    wait
    exit 0
  fi
  sleep 0.5
done

echo "[dev-stack] ERROR: Web did not become ready in time" >&2
exit 1
