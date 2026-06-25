# Build and Test サマリー

## ステータス（2026-06-21）

| 項目 | 状態 |
|------|------|
| ビルド（agents + api） | ✅ ローカル・CI 通過 |
| ユニットテスト（Vitest） | ✅ agents + tts |
| プロンプト禁止語チェック | ✅ `scripts/check-prompts.sh` |
| Web TypeScript チェック | ✅ CI `web` ジョブ |
| TTS（Google Cloud） | ✅ Chirp 3 HD — Zephyr / Rasalgethi / Callirrhoe |
| Kebbi クライアント（sibling） | ✅ ENH-KEBBI-02（client / ハンドオフ prefetch） |
| クライアントチャネル | ✅ Web vs Kebbi finish 案内分岐 |
| 結合テスト（手動） | 📋 手順書あり |
| Staging デプロイ | 📋 workflow 準備済（GCP secrets 要） |
| E2E 自動化 | ⏸ MVP 外 |
| パフォーマンステスト | ⏸ MVP 外 |

## クイックコマンド

```bash
npm ci
npm run build --workspace=@nakanaori/agents
npm run build --workspace=nakanaori-api
npm run test --workspace=@nakanaori/agents
bash scripts/check-prompts.sh
```

## 関連ドキュメント

- [build-instructions.md](./build-instructions.md)
- [unit-test-instructions.md](./unit-test-instructions.md)
- [integration-test-instructions.md](./integration-test-instructions.md)
- [docs/devops.md](../../../docs/devops.md)
- [docs/kebbi-dev-guide.md](../../../docs/kebbi-dev-guide.md)

## 次のステップ

1. GCP Secrets 設定後、`main` で staging デプロイ
2. `GEMINI_API_KEY` 付きで実 LLM スモーク
3. Kebbi 実機 E2E — 子B ハンドオフ・頭なで finish・Web 案内混入なし
4. Kebbi sibling repo との契約テスト
