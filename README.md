# ナカナオリ・エージェント

[![CI](https://github.com/satoshi-maemoto/nakanaori-agent/actions/workflows/ci.yml/badge.svg)](https://github.com/satoshi-maemoto/nakanaori-agent/actions/workflows/ci.yml)
[![Deploy Staging](https://github.com/satoshi-maemoto/nakanaori-agent/actions/workflows/deploy-staging.yml/badge.svg)](https://github.com/satoshi-maemoto/nakanaori-agent/actions/workflows/deploy-staging.yml)

学校という小さな社会で、子どもたちのケンカを **裁かずに** 話を整理し、先生が公正に対応できるよう支援する AI エージェント。

**ロボットは裁かない。ただ、話を整理して先生につなぐ。**  
**主役は人。ロボットは黒子。**

[DevOps × AI Agent Hackathon 2026](https://findy.co.jp/4127/) 提出作品。

## デモ URL

| サービス | URL |
|----------|-----|
| Web（トップ） | https://nakanaori-web-370062202060.asia-northeast1.run.app/ |
| Web（子ども） | https://nakanaori-web-370062202060.asia-northeast1.run.app/child |
| Web（先生） | https://nakanaori-web-370062202060.asia-northeast1.run.app/teacher |
| API health | https://nakanaori-api-370062202060.asia-northeast1.run.app/health |

初回デプロイ手順: [docs/hackathon-staging-deploy.md](docs/hackathon-staging-deploy.md)（**別 Cloud Run** — `nakanaori-api` / `nakanaori-web`）

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

**同一 LAN のタブレット等** から先生・子ども UI にアクセスする場合:

```text
http://<MacのLAN-IP>:5173/child
http://<MacのLAN-IP>:5173/teacher
```

`dev-stack` 起動時に LAN URL を表示します。`VITE_API_BASE_URL` は **空のまま**（Vite プロキシ経由）。Mac ファイアウォールで Node の受信を許可してください。

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

### デモ（curl — 順番取り合い）

台本: [docs/examples/turn-order-story-dialogue.md](docs/examples/turn-order-story-dialogue.md)

```bash
export API_URL=http://localhost:8080
SESSION=$(curl -s -X POST "$API_URL/v1/sessions" \
  -H "Content-Type: application/json" \
  -d '{"child_a_label":"ゆうき","child_b_label":"けんた"}' | jq -r .session_id)

curl -s -X POST "$API_URL/v1/sessions/$SESSION/child-turn" \
  -H "Content-Type: application/json" \
  -d '{"child_id":"a","utterance":"左のブランコぼくが先なのにけんたが割り込んだ。"}'

curl -s -X POST "$API_URL/v1/sessions/$SESSION/child-turn" \
  -H "Content-Type: application/json" \
  -d '{"child_id":"b","utterance":"右のブランコぼくが先。ゆうきくん左の方怒鳴ってただけ。"}'

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
- [x] デプロイ URL（[staging 手順](docs/hackathon-staging-deploy.md)）
- [ ] Proto Pedia 登録（[文案](docs/proto-pedia-draft.md)）
- [ ] 3分デモ動画（[台本](docs/demo-video-script.md)）

[docs/hackathon-submission.md](docs/hackathon-submission.md) · [docs/hackathon-appeal-plan.md](docs/hackathon-appeal-plan.md)

## ライセンス

MIT — [LICENSE](LICENSE) を参照
