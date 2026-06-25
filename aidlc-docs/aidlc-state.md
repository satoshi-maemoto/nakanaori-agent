# AI-DLC 状態トラッキング

## プロジェクト情報

- **プロジェクト名**: Nakanaori Agent（ナカナオリ・エージェント）
- **プロジェクト種別**: Greenfield
- **開始日**: 2026-06-21
- **現在ステージ**: OPERATIONS — ハッカソン提出（訴求力向上）+ GCP staging デプロイ

## 作業ユニット

1. `unit-agent-core` — `@nakanaori/agents` TypeScript + ADK（P0）✅
2. `unit-api` — Hono + Node.js（P0）✅
3. `unit-devops` — CI/CD + 監視（P0）✅
4. `unit-web-ui` — Tailwind + VRM + 子ども/先生 UI + ENH-UI-01〜05（P0）✅
5. `unit-web-teacher` — 先生ダッシュボード — unit-web-ui に統合実装 ✅
6. `unit-web-child` — 子ども Web + VRM — unit-web-ui に統合実装 ✅
7. `unit-kebbi-contract` — API 契約 + TTS + sibling repo（P0 デモ）✅
8. `unit-tts-service` — `packages/tts` + `/v1/tts/synthesize` ✅
9. `unit-kebbi-client` — `nakanaori-kebbi` Android ✅

## ステージ進捗

### CONSTRUCTION フェーズ

- [x] unit-agent-core — Code Generation
- [x] unit-api — Code Generation
- [x] unit-web-ui — Functional Design + NFR + Code Generation
- [x] unit-web-ui — ENH-UI-01 VRM 品質・表示修正
- [x] unit-web-ui — ENH-UI-02 子ども UX + 先生デモセッション一覧
- [x] unit-web-ui — ENH-UI-03 チャット UX + ローカル Gemini
- [x] unit-web-ui — ENH-UI-04 子どもナビ + 先生確認ガイド + LLM 整理
- [x] unit-web-ui — ENH-UI-05 子ども番終了確認 + VRM resetLayout
- [x] unit-api — ENH-UI-02 / ENH-UI-03 / ENH-UI-04 API 拡張
- [x] unit-kebbi-contract — TTS API + 契約更新
- [x] unit-tts-service — packages/tts + Google Cloud TTS + ENH-TTS-01 Chirp 3 HD
- [x] unit-kebbi-client — nakanaori-kebbi Android
- [x] unit-kebbi-client — ENH-KEBBI-02 クライアントチャネル + 子B ハンドオフ UX

### OPERATIONS フェーズ

- [ ] Cloud Run staging 初回デプロイ
- [x] ハッカソン訴求力向上 — ドキュメント整備（appeal-plan / staging-deploy / video-script / proto-pedia）
- [ ] ハッカソン P0 — Deployed URL + Proto Pedia + 3分動画

## 現在の状態

- **次ステージ**: `bootstrap-staging-gcp.sh` → GitHub Secrets → main push → README URL 更新
- **staging 方針**: AIxR-API とは **別 Cloud Run**（`nakanaori-api` / `nakanaori-web`）
- **ハッカソン計画**: `aidlc-docs/operations/hackathon-submission-plan.md` · `docs/hackathon-appeal-plan.md`
- **Kebbi repo**: `$NAKANAORI_KEBBI_ROOT`（未設定時 `../nakanaori-kebbi`）
- **技術スタック**: TypeScript, Tailwind v4, three + @pixiv/three-vrm, Hono, ADK, Gemini 2.5 Flash
- **ローカル**: `.env.example` + `scripts/dev-stack.sh`（API 起動後 Web）
- **デモ台本**: `docs/examples/turn-order-story-dialogue.md`（順番取り合い）
- **子どもフロー**: `docs/examples/child-conversation-flow.md`（Web / Kebbi 比較表あり）

## 確定した決定事項

- Web CSS: Tailwind + shadcn 互換コンポーネント
- VRM: CharaTomo 同系 GLB、自然ポーズ + idle + 瞬き + head ボーンカメラ + **resetLayout**（ENH-UI-01/05）
- 子ども UI: 大アバター、低学年文言、`child-copy.ts`、**おくる** / **番を おわる**（確認あり）、1回め/2回め表示、A/B バルーン色、チャット内スクロール（ENH-UI-03/05）
- 子どもナビ: ナカナオリ自己紹介、名前収集、番終了・先生相談メッセージ（ENH-UI-04/05）
- **クライアントチャネル**: `POST /v1/sessions` の `client`（`web` | `kebbi`）→ `SessionState.client_channel` → `finishTurnHint()` で案内分岐（ENH-KEBBI-02）
- 先生 UI: **確認の進め方**をヒーロー表示、LLM `teacher_hints`、会話履歴・食い違い整理（ENH-UI-04）
- 先生デモ: 進行中セッション一覧 + LLM insights（ENH-UI-02/04）
- LLM: `gemini-2.5-flash` デフォルト；FactStructurer が disagreements / teacher_hints を生成（ENH-UI-03/04）
- **Kebbi UX**: `client: kebbi`、頭なで番交代、手のふれあい聞き取りポーズ（ENH-KEBBI-02/03）
- TTS: Google Cloud Chirp 3 HD — Web `Zephyr`/`Rasalgethi`（`avatarGender`）、Kebbi `Callirrhoe`（`kebbi_child`）；pitch 非対応（ENH-TTS-01）
- Kebbi: Nuwa ASR + ExoPlayer TTS；頭なで `finish_turn`；ハンドオフ prefetch；sibling repo `nakanaori-kebbi`
