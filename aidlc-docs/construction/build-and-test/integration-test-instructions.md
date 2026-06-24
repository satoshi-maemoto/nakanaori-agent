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

## Kebbi（private repo）

契約: `clients/kebbi/api-contract.md`  
実装: `/Users/maemoto/Documents/GitHub/nakanaori-kebbi`（`NakanaoriApi.kt`, `TtsApi.kt`）

1. monorepo で `bash scripts/dev-stack.sh`（TTS 用 `.env` 推奨）
2. Kebbi 設定 → API URL = PC の LAN IP（例 `http://192.168.1.10:8080`）
3. 実機で起動 → ウェルカム TTS → 音声入力 → `agent_message` 再生
4. 「おわり」で `finish_turn: true`
5. 先生 Web `/teacher` で同一セッション確認

参照: CharaTomo-Kebbi の Nuwa AAR 配置手順
