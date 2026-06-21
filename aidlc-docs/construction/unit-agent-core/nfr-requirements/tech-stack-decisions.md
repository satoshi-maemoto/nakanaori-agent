# 技術スタック決定 — unit-agent-core

## 決定サマリー

| 領域 | 選定 | 理由 |
|------|------|------|
| 言語 | **TypeScript 5.x**（Node.js 22+） | Web と同一言語；ADK TS 公式サポート；型安全 |
| LLM | Gemini `gemini-2.0-flash` | Inception 確定；低レイテンシ・コスト |
| エージェント FW | Google ADK（**`@google/adk`**） | ハッカソン必須；[adk-js](https://github.com/google/adk-js) |
| スキーマ | **Zod v3** | ADK TS の structured output；実行時検証 |
| テスト | **Vitest** + モック | Web と CI 統一；LLM モック |
| Lint | **ESLint** + TypeScript | `services/web` と共通ツールチェーン |
| プロンプト | Markdown（`prompts/*.md`） | レビュー容易；CI 禁止語チェック |
| ランタイム | Node.js（Cloud Run） | ADK TS は Node エコシステム向け |

> **変更（2026-06-21）**: 当初 Python + `google-adk` 案から **TypeScript + `@google/adk`** に変更。既存 `agents/*.py` は Code Generation で TS に置換。

## 連鎖変更（unit-api）

`services/api` は現在 Python（FastAPI）で `nakanaori` を **直接 import** している。TypeScript エージェントと整合させるため **unit-api も Node.js API に移行**する（Hono 推奨）。

| ユニット | 変更前 | 変更後 |
|----------|--------|--------|
| unit-agent-core | `agents/` Python | `packages/agents/` TypeScript |
| unit-api | `services/api/` FastAPI | `services/api/` Hono + Node |
| unit-devops | Python CI / Docker | Node CI / Docker（multi-stage） |
| unit-web-* | 変更なし | 変更なし |

## 目標ディレクトリ構成

```text
packages/agents/              # unit-agent-core
├── src/
│   ├── orchestrator.ts
│   ├── workflow.ts
│   ├── agents/
│   ├── schemas/              # Zod
│   └── prompts/              # *.md（既存を移行）
├── package.json              # @google/adk, zod
└── vitest.config.ts

services/api/                 # unit-api（Node）
├── src/
│   ├── index.ts              # Hono app
│   ├── routes/
│   └── store.ts
├── package.json              # depends on @nakanaori/agents
└── Dockerfile                # node:22-slim

services/web/                 # 変更なし
```

## ADK 統合アーキテクチャ

```text
MediationWorkflow
  └── SessionOrchestrator（TypeScript 状態機械）
  └── AgentRegistry / 直接注入
        ├── ListenerAgent      → LlmAgent + listener.md
        ├── FactStructurerAgent → LlmAgent + fact_structurer.md
        ├── ConfirmationAgent  → LlmAgent（P1）
        └── TeacherBriefAgent  → LlmAgent + teacher_brief.md
  └── EmotionGuardAgent（ルールベース — ADK 外）
```

### ADK パターン（TypeScript）

- **エージェント per 役割**（Functional Design Q5=B）
- **構造化出力**: Zod schema → ADK response schema
- **プロンプト**: `fs.readFileSync` で md 読み込み → `instruction`
- **モデル**: 全エージェント `gemini-2.0-flash`
- **ローカル開発**: `npx adk web`（任意）；ユニットテストは Vitest

## 依存関係（追加予定）

```json
// packages/agents/package.json
{
  "dependencies": {
    "@google/adk": "^1.2.0",
    "zod": "^3.23.0"
  },
  "devDependencies": {
    "vitest": "^3.0.0",
    "typescript": "^5.0.0"
  }
}
```

```json
// services/api/package.json
{
  "dependencies": {
    "@nakanaori/agents": "workspace:*",
    "hono": "^4.0.0",
    "@hono/node-server": "^1.0.0"
  }
}
```

npm workspaces（ルート `package.json`）で monorepo 管理を推奨。

## 環境変数

| 変数 | 用途 | 設定場所 |
|------|------|----------|
| `GEMINI_API_KEY` | Gemini API 認証 | Cloud Run Secret / ローカル .env |
| `GEMINI_MODEL` | モデル上書き（任意） | デフォルト `gemini-2.0-flash` |

## LLM 呼び出し戦略

| エージェント | MVP | 備考 |
|--------------|-----|------|
| Listener | ADK + Gemini | 毎ターン |
| FactStructurer | ADK + Gemini | 双方完了後1回 |
| TeacherBrief | ADK + Gemini | brief 生成時1回 |
| Confirmation | ADK + Gemini | P1 |
| EmotionGuard | 正規表現 | Phase 2: Gemini 補助オプション |

## テスト戦略

| レイヤー | 方法 |
|----------|------|
| EmotionGuard | Vitest ユニットテスト |
| Orchestrator / Workflow | モック LlmAgent で状態遷移 |
| ADK Agents | Vitest mock で Gemini レスポンス固定 |
| プロンプト | `check-prompts.sh`（言語非依存） |
| 実 Gemini | ローカル / staging 手動（CI 外） |

## 却下した代替案

| 代替 | 却下理由 |
|------|----------|
| Python + `google-adk` を維持 | ユーザー方針：TS 統一 |
| TS エージェント + Python API 併存 | import 不可；HTTP 分割は MVP に過剰 |
| `google-genai` のみ（ADK なし） | ハッカソン必須 ADK 非充足 |
| gemini-pro 混用 | Inception で flash 統一済み |

## Code Generation への引き継ぎ

1. ルート `package.json` で npm workspaces 設定
2. `packages/agents/` を新設し `agents/nakanaori/*.py` を TS 移植
3. `@google/adk` で LlmAgent 実装
4. `services/api/` を Hono + Node に書き換え
5. CI: Python job → Node job（agents + api）；web job は現状維持
6. Dockerfile: `node:22-slim` ベースに更新
7. 旧 `agents/pyproject.toml` / Python API は移行完了後に削除

## 参考リンク

- [ADK TypeScript クイックスタート](https://adk.dev/get-started/typescript)
- [google/adk-js](https://github.com/google/adk-js)
