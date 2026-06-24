# Demo Scenario — Eraser Conflict

Use this script for hackathon demo video and live pitch (決勝 8/19).

## 詳細台本（推奨）

**送信単位・矛盾の解説・先生デモの見せ方** は以下を正とする。

- [examples/eraser-story-dialogue.md](./examples/eraser-story-dialogue.md) — 手順・矛盾表・3分短縮版
- [examples/eraser-story-utterances.json](./examples/eraser-story-utterances.json) — `turns.recommended`

各子: **名前 → 2回のまとめ「おくる」 → 番を おわる → おわり（確認）**（Web）

Kebbi: 同じ台本の「送る言葉」は音声入力。**番の終わりは頭をなでる**（`POST /v1/sessions` に `client: kebbi`）。

フロー詳細: [child-conversation-flow.md](./examples/child-conversation-flow.md)

## Cast

- **子どもA**: 「Bが私の消しゴムを取った！」
- **子どもB**: 「違う、落ちてたから拾っただけ！」
- **ロボット**: ナカナオリ・エージェント（Web アバター or Kebbi）
- **先生**: ダッシュボードでブリーフを確認

## Scene 1 — 介入

Two children argue. Teacher is busy. Child or teacher taps "話したい" on robot/Web UI.

Robot: 「二人とも、順番に話してね。まずは A さんから聞くよ。」

## Scene 2 — 子どもA（listening_a）

**A**: 「今日の国語の時間、Bが私の消しゴムを取った！」

Robot: 「そうだったんだね。もう少し教えてくれる？」

**A**: 「机の上に置いてたのに、なくなって、Bが持ってた。」

## Scene 3 — 子どもB（listening_b）

Robot: 「じゃあ B さんの話も聞くね。」

**B**: 「違う！床に落ちてたから拾っただけ。取ったんじゃない。」

## Scene 4 — 裁かない（API ブリーフを提示）

System does **not** say who is right.

**Structured output**:

| | 子どもA | 子どもB |
|---|---------|---------|
| 事実 | 机の消しゴムがなくなったと感じた | 床の消しゴムを拾ったと言っている |
| 気持ち | 取られたと感じた | 悪いことをしたとは思っていない |
| 不明 | — | 消しゴムの所有者 |

**不一致**: 取った vs 拾った  
**不明点**: 消しゴムが誰のものか、まだ確認されていない

## Scene 5 — 先生ダッシュボード

先生画面（ENH-UI-04）:

1. **確認の進め方** — LLM 生成 `teacher_hints` をヒーロー表示（番号付き）
2. 話の整理 — 具体的な `disagreements` / `unknowns`
3. 会話履歴 — 双方の生発話
4. ブリーフ完成時 — 事実・気持ちの分離 + AI 免責

従来の1枚ブリーフ要素:

- タイムライン
- 双方の事実・感情（分離表示）
- 提案質問: 「消しゴムの所有者と、取った／拾ったという認識差を確認する」
- 注記: 「この整理はAIによるものです。最終的な判断は先生が行ってください。」

## Scene 6 — 審査員向けメッセージ

> ナカナオリ・エージェントは裁かない。  
> ロボットが黒子として話を整理し、先生が公正に対応できる材料を届ける。  
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
  -d '{"child_id":"a","utterance":"Bが私の消しゴムを取った！"}'

# Child B turn
curl -s -X POST "$API_URL/v1/sessions/$SESSION_ID/child-turn" \
  -H "Content-Type: application/json" \
  -d '{"child_id":"b","utterance":"落ちてたから拾っただけ！"}'

# Teacher brief
curl -s "$API_URL/v1/sessions/$SESSION_ID/teacher-brief"
```

## Kebbi 実機デモ

1. Mac: `bash scripts/dev-stack.sh`
2. Kebbi: `bash scripts/kebbi-deploy.sh`（または VS Code **Kebbi: Deploy + Nakanaori Dev Stack**）
3. 設定 → API URL = `http://<PC-LAN-IP>:8080` → 保存 → もどる
4. 上記 Scene 2–3 を音声で実施（台本: [eraser-story-dialogue.md](./examples/eraser-story-dialogue.md)）
5. 先生 Web `/teacher` でブリーフ確認

詳細: [kebbi-dev-guide.md](./kebbi-dev-guide.md)
