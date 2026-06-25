# Google Cloud TTS 認証設定

`POST /v1/tts/synthesize`（`packages/tts`）と Kebbi / Web 音声再生で使う Google Cloud Text-to-Speech の設定手順です。

未設定時は TTS API が **503** を返します。Kebbi は **Nuwa ロボット TTS** にフォールバックします。

---

## 1. GCP でサービスアカウントを用意

1. [Google Cloud Console](https://console.cloud.google.com/) でプロジェクトを選択（または新規作成）
2. **API とサービス → ライブラリ** で **Cloud Text-to-Speech API** を有効化
3. **IAM と管理 → サービスアカウント → 作成**
   - 名前例: `nakanaori-tts`
   - ロール: **Cloud Text-to-Speech ユーザー**（`roles/cloudtts.user`）  
     または最小権限でカスタムロール + `cloudtexttospeech.synthesize` 相当
4. 作成したアカウント → **キー → 鍵を追加 → JSON** でダウンロード

ダウンロードした JSON の形は [config/google-tts-service-account.example.json](../config/google-tts-service-account.example.json) を参照。

---

## 2. 認証の渡し方（2 通り）

どちらか **1 つ** 設定すれば TTS が有効になります。

| 変数 | 向いている用途 |
|------|----------------|
| `GOOGLE_APPLICATION_CREDENTIALS` | **ローカル開発（推奨）** — JSON ファイルパス |
| `GOOGLE_TTS_CREDENTIALS_JSON` | Cloud Run / CI — JSON 文字列を環境変数に直接 |

### 方法 A: `GOOGLE_APPLICATION_CREDENTIALS`（推奨）

1. ダウンロードした JSON を **リポジトリ外** または `credentials/` に保存（git 管理外）

   ```bash
   mkdir -p credentials
   cp ~/Downloads/your-project-xxxxx.json credentials/google-tts-service-account.json
   chmod 600 credentials/google-tts-service-account.json
   ```

2. ルートの `.env` に追記:

   ```bash
   GOOGLE_APPLICATION_CREDENTIALS=./config/google-tts-service-account.json
   ```

   相対パスは **リポジトリルート基準** で解決されます（API の cwd が `services/api` でも可）。絶対パスでも構いません。

   ```bash
   GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/nakanaori-agent/config/google-tts-service-account.json
   ```

3. API 再起動:

   ```bash
   bash scripts/dev-stack.sh
   ```

### 方法 B: `GOOGLE_TTS_CREDENTIALS_JSON`

JSON ファイルの**中身を 1 行**にして `.env` またはデプロイ環境に設定します。

```bash
# .env の例（改行なし 1 行）
GOOGLE_TTS_CREDENTIALS_JSON={"type":"service_account","project_id":"your-project",...}
```

**注意**

- `private_key` フィールド内の改行は `\n` にエスケープ（実キー JSON そのまま 1 行化する場合）
- シェルで値に `$` やスペースが含まれる場合は `.env` にそのまま書く（引用符で囲まない — `dotenv` が読む）
- **本番**では Secret Manager 等に保存し、Cloud Run の環境変数として注入

一行化の例（macOS / Linux）:

```bash
# ファイルパス方式の JSON から 1 行 JSON を生成（確認用）
python3 -c 'import json; print(json.dumps(json.load(open("credentials/google-tts-service-account.json"))))'
```

生成した文字列を `GOOGLE_TTS_CREDENTIALS_JSON=` の右辺に貼り付けます。

---

## 3. 任意: 音声の変更

| 用途 | 声 |
|------|-----|
| Web 女性ロボット | `ja-JP-Chirp3-HD-Zephyr` |
| Web 男性ロボット | `ja-JP-Chirp3-HD-Rasalgethi` |
| Kebbi 子ども向け | `ja-JP-Chirp3-HD-Callirrhoe`（`profile: kebbi_child`） |
| 未指定 / 既定 | `GOOGLE_TTS_VOICE` または `ja-JP-Chirp3-HD-Rasalgethi` |

```bash
GOOGLE_TTS_VOICE=ja-JP-Chirp3-HD-Rasalgethi
```

Chirp 3 HD は **pitch 非対応**（API に pitch を送らない）。Kebbi は `speaking_rate: 1.08` で明るめに調整。

**料金・試聴**: [Chirp 3 HD ドキュメント](https://cloud.google.com/text-to-speech/docs/chirp3-hd) / [pricing](https://cloud.google.com/text-to-speech/pricing) — Chirp 3 HD $30/100万文字（無料枠 100万/月）。Neural2 より合成が遅い場合あり（Kebbi は prefetch で緩和）。

Web では API に `"gender": "male"` / `"female"` を渡すと上表の声が選ばれます。

---

## 4. 動作確認

```bash
curl -sf -X POST http://localhost:8080/v1/tts/synthesize \
  -H "Content-Type: application/json" \
  -d '{"text":"こんにちは、ナカナオリだよ。"}' | jq '.data.format'
```

期待: `"mp3"`

未設定時:

```bash
curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:8080/v1/tts/synthesize \
  -H "Content-Type: application/json" \
  -d '{"text":"test"}'
```

期待: `503`

---

## 5. サンプルファイル

| パス | 説明 |
|------|------|
| [config/google-tts-service-account.example.json](../config/google-tts-service-account.example.json) | サービスアカウント JSON の雛形 |
| [config/google-tts.env.example](../config/google-tts.env.example) | `.env` 追記例 |
| [.env.example](../.env.example) | ルート環境変数テンプレート |

---

## 6. セキュリティ

- サービスアカウント JSON **を Git にコミットしない**
- `.gitignore`: `.env`, `credentials/`, `*-credentials.json`
- 漏洩したキーは GCP コンソールで**キーを無効化**し、新キーを発行
- TTS 専用のサービスアカウントにし、プロジェクト全体の Owner は付与しない

---

## 7. Kebbi / Web との関係

- **Kebbi**: `TtsApi.kt` → 同一 `POST /v1/tts/synthesize`。503 時は Nuwa ロボ TTS
- **Web**: [services/web/src/lib/tts-player.ts](../services/web/src/lib/tts-player.ts) から同 API を呼び出し可能（将来 lip-sync 連携）

契約: [clients/kebbi/api-contract.md](../clients/kebbi/api-contract.md)
