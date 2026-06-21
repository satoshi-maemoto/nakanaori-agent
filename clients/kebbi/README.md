# Kebbi Client (Sibling Repository)

The Nuwa Kebbi Android client is **not** implemented in this repository.

## Sibling Repository

- **GitHub**: [SystemFriend/AIxR-CharaTomo-Kebbi](https://github.com/SystemFriend/AIxR-CharaTomo-Kebbi)
- **Local path**: `/Users/maemoto/Documents/GitHub/AIxR-CharaTomo-Kebbi`

## Integration Approach

1. Nakanaori uses a **session-based REST API** (this repo's `services/api/`)
2. Do **not** use CharaTomo `POST /api/v1/llm/chat` — mediation workflow differs from general chat
3. Reference CharaTomo-Kebbi for:
   - Nuwa TTS / ASR patterns (`NuwaSpeechHelper`, playback vs mic coordination)
   - HTTP client patterns (`ChatApi.kt`, `VoiceApi.kt`)
   - Robot face animation during speech

## Sync Policy

When changing API contract (`clients/kebbi/api-contract.md`):

1. Update this repo's API routes and schemas
2. Open `AIxR-CharaTomo-Kebbi` and implement/adapt `NakanaoriApi.kt` (or equivalent)
3. See `AIxR-CharaTomo-Kebbi/AGENTS.md` for Kebbi agent notes

## Phase 2: Voice

- STT/TTS via Google Cloud Speech APIs or Kebbi Nuwa SDK
- Contract extensions documented in `api-contract.md` when added
