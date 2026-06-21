# AI-DLC 状態トラッキング

## プロジェクト情報

- **プロジェクト名**: Nakanaori Agent（ナカナオリ・エージェント）
- **プロジェクト種別**: Greenfield
- **開始日**: 2026-06-21
- **現在ステージ**: CONSTRUCTION — unit-web-ui ENH-UI-04 完了

## 作業ユニット

1. `unit-agent-core` — `@nakanaori/agents` TypeScript + ADK（P0）✅
2. `unit-api` — Hono + Node.js（P0）✅
3. `unit-devops` — CI/CD + 監視（P0）✅
4. `unit-web-ui` — Tailwind + VRM + 子ども/先生 UI + ENH-UI-01〜04（P0）✅
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
- [x] unit-web-ui — ENH-UI-03 チャット UX + ローカル Gemini
- [x] unit-web-ui — ENH-UI-04 子どもナビ + 先生確認ガイド + LLM 整理
- [x] unit-api — ENH-UI-02 / ENH-UI-03 / ENH-UI-04 API 拡張
- [ ] unit-kebbi-contract — sibling repo 実装

### OPERATIONS フェーズ

- [ ] Cloud Run staging 初回デプロイ

## 現在の状態

- **次ステージ**: Kebbi 実装 / GCP デプロイ / 未コミット分のコミット
- **技術スタック**: TypeScript, Tailwind v4, three + @pixiv/three-vrm, Hono, ADK, Gemini 2.5 Flash
- **ローカル**: `.env.example` + `scripts/dev-stack.sh`（API 起動後 Web）
- **デモ台本**: `docs/examples/eraser-story-dialogue.md`

## 確定した決定事項

- Web CSS: Tailwind + shadcn 互換コンポーネント
- VRM: CharaTomo 同系 GLB、自然ポーズ + idle + 瞬き + head ボーンカメラ（ENH-UI-01/03）
- 子ども UI: 大アバター、低学年文言、`child-copy.ts`、**おくる** / **つぎの ばん**、A/B バルーン色、チャット内スクロール（ENH-UI-03/04）
- 子どもナビ: ナカナオリ自己紹介、名前収集、名前呼び（ENH-UI-04）
- 先生 UI: **確認の進め方**をヒーロー表示、LLM `teacher_hints`、会話履歴・食い違い整理（ENH-UI-04）
- 先生デモ: 進行中セッション一覧 + LLM insights（ENH-UI-02/04）
- LLM: `gemini-2.5-flash` デフォルト；FactStructurer が disagreements / teacher_hints を生成（ENH-UI-03/04）
- レイアウト: md+ 左アバター + 右チャット
