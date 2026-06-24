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

| 用途 | Voice | 備考 |
|------|-------|------|
| Web 既定 | `ja-JP-Neural2-C`（`GOOGLE_TTS_VOICE`） | 中性・落ち着き |
| Web 男女 | `Neural2-B` / `Neural2-C` | `avatarGender` |
| Kebbi 子ども | `ja-JP-Neural2-B`, rate 1.08, pitch +2.0 | `profile: kebbi_child` 明示時のみ |

Encoding: MP3（data URI 返却）
