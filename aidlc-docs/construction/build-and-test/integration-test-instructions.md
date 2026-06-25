# 結合テスト手順

## ローカル API + Web

### 1. API 起動

```bash
npm run build --workspace=@nakanaori/agents
npm run build --workspace=nakanaori-api
npm run dev --workspace=nakanaori-api
```

### 2. Web 起動（別ターミナル）

```bash
cd services/web && npm install && npm run dev
```

Vite プロキシが `/v1` と `/health` を `localhost:8080` に転送。

### 3. 手動シナリオ

1. `http://localhost:5173` を開く
2. 子ども A/B 画面でセッション作成 → 発話送信
3. 先生画面で Teacher Brief を確認（`ai_disclaimer` 必須）
4. 高リスク語（例: 「殴った」）でエスカレーション確認

### 4. curl スモーク

```bash
curl -sf http://localhost:8080/health
SID=$(curl -sf -X POST http://localhost:8080/v1/sessions \
  -H "Content-Type: application/json" \
  -d '{"child_a_label":"子どもA","child_b_label":"子どもB"}' | jq -r .session_id)
curl -sf -X POST "http://localhost:8080/v1/sessions/$SID/child-turn" \
  -H "Content-Type: application/json" \
  -d '{"child_id":"a","utterance":"こんにちは"}'
```

### 5. TTS スモーク（Google 認証設定時）

設定手順: [docs/google-cloud-tts-setup.md](../../../docs/google-cloud-tts-setup.md)

```bash
curl -sf -X POST http://localhost:8080/v1/tts/synthesize \
  -H "Content-Type: application/json" \
  -d '{"text":"こんにちは、ナカナオリだよ。"}' | jq '.data.format'

# Web 女性（Chirp3-HD-Zephyr）
curl -sf -X POST http://localhost:8080/v1/tts/synthesize \
  -H "Content-Type: application/json" \
  -d '{"text":"テスト","gender":"female"}' | jq '.data.format'

# Kebbi 子ども向け（Chirp3-HD-Callirrhoe, rate 1.08）
curl -sf -X POST http://localhost:8080/v1/tts/synthesize \
  -H "Content-Type: application/json" \
  -d '{"text":"テスト","options":{"profile":"kebbi_child"}}' | jq '.data.format'
```

未設定時は `503`（Kebbi は Nuwa ロボ TTS にフォールバック）。

```bash
npm test --workspace=@nakanaori/tts
```

## Staging（Cloud Run）

`main` マージ後 `deploy-staging.yml` が:

1. `nakanaori-api` をデプロイ
2. API URL を取得して Web イメージに `VITE_API_BASE_URL` を注入
3. `nakanaori-web` をデプロイ

確認:

```bash
gcloud run services describe nakanaori-api --region asia-northeast1 --format 'value(status.url)'
gcloud run services describe nakanaori-web --region asia-northeast1 --format 'value(status.url)'
```

## Kebbi（sibling repo）

契約: `clients/kebbi/api-contract.md`  
実装: `nakanaori-kebbi`（`NakanaoriApi.kt`, `TtsApi.kt`）  
詳細手順: [docs/kebbi-dev-guide.md](../../../docs/kebbi-dev-guide.md)

### 前提

- USB 接続 + `adb devices` で実機表示
- Mac で `bash scripts/dev-stack.sh`（TTS 用 `.env` 推奨）
- Mac LAN IP を確認: `ipconfig getifaddr en0`

### デプロイ

```bash
bash scripts/kebbi-deploy.sh
# または nakanaori-kebbi で bash scripts/kebbi-deploy.sh
```

### 設定（必須）

1. 設定を開く（画面下 **⚙ 設定をひらく** / ロボット頭タップ / 「設定」と発話）
2. API URL = `http://<PC-LAN-IP>:8080`（**`127.0.0.1` 不可**）
3. 子ども A/B ラベル、**この Kebbi が 話す 子**（A または B）
4. **保存** → **← もどる**（保存後にセッション再接続）

接続確認:

```bash
adb shell curl -sf http://<PC-LAN-IP>:8080/health
```

### シナリオ

1. セッション作成 — Kebbi は API が `"client": "kebbi"` を受信していること（log / 名前登録後案内で確認）
2. ウェルカム TTS → マイク許可 → 連続 ASR
3. 子ども発話 → `agent_message` 再生（API TTS `kebbi_child` または Nuwa フォールバック）
4. 番終了 — **頭をなでる**（または「おわった」→ 頭なで）で `finish_turn: true`
5. 子B: ハンドオフ挨拶 → 腕提示 → 手案内 → 手長押しで聞き取りポーズ → ASR
6. 先生 Web `/teacher` でブリーフ確認（`ai_disclaimer` 必須）

### ログ・診断

```bash
bash scripts/kebbi-logcat.sh
bash scripts/kebbi-status.sh
adb shell run-as com.nakanaori.kebbi cat shared_prefs/nakanaori_kebbi_settings.xml
```

参照: CharaTomo-Kebbi の Nuwa AAR 配置手順（`app/libs/`）
