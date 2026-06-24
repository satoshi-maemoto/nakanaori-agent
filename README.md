# ナカナオリ・エージェント

学校という小さな社会で、子どもたちのケンカを **裁かずに** 話を整理し、先生が公正に対応できるよう支援する AI エージェント。

**ロボットは裁かない。ただ、話を整理して先生につなぐ。**  
**主役は人。ロボットは黒子。**

[DevOps × AI Agent Hackathon 2026](https://findy.co.jp/4127/) 提出作品。

## デモ URL

_Staging デプロイ後に URL を記載_

## 構成

| コンポーネント | 技術 |
|----------------|------|
| エージェント | TypeScript + Google ADK（`@google/adk`）+ Gemini API |
| API | Hono + Node.js on Cloud Run |
| Web | React (先生ダッシュボード + 子ども UI) |
| Kebbi | sibling repo `nakanaori-kebbi`（Nuwa Android · `$NAKANAORI_KEBBI_ROOT`） |

詳細: [docs/architecture.md](docs/architecture.md)

## クイックスタート

### API

```bash
npm install
npm run build --workspace=@nakanaori/agents
npm run dev --workspace=nakanaori-api
```

`GEMINI_API_KEY` を設定すると ADK + Gemini が有効（未設定時はスタブ応答でデモ可能）。

```bash
cp .env.example .env
# .env に GEMINI_API_KEY を記入
bash scripts/dev-stack.sh
```

### Web

```bash
cd services/web && npm install && npm run dev
```

ブラウザ: http://localhost:5173

### Kebbi 実機

```bash
bash scripts/dev-stack.sh          # Mac: API :8080
bash scripts/kebbi-deploy.sh       # Kebbi: ビルド・インストール・起動
```

Kebbi 設定で API URL に **PC の LAN IP**（例 `http://192.168.11.4:8080`）を指定。詳細: [docs/kebbi-dev-guide.md](docs/kebbi-dev-guide.md)

### デモ（curl）

```bash
export API_URL=http://localhost:8080
SESSION=$(curl -s -X POST "$API_URL/v1/sessions" \
  -H "Content-Type: application/json" \
  -d '{"child_a_label":"子どもA","child_b_label":"子どもB"}' | jq -r .session_id)

curl -s -X POST "$API_URL/v1/sessions/$SESSION/child-turn" \
  -H "Content-Type: application/json" \
  -d '{"child_id":"a","utterance":"Bが私の消しゴムを取った！"}'

curl -s -X POST "$API_URL/v1/sessions/$SESSION/child-turn" \
  -H "Content-Type: application/json" \
  -d '{"child_id":"b","utterance":"落ちてたから拾っただけ！"}'

curl -s "$API_URL/v1/sessions/$SESSION/teacher-brief" | jq
```

## AI-DLC 開発

本リポジトリは [AI-DLC](https://github.com/awslabs/aidlc-workflows) ワークフローで開発します。

- 成果物: `aidlc-docs/`
- Cursor で開始: `Using AI-DLC, ...`（[AGENTS.md](AGENTS.md) 参照）

## DevOps

- CI: lint, プロンプト禁止語チェック, Vitest
- Staging: `main` への push で Cloud Run デプロイ

[docs/devops.md](docs/devops.md)

## 提出物（ハッカソン）

- [ ] 公開 GitHub リポジトリ
- [ ] デプロイ URL
- [ ] Proto Pedia 登録

[docs/hackathon-submission.md](docs/hackathon-submission.md)

## ライセンス

MIT — [LICENSE](LICENSE) を参照
