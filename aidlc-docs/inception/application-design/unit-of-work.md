# 作業ユニット

## 概要

Nakanaori Agent は **greenfield monorepo** で、sibling repo クライアント（Kebbi）が1つあります。ユニットはバックエンド/インフラを技術レイヤーで、デモ成果物をクライアント面で分解します。Web と Kebbi は**同一デモ優先度**です。

## ユニット定義

| Unit ID | 名称 | リポジトリパス | デプロイ | 責務 |
|---------|------|----------------|----------|------|
| `unit-agent-core` | Agent Core | `packages/agents/` | ライブラリ（npm） | ADK マルチエージェント、プロンプト、スキーマ、倫理ガード |
| `unit-api` | API Service | `services/api/` | Cloud Run `nakanaori-api` | REST API、in-memory セッションストア、ワークフロー呼び出し |
| `unit-devops` | DevOps | `.github/workflows/`, `scripts/`, `infrastructure/` | CI/CD パイプライン | lint、テスト、プロンプトチェック、staging デプロイ（API + web） |
| `unit-web-ui` | Web UI / UX | `services/web/src/{components,avatar,theme}/` | Cloud Run `nakanaori-web`（共有） | デザインシステム、VRM 黒子アバター、UI ブラッシュアップ（CharaTomo-Web 同系） |
| `unit-web-teacher` | Teacher Web | `services/web/src/teacher/` | Cloud Run `nakanaori-web`（共有） | セッション一覧、ブリーフ表示、エスカレーションフラグ（UI は unit-web-ui） |
| `unit-web-child` | Child Web | `services/web/src/child/` | Cloud Run `nakanaori-web`（共有） | 子ども会話 UI + VRM アバター（UI は unit-web-ui） |
| `unit-kebbi-contract` | Kebbi Contract | `clients/kebbi/` + sibling repo | sibling repo APK | HTTP 契約、`AIxR-CharaTomo-Kebbi` の `NakanaoriApi.kt` |

## ユニット詳細

### unit-agent-core

- **スコープ**: SessionOrchestrator、Listener、EmotionGuard、FactStructurer、Confirmation、TeacherBrief
- **技術**: TypeScript + `@google/adk` + Gemini（`gemini-2.0-flash`）
- **出力**: 構造化 facts/feelings/unknowns、`ai_disclaimer` 付き先生ブリーフ
- **テスト**: `packages/agents/src/*.test.ts`（Vitest）

### unit-api

- **スコープ**: Hono ルート（`/v1/sessions`、child-turn、teacher-brief）、SessionStore（in-memory MVP）
- **依存**: unit-agent-core
- **リージョン**: `asia-northeast1`
- **認証**: デモモード — セッション ID のみ（MVP 認証なし）

### unit-web-ui

- **スコープ**: デザインシステム、VRM 黒子アバター（Three.js + `@pixiv/three-vrm`）、子ども/先生 UI ブラッシュアップ
- **参照**: AIxR-CharaTomo-Web — `vrm-viewer.js` / `character-manager.js` パターンを React 向け移植
- **依存**: unit-api（REST）
- **フォールバック**: WebGL 非対応 → 2D 静止画
- **成果物パス**: `services/web/src/components/`, `src/avatar/`, `src/theme/`, `public/models/*.vrm`

### unit-devops

- **スコープ**: `ci.yml`、`deploy-staging.yml`（web 対応拡張）、`check-prompts.sh`、Cloud Run マニフェスト
- **シークレット**: `GCP_PROJECT_ID`、`GCP_SA_KEY`、GCP Secret Manager `GEMINI_API_KEY`
- **デプロイ先**: API と web の別 Cloud Run サービス

### unit-web-teacher

- **スコープ**: TeacherView — セッション一覧、ブリーフ表示、エスカレーションセッション強調
- **依存**: unit-api（REST）、unit-web-ui（デザインシステム・BriefCard 等）
- **デモ**: 先生がダッシュボードをポーリングしてエスカレーション確認（MVP WebSocket なし）

### unit-web-child

- **スコープ**: ChildView — 会話 UI + VRM 黒子アバター
- **依存**: unit-api（REST）、unit-web-ui（AvatarCanvas、ChatBubble 等）
- **言語**: 日本語のみ
- **パッケージング**: `/teacher` と `/child` ルートの単一 Vite アプリ（先生と共有ビルド）

### unit-kebbi-contract

- **スコープ**: `clients/kebbi/api-contract.md`；Kebbi クライアント向け API 安定性
- **実装**: sibling repo `AIxR-CharaTomo-Kebbi` — `NakanaoriApi.kt`、TTS/ASR（Phase 2）
- **制約**: CharaTomo `POST /api/v1/llm/chat` は**使用しない**
- **デモ優先度**: Web と同等 — ハッカソン提出に両方必須

## コード構成（Greenfield Monorepo）

```text
nakanaori-agent/
├── packages/agents/           # unit-agent-core
├── services/api/              # unit-api
├── services/web/              # unit-web-ui + unit-web-teacher + unit-web-child
│   ├── src/avatar/            # VRM（CharaTomo-Web 同系）
│   ├── src/components/        # 共通 UI
│   ├── src/theme/             # デザイントークン
│   ├── src/teacher/           # 先生画面
│   ├── src/child/             # 子ども画面
│   └── public/models/         # .vrm モデル
├── clients/kebbi/             # unit-kebbi-contract（契約のみ）
├── .github/workflows/         # unit-devops
├── scripts/                   # unit-devops
└── infrastructure/            # unit-devops
```

参照リポジトリ（VRM パターン）: `/Users/maemoto/Documents/GitHub/AIxR-CharaTomo-Web`

## Construction ビルド順

1. `unit-devops` — CI + デプロイパイプライン（API + web）
2. `unit-agent-core` — ADK + Gemini ✅
3. `unit-api` — ワークフローを REST に接続 ✅
4. **`unit-web-ui`** — デザインシステム + VRM 基盤（Construction 次着手）
5. **並行**: `unit-web-teacher` + `unit-web-child`（unit-web-ui 上に機能実装）+ `unit-kebbi-contract`

Kebbi Android コードはこの repo **外** — `/Users/maemoto/Documents/GitHub/AIxR-CharaTomo-Kebbi`

## デモ成功基準（ユニット別）

| ユニット | デモ可能になる条件 |
|----------|-------------------|
| unit-agent-core | 仲介ループ全体が構造化ブリーフを返す；エスカレーションが動作 |
| unit-api | staging URL が `/v1/sessions/*` を提供 |
| unit-devops | PR で CI が green；main で staging 自動デプロイ |
| unit-web-ui | VRM アバター表示；デモ品質 UI；消しゴムシナリオ UI 完走 |
| unit-web-teacher | 先生が staging web URL でブリーフ + エスカレーションフラグを確認 |
| unit-web-child | 子どもが VRM 付き web UI でヒアリングターンを完了 |
| unit-kebbi-contract | Kebbi が staging API を呼び出し；ロボットが応答を発話（テキストまたは TTS） |

## この分解の範囲外

- Firestore セッション永続化（MVP 後）
- Firebase Auth
- STT/TTS（FR-10、Phase 2）
- マルチスクールテナンシー
