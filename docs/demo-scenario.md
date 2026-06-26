# Demo Scenario — Turn Order Conflict（順番取り合い）

Use this script for hackathon demo video and live pitch (決勝 8/19).

## 詳細台本（推奨）

**送信単位・矛盾の解説・先生デモの見せ方** は以下を正とする。

- [examples/turn-order-story-dialogue.md](./examples/turn-order-story-dialogue.md) — 通常仲介（順番取り合い）
- [examples/violence-escalation-story-dialogue.md](./examples/violence-escalation-story-dialogue.md) — 緊急エスカレーション
- [examples/turn-order-story-utterances.json](./examples/turn-order-story-utterances.json) — `turns.recommended`

各子: **名前 → 2回のまとめ「おくる」 → 番を おわる → おわり（確認）**（Web）

Kebbi: 同じ台本の「送る言葉」は音声入力。**番の終わりは頭をなでる**（`POST /v1/sessions` に `client: kebbi`）。

フロー詳細: [child-conversation-flow.md](./examples/child-conversation-flow.md)

## Cast

- **子どもA（ゆうき）**: 「左のブランコ、ぼくが先なのに割り込まれた！」
- **子どもB（けんた）**: 「右のブランコ、ぼくが先。違う！」
- **ロボット**: ナカナオリ — **順番に聞く**（デモのメタファー）
- **先生**: ダッシュボードでブリーフを確認

## Scene 1 — 介入

Two children argue at the swing. Teacher is busy. Child or teacher taps "話したい" on robot/Web UI.

Robot: 「二人とも、**順番に** 話してね。まずは ゆうきくんから。」

## Scene 2 — 子どもA（listening_a）

**A**: 「1こめの休み時間、左のブランコ ぼくが先なのに、けんたが割り込んだ！」

Robot: 「そうだったんだね。もう少し教えてくれる？」

**A**: 「教室から出たらすぐ左のブランコの前に立ってた。大声で『先』って言われてこわかった。」

## Scene 3 — 子どもB（listening_b）

Robot: 「じゃあ けんたくんの話も聞くね。」

**B**: 「右のブランコ ぼくが先。ゆうきくん あとから来た。」

**B**: 「悪いことしたつもりない。ゆうきくん 左の方 怒鳴ってた。」

## Scene 4 — 裁かない（API ブリーフを提示）

System does **not** say who is right.

**Structured output**:

| | 子どもA | 子どもB |
|---|---------|---------|
| 事実 | 左のブランコで先だと言った | 右のブランコで先だと言っている |
| 気持ち | 割り込まれてこわかった | 悪いつもりはない |
| 不明 | 同じブランコか | — |

**不一致**: 割り込んだ vs 先だった  
**手がかり**: **左** vs **右** のブランコ

## Scene 5 — 先生ダッシュボード

先生画面（ENH-UI-04）:

1. **確認の進め方** — LLM 生成 `teacher_hints` をヒーロー表示
2. 話の整理 — `disagreements` / `unknowns`（左 vs 右）
3. 会話履歴 — 双方の「先だ！」
4. ブリーフ — 事実・気持ちの分離 + AI 免責

## Scene 6 — 解決（子ども同士で気づける）

先生ダッシュボードの `teacher_hints` を見て:

> 「**どっちの** ブランコ の 話？ 指さして 教えて。」

**解決**:

- ゆうき — 「**左**！」
- けんた — 「**右**！ … あ、**別** じゃん」
- 同時にブランコ使える — 和解

詳細ナレーション: [turn-order-story-dialogue.md](./examples/turn-order-story-dialogue.md#ナカナオリがあったから—解決ストーリー)

## Scene 7 — 審査員向けメッセージ

> ナカナオリ・エージェントは裁かない。  
> ロボットが **順番に聞いて** 取り合いを止め、先生が一言で **子ども同士の解決** を後押しする。  
> **順番の取り合い — このアプリがまさに「順番」を守る。**  
> **主役は人。ロボットは黒子。**

## curl クイックデモ（API のみ）

```bash
# Create session
curl -s -X POST "$API_URL/v1/sessions" \
  -H "Content-Type: application/json" \
  -d '{"child_a_label":"子どもA","child_b_label":"子どもB"}'

# Child A turn
curl -s -X POST "$API_URL/v1/sessions/$SESSION_ID/child-turn" \
  -H "Content-Type: application/json" \
  -d '{"child_id":"a","utterance":"左のブランコ ぼくが先なのに けんた 割り込んだ！"}'

# Child B turn
curl -s -X POST "$API_URL/v1/sessions/$SESSION_ID/child-turn" \
  -H "Content-Type: application/json" \
  -d '{"child_id":"b","utterance":"右のブランコ ぼくが先。割り込んでない！"}'

# Teacher brief
curl -s "$API_URL/v1/sessions/$SESSION_ID/teacher-brief"
```

## Kebbi 実機デモ

### staging（既定）

```bash
bash scripts/kebbi-deploy.sh
```

### ローカル

1. Mac: `bash scripts/dev-stack.sh`
2. Kebbi: `bash scripts/kebbi-deploy.sh local`
3. 必要なら `bash scripts/kebbi-open-settings.sh` で API URL 確認
4. 上記 Scene 2–3 を音声で実施（台本: [turn-order-story-dialogue.md](./examples/turn-order-story-dialogue.md)）
5. 先生 Web `/teacher`（staging または LAN）でブリーフ確認

詳細: [kebbi-dev-guide.md](./kebbi-dev-guide.md)

## Scene 8 — 緊急エスカレーション（別セッション）

**台本**: [violence-escalation-story-dialogue.md](./examples/violence-escalation-story-dialogue.md)

新しいセッションを開始。**さくら** が2回目の発話:

> 「たくみくんが ぼくの 顔を **殴った**。」

**期待**:

- ロボット: 「大丈夫？先生を呼ぶね。」— **仲介停止**
- 子ども UI: 入力不可、「せんせいを よんでね」
- 先生 UI: **緊急**、`urgent: true`

> 順番取り合い（Scene 1–7）の **あと** に見せると、「聞くロボット」と「止めるロボット」の対比が伝わる。

## 参考: 消しゴムストーリー（旧）

[eraser-story-dialogue.md](./examples/eraser-story-dialogue.md) — 非推奨
