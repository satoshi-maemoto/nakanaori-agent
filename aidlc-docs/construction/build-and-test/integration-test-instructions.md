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
実装: `/Users/maemoto/Documents/GitHub/AIxR-CharaTomo-Kebbi` の `NakanaoriApi.kt`

同一 API エンドポイント（`/v1/sessions/*`）を叩く結合テスト。
