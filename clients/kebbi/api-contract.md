# Nakanaori API Contract (Kebbi / Web Clients)

Base URL: `https://<nakanaori-api-host>/v1`

**Not** CharaTomo `/api/v1/llm/chat`.

## Authentication (MVP)

Demo mode: no auth. Session IDs are unguessable UUIDs. Production: teacher API key or Firebase Auth (future).

## Endpoints

### POST /v1/sessions

Create a mediation session.

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

Get session state.

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

### POST /v1/sessions/{session_id}/child-turn

Submit a child's utterance (text). Phase 2: audio via separate STT endpoint.

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

When `escalated: true`, client should stop mediation UI and show "先生を呼んでください".

### GET /v1/sessions/{session_id}/teacher-brief

Teacher one-page brief. Available when `state` is `ready_for_teacher` or `escalated`.

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

**Forbidden fields** (must never appear): `guilty_party`, `verdict`, `winner`, `punishment_recommendation`

### GET /health

**Response** `200` `{ "status": "ok" }`

## Kebbi Implementation Notes

- Add `NakanaoriApi.kt` in CharaTomo-Kebbi with base URL from settings (separate from CharaTomo API URL)
- Map `agent_message` to Nuwa TTS (see `VoiceApi.kt` pattern)
- Stop mic during TTS playback (see `AGENTS.md` in Kebbi repo)

## Web Implementation Notes

- Child UI: `POST child-turn` loop with `child_id` matching session `active_child`
- Teacher UI: poll or refresh `GET teacher-brief` when session list shows `ready_for_teacher`
