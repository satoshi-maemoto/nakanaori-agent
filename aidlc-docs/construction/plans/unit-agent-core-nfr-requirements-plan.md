# unit-agent-core NFR Requirements 計画

## チェックリスト

- [x] Functional Design 成果物を分析
- [x] スケーラビリティ・性能・可用性・セキュリティの NFR 質問を作成
- [x] Inception / Functional Design 確定事項から回答
- [x] `nfr-requirements.md` を生成
- [x] `tech-stack-decisions.md` を生成
- [x] 人間による NFR Requirements 承認（2026-06-21 — TypeScript + 一括 Code Generation）

## NFR 質問

### Q1: 想定同時セッション数（ハッカソン MVP）は？

- [A] 1〜5（デモ・審査）
- [B] 10〜50（小規模パイロット）
- [C] 100+（本番想定）

[Answer]:A

### Q2: 子ども1ターン（Listener ADK 呼び出し）の目標レイテンシは？

- [A] < 3秒（p95）
- [B] < 8秒（p95）
- [C] ベストエフォート（デモのみ）

[Answer]:B — 教室デモで許容；Gemini flash 前提

### Q3: Gemini API 障害時のフォールバックは？

- [A] 固定 safe 文言 + エラー返却（仲介続行不可）
- [B] ルールベーススタブ応答でデモ継続
- [C] リトライ3回のみ

[Answer]:C — 3回リトライ後は子ども向け safe メッセージと API 503（unit-api 連携）

### Q4: 子ども発話のログ記録方針は？

- [A] 全文を Cloud Logging（staging）
- [B] session_id + 文字数 + エージェント名のみ（本文マスク）
- [C] ログなし（MVP）

[Answer]:B — 児童プライバシー配慮；エスカレーション時は reason のみ

### Q5: ADK / SDK 選定は？

- [A] `@google/adk`（TypeScript）+ Zod
- [B] `google-adk`（Python）+ Pydantic
- [C] Vertex AI Agent Engine

[Answer]:A — TypeScript 統一（2026-06-21 変更）。ハッカソン必須 ADK；[adk-js](https://github.com/google/adk-js)

### Q6: ユニットテスト方針（ADK 導入後）は？

- [A] オーケストレーション + EmotionGuard はユニットテスト；LLM はモック
- [B] 統合テストのみ（実 Gemini、CI ではスキップ）
- [C] 両方

[Answer]:C — CI はモック；手動/staging で実 Gemini スモーク

## 承認

NFR Requirements — ユーザー承認済み。Code Generation（TypeScript 移行）完了（2026-06-21）。
