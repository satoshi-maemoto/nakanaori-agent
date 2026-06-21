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
3. `unit-web-teacher` / `unit-web-child` — `services/web/src/teacher`、`child`
4. `unit-devops` — `.github/workflows/`、`scripts/`
5. `unit-kebbi-contract` — `clients/kebbi/api-contract.md`

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

# プロンプトチェック
bash scripts/check-prompts.sh
```

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
