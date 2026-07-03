#!/usr/bin/env bash
# Copyright 2026 Satoshi Maemoto
# SPDX-License-Identifier: Apache-2.0


# Nakanaori staging — GCP 初回セットアップ（別 Cloud Run サービス）
#
# 用途: nakanaori-api / nakanaori-web を AIxR-API とは独立した Cloud Run にデプロイするための
#       Artifact Registry・Secret Manager・デプロイ SA を用意する。
#
# 使い方:
#   export PROJECT_ID=your-gcp-project
#   export REGION=asia-northeast1          # 任意（デフォルト asia-northeast1）
#   # GEMINI_API_KEY を Secret Manager に登録する場合（初回のみ）:
#   export GEMINI_API_KEY=your-key
#   # TTS（任意）— サービスアカウント JSON ファイル:
#   export GOOGLE_TTS_CREDENTIALS_FILE=./credentials/google-tts-service-account.json
#   bash scripts/bootstrap-staging-gcp.sh
#
# 完了後: GitHub リポジトリ Secrets に GCP_PROJECT_ID / GCP_SA_KEY を登録 → main push

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PROJECT_ID="${PROJECT_ID:?Set PROJECT_ID (e.g. export PROJECT_ID=your-gcp-project)}"
REGION="${REGION:-asia-northeast1}"
AR_REPO="${AR_REPO:-nakanaori}"
DEPLOY_SA_NAME="${DEPLOY_SA_NAME:-nakanaori-github-deploy}"
DEPLOY_SA_EMAIL="${DEPLOY_SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"
SECRET_NAME="${SECRET_NAME:-GEMINI_API_KEY}"
TTS_SECRET_NAME="${TTS_SECRET_NAME:-GOOGLE_TTS_CREDENTIALS_JSON}"

echo "==> Nakanaori staging bootstrap"
echo "    PROJECT_ID=$PROJECT_ID"
echo "    REGION=$REGION"
echo "    Artifact Registry repo=$AR_REPO"
echo "    Deploy SA=$DEPLOY_SA_EMAIL"
echo ""

gcloud config set project "$PROJECT_ID"

echo "==> Enabling APIs..."
gcloud services enable \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  secretmanager.googleapis.com \
  storage.googleapis.com \
  texttospeech.googleapis.com \
  --project="$PROJECT_ID"

echo "==> Artifact Registry ($AR_REPO)..."
if gcloud artifacts repositories describe "$AR_REPO" \
  --location="$REGION" --project="$PROJECT_ID" &>/dev/null; then
  echo "    already exists"
else
  gcloud artifacts repositories create "$AR_REPO" \
    --repository-format=docker \
    --location="$REGION" \
    --project="$PROJECT_ID" \
    --description="Nakanaori API + Web images (separate from AIxR-API)"
fi

echo "==> Secret Manager ($SECRET_NAME)..."
if gcloud secrets describe "$SECRET_NAME" --project="$PROJECT_ID" &>/dev/null; then
  echo "    secret exists (skip create; use 'gcloud secrets versions add' to rotate)"
else
  if [[ -z "${GEMINI_API_KEY:-}" ]]; then
    echo "    WARN: GEMINI_API_KEY env not set — create secret manually:"
    echo "    echo -n 'YOUR_KEY' | gcloud secrets create $SECRET_NAME --data-file=- --project=$PROJECT_ID"
  else
    printf '%s' "$GEMINI_API_KEY" | gcloud secrets create "$SECRET_NAME" \
      --data-file=- \
      --project="$PROJECT_ID"
    echo "    created"
  fi
fi

echo "==> Secret Manager ($TTS_SECRET_NAME) — optional TTS..."
if gcloud secrets describe "$TTS_SECRET_NAME" --project="$PROJECT_ID" &>/dev/null; then
  echo "    secret exists (skip create; use 'gcloud secrets versions add' to rotate)"
else
  if [[ -n "${GOOGLE_TTS_CREDENTIALS_FILE:-}" && -f "$GOOGLE_TTS_CREDENTIALS_FILE" ]]; then
    python3 -c "import json,sys; print(json.dumps(json.load(open(sys.argv[1]))))" \
      "$GOOGLE_TTS_CREDENTIALS_FILE" | gcloud secrets create "$TTS_SECRET_NAME" \
      --data-file=- \
      --project="$PROJECT_ID"
    echo "    created from $GOOGLE_TTS_CREDENTIALS_FILE"
  elif [[ -n "${GOOGLE_TTS_CREDENTIALS_JSON:-}" ]]; then
    printf '%s' "$GOOGLE_TTS_CREDENTIALS_JSON" | gcloud secrets create "$TTS_SECRET_NAME" \
      --data-file=- \
      --project="$PROJECT_ID"
    echo "    created from GOOGLE_TTS_CREDENTIALS_JSON env"
  else
    echo "    WARN: TTS credentials not set — staging deploys without TTS (503 fallback)."
    echo "    See docs/google-cloud-tts-setup.md"
    echo "    export GOOGLE_TTS_CREDENTIALS_FILE=./credentials/google-tts-service-account.json"
  fi
fi

echo "==> Deploy service account ($DEPLOY_SA_NAME)..."
if gcloud iam service-accounts describe "$DEPLOY_SA_EMAIL" --project="$PROJECT_ID" &>/dev/null; then
  echo "    already exists"
else
  gcloud iam service-accounts create "$DEPLOY_SA_NAME" \
    --display-name="Nakanaori GitHub Actions deploy (staging)" \
    --project="$PROJECT_ID"
fi

DEPLOY_ROLES=(
  roles/run.admin
  roles/artifactregistry.writer
  roles/iam.serviceAccountUser
  roles/secretmanager.admin
)

for role in "${DEPLOY_ROLES[@]}"; do
  gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="serviceAccount:${DEPLOY_SA_EMAIL}" \
    --role="$role" \
    --condition=None \
    --quiet >/dev/null
done
echo "    IAM roles bound (run.admin, artifactregistry.writer, serviceAccountUser, secretmanager.admin)"

echo "==> VRM models bucket (Web Docker ビルド用)..."
ASSETS_BUCKET="${PROJECT_ID}-nakanaori-assets"
if gcloud storage buckets describe "gs://${ASSETS_BUCKET}" --project="$PROJECT_ID" &>/dev/null; then
  echo "    bucket exists: gs://${ASSETS_BUCKET}"
else
  gcloud storage buckets create "gs://${ASSETS_BUCKET}" \
    --location="$REGION" \
    --project="$PROJECT_ID"
  echo "    created gs://${ASSETS_BUCKET}"
fi

MODELS_DIR="$ROOT/services/web/public/models"
if [[ -f "$MODELS_DIR/8329890252317737768.glb" && -f "$MODELS_DIR/8590256991748008892.glb" ]]; then
  gcloud storage cp "$MODELS_DIR"/*.glb "gs://${ASSETS_BUCKET}/models/" --project="$PROJECT_ID"
  echo "    uploaded VRM GLB to gs://${ASSETS_BUCKET}/models/"
else
  echo "    WARN: GLB not found — run: npm run setup:vrm-models && re-run this script"
fi

gcloud storage buckets add-iam-policy-binding "gs://${ASSETS_BUCKET}" \
  --member="serviceAccount:${DEPLOY_SA_EMAIL}" \
  --role="roles/storage.objectViewer" \
  --project="$PROJECT_ID" \
  --quiet >/dev/null
echo "    ${DEPLOY_SA_EMAIL} → objectViewer on ${ASSETS_BUCKET}"

echo "==> Cloud Run runtime — Secret Manager accessor..."
PROJECT_NUMBER="$(gcloud projects describe "$PROJECT_ID" --format='value(projectNumber)')"
RUNTIME_SA="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

for sm_secret in "$SECRET_NAME" "$TTS_SECRET_NAME"; do
  if gcloud secrets describe "$sm_secret" --project="$PROJECT_ID" &>/dev/null; then
    gcloud secrets add-iam-policy-binding "$sm_secret" \
      --project="$PROJECT_ID" \
      --member="serviceAccount:${RUNTIME_SA}" \
      --role="roles/secretmanager.secretAccessor" \
      --quiet >/dev/null
    echo "    $RUNTIME_SA → secretAccessor on $sm_secret"
  else
    echo "    skip (secret $sm_secret not found yet)"
  fi
done

KEY_FILE="${KEY_FILE:-./nakanaori-github-deploy-key.json}"
if [[ -f "$KEY_FILE" ]]; then
  echo "==> SA key file already exists: $KEY_FILE (not overwriting)"
else
  echo "==> Creating SA key → $KEY_FILE"
  gcloud iam service-accounts keys create "$KEY_FILE" \
    --iam-account="$DEPLOY_SA_EMAIL" \
    --project="$PROJECT_ID"
  echo "    ⚠️  Do NOT commit this file. Add to GitHub Secret GCP_SA_KEY, then delete locally."
fi

echo ""
echo "==> Done. Next steps:"
echo ""
echo "1. GitHub → Settings → Secrets and variables → Actions:"
echo "     GCP_PROJECT_ID = $PROJECT_ID"
echo "     GCP_SA_KEY     = contents of $KEY_FILE"
echo ""
echo "2. git push origin main  → deploy-staging.yml deploys:"
echo "     Cloud Run: nakanaori-api, nakanaori-web"
echo "     Images:    ${REGION}-docker.pkg.dev/${PROJECT_ID}/${AR_REPO}/api|web"
echo ""
echo "3. After deploy, get URLs (gcloud run services describe) and report to hackathon secretariat."
echo "   Run smoke tests — see docs/hackathon-staging-deploy.md"
