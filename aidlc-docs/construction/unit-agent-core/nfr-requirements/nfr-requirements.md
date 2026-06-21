# NFR 要件 — unit-agent-core

## スコープ

`unit-agent-core` は TypeScript ライブラリ（`@nakanaori/agents`）として `unit-api`（Node/Hono）から import される。

## 要件マトリクス

| ID | カテゴリ | 要件 | 優先度 | 検証方法 |
|----|----------|------|--------|----------|
| NFR-AC-01 | 倫理 | 出力に裁きラベル・禁止フィールドなし | P0 | プロンプト CI + schema + テスト |
| NFR-AC-02 | 倫理 | TeacherBrief に `ai_disclaimer` 必須 | P0 | pytest |
| NFR-AC-03 | 安全 | 高リスク発話で即エスカレーション | P0 | EmotionGuard テスト |
| NFR-PF-01 | 性能 | 子どもターン ADK 応答 p95 < 8秒 | P1 | staging 手動計測 |
| NFR-PF-02 | 性能 | FactStructurer + Brief 合計 < 15秒/セッション | P1 | staging |
| NFR-SC-01 | スケール | 同時セッション 5 件（MVP） | P0 | デモ十分 |
| NFR-SC-02 | スケール | ステートレスエージェント呼び出し（状態は unit-api） | P0 | 設計レビュー |
| NFR-AV-01 | 可用性 | Gemini 3回リトライ（指数バックオフ） | P0 | 実装 + テスト |
| NFR-AV-02 | 可用性 | リトライ失敗時 safe フォールバック文 | P0 | 実装 |
| NFR-SE-01 | セキュリティ | `GEMINI_API_KEY` をコード・ログに出力しない | P0 | レビュー + CI |
| NFR-SE-02 | セキュリティ | 子ども発話本文を構造化ログに含めない | P0 | unit-api ログ設計 |
| NFR-SE-03 | セキュリティ | プロンプトインジェクション対策（system prompt 固定） | P1 | プロンプト設計 |
| NFR-MA-01 | 保守 | プロンプトは `prompts/*.md` でバージョン管理 | P0 | リポジトリ |
| NFR-MA-02 | 保守 | エージェント入出力は Zod で型付け | P0 | tsc + vitest |
| NFR-MA-03 | 保守 | ADK 呼び出しは各 Agent クラスに閉じる | P0 | コードレビュー |
| NFR-TE-01 | テスト | CI: Vitest + モック LLM | P0 | GitHub Actions |
| NFR-TE-02 | テスト | 禁止語チェック `check-prompts.sh` | P0 | CI |
| NFR-LO-01 | 可観測性 | エージェント名・state・escalated をログ（unit-api 経由） | P1 | NFR-07 |
| NFR-CO-01 | コンプライアンス | セッションデータ保持 ≤ 7日（ポリシー；core は stateless） | P0 | 要件文書 |

## 性能詳細

### レイテンシ予算（1セッション・MVP）

| ステップ | 呼び出し | 目標 |
|----------|----------|------|
| 子どもAターン | EmotionGuard（ローカル） + Listener（ADK） | < 8s |
| 子どもBターン | 同上 | < 8s |
| 整理 | FactStructurer（ADK） | < 8s |
| ブリーフ | TeacherBrief（ADK） | < 8s |

**合計**: デモシナリオ（消しゴム）で 30秒以内が UX 目標。

### スループット

- MVP: 同時 5 セッション以下
- ボトルネック: Gemini API クォータ（flash モデル）
- 水平スケール: unit-api（Cloud Run）側；core はプロセス内ライブラリ

## 可用性・障害処理

```text
Gemini 呼び出し
  → 失敗: リトライ最大3回（0.5s, 1s, 2s バックオフ）
  → 全失敗: ListenerResponse フォールバック
      agent_message: 「ごめんね、いまうまく聞けなかった。もう一度話してくれる？」
      needs_more: true
  → unit-api: HTTP 200（部分成功）または 503（設定次第）
```

EmotionGuard は**ローカル完結** — Gemini 障害時もエスカレーション検知は動作。

## セキュリティ・プライバシー

| データ | 取扱い |
|--------|--------|
| 子ども発話 | SessionState 内のみ（unit-api in-memory）；ログに本文なし |
| Gemini 送信 | 発話 + システムプロンプト；GCP 経由 |
| API キー | 環境変数 / Secret Manager のみ |
| 先生ブリーフ | 裁きなし構造化データ |

## 児童安全（NAKANAORI 拡張）

- NAKANAORI-01〜04, 06 を NFR としてトレース
- エスカレーション時: 子ども向けメッセージは安心させるが**事実認定しない**
- 長期プロファイリング: unit-agent-core では行わない

## 依存 NFR（他ユニット）

| NFR | 担当ユニット |
|-----|--------------|
| Cloud Run デプロイ | unit-api, unit-devops |
| 公開 URL | unit-devops |
| セッション永続化 | unit-api |
| CORS / HTTP | unit-api |

## ハッカソン必須技術との対応

| 必須 | unit-agent-core の責務 |
|------|------------------------|
| Gemini API | ADK 経由で flash モデル呼び出し |
| ADK | Listener, Structurer, Brief を ADK Agent 化 |
| Cloud Run | 直接なし（unit-api がホスト） |
