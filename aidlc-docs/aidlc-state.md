# AI-DLC 状態トラッキング

## プロジェクト情報

- **プロジェクト名**: Nakanaori Agent（ナカナオリ・エージェント）
- **プロジェクト種別**: Greenfield
- **開始日**: 2026-06-21
- **現在ステージ**: CONSTRUCTION — unit-web-ui ENH-UI-02 完了

## 作業ユニット

1. `unit-agent-core` — `@nakanaori/agents` TypeScript + ADK（P0）✅
2. `unit-api` — Hono + Node.js（P0）✅
3. `unit-devops` — CI/CD + 監視（P0）✅
4. `unit-web-ui` — Tailwind + VRM 男女選択 + UI リデザイン + VRM 品質 ENH-UI-01（P0）✅
5. `unit-web-teacher` — 先生ダッシュボード — unit-web-ui に統合実装 ✅
6. `unit-web-child` — 子ども Web + VRM — unit-web-ui に統合実装 ✅
7. `unit-kebbi-contract` — API 契約 + sibling repo（P0 デモ）

## ステージ進捗

### CONSTRUCTION フェーズ

- [x] unit-agent-core — Code Generation
- [x] unit-api — Code Generation
- [x] unit-web-ui — Functional Design + NFR + Code Generation
- [x] unit-web-ui — ENH-UI-01 VRM 品質・表示修正
- [x] unit-web-ui — ENH-UI-02 子ども UX + 先生デモセッション一覧
- [x] unit-api — ENH-UI-02 セッション一覧 API
- [ ] unit-kebbi-contract — sibling repo 実装

### OPERATIONS フェーズ

- [ ] Cloud Run staging 初回デプロイ

## 現在の状態

- **次ステージ**: Kebbi 実装 / GLB モデル配置 / GCP デプロイ
- **技術スタック**: TypeScript, Tailwind v4, three + @pixiv/three-vrm, Hono, ADK

## 確定した決定事項

- Web CSS: Tailwind + shadcn 互換コンポーネント
- VRM: CharaTomo 同系 GLB、男性/女性 UI 選択、SVG フォールバック、自然ポーズ + idle + 瞬き（ENH-UI-01）
- レイアウト: md+ 左アバター + 右チャット；子ども画面は大アバター + 低学年向け文言（ENH-UI-02）
- 先生デモ: 進行中セッション一覧 API + UI（ENH-UI-02）
