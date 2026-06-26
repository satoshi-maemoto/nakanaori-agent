# Kebbi クライアント（sibling リポジトリ）

Nuwa Kebbi Android クライアントは **この monorepo 外** の sibling repo に実装されています。

## リポジトリ

| 項目 | 値 |
|------|-----|
| **ローカル clone** | `$NAKANAORI_KEBBI_ROOT`（未設定時 `../nakanaori-kebbi`） |
| **Package** | `com.nakanaori.kebbi` |
| **参照実装** | [AIxR-CharaTomo-Kebbi](https://github.com/SystemFriend/AIxR-CharaTomo-Kebbi)（Nuwa ASR/TTS パターン） |

## 連携方針

1. Nakanaori **セッション REST API** + **`POST /v1/tts/synthesize`**
2. セッション作成時 **`"client": "kebbi"`** — Web 用「番を おわる」案内を避け、頭なで案内に切替（[api-contract.md](./api-contract.md)）
3. CharaTomo `POST /api/v1/llm/chat` は **使用しない**
4. TTS: Google Cloud Chirp 3 HD（`packages/tts`）；Kebbi は `kebbi_child` → `Callirrhoe`；未設定時 Nuwa ロボ TTS
5. **アバター選択なし** — Kebbi は子ども向け 1 声（Web の男女声とは独立）

## 同期ポリシー

`clients/kebbi/api-contract.md` を変更する場合:

1. この repo の API ルートと `packages/tts` を更新
2. Kebbi クライアント側の `NakanaoriApi.kt` / `TtsApi.kt` を適応

## 音声

| 用途 | Voice ID | API 指定 |
|------|----------|----------|
| Kebbi | `ja-JP-Chirp3-HD-Callirrhoe` | `options.profile: "kebbi_child"` |
| Web 女性 | `ja-JP-Chirp3-HD-Zephyr` | `gender: "female"` |
| Web 男性 | `ja-JP-Chirp3-HD-Rasalgethi` | `gender: "male"` |

- **STT**: Kebbi Nuwa SDK クラウド ASR（端末内）
- **TTS**: `POST /v1/tts/synthesize` → ExoPlayer；フォールバック Nuwa TTS
- **TTS 認証設定**（API 側）: [docs/google-cloud-tts-setup.md](../../docs/google-cloud-tts-setup.md)

## 開発・デモ

実機のセットアップ、API URL（LAN IP）、設定画面・顔表示の注意、トラブルシューティング:

**[docs/kebbi-dev-guide.md](../../docs/kebbi-dev-guide.md)**

```bash
# Mac: API
bash scripts/dev-stack.sh

# Kebbi: ビルド・実機インストール・起動（既定 staging）
bash scripts/kebbi-deploy.sh
bash scripts/kebbi-deploy.sh local      # dev-stack 向け
bash scripts/kebbi-use-staging.sh       # URL のみ staging
bash scripts/kebbi-use-local.sh       # URL のみ LAN
bash scripts/kebbi-open-settings.sh   # 設定画面を adb で開く
```

接続先の既定値: [config/kebbi-targets.env](../../config/kebbi-targets.env)

Kebbi 設定の API URL — **staging**: Cloud Run API / **local**: `http://<PC-LAN-IP>:8080`（`127.0.0.1` は不可）。保存後「もどる」でセッション再接続。
