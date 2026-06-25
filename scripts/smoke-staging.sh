#!/usr/bin/env bash
# Post-deploy smoke test for staging (API + Web).
# Usage: API_URL=https://... WEB_URL=https://... bash scripts/smoke-staging.sh
set -euo pipefail

API_URL="${API_URL:?Set API_URL}"
WEB_URL="${WEB_URL:?Set WEB_URL}"

echo "==> smoke: API health"
curl -sf "${API_URL%/}/health" | grep -q '"status":"ok"'

echo "==> smoke: Web top"
curl -sf "${WEB_URL%/}/" | grep -qi html

echo "==> smoke: POST /v1/sessions"
SESSION=$(curl -sf -X POST "${API_URL%/}/v1/sessions" \
  -H "Content-Type: application/json" \
  -d '{"child_a_label":"smokeA","child_b_label":"smokeB"}')
echo "$SESSION" | grep -q session_id

echo "==> smoke passed"
