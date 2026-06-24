# unit-tts-service — Code Generation Plan

- [x] `packages/tts` package scaffold
- [x] `prepareTtsText()` + tests
- [x] `GoogleTtsClient.synthesize()`
- [x] `POST /v1/tts/synthesize` in services/api
- [x] `.env.example` GOOGLE_APPLICATION_CREDENTIALS
- [x] api-contract.md TTS section
- [x] `resolveVoiceAudio()` — Web `avatarGender` vs Kebbi `profile: kebbi_child`
- [x] `kebbi_child` — `ja-JP-Neural2-B`, rate 1.08, pitch +2.0（明示指定時のみ）
