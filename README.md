# ナカナオリ・エージェント

[![CI](https://github.com/satoshi-maemoto/nakanaori-agent/actions/workflows/ci.yml/badge.svg)](https://github.com/satoshi-maemoto/nakanaori-agent/actions/workflows/ci.yml)
[![Deploy Staging](https://github.com/satoshi-maemoto/nakanaori-agent/actions/workflows/deploy-staging.yml/badge.svg)](https://github.com/satoshi-maemoto/nakanaori-agent/actions/workflows/deploy-staging.yml)

学校という小さな社会で、子どもたちのケンカを **裁かずに** 話を整理し、先生が公正に対応できるよう支援する AI エージェント。

**ロボットは裁かない。ただ、話を整理して先生につなぐ。**  
**主役は人。ロボットは黒子。**

[DevOps × AI Agent Hackathon 2026](https://findy.co.jp/4127/) 提出作品。

## Staging デプロイ

`main` への push で Cloud Run（`nakanaori-api` / `nakanaori-web`）へ自動デプロイされます。

**デモ URL は README には掲載しません** — ハッカソン事務局への別途連絡用です。URL の確認方法は [docs/hackathon-staging-deploy.md](docs/hackathon-staging-deploy.md) を参照してください。

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
# ステージング（既定）— Cloud Run API を adb で Kebbi に設定
bash scripts/kebbi-deploy.sh

# ローカル dev-stack 向け
bash scripts/dev-stack.sh          # 別ターミナル
bash scripts/kebbi-deploy.sh local

# URL だけ切替 / 設定画面を adb で開く
bash scripts/kebbi-use-staging.sh
bash scripts/kebbi-use-local.sh
bash scripts/kebbi-open-settings.sh
```

接続先の既定: [config/kebbi-targets.env](config/kebbi-targets.env)（staging Web URL から API URL を自動導出）。詳細: [docs/kebbi-dev-guide.md](docs/kebbi-dev-guide.md)

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
- Staging: `main` への push で Cloud Run デプロイ（`GEMINI_API_KEY` / `GOOGLE_TTS_CREDENTIALS_JSON` は Secret Manager で任意注入）

[docs/devops.md](docs/devops.md)

## 提出物（ハッカソン）

- [ ] 公開 GitHub リポジトリ
- [x] Staging デプロイ（URL は事務局へ別途連絡 — [手順](docs/hackathon-staging-deploy.md)）
- [ ] Proto Pedia 登録（[文案](docs/proto-pedia-draft.md)）
- [ ] 3分デモ動画（[台本](docs/demo-video-script.md)）

[docs/hackathon-submission.md](docs/hackathon-submission.md) · [docs/hackathon-appeal-plan.md](docs/hackathon-appeal-plan.md)

## ライセンス

| 対象 | ライセンス |
|------|------------|
| **ソースコード** | [Apache License 2.0](LICENSE) — [NOTICE](NOTICE) を同梱 |
| **ドキュメント・デモ素材** | [CC BY 4.0](docs/CONTENT-LICENSE.md) |
| **VRM モデル** | VRoid Project サンプル（[models/README.md](services/web/public/models/README.md)） |

再利用時は LICENSE / NOTICE の著作権表示を残してください。
