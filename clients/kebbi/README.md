# Kebbi クライアント（Private リポジトリ）

Nuwa Kebbi Android クライアントは **この monorepo 外** の private repo に実装されています。

## リポジトリ

| 項目 | 値 |
|------|-----|
| **GitHub** | https://github.com/satoshi-maemoto/nakanaori-kebbi （private） |
| **ローカル** | `/Users/maemoto/Documents/GitHub/nakanaori-kebbi` |
| **Package** | `com.nakanaori.kebbi` |
| **参照実装** | [AIxR-CharaTomo-Kebbi](https://github.com/SystemFriend/AIxR-CharaTomo-Kebbi)（Nuwa ASR/TTS パターン） |

## 連携方針

1. Nakanaori **セッション REST API** + **`POST /v1/tts/synthesize`**
2. CharaTomo `POST /api/v1/llm/chat` は **使用しない**
3. TTS: Google Cloud（monorepo `packages/tts`）；未設定時 Kebbi は Nuwa ロボ TTS
4. **アバター選択なし** — 中性的 1 声

## 同期ポリシー

`clients/kebbi/api-contract.md` を変更する場合:

1. この repo の API ルートと `packages/tts` を更新
2. `nakanaori-kebbi` の `NakanaoriApi.kt` / `TtsApi.kt` を適応
3. Kebbi 向け手順は `nakanaori-kebbi/AGENTS.md`

## 音声

- **STT**: Kebbi Nuwa SDK クラウド ASR（端末内）
- **TTS**: `POST /v1/tts/synthesize` → ExoPlayer；フォールバック Nuwa TTS
- **TTS 認証設定**（API 側）: [docs/google-cloud-tts-setup.md](../../docs/google-cloud-tts-setup.md)

## 開発・デモ

実機のセットアップ、API URL（LAN IP）、設定画面・顔表示の注意、トラブルシューティング:

**[docs/kebbi-dev-guide.md](../../docs/kebbi-dev-guide.md)**

```bash
# Mac: API
bash scripts/dev-stack.sh

# Kebbi: ビルド・実機インストール・起動
bash scripts/kebbi-deploy.sh
```

Kebbi 設定の API URL は **`http://<PC-LAN-IP>:8080`**（`127.0.0.1` は端末自身を指すため不可）。保存後「もどる」でセッション再接続。
