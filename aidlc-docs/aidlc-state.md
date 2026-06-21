# AI-DLC 状態トラッキング

## プロジェクト情報

- **プロジェクト名**: Nakanaori Agent（ナカナオリ・エージェント）
- **プロジェクト種別**: Greenfield（新規）
- **開始日**: 2026-06-21
- **現在ステージ**: INCEPTION — 完了、CONSTRUCTION 待ち

## 実行計画サマリー

- **総ステージ数**: 14（計画）
- **実行するステージ**: Requirements, User Stories, Workflow Planning, Application Design, Units Generation, NFR Requirements, NFR Design, Infrastructure Design, Code Generation, Build and Test, Operations
- **スキップするステージ**: Reverse Engineering（greenfield）

## 作業ユニット

1. `unit-agent-core` — ADK マルチエージェント + プロンプト（P0）
2. `unit-api` — Cloud Run API（P0）
3. `unit-devops` — CI/CD + 監視（P0）
4. `unit-web-teacher` — 先生ダッシュボード（P0 デモ）
5. `unit-web-child` — 子ども Web アバター（P0 デモ）
6. `unit-kebbi-contract` — API 契約 + sibling repo（P0 デモ）

## ステージ進捗

### INCEPTION フェーズ

- [x] Workspace Detection（完了 — greenfield monorepo）
- [x] Reverse Engineering（スキップ — greenfield）
- [x] Requirements Analysis（完了 — 検証質問回答済み）
- [x] User Stories（承認済み）
- [x] Workflow Planning（完了）
- [x] Application Design（承認済み）
- [x] Units Generation（完了）

### CONSTRUCTION フェーズ

- [ ] Functional Design — 実行待ち
- [ ] NFR Requirements — 実行待ち
- [ ] NFR Design — 実行待ち
- [ ] Infrastructure Design — 実行待ち
- [ ] Code Generation — 実行待ち
- [ ] Build and Test — 実行待ち

### OPERATIONS フェーズ

- [ ] Operations — 実行待ち（Cloud Run デプロイ）

## 現在の状態

- **ライフサイクルフェーズ**: INCEPTION 完了 → 次は CONSTRUCTION
- **現在ステージ**: Units Generation（完了）
- **次ステージ**: Functional Design（ユニット単位）または NFR Requirements
- **ステータス**: Construction フェーズ開始の承認待ち
- **デモ優先度**: Web（先生 + 子ども）と Kebbi — 同一優先度

## 確定した決定事項（スナップショット）

- デプロイ: Cloud Run API + 別 Cloud Run web（`asia-northeast1`）
- セッションストア: in-memory MVP
- Gemini: 全エージェント `gemini-2.0-flash`
- Web: 単一 Vite アプリ（`/teacher`, `/child`）
- 認証: デモモード（セッション ID）
- エスカレーション: ダッシュボードフラグのみ
