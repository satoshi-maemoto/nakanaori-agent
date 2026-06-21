# DevOps — つくる・まわす・とどける

ハッカソン概念および AI-DLC Operations フェーズに沿った構成。

## パイプライン

```mermaid
flowchart LR
    PR[PR_or_push] --> CI[ci.yml]
    CI --> Lint[TypeScript_build]
    CI --> PromptCheck[check-prompts.sh]
    CI --> Test[vitest]
    merge[merge_to_main] --> Deploy[deploy-staging.yml]
    Deploy --> Build[Docker_build]
    Build --> CloudRun[Cloud_Run_staging]
```

## CI（`/.github/workflows/ci.yml`）

push と PR のたびに:

1. Node lint + build — `@nakanaori/agents`、`nakanaori-api`
2. プロンプト禁止語チェック — `scripts/check-prompts.sh`
3. ユニットテスト — Vitest（agents）
4. TypeScript チェック — `services/web/`

## デプロイ（`/.github/workflows/deploy-staging.yml`）

`main` への push 時:

1. API Docker イメージをビルド → Artifact Registry
2. Cloud Run（staging）に `nakanaori-api` をデプロイ
3. デプロイ済み API URL を取得
4. Web Docker イメージを `VITE_API_BASE_URL` 付きでビルド → `nakanaori-web` をデプロイ

API は CORS を有効化済み（Web 別オリジンから `/v1/*` を呼び出し可能）。

### 必要な GitHub Secrets

| Secret | 目的 |
|--------|------|
| `GCP_PROJECT_ID` | GCP プロジェクト |
| `GCP_SA_KEY` | デプロイ用サービスアカウント JSON |
| `GEMINI_API_KEY` | Secret Manager または env 経由で Cloud Run に注入 |

## プロンプトガバナンス

- プロンプト: `packages/agents/src/prompts/`
- CI が裁きラベルをブロック（悪い子、guilty、verdict 等）
- プロンプト変更は PR レビュー必須

## 監視（Operations）

- Cloud Logging: エージェント遷移の構造化 JSON ログ
- ログフィールド: `session_id`、`agent_name`、`state`、`escalated`
- 将来: エラー率に対する Cloud Monitoring アラート

## ローカル開発

```bash
npm install
npm run dev --workspace=nakanaori-api
```

## 環境

`infrastructure/cloud-run/env.example` を `.env` にコピー（コミット禁止）。
