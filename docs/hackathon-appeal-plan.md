# ハッカソン訴求力向上計画

**イベント**: [DevOps × AI Agent Hackathon 2026](https://findy.co.jp/4127/)  
**提出期限**: 2026-07-10（金）23:59  
**関連**: [hackathon-submission.md](./hackathon-submission.md) · [demo-scenario.md](./demo-scenario.md)

---

## 現状評価（2026-06-21 時点）

| 軸 | スコア | 状態 |
|----|--------|------|
| AI エージェント中心性 | 8/10 | 多段 ADK・状態機械・Kebbi 実機 — **強い** |
| 課題へのアプローチ | 8/10 | 非裁断・学校ドメイン・デモ台本2本 — **強い** |
| ユーザビリティ | 7/10 | 低学年 UI・先生確認ガイド — デモモード感あり |
| 実用性・体験価値 | 8/10 | 先生負荷低減・ライブデモ向き — **強い** |
| 実装力 | 6.5/10 | ローカル完成、**公開 URL 未了** |
| **DevOps「とどける」** | 5/10 | workflow 準備済、**staging 未デプロイ** — **最大の穴** |

**総合**: コンセプト・エージェント設計は上位入賞圏。**提出物（URL・動画・Proto Pedia）が追いついていない**。

---

## 審査基準 × 訴求メッセージ（提出用コピー）

| 審査基準 | 一言訴求 | 証拠（デモで見せる） |
|----------|----------|----------------------|
| エージェント中心性 | 「単一チャットではなく、聞く→整理→エスカレーションの多段 ADK」 | Listener / FactStructurer / EmotionGuard の役割分担 |
| アプローチ | 「裁かない黒子 — 先生が公正に判断する材料を届ける」 | 事実・気持ち・不明点の分離、`ai_disclaimer` |
| ユーザビリティ | 「低学年向け UI + 先生は確認の進め方がヒーロー表示」 | `/child` 大文字・`/teacher` セッション一覧 |
| 実用性 | 「順番取り合いをロボットが順番に聞き、1分で解決に導ける」 | [turn-order-story-dialogue.md](./examples/turn-order-story-dialogue.md) |
| 実装力 | 「CI → Cloud Run staging — DevOps で回す」 | GitHub Actions、プロンプト禁止語 CI |

**DevOps 3 コンセプト**

| コンセプト | 訴求 | ギャップ |
|------------|------|----------|
| つくる | CI / Vitest / AI-DLC / monorepo | ✅ 文書・実装済 |
| まわす | プロンプトガバナンス、再デプロイ、**構造化ログ・スモーク・Secret 運用** | ✅ 実装済（Logging Runbook: devops.md） |
| とどける | Cloud Run 公開 URL | ✅ |

---

## アクション一覧（優先順）

### P0 — 提出必須（7/10 まで）

| # | タスク | 担当ドキュメント | 状態 |
|---|--------|------------------|------|
| 1 | GCP Secrets 設定 → `main` push → staging デプロイ | [hackathon-staging-deploy.md](./hackathon-staging-deploy.md) · `scripts/bootstrap-staging-gcp.sh` | ✅ |
| 2 | Staging デプロイ + **Deployed URL を事務局へ連絡**（README 非掲載） | [README.md](../README.md) · [hackathon-staging-deploy.md](./hackathon-staging-deploy.md) | ✅ |
| 3 | **Proto Pedia** 登録（文案: [proto-pedia-draft.md](./proto-pedia-draft.md)） | proto-pedia-draft.md | ☐ |
| 4 | **3分デモ動画** 撮影・公開（台本: [demo-video-script.md](./demo-video-script.md)） | demo-video-script.md | ☐ |
| 5 | 提出チェックリスト完了 | [hackathon-submission.md](./hackathon-submission.md) | ☐ |

### P1 — 訴求力ブースト

| # | タスク | 状態 |
|---|--------|------|
| 6 | デモは **GEMINI_API_KEY 必須**（LLM `teacher_hints` まで見せる） | ☐ |
| 7 | 動画 Scene 8: 暴力ワード → 即エスカレーション | [violence-escalation-story-dialogue.md](./examples/violence-escalation-story-dialogue.md) | ☐ |
| 8 | README に CI バッジ（GitHub Actions） | ✅ |
| 9 | `hackathon-submission.md` と台本の用語統一（消しゴム → 順番取り合い） | ✅ |

### P2 — 決勝向け（8/19）

| # | タスク | 状態 |
|---|--------|------|
| 10 | Kebbi + 先生ダッシュボード **ライブデモ** リハーサル | ☐ |
| 11 | Cloud Logging で `escalated` / `state` の運用デモ（まわす） | ✅ logger.ts + devops Runbook |
| 12 | US-03 確認ループ（P1）— ストーリー補強 | ☐ |

---

## 3分デモ動画構成（要約）

詳細: [demo-video-script.md](./demo-video-script.md)

| 時間 | 内容 |
|------|------|
| 0:00–0:20 | 課題 + 「主役は人。ロボットは黒子。」 |
| 0:20–1:40 | **順番取り合い** — 子ども Web → 先生ダッシュボード（LLM 整理） |
| 1:40–2:10 | **緊急** — 「殴った」→ 仲介停止・先生 UI 急ぎ |
| 2:10–2:40 | **DevOps** — PR → CI → main → Cloud Run（画面録画） |
| 2:40–3:00 | Kebbi 実機（任意）+ 締め |

---

## ローカル vs 提出デモ

| 用途 | 推奨 |
|------|------|
| 審査員・Proto Pedia | **Cloud Run staging URL**（事務局提出用；Web は `VITE_API_BASE_URL` 注入済） |
| 決勝ライブ | Kebbi + staging API（`kebbi-deploy.sh` 既定）または LAN `dev-stack` |
| 開発 | `bash scripts/dev-stack.sh` + `kebbi-deploy.sh local` |

---

## 関連ファイル

| パス | 用途 |
|------|------|
| [hackathon-submission.md](./hackathon-submission.md) | 提出チェックリスト |
| [hackathon-staging-deploy.md](./hackathon-staging-deploy.md) | 初回 staging 手順 |
| [demo-video-script.md](./demo-video-script.md) | 動画台本 |
| [proto-pedia-draft.md](./proto-pedia-draft.md) | Proto Pedia 文案 |
| [demo-scenario.md](./demo-scenario.md) | ライブピッチ Scene 1–8 |
| [devops.md](./devops.md) | CI/CD パイプライン |
| [kebbi-dev-guide.md](./kebbi-dev-guide.md) | Kebbi 実機 · 設定 UI · local/staging |
| [config/kebbi-targets.env](../config/kebbi-targets.env) | Kebbi 接続先既定 |
| [aidlc-docs/operations/hackathon-submission-plan.md](../aidlc-docs/operations/hackathon-submission-plan.md) | AI-DLC 実行計画 |

---

## 進捗ログ

| 日付 | 内容 |
|------|------|
| 2026-06-21 | 訴求力評価・本計画作成。P0 ドキュメント整備完了（README CI バッジ含む） |
| 2026-06-26 | TTS 任意 Secret · README URL 非掲載 · Kebbi local/staging 切替 · 設定 UI 改善 — ドキュメント反映 |
