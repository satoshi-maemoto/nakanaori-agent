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
| `docs/` | アーキテクチャ、デモ、DevOps、ハッカソン、**Kebbi 実機**（`kebbi-dev-guide.md`） |

## 作業ユニット（Construction）

1. `unit-agent-core` — `packages/agents/`
2. `unit-api` — `services/api/`
3. `unit-web-ui` — `services/web/src/{avatar,components,theme}/` — VRM + UI ✅
4. `unit-web-teacher` / `unit-web-child` — `services/web/src/teacher`、`child`
5. `unit-devops` — `.github/workflows/`、`scripts/`
6. `unit-kebbi-contract` — `clients/kebbi/api-contract.md` + `packages/tts`
7. `unit-kebbi-client` — sibling repo `nakanaori-kebbi`（Android）

## Kebbi（sibling リポジトリ）

- **Path**: `$NAKANAORI_KEBBI_ROOT`（未設定時は `../nakanaori-kebbi`）
- **Contract**: `clients/kebbi/api-contract.md`
- **開発ガイド**: `docs/kebbi-dev-guide.md`（API URL・設定画面・顔 hide・再接続）
- **TTS**: `packages/tts` + `POST /v1/tts/synthesize` — Chirp 3 HD（Web `Zephyr`/`Rasalgethi`、Kebbi `Callirrhoe`）
- Do **not** use CharaTomo `POST /api/v1/llm/chat`
- Nuwa AAR: `app/libs/`（CharaTomo-Kebbi と同手順）
- 実機: `bash scripts/kebbi-deploy.sh`（`NAKANAORI_KEBBI_ROOT` でパス上書き可）

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
| **Kebbi: Build debug APK** | `../nakanaori-kebbi` を `assembleDebug` |
| **Kebbi: Install to device** | 接続済み実機へ `installDebug` |
| **Kebbi: Build & Deploy** | ビルド・インストール・`MainActivity` 起動 |
| **Kebbi: App status** | 実機でアプリ起動中か確認（`adb`） |
| **Kebbi: Logcat (follow)** | `NakanaoriKebbi` タグの logcat を追跡 |
| **Kebbi: Deploy + Logcat** | デプロイと logcat を同時起動 |
| **Kebbi: Deploy + Nakanaori Dev Stack** | API+Web と Kebbi デプロイを同時起動 |

Kebbi リポジトリは sibling `../nakanaori-kebbi` を参照。別パスなら `NAKANAORI_KEBBI_ROOT` を設定。

`GEMINI_API_KEY` または `GOOGLE_GENAI_API_KEY` を設定すると ADK + Gemini が有効。

```bash
cp .env.example .env   # GEMINI_API_KEY を記入
# TTS を使う場合: docs/google-cloud-tts-setup.md
bash scripts/dev-stack.sh
```

- AI: `@google/adk` + Gemini（`gemini-2.5-flash` デフォルト）
- デモ台本: `docs/examples/eraser-story-dialogue.md`
- 先生 UI コア: `ConfirmationGuidePanel`（`teacher_hints` ヒーロー）— ENH-UI-04 詳細は `aidlc-docs/construction/unit-web-ui/enhancements/teacher-confirmation-guide/requirements.md`

## GCP

- ランタイム: Cloud Run Node.js 22（`asia-northeast1`）
- シークレット: `GEMINI_API_KEY`（Secret Manager）

## 倫理（必須）

`.cursor/rules/nakanaori-product.mdc` を参照。

## ハッカソン

- 期限: 2026-07-10
- チェックリスト: `docs/hackathon-submission.md`
- デモ脚本: `docs/demo-scenario.md`
