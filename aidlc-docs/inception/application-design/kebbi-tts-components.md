# Kebbi + TTS — Application Design

## コンポーネント

| コンポーネント | 配置 | 責務 |
|----------------|------|------|
| `@nakanaori/tts` | `packages/tts` | テキスト前処理、Google TTS クライアント |
| TTS Route | `services/api` | `POST /v1/tts/synthesize` |
| `NakanaoriKebbiApp` | sibling repo `nakanaori-kebbi` | Android エントリ |
| `NakanaoriApi` | sibling repo `nakanaori-kebbi` | セッション REST |
| `TtsApi` | sibling repo `nakanaori-kebbi` | TTS REST |
| `NakanaoriViewModel` | sibling repo `nakanaori-kebbi` | セッション状態機械 |
| `NuwaSpeechHelper` | sibling repo `nakanaori-kebbi` | ASR + ロボ TTS フォールバック |

## データフロー

Kebbi → API sessions → agents → agent_message → TTS synthesize → ExoPlayer / Nuwa TTS

## 音声設定

| 用途 | Voice ID | 指定方法 |
|------|----------|----------|
| Web 女性 | `ja-JP-Chirp3-HD-Zephyr` | `gender: "female"` |
| Web 男性 / 既定 | `ja-JP-Chirp3-HD-Rasalgethi` | `gender: "male"` または未指定 |
| Kebbi 子ども | `ja-JP-Chirp3-HD-Callirrhoe` | `options.profile: "kebbi_child"`（rate 1.08） |

Encoding: MP3（data URI 返却）

**Chirp 3 HD**: pitch 非対応 — `voiceSupportsPitch()` が false のとき API に pitch を送らない。Neural2 等を明示 `voice` で指定した場合のみ pitch 利用可。

**料金**（2026）: Chirp 3 HD $30/100万文字（無料枠 100万/月）。旧 Neural2 は $16/100万文字。
