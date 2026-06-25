# 3分デモ動画台本

**用途**: DevOps × AI Agent Hackathon 2026 提出  
**前提**: staging URL または LAN `dev-stack` + **GEMINI_API_KEY 設定済**  
**詳細シナリオ**: [demo-scenario.md](./demo-scenario.md)

---

## 構成（180秒）

### 0:00–0:20 オープニング

**画面**: タイトルスライド or 子ども UI トップ

**ナレーション**:

> 学校の小さなケンカ。子どもは動揺して、先生は忙しい。  
> **ナカナオリ・エージェント** — ロボットは裁かない。話を整理して、先生につなぐ。  
> **主役は人。ロボットは黒子。**

---

### 0:20–1:40 Scene A — 順番取り合い（通常仲介）

**画面**: `/child` → はじめる

| 操作 | 送る言葉（ゆうき） |
|------|-------------------|
| おくる | `ゆうき` |
| おくる | `1こめの 休み時間、左の ブランコ ぼくが 先 なのに けんた 割り込んだ。` |
| 番を おわる | — |

**画面**: けんたの番（短縮可）

| おくる | `けんた` |
| おくる | `右の ブランコ ぼくが 先。ゆうきくん 左の 方 怒鳴ってた だけ。` |
| 番を おわる | — |

**画面**: `/teacher` → セッション選択 → **確認の進め方**（ヒーロー）→ 食い違い「左 vs 右」

**ナレーション**:

> ロボットは **順番に聞く**。ADK が事実と気持ちを整理し、先生に「どっちのブランコ？」という確認ヒントを渡す。  
> **別のブランコ** だった — 子ども同士で1分で解決。

台本: [turn-order-story-dialogue.md](./examples/turn-order-story-dialogue.md)

---

### 1:40–2:10 Scene B — 緊急エスカレーション

**画面**: **新しいセッション** `/child`

| おくる | `さくら` |
| おくる | `休み時間、たくみくんが わたしの 顔を 殴った。痛かった。` |

**画面**: 「せんせいを よんでね」バナー → `/teacher` 急ぎ表示

**ナレーション**:

> 「殴った」— ロボットは **聞くのをやめて、先生を呼ぶ**。裁かない。安全を最優先。

台本: [violence-escalation-story-dialogue.md](./examples/violence-escalation-story-dialogue.md)

---

### 2:10–2:50 Scene C — DevOps（とどける + まわす）

**画面 A（10秒）**: GitHub → Actions（CI 緑）→ `check-prompts.sh` 成功 → `deploy-staging.yml` → Cloud Run Revisions

**画面 B（10秒）**: GCP **Cloud Logging** — クエリ `jsonPayload.event="session.escalated"` または暴力デモ直後の `session.child_turn`

**画面 C（10秒）**: **Secret Manager** — `GEMINI_API_KEY`（審査用 ON / 普段 OFF の運用説明）

**ナレーション**:

> **DevOps × AI Agent** — PR で lint と禁止語チェック。main マージで Cloud Run に自動デプロイ、**スモークテスト**で health 確認。  
> エージェントの状態遷移とエスカレーションは **Cloud Logging** で追える。Gemini キーは Secret Manager で **運用 ON/OFF**。  
> つくる・**まわす**・とどける。

参照: [devops.md](./devops.md)（Runbook · Logging クエリ）

---

### 2:50–3:00 クロージング（任意: Kebbi）

**画面**: Kebbi 実機 5秒 or エージェント構成図（[architecture.md](./architecture.md)）

**ナレーション**:

> 多段 ADK — Listener、FactStructurer、EmotionGuard。  
> Web も Kebbi も、同じ API。Google Cloud Run + Gemini + ADK。

---

## 撮影チェックリスト

- [ ] `GEMINI_API_KEY` 有効（teacher_hints が空にならない）
- [ ] 音声・字幕（審査員向けに日本語 OK）
- [ ] 1920×1080 推奨
- [ ] 公開 URL（YouTube 限定公開 / Google Drive 等）を Proto Pedia に記載

---

## B-roll（差し込み用）

- エージェント状態遷移（`aidlc-docs/inception/application-design/application-design.md` の stateDiagram）
- CI ログ `scripts/check-prompts.sh` 成功
- 子ども UI の「番を おわる」確認パネル
