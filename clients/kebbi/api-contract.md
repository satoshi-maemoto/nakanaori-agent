# Nakanaori API 契約（Kebbi / Web クライアント）

Base URL: `https://<nakanaori-api-host>/v1`

CharaTomo `/api/v1/llm/chat` **ではない**。

## 認証（MVP）

デモモード: 認証なし。セッション ID は推測困難な UUID。本番: 先生 API キーまたは Firebase Auth（将来）。

## エンドポイント

### POST /v1/sessions

仲介セッションを作成。

**Request**

```json
{
  "child_a_label": "子どもA",
  "child_b_label": "子どもB",
  "client": "kebbi"
}
```

- `client`（任意）: `"web"`（既定）または `"kebbi"`。番の終わり方の案内文を切り替える。

**クライアント別コピー（`afterNameReceived` など）**

| 項目 | `web` | `kebbi` |
|------|-------|---------|
| 番の終え方（UI） | 「番を おわる」ボタン | 頭をなでる / 音声「おわった」 |
| 名前登録後の案内 | 「話し終わったら、『番を おわる』を おしてね。」 | 「話し終わったら、あたまを なでてね。」 |

Web は `client` 省略可。Kebbi は `"client": "kebbi"` を **必須** で送ること（省略すると Web 用案内が TTS される）。

**Response** `201`

```json
{
  "session_id": "uuid",
  "state": "listening_a",
  "child_a_label": "子どもA",
  "child_b_label": "子どもB",
  "child_a_name": null,
  "child_b_name": null,
  "active_child": "a",
  "escalated": false,
  "urgent": false,
  "welcome_message": "こんにちは、ナカナオリだよ。…なまえを 教えてくれる？"
}
```

`welcome_message`: 子ども UI の初回ロボット吹き出し（自己紹介 + 安心 + 名前確認）。

### GET /v1/sessions/{session_id}

セッション状態を取得。

**Response** `200`

```json
{
  "session_id": "uuid",
  "state": "listening_b",
  "child_a_label": "子どもA",
  "child_b_label": "子どもB",
  "active_child": "b",
  "escalated": false,
  "urgent": false
}
```

**States**: `created`, `listening_a`, `listening_b`, `structuring`, `confirming_a`, `confirming_b`, `ready_for_teacher`, `escalated`, `closed`

### GET /v1/sessions

進行中セッション一覧（`closed` 以外）。先生デモ UI 用。

**Response** `200`

```json
{
  "sessions": [
    {
      "session_id": "uuid",
      "state": "listening_a",
      "child_a_label": "子どもA",
      "child_b_label": "子どもB",
      "active_child": "a",
      "escalated": false,
      "urgent": false
    }
  ]
}
```

### GET /v1/sessions/{session_id}/progress

デモ用途中経過。**発話一覧 + LLM 整理（insights）**。ブリーフ未準備時に先生 UI が表示。

`insights` は Gemini 有効時 LLM 生成（発話内容が変わるまで `analysis_snapshot` でキャッシュ）。

**Response** `200`

```json
{
  "session_id": "uuid",
  "state": "listening_b",
  "child_a_label": "ゆうき",
  "child_b_label": "子どもB",
  "child_a_name": "ゆうき",
  "child_b_name": null,
  "active_child": "b",
  "escalated": false,
  "urgent": false,
  "brief_ready": false,
  "turns_a": [{ "child_id": "a", "utterance": "…" }],
  "turns_b": [{ "child_id": "b", "utterance": "…" }],
  "escalation_reason": null,
  "insights": {
    "agreements": ["双方とも消しゴムをめぐって話している"],
    "disagreements": ["ゆうきは取られたと言い、けんたは拾っただけと言っている"],
    "unknowns": ["話している消しゴムが同じ1つか"],
    "teacher_hints": [
      "二人に消しゴムを見せてもらい、同じものについて話しているか確かめる",
      "取った／拾ったについて、手に取る直前の場所と順番を事実だけ聞く"
    ]
  }
}
```

### POST /v1/sessions/{session_id}/child-turn

子どもの発話（テキスト）を送信。Phase 2: 別 STT エンドポイント経由の音声。

**Request**

```json
{
  "child_id": "a",
  "utterance": "Bが私の消しゴムを取った！",
  "finish_turn": false
}
```

| フィールド | 説明 |
|------------|------|
| `child_id` | `"a"` または `"b"`（`active_child` と一致必須） |
| `utterance` | 発話テキスト（`finish_turn: true` のみで空可） |
| `finish_turn` | `true` で次の子へ番移行（デフォルト `false`） |

**Errors** `400`

- `いまは {label} の番です` — 相手の番への送信
- `session not accepting turns` — ブリーフ準備完了後

**Response** `200`

```json
{
  "session_id": "uuid",
  "state": "listening_b",
  "agent_message": "そうだったんだね。ゆっくり話してくれてありがとう。",
  "escalated": false,
  "done_with_child": false,
  "child_a_name": "ゆうき",
  "child_b_name": null,
  "child_a_label": "子どもA",
  "child_b_label": "子どもB"
}
```

`escalated: true` の場合、クライアントは仲介 UI を停止し「先生を呼んでください」を表示。

### GET /v1/sessions/{session_id}/teacher-brief

先生向け1枚ブリーフ。`state` が `ready_for_teacher` または `escalated` のとき利用可能。

**Response** `200`

```json
{
  "session_id": "uuid",
  "urgent": false,
  "ai_disclaimer": "この整理はAIによるものです。最終的な判断は先生が行ってください。",
  "timeline": [
    { "at": "2026-06-21T10:00:00Z", "event": "セッション開始" }
  ],
  "conversation_a": {
    "label": "ゆうき",
    "utterances": ["きょう こくごの じかん、けんたが ぼくの けしゴム 取った！"]
  },
  "conversation_b": {
    "label": "けんた",
    "utterances": ["床に おちてた 水色の けしゴム ひろっただけ"]
  },
  "child_a": {
    "label": "子どもA",
    "facts": ["消しゴムがなくなったと感じた"],
    "feelings": ["取られたと感じた"],
    "unknowns": []
  },
  "child_b": {
    "label": "子どもB",
    "facts": ["床に落ちていた消しゴムを拾った"],
    "feelings": ["悪いことをしたとは思っていない"],
    "unknowns": []
  },
  "agreements": [],
  "disagreements": ["ゆうきは取られたと言い、けんたは拾っただけと言っている"],
  "unknowns": ["話している消しゴムが同じ1つか"],
  "suggested_questions": [
    "二人に消しゴムを見せてもらい、同じものについて話しているか確かめる"
  ],
  "teacher_hints": [
    "取った／拾ったについて、手に取る直前の場所と順番を事実だけ聞く",
    "いつ机に置き、いつ床を見たかをタイムラインに並べて確認する"
  ]
}
```

`teacher_hints`: 先生が真相確認に使う **具体的ステップ**（有罪認定・罰則提案は含めない）。Web UI では **確認の進め方** としてヒーロー表示。

**禁止フィールド**（出現してはならない）: `guilty_party`, `verdict`, `winner`, `punishment_recommendation`

### GET /health

**Response** `200` `{ "status": "ok" }`

### POST /v1/tts/synthesize

ロボット応答（`welcome_message` / `agent_message`）を Google Cloud TTS で音声化。Kebbi と Web 共通。

**Request**

```json
{
  "text": "こんにちは、ナカナオリだよ。",
  "gender": "female",
  "options": {
    "emotion_level": { "positive": 50, "negative": 50 },
    "speaking_rate": 1.0,
    "profile": "kebbi_child"
  }
}
```

- `gender`（任意）: **Web 向け** `"male"` | `"female"` — ロボット見た目に合わせた声（`ja-JP-Neural2-B` / `C`）。Kebbi は送らない。
- `options.profile`（任意）: **Kebbi 向け** `"kebbi_child"` — 明るい子ども向け声（`Neural2-B` + 高め pitch）。Web は送らない。
- `voice`（任意）: Google voice 名を直接指定（`gender` / `profile` より優先）

**Response** `200`

```json
{
  "success": true,
  "data": {
    "audioUrl": "data:audio/mp3;base64,...",
    "format": "mp3",
    "service": "google_cloud"
  }
}
```

**Errors**

- `400` — `text` 空
- `503` — Google TTS 未設定（Kebbi は Nuwa ロボット TTS にフォールバック）
- `502` — 合成失敗

**Voice（MVP）**: Web は `gender` で `female`→`Neural2-B`、`male`→`Neural2-C`。Kebbi は `options.profile: "kebbi_child"` で明るい子ども向け声（Web の `gender` には影響しない）。

## Kebbi 実装メモ

- **Private repo**: `nakanaori-kebbi`（`com.nakanaori.kebbi`）
- `NakanaoriApi.kt` — ベース URL は設定から（CharaTomo API とは別）
- `TtsApi.kt` — `POST /v1/tts/synthesize`（`options.profile: "kebbi_child"`）；503 時は Nuwa ロボ TTS
- Nuwa クラウド ASR → `POST child-turn`（テキスト `utterance`）
- TTS 再生中はマイク停止；終了 500ms 後 ASR 再開
- **アバター選択なし** — Kebbi は `profile: kebbi_child` 固定（Web は `gender` 指定）

## Web 実装メモ

- 子ども UI: セッション `active_child` に合わせた `child_id` で `POST child-turn` ループ；初回 `welcome_message` 表示；A/B 別バルーン色
- 先生 UI: 一覧 + `GET progress`（`insights.teacher_hints` 優先表示）→ `ready_for_teacher` で `GET teacher-brief`
- デモ台本: `docs/examples/eraser-story-dialogue.md`
