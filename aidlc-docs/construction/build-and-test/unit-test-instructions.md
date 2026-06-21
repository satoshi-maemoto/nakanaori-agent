# ユニットテスト実行

## 対象

| パッケージ | フレームワーク | テストファイル |
|------------|----------------|----------------|
| `@nakanaori/agents` | Vitest | `packages/agents/src/workflow.test.ts` |

## 実行

```bash
npm run test --workspace=@nakanaori/agents
```

ルートから:

```bash
npm test
```

## 内容

- セッション作成
- 子ども A/B のターン処理（LLM キーなし = スタブ）
- 高リスク発話のエスカレーション（EmotionGuard）

## CI

`.github/workflows/ci.yml` の `agents-and-api` ジョブで自動実行。

## 注意

- `GEMINI_API_KEY` 未設定でも CI は通る（スタブ応答）
- 実 LLM 連携の手動確認は integration-test-instructions を参照
