# unit-agent-core Functional Design 計画

## チェックリスト

- [x] ユニット定義とストーリーマッピングを分析（US-02, US-05 ほか）
- [x] ビジネスロジック・ドメイン・ルールに関する設計質問を作成
- [x] Inception 確定事項から設計質問に回答
- [x] `business-logic-model.md` を生成
- [x] `business-rules.md` を生成
- [x] `domain-entities.md` を生成
- [x] 人間による Functional Design 承認（2026-06-21）

## 設計質問

### Q1: 子ども1人あたりのヒアリング終了条件（MVP）は？

- [A] 固定ターン数（例: 各2ターン）で自動遷移
- [B] Listener が `needs_more=false` を返したら遷移（ADK 判断）
- [C] 子どもが「もうない」と明示したら遷移

[Answer]:B — ADK Listener が `needs_more` で判断。MVP では最低1ターン必須

### Q2: 確認ループ（confirming_a/b）は MVP で必須か？

- [A] P0 — structuring 後に必ず確認してから brief
- [B] P1 — MVP は structuring → ready_for_teacher を省略可；Phase 1.5 で追加
- [C] スキップ — デモでは確認なし

[Answer]:B — US-03 は P1。MVP ワークフローは listening → structuring → ready_for_teacher。ConfirmationAgent は実装するが API 経由の確認フローは P1

### Q3: EmotionGuard の実装方式（MVP）は？

- [A] ルールベース（正規表現）のみ — 高速・決定的
- [B] Gemini のみ — 文脈理解
- [C] ハイブリッド — ルールで即時エスカレーション + Gemini で補助（将来）

[Answer]:C — MVP はルールベース（現行 `ESCALATION_PATTERNS`）を P0。Gemini 補助は Phase 2

### Q4: FactStructurer の感情抽出形式は？

- [A] 子ども発話から「〜と感じた」形式に正規化（NAKANAORI-02）
- [B] 生の発話を facts に入れ、feelings は空でも可（MVP 簡略）
- [C] 必ず facts / feelings / unknowns を各1件以上

[Answer]:A — ADK + プロンプトで「〜と感じた」形式を生成。スキーマ検証で分離を強制

### Q5: ADK エージェント構成は？

- [A] 1 ADK Agent + ツール切替（単一エントリ）
- [B] エージェントごとに ADK Agent インスタンス + SessionOrchestrator がルーティング
- [C] ADK SequentialAgent / ワークフローで全自動

[Answer]:B — 既存 SessionOrchestrator のルーティングを維持。各エージェントを ADK Agent に置換

### Q6: Gemini モデルと出力形式は？

- [A] 全エージェント `gemini-2.0-flash`、構造化出力は Pydantic schema
- [B] エージェントごとにモデル分離

[Answer]:A — Application Design 確定事項

## 承認

Functional Design 成果物 — ユーザー承認済み（2026-06-21）。
