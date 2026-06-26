# 初回 Staging デプロイ手順（ハッカソン提出用）

**目的**: **AIxR-API とは別の** Cloud Run サービス `nakanaori-api` + `nakanaori-web` をデプロイし、**Deployed URL を事務局へ別途連絡**する（README には掲載しない）。

**前提**: [hackathon-appeal-plan.md](./hackathon-appeal-plan.md) P0-1

---

## アーキテクチャ方針

| 項目 | 決定 |
|------|------|
| ランタイム | **別 Cloud Run サービス**（`nakanaori-api` / `nakanaori-web`） |
| AIxR-API staging | **使用しない** — API 契約・ADK ワークフローが異なる |
| GCP プロジェクト | 新規でも既存（AIxR 等）でも可 — **サービス名だけ分離** |
| 秘密情報 | リポジトリに載せない — GitHub Secrets + GCP Secret Manager |

```text
GitHub (public repo)          GCP
─────────────────────         ─────────────────────────────
Secrets:                      Cloud Run (別サービス)
  GCP_PROJECT_ID      ──►       nakanaori-api  ← GEMINI + TTS (Secret Manager, 任意)
  GCP_SA_KEY                    nakanaori-web  ← VITE_API_BASE_URL ビルド時注入
                                Artifact Registry: nakanaori/{api,web}
                                (AIxR-API の aixr-api-service-prod 等とは独立)
```

要件根拠: `aidlc-docs/inception/requirements/requirements.md` — **GCP スタンドアロン構成**

---

## 0. クイックセットアップ（推奨）

```bash
export PROJECT_ID=your-gcp-project
export GEMINI_API_KEY=your-gemini-key   # 初回のみ
bash scripts/bootstrap-staging-gcp.sh
```

生成された `nakanaori-github-deploy-key.json` を GitHub Secret `GCP_SA_KEY` に登録（**コミット禁止**）。

---

## 1. GCP 準備（手動の場合）

### 1.1 プロジェクトと API

```bash
export PROJECT_ID=your-gcp-project
export REGION=asia-northeast1

gcloud config set project "$PROJECT_ID"
gcloud services enable run.googleapis.com artifactregistry.googleapis.com secretmanager.googleapis.com
```

### 1.2 Artifact Registry

```bash
gcloud artifacts repositories create nakanaori \
  --repository-format=docker \
  --location=$REGION \
  --project=$PROJECT_ID
```

イメージパス（workflow 固定）:

```text
${REGION}-docker.pkg.dev/${PROJECT_ID}/nakanaori/api:${git-sha}
${REGION}-docker.pkg.dev/${PROJECT_ID}/nakanaori/web:${git-sha}
```

### 1.3 Secret Manager — 実行時キー

```bash
echo -n "YOUR_GEMINI_API_KEY" | gcloud secrets create GEMINI_API_KEY \
  --data-file=- \
  --project=$PROJECT_ID
```

Cloud Run のデフォルト実行 SA に accessor を付与:

```bash
PROJECT_NUMBER=$(gcloud projects describe "$PROJECT_ID" --format='value(projectNumber)')
RUNTIME_SA="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
  --project="$PROJECT_ID" \
  --member="serviceAccount:${RUNTIME_SA}" \
  --role="roles/secretmanager.secretAccessor"
```

### 1.3b Secret Manager — TTS 認証（任意）

TTS を staging で有効にする場合、サービスアカウント JSON を **1 行 JSON** として Secret Manager に登録します。

```bash
# Cloud Text-to-Speech API を有効化
gcloud services enable texttospeech.googleapis.com --project=$PROJECT_ID

# JSON ファイルから Secret 作成（bootstrap でも可）
python3 -c 'import json; print(json.dumps(json.load(open("credentials/google-tts-service-account.json"))))' \
  | gcloud secrets create GOOGLE_TTS_CREDENTIALS_JSON \
    --data-file=- \
    --project=$PROJECT_ID

gcloud secrets add-iam-policy-binding GOOGLE_TTS_CREDENTIALS_JSON \
  --project="$PROJECT_ID" \
  --member="serviceAccount:${RUNTIME_SA}" \
  --role="roles/secretmanager.secretAccessor"
```

**未設定でもデプロイは成功** — workflow が `::warning::` を出し、API は TTS 503 + フォールバックで動作します。

### 1.4 デプロイ用サービスアカウント

GitHub Actions 専用 SA（最小限のロール）:

| ロール | 用途 |
|--------|------|
| `roles/run.admin` | Cloud Run デプロイ |
| `roles/artifactregistry.writer` | イメージ push |
| `roles/iam.serviceAccountUser` | Run として SA を指定 |
| `roles/secretmanager.admin` | deploy 時 `--set-secrets` バインディング |

```bash
gcloud iam service-accounts create nakanaori-github-deploy \
  --display-name="Nakanaori GitHub Actions deploy"

# 各ロールを DEPLOY_SA に付与（bootstrap スクリプト参照）

gcloud iam service-accounts keys create nakanaori-github-deploy-key.json \
  --iam-account=nakanaori-github-deploy@${PROJECT_ID}.iam.gserviceaccount.com
```

---

## 2. GitHub Secrets（公開リポジトリ — 必須）

| Secret | 内容 | リポジトリにコミット？ |
|--------|------|------------------------|
| `GCP_PROJECT_ID` | GCP プロジェクト ID | ❌ |
| `GCP_SA_KEY` | デプロイ SA の JSON 全文 | ❌ |

**Settings → Secrets and variables → Actions**

`GEMINI_API_KEY` と `GOOGLE_TTS_CREDENTIALS_JSON` は **GitHub には置かない** — Secret Manager のみ（`deploy-staging.yml` が `--set-secrets` で注入）。

ローカル開発用 `.env` も gitignore 済み（`.env.example` のみコミット）。

---

## 3. デプロイ実行

`main` ブランチへ push すると [.github/workflows/deploy-staging.yml](../.github/workflows/deploy-staging.yml) が実行:

1. API イメージ build → Artifact Registry → Cloud Run **`nakanaori-api`**
2. API URL 取得 → Web ビルド（`VITE_API_BASE_URL`）→ Cloud Run **`nakanaori-web`**

手動確認:

```bash
gcloud run services describe nakanaori-api --region asia-northeast1 --format 'value(status.url)'
gcloud run services describe nakanaori-web --region asia-northeast1 --format 'value(status.url)'
curl -s "$(gcloud run services describe nakanaori-api --region asia-northeast1 --format 'value(status.url)')/health"
```

---

## 4. デプロイ後の確認

デプロイ成功後、URL を取得して **ハッカソン事務局へ別途連絡**します（README には掲載しない）。

```bash
gcloud run services describe nakanaori-web --region asia-northeast1 --format 'value(status.url)'
gcloud run services describe nakanaori-api --region asia-northeast1 --format 'value(status.url)'
bash scripts/smoke-staging.sh   # API_URL / WEB_URL を上記で設定
```

[hackathon-submission.md](./hackathon-submission.md) の提出チェックを更新。

---

## 5. 提出前スモーク

1. Web `/child` → はじめる → 名前 → 順番取り合い台本（2–3 回おくる）
2. Web `/teacher` → 進行中セッション → ブリーフ（**GEMINI 必須**で `teacher_hints` 表示）
3. 別セッション → 暴力ワード → 緊急表示

台本: [turn-order-story-dialogue.md](./examples/turn-order-story-dialogue.md) · [violence-escalation-story-dialogue.md](./examples/violence-escalation-story-dialogue.md)

---

## 6. トラブルシューティング

| 症状 | 対処 |
|------|------|
| deploy workflow 失敗 | Actions ログ、`GCP_SA_KEY` / Artifact Registry 権限 |
| GEMINI secret DISABLED | **正常** — workflow は `::warning::` のうえ stub モードでデプロイ（`--remove-secrets`） |
| TTS secret 未設定 / DISABLED | **正常** — workflow は `::warning::` のうえ TTS 503 フォールバックでデプロイ |
| TTS 502 on staging | Secret の JSON 形式・TTS API 有効化・`roles/cloudtts.user` を確認 |
| `Permission denied` on secret | デプロイ SA に `secretmanager.admin`、実行 SA に `secretAccessor` |
| Web が API に繋がらない | Web イメージの `VITE_API_BASE_URL` が API URL か確認（再デプロイ） |
| teacher_hints 空 | Cloud Run の `GEMINI_API_KEY` secret 注入を確認 |
| TTS 405 on staging | Web TTS が nginx に POST していた → `use-robot-tts` が `VITE_API_BASE_URL` を使用するよう修正済 |
| VRM が 2D フォールバック | GLB が Docker に未同梱 → GCS `${PROJECT_ID}-nakanaori-assets/models/` から CI 取得。初回: `npm run setup:vrm-models` → bootstrap 再実行 |
| フォーク PR で deploy 失敗 | 正常 — Secrets は fork に渡らない |

---

## 7. TTS（任意）

Kebbi / Web 音声は Google Cloud TTS 認証が API 側必要。staging では Secret `GOOGLE_TTS_CREDENTIALS_JSON` が **ENABLED** のときのみ TTS 有効；未設定でも **503 + フォールバック** でデモ可能。

`deploy-staging.yml` は GEMINI と同様、Secret が無い／無効なら `::warning::` を出して `--remove-secrets` のうえデプロイ続行。

[google-cloud-tts-setup.md](./google-cloud-tts-setup.md)

---

## 8. Kebbi 実機（staging / local）

| 操作 | コマンド |
|------|----------|
| staging デプロイ（既定） | `bash scripts/kebbi-deploy.sh` |
| local（dev-stack） | `bash scripts/dev-stack.sh` → `kebbi-deploy.sh local` |
| API URL のみ切替 | `kebbi-use-staging.sh` / `kebbi-use-local.sh` |
| 設定画面を adb で開く | `kebbi-open-settings.sh` |

接続先既定: [config/kebbi-targets.env](../config/kebbi-targets.env)（Web URL → API URL 自動導出）

詳細: [kebbi-dev-guide.md](./kebbi-dev-guide.md)

---

## 9. 既存 GCP プロジェクト（AIxR 等）を使う場合

- **OK**: 同一 `PROJECT_ID` に `nakanaori-api` / `nakanaori-web` を追加（請求・Secret 共有）
- **NG**: AIxR-API の Cloud Run URL を Nakanaori の API ベース URL にする
- Artifact Registry は **`nakanaori`** リポジトリを別途作成（AIxR の `mytrainer-repo` 等と混在しない）
