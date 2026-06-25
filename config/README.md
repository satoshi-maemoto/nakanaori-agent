# 設定サンプル（config/）

| ファイル | 用途 |
|----------|------|
| [google-tts-service-account.example.json](./google-tts-service-account.example.json) | GCP サービスアカウント JSON の**雛形**（コミット可） |
| [google-tts.env.example](./google-tts.env.example) | `.env` に追記する TTS 環境変数の例 |

**実際のキー JSON はコミットしないでください。**  
`credentials/` 配下や `*-credentials.json` は `.gitignore` 対象です。

手順: [docs/google-cloud-tts-setup.md](../docs/google-cloud-tts-setup.md)

**音声（Chirp 3 HD）**: Web `Zephyr` / `Rasalgethi`（`gender`）、Kebbi `Callirrhoe`（`kebbi_child`）。詳細は [kebbi-tts-components.md](../aidlc-docs/inception/application-design/kebbi-tts-components.md)。
