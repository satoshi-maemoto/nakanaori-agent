# 設定サンプル（config/）

| ファイル | 用途 |
|----------|------|
| [google-tts-service-account.example.json](./google-tts-service-account.example.json) | GCP サービスアカウント JSON の**雛形**（コミット可） |
| [google-tts.env.example](./google-tts.env.example) | `.env` に追記する TTS 環境変数の例 |
| [kebbi-targets.env](./kebbi-targets.env) | Kebbi 実機の **local / staging** 接続先既定（`KEBBI_TARGET`、staging Web URL 等） |

**実際のキー JSON はコミットしないでください。**  
`credentials/` 配下や `*-credentials.json` は `.gitignore` 対象です。  
staging 用 TTS 認証は **GCP Secret Manager** `GOOGLE_TTS_CREDENTIALS_JSON` に登録（[google-cloud-tts-setup.md](../docs/google-cloud-tts-setup.md) 方法 C）。

## Kebbi 接続先

| ターゲット | API URL | 設定方法 |
|-----------|---------|----------|
| **staging**（既定） | `nakanaori-web` → `nakanaori-api` に自動変換 | `kebbi-deploy.sh` / `kebbi-use-staging.sh` |
| **local** | Mac LAN IP `:8080`（`dev-stack` 起動中） | `kebbi-deploy.sh local` / `kebbi-use-local.sh` |

`.env` の `KEBBI_TARGET` で上書き可能。詳細: [kebbi-dev-guide.md](../docs/kebbi-dev-guide.md)

手順（TTS）: [docs/google-cloud-tts-setup.md](../docs/google-cloud-tts-setup.md)

**音声（Chirp 3 HD）**: Web `Zephyr` / `Rasalgethi`（`gender`）、Kebbi `Callirrhoe`（`kebbi_child`）。詳細は [kebbi-tts-components.md](../aidlc-docs/inception/application-design/kebbi-tts-components.md)。
