# Kebbi + TTS — Application Design

## コンポーネント

| コンポーネント | 配置 | 責務 |
|----------------|------|------|
| `@nakanaori/tts` | `packages/tts` | テキスト前処理、Google TTS クライアント |
| TTS Route | `services/api` | `POST /v1/tts/synthesize` |
| `NakanaoriKebbiApp` | private repo | Android エントリ |
| `NakanaoriApi` | private repo | セッション REST |
| `TtsApi` | private repo | TTS REST |
| `NakanaoriViewModel` | private repo | セッション状態機械 |
| `NuwaSpeechHelper` | private repo | ASR + ロボ TTS フォールバック |

## データフロー

Kebbi → API sessions → agents → agent_message → TTS synthesize → ExoPlayer / Nuwa TTS

## 音声設定

- Voice: `ja-JP-Neural2-C`（中性・落ち着き）
- Gender: NEUTRAL
- Encoding: MP3
