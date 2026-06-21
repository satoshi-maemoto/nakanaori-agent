# Nakanaori Agent — エージェントガイド

**ナカナオリ・エージェント**（学校ケンカ仲介）向け AI-DLC + GCP monorepo。

## 哲学

- 「ロボットは裁かない。ただ、話を整理して先生につなぐ。」
- 「主役は人。ロボットは黒子。」

## ドキュメント言語

- プロジェクトの Markdown（`aidlc-docs/`、`docs/`、`README.md` 等）は**基本的に日本語**で記載
- 識別子、コード、パス、API ルート、JSON フィールド名は英語のまま

## AI-DLC ワークフロー

Cursor で開始:

```text
Using AI-DLC, ナカナオリ・エージェントの Construction を進めてください。
unit-agent-core から Functional Design を開始してください。
```

成果物: `aidlc-docs/`。ルール: `.cursor/rules/ai-dlc-workflow.mdc`、`.aidlc-rule-details/`。

AI-DLC ルール更新: `bash scripts/setup-aidlc.sh`

## リポジトリマップ

| パス | 目的 |
|------|------|
| `agents/nakanaori/` | ADK エージェントスタブ、プロンプト、スキーマ |
| `services/api/` | Cloud Run 上の FastAPI |
| `services/web/` | React 先生 + 子ども UI |
| `clients/kebbi/` | API 契約（実装は外部） |
| `aidlc-docs/` | Inception / Construction 成果物 |
| `docs/` | アーキテクチャ、デモ、DevOps、ハッカソン |
| `.cursor/rules/` | Cursor ルール（プロダクト + ハッカソン） |

## 作業ユニット（Construction）

1. `unit-agent-core` — `agents/nakanaori/`
2. `unit-api` — `services/api/`
3. `unit-web-teacher` / `unit-web-child` — `services/web/src/teacher`、`child`
4. `unit-devops` — `.github/workflows/`、`scripts/`
5. `unit-kebbi-contract` — `clients/kebbi/api-contract.md`

## Kebbi（Sibling リポジトリ）

- **パス**: `/Users/maemoto/Documents/GitHub/AIxR-CharaTomo-Kebbi`
- **契約**: `clients/kebbi/api-contract.md`
- CharaTomo `POST /api/v1/llm/chat` は**使用しない**
- API 変更時: この repo の契約を更新 + Kebbi repo で `NakanaoriApi.kt` を実装

## ローカル開発

```bash
# エージェントテスト
cd agents && pip install -e ".[dev]" && pytest -q

# API
cd agents && pip install -e .
cd ../services/api && pip install -e . && uvicorn nakanaori_api.main:app --reload --port 8080

# Web
cd services/web && npm install && npm run dev

# プロンプトチェック
bash scripts/check-prompts.sh
```

## GCP

- ランタイム: Cloud Run（デフォルト `asia-northeast1`）
- AI: Gemini API + ADK（エージェントスタブに接続）
- シークレット: staging では Secret Manager 経由の `GEMINI_API_KEY`

## 倫理（必須）

`.cursor/rules/nakanaori-product.mdc` および `.aidlc-rule-details/extensions/child-safety/nakanaori/` を参照。

- 出力に裁きラベルを含めない
- 暴力・いじめ・自傷は即時エスカレーション
- 先生ブリーフには常に AI 免責事項

## ハッカソン

- イベント: DevOps × AI Agent Hackathon 2026
- 期限: 2026-07-10
- チェックリスト: `docs/hackathon-submission.md`
- デモ脚本: `docs/demo-scenario.md`
