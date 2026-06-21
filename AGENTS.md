# Nakanaori Agent — エージェントガイド

**ナカナオリ・エージェント**（学校ケンカ仲介）向け AI-DLC + GCP monorepo。

## 哲学

- 「ロボットは裁かない。ただ、話を整理して先生につなぐ。」
- 「主役は人。ロボットは黒子。」

## ドキュメント言語

- プロジェクトの Markdown（`aidlc-docs/`、`docs/`、`README.md` 等）は**基本的に日本語**で記載
- 識別子、コード、パス、API ルート、JSON フィールド名は英語のまま

## リポジトリマップ

| パス | 目的 |
|------|------|
| `packages/agents/` | `@nakanaori/agents` — ADK + Gemini エージェント |
| `services/api/` | Hono REST API（Cloud Run） |
| `services/web/` | React 先生 + 子ども UI |
| `clients/kebbi/` | API 契約（実装は外部） |
| `aidlc-docs/` | Inception / Construction 成果物 |
| `docs/` | アーキテクチャ、デモ、DevOps、ハッカソン |

## 作業ユニット（Construction）

1. `unit-agent-core` — `packages/agents/`
2. `unit-api` — `services/api/`
3. `unit-web-ui` — `services/web/src/{avatar,components,theme}/` — VRM + UI ✅
4. `unit-web-teacher` / `unit-web-child` — `services/web/src/teacher`、`child`
5. `unit-devops` — `.github/workflows/`、`scripts/`
6. `unit-kebbi-contract` — `clients/kebbi/api-contract.md`

VRM 参照: `/Users/maemoto/Documents/GitHub/AIxR-CharaTomo-Web`（`vrm-viewer.js`）

## ローカル開発

```bash
# 依存関係（ルート）
npm install

# エージェントテスト
npm run test --workspace=@nakanaori/agents

# API（ポート 8080）
npm run dev --workspace=nakanaori-api

# Web
cd services/web && npm install && npm run dev

# VRM モデル（初回のみ — CharaTomo-Web からコピー）
npm run setup:vrm-models

# プロンプトチェック
bash scripts/check-prompts.sh
```

## VS Code デバッグ

`.vscode/launch.json` から起動:

| 構成 | 用途 |
|------|------|
| **Nakanaori: Local Dev (API + Web terminals)** | API + Web を別ターミナルで起動 |
| **Nakanaori: Dev Stack (API + Web)** | 1 ターミナルで両方起動 |
| **Nakanaori: Open Browser (Child)** | サーバー起動 → 子ども UI を Chrome で開く |
| **Nakanaori: Browser E2E (Playwright)** | サーバー起動 → `verify-browser.mjs` |

`GEMINI_API_KEY` または `GOOGLE_GENAI_API_KEY` を設定すると ADK + Gemini が有効。

## GCP

- ランタイム: Cloud Run Node.js 22（`asia-northeast1`）
- AI: `@google/adk` + Gemini（`gemini-2.0-flash`）
- シークレット: `GEMINI_API_KEY`（Secret Manager）

## 倫理（必須）

`.cursor/rules/nakanaori-product.mdc` を参照。

## ハッカソン

- 期限: 2026-07-10
- チェックリスト: `docs/hackathon-submission.md`
- デモ脚本: `docs/demo-scenario.md`
