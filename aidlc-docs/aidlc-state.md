# AI-DLC 状態トラッキング

## プロジェクト情報

- **プロジェクト名**: Nakanaori Agent（ナカナオリ・エージェント）
- **プロジェクト種別**: Greenfield
- **開始日**: 2026-06-21
- **現在ステージ**: CONSTRUCTION — Build and Test 手順書完了

## 作業ユニット

1. `unit-agent-core` — `@nakanaori/agents` TypeScript + ADK（P0）✅
2. `unit-api` — Hono + Node.js（P0）✅
3. `unit-devops` — CI/CD + 監視（P0）— staging web deploy 追加済
4. `unit-web-teacher` — 先生ダッシュボード（P0 デモ）
5. `unit-web-child` — 子ども Web アバター（P0 デモ）
6. `unit-kebbi-contract` — API 契約 + sibling repo（P0 デモ）

## ステージ進捗

### INCEPTION フェーズ

- [x] 全ステージ完了

### CONSTRUCTION フェーズ

- [x] Functional Design — unit-agent-core 承認済み
- [x] NFR Requirements — unit-agent-core 承認済み（TypeScript）
- [ ] NFR Design — スキップ（MVP）
- [x] Infrastructure Design — unit-devops（deploy-staging web + CORS）
- [x] Code Generation — unit-agent-core + unit-api（TypeScript 移行）
- [x] Build and Test — 手順書 + ローカル/CI 検証

### OPERATIONS フェーズ

- [ ] Operations — Cloud Run staging 初回デプロイ（GCP secrets 待ち）

## 現在の状態

- **ライフサイクルフェーズ**: CONSTRUCTION 後半
- **現在ステージ**: Build and Test 完了
- **次ステージ**: unit-web-* UI、Kebbi 実装、GCP staging デプロイ
- **技術スタック**: TypeScript monorepo（npm workspaces）、`@google/adk`

## 確定した決定事項（スナップショット）

- 言語: **TypeScript**（agents + api + web）
- ADK: `@google/adk` + `gemini-2.0-flash`
- デプロイ: Cloud Run API + 別 Cloud Run web（`asia-northeast1`）
- セッションストア: in-memory MVP
- 認証: デモモード（セッション ID）
