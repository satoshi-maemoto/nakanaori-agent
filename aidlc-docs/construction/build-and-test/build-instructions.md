# ビルド手順

## 前提

- **Node.js**: 22.x
- **npm**: workspaces（ルート `package.json`）
- **環境変数**（API 実行時）:
  - `GEMINI_API_KEY` または `GOOGLE_GENAI_API_KEY` — 省略時は LLM スタブ
  - `PORT` — デフォルト 8080

## 手順

### 1. 依存関係インストール

```bash
npm ci
```

### 2. エージェント + API ビルド

```bash
npm run build --workspace=@nakanaori/agents
npm run build --workspace=nakanaori-api
```

### 3. Web ビルド（任意）

```bash
cd services/web && npm install && npm run build
```

本番向け API URL を埋め込む場合:

```bash
VITE_API_BASE_URL=https://nakanaori-api-xxx.run.app npm run build
```

### 4. Docker イメージ

```bash
# API（リポジトリルートから）
docker build -f services/api/Dockerfile -t nakanaori-api .

# Web
docker build -f services/web/Dockerfile \
  --build-arg VITE_API_BASE_URL=http://localhost:8080 \
  -t nakanaori-web services/web
```

## 成功時の成果物

| パス | 内容 |
|------|------|
| `packages/agents/dist/` | `@nakanaori/agents` コンパイル出力 |
| `services/api/dist/` | Hono API サーバー |
| `services/web/dist/` | 静的 SPA（Vite） |

## トラブルシュート

- **`@nakanaori/agents` が見つからない** — ルートで `npm ci` 後、agents を先にビルド
- **プロンプトが読めない** — agents ビルドが `dist/prompts` をコピーする。`npm run build --workspace=@nakanaori/agents` を再実行
