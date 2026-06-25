# ENH-TTS-01 — Chirp 3 HD 音声への移行

## メタデータ

| 項目 | 内容 |
|------|------|
| **Enhancement ID** | ENH-TTS-01 |
| **ユニット** | `unit-tts-service` + `unit-kebbi-contract` |
| **状態** | ✅ 完了 |
| **関連** | ENH-KEBBI-01（TTS 基盤） |

## 背景

- Neural2（`ja-JP-Neural2-B/C`）は落ち着いた大人声で、低学年向けロボットにはやや硬い
- Google **Chirp 3 HD** は自然さ・若々しさが向上（料金: $30/100万文字、無料枠 100万文字/月）
- Chirp 3 HD は **pitch パラメータ非対応** — API に `pitch` を送ると 400 になる

## 音声マッピング（確定）

| チャネル | API 指定 | Google 声 ID | 備考 |
|----------|----------|--------------|------|
| Web 女性 | `gender: "female"` | `ja-JP-Chirp3-HD-Zephyr` | `avatarGender` |
| Web 男性 | `gender: "male"` | `ja-JP-Chirp3-HD-Rasalgethi` | `avatarGender` |
| 既定（gender 未指定） | — | `ja-JP-Chirp3-HD-Rasalgethi` | `DEFAULT_VOICE_NAME` / `GOOGLE_TTS_VOICE` |
| Kebbi | `options.profile: "kebbi_child"` | `ja-JP-Chirp3-HD-Callirrhoe` | `speaking_rate: 1.08`、pitch なし |

## 受け入れ基準

| ID | 基準 | 状態 |
|----|------|------|
| AC-TTS-01 | Web female → Zephyr | ✅ |
| AC-TTS-02 | Web male / 既定 → Rasalgethi | ✅ |
| AC-TTS-03 | Kebbi `kebbi_child` → Callirrhoe + rate 1.08 | ✅ |
| AC-TTS-04 | Chirp3 声では `audioConfig.pitch` を省略 | ✅ |
| AC-TTS-05 | 明示 `voiceName` で Neural2 指定時は pitch 利用可 | ✅ |

## 実装ファイル

| パス | 内容 |
|------|------|
| `packages/tts/src/voice-config.ts` | 声 ID、`voiceSupportsPitch()` |
| `packages/tts/src/resolve-voice-options.ts` | pitch 省略ロジック |
| `packages/tts/src/google-tts-client.ts` | 条件付き `pitch` 送信 |
| `docs/google-cloud-tts-setup.md` | 声一覧・料金注記 |
| `clients/kebbi/api-contract.md` | TTS 契約 |

## 運用上の注意

- **レイテンシ**: Chirp 3 HD は Neural2 より合成が遅いことがある（Kebbi は prefetch / キャッシュで緩和）
- **試聴**: [Google Chirp 3 HD ドキュメント](https://cloud.google.com/text-to-speech/docs/chirp3-hd)
- **料金**: [Text-to-Speech pricing](https://cloud.google.com/text-to-speech/pricing) — Chirp 3 HD $30/1M chars（Neural2 $16/1M）

## 検証

- `npm run test --workspace=@nakanaori/tts`
- curl: `gender: female` / `male`、`profile: kebbi_child`
- Web `/child` 男女切替、Kebbi 実機 TTS
