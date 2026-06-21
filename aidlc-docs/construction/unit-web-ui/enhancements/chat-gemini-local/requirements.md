# ENH-UI-03 — 子どもチャット UX + ローカル Gemini 接続

## メタデータ

| 項目 | 内容 |
|------|------|
| **Enhancement ID** | ENH-UI-03 |
| **ユニット** | `unit-web-ui` + `unit-api` + `unit-agent-core`（モデル） |
| **種別** | Enhancement |
| **状態** | ✅ 完了（2026-06-21） |
| **関連コミット** | `ef6380c` 以降の未コミット変更含む |

## 背景

ローカルデモ検証で以下が判明した。

1. **Gemini 404** — デフォルト `gemini-2.0-flash` が API から廃止され、ADK が空応答 → UI に返答なし
2. **日本語 IME** — macOS Chrome で変換確定 Enter が送信トリガーになり、文が分割送信される
3. **400 エラー** — 1 発話ごとに次の子へ進む設計のため、分割送信 + 続き入力で `ready_for_teacher` 後に 400
4. **環境変数** — `.env` サンプルと API からの読込が未整備
5. **文言** — サブタイトルを「あんしんして はなしてね。」に簡素化

## ユーザー要求（要約）

- Gemini と実際に繋げる設定
- 日本語入力中 Enter で送信されないように
- 400 エラー解消
- ドキュメント反映

## 受け入れ基準

| ID | 基準 | 状態 |
|----|------|------|
| AC-LLM-01 | デフォルトモデル `gemini-2.5-flash`（2.0-flash 廃止対応） | ✅ |
| AC-LLM-02 | ADK `errorCode` / 空応答でフォールバック文言 | ✅ |
| AC-LLM-03 | `.env.example` + API `load-env.ts` + dev-stack `.env` 読込 | ✅ |
| AC-CH-04 | IME 変換中 Enter は送信しない | ✅ |
| AC-CH-05 | 「おくる」= 同じ子の番で複数発話可 | ✅ |
| AC-CH-06 | 「つぎの ばん」= `finish_turn: true` で次の子へ | ✅ |
| AC-CH-07 | 相手の番への送信は API が 400 + わかりやすい `detail` | ✅ |
| AC-CH-08 | サブタイトル「あんしんして はなしてね。」 | ✅ |
| AC-VRM-11 | VRM カメラ: head ボーン注視 + 顔より 3% 下（ENH-UI-01 追記） | ✅ |

## API 変更

### `POST /v1/sessions/:id/child-turn`

```json
{
  "child_id": "a",
  "utterance": "太郎くんが消しゴム取った",
  "finish_turn": false
}
```

| フィールド | 説明 |
|------------|------|
| `utterance` | 発話（`finish_turn: true` かつ空の場合は番移行のみ） |
| `finish_turn` | `true` で listening_a → b → structuring へ進行 |

**バリデーション**: `active_child` と `child_id` 不一致 → `400` + `いまは ○○ の番です`

## 子ども UI 操作（1 台デモ）

1. **おくる** — 同じ子の番のまま会話継続（LLM 応答あり）
2. **つぎの ばん** — 話し終えて次の子へ（発話なしでも可）

## ローカル Gemini 設定

```bash
cp .env.example .env
# GEMINI_API_KEY=... を記入
bash scripts/dev-stack.sh
```

| 変数 | 用途 |
|------|------|
| `GEMINI_API_KEY` | ADK + Gemini（必須で LLM 有効） |
| `GEMINI_MODEL` | 省略時 `gemini-2.5-flash` |

## 実装ファイル

| パス | 内容 |
|------|------|
| `packages/agents/src/config.ts` | デフォルトモデル 2.5-flash |
| `packages/agents/src/llm/adk-runner.ts` | errorCode / 空応答 throw |
| `packages/agents/src/index.ts` | `finishTurn` オプション |
| `services/api/src/app.ts` | active_child 検証、`finish_turn` |
| `services/api/src/load-env.ts` | dotenv 読込 |
| `services/web/src/child/ChildView.tsx` | IME + 2 ボタン |
| `services/web/src/lib/child-copy.ts` | 文言 |
| `scripts/dev-stack.sh` | API 起動待ち → Web |
| `.env.example` | サンプル |

## 検証

- `npm run test --workspace=@nakanaori/agents`
- `scripts/verify-browser.mjs`（「つぎの ばん」含む）
