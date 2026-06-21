# Code Generation 計画 — ENH-UI-03 チャット + Gemini ローカル

## チェックリスト

- [x] `enhancements/chat-gemini-local/requirements.md`
- [x] Gemini モデル `gemini-2.5-flash` + ADK エラー処理
- [x] `.env.example` / `load-env.ts` / dev-stack `.env`
- [x] `finish_turn` API + MediationWorkflow
- [x] ChildView IME ガード + 「つぎの ばん」
- [x] active_child バリデーション + エラー detail 表示
- [x] vrm-integration カメラ追記
- [x] api-contract / screen-inventory / tech-stack 更新
- [x] verify-browser / workflow.test 更新
- [x] aidlc-state / audit 更新

## 承認

Enhancement — ローカル検証フィードバックに基づき実装（2026-06-21）。
