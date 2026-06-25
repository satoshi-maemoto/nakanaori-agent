# ハッカソン提出 — Operations 実行計画

**フェーズ**: OPERATIONS（ハッカソン提出）  
**状態**: 進行中（2026-06-21〜）  
**正本ドキュメント**: [docs/hackathon-appeal-plan.md](../../docs/hackathon-appeal-plan.md)

---

## 目的

DevOps × AI Agent Hackathon 2026 の審査基準に対し、**提出物（URL・動画・Proto Pedia）** と **訴求メッセージ** を揃える。

---

## P0 タスク（7/10 期限）

| ID | タスク | 成果物 | 状態 |
|----|--------|--------|------|
| HCK-01 | GCP bootstrap + staging 初回デプロイ（別 Cloud Run） | hackathon-staging-deploy.md · bootstrap-staging-gcp.sh | ☐ |
| HCK-02 | README デモ URL 更新 | README.md | ☐ |
| HCK-03 | Proto Pedia 登録 | proto-pedia-draft.md ベース | ☐ |
| HCK-04 | 3分デモ動画 | demo-video-script.md | ☐ |
| HCK-05 | 提出チェックリスト完了 | hackathon-submission.md | ☐ |

---

## P1 タスク（訴求ブースト）

| ID | タスク | 状態 |
|----|--------|------|
| HCK-06 | デモ時 GEMINI 必須（LLM teacher_hints） | ☐ |
| HCK-07 | README CI バッジ | ✅ |
| HCK-08 | Cloud Logging 運用デモ（決勝向け） | ☐ |

---

## 審査基準トレーサビリティ

| 審査基準 | AI-DLC / 実装 | デモ |
|----------|---------------|------|
| エージェント中心性 | unit-agent-core, ADK runner | 多段 workflow + Scene B 停止 |
| アプローチ | requirements.md, NAKANAORI 倫理 | 黒子哲学 + 学校ドメイン |
| ユーザビリティ | ENH-UI-03/04/05 | /child /teacher |
| 実用性 | turn-order 解決ストーリー | Scene A |
| 実装力 | unit-devops, deploy-staging.yml | Scene C DevOps |

---

## 参照

- [hackathon-staging-deploy.md](../../docs/hackathon-staging-deploy.md)
- [demo-video-script.md](../../docs/demo-video-script.md)
- [proto-pedia-draft.md](../../docs/proto-pedia-draft.md)
- [hackathon-submission.md](../../docs/hackathon-submission.md)
- [aidlc-state.md](../aidlc-state.md)

---

## 進捗

| 日付 | 内容 |
|------|------|
| 2026-06-21 | 訴求力評価に基づき本計画 + docs 整備開始 |
