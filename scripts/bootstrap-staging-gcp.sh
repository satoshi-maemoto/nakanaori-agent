#!/usr/bin/env bash
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
#   bash scripts/bootstrap-staging-gcp.sh
#
# 完了後: GitHub リポジトリ Secrets に GCP_PROJECT_ID / GCP_SA_KEY を登録 → main push

set -euo pipefail

PROJECT_ID="${PROJECT_ID:?Set PROJECT_ID (e.g. export PROJECT_ID=your-gcp-project)}"
REGION="${REGION:-asia-northeast1}"
AR_REPO="${AR_REPO:-nakanaori}"
DEPLOY_SA_NAME="${DEPLOY_SA_NAME:-nakanaori-github-deploy}"
DEPLOY_SA_EMAIL="${DEPLOY_SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"
SECRET_NAME="${SECRET_NAME:-GEMINI_API_KEY}"

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

echo "==> Cloud Run runtime — Secret Manager accessor..."
PROJECT_NUMBER="$(gcloud projects describe "$PROJECT_ID" --format='value(projectNumber)')"
RUNTIME_SA="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

if gcloud secrets describe "$SECRET_NAME" --project="$PROJECT_ID" &>/dev/null; then
  gcloud secrets add-iam-policy-binding "$SECRET_NAME" \
    --project="$PROJECT_ID" \
    --member="serviceAccount:${RUNTIME_SA}" \
    --role="roles/secretmanager.secretAccessor" \
    --quiet >/dev/null
  echo "    $RUNTIME_SA → secretAccessor on $SECRET_NAME"
else
  echo "    skip (secret $SECRET_NAME not found yet)"
fi

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
echo "3. After deploy, update README デモ URL and run smoke tests."
echo "   See docs/hackathon-staging-deploy.md"
