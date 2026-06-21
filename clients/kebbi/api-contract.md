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
  "child_b_label": "子どもB"
}
```

**Response** `201`

```json
{
  "session_id": "uuid",
  "state": "listening_a",
  "child_a_label": "子どもA",
  "child_b_label": "子どもB",
  "active_child": "a"
}
```

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

デモ用途中経過（発話一覧）。ブリーフ未準備時に先生 UI が表示。

**Response** `200`

```json
{
  "session_id": "uuid",
  "state": "listening_b",
  "child_a_label": "子どもA",
  "child_b_label": "子どもB",
  "active_child": "b",
  "escalated": false,
  "urgent": false,
  "brief_ready": false,
  "turns_a": [{ "child_id": "a", "utterance": "…" }],
  "turns_b": [],
  "escalation_reason": null
}
```

### POST /v1/sessions/{session_id}/child-turn

子どもの発話（テキスト）を送信。Phase 2: 別 STT エンドポイント経由の音声。

**Request**

```json
{
  "child_id": "a",
  "utterance": "Bが私の消しゴムを取った！"
}
```

**Response** `200`

```json
{
  "session_id": "uuid",
  "state": "listening_b",
  "agent_message": "そうだったんだね。ゆっくり話してくれてありがとう。",
  "escalated": false,
  "done_with_child": false
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
  "disagreements": ["消しゴムを取った vs 拾った"],
  "unknowns": ["消しゴムの所有者が確認されていない"],
  "suggested_questions": [
    "消しゴムの所有者と、取った／拾ったという認識の違いを確認する"
  ]
}
```

**禁止フィールド**（出現してはならない）: `guilty_party`, `verdict`, `winner`, `punishment_recommendation`

### GET /health

**Response** `200` `{ "status": "ok" }`

## Kebbi 実装メモ

- CharaTomo-Kebbi に `NakanaoriApi.kt` を追加（ベース URL は設定から、CharaTomo API URL とは別）
- `agent_message` を Nuwa TTS にマッピング（`VoiceApi.kt` パターン参照）
- TTS 再生中はマイク停止（Kebbi repo の `AGENTS.md` 参照）

## Web 実装メモ

- 子ども UI: セッション `active_child` に合わせた `child_id` で `POST child-turn` ループ
- 先生 UI: セッション一覧が `ready_for_teacher` のとき `GET teacher-brief` をポーリングまたは更新
