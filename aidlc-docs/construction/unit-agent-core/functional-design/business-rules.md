# ビジネスルール — unit-agent-core

## 倫理ルール（NAKANAORI 拡張）

| ルール ID | 内容 | unit-agent-core での実装 |
|-----------|------|--------------------------|
| NAKANAORI-01 | 裁きラベル禁止 | プロンプト CI；スキーマに `guilty_party` 等なし；出力検証 |
| NAKANAORI-02 | 事実・感情・不明点の分離 | FactStructurer / TeacherBrief スキーマ強制 |
| NAKANAORI-03 | 高リスク即時エスカレーション | EmotionGuard → escalated；自律的解決しない |
| NAKANAORI-04 | 人間（先生）が判断者 | `AI_DISCLAIMER` 定数；TeacherBrief 必須フィールド |
| NAKANAORI-06 | 黒子ペルソナ | Listener / Confirmation プロンプト；lecture 禁止 |

## 禁止出力（ハード制約）

以下の語・フィールドは**生成・保存・返却してはならない**:

- 日本語: 悪い子, 悪い方, 有罪, 勝ち, 負け
- 英語: guilty, at_fault, verdict, winner
- スキーマフィールド: `guilty_party`, `verdict`, `winner`, `punishment_recommendation`

`scripts/check-prompts.sh` が CI でブロック。

## セッション状態遷移ルール

| 現在状態 | イベント | 次状態 | 条件 |
|----------|--------|--------|------|
| listening_a | 子どもAターン完了 | listening_b | エスカレーションなし |
| listening_b | 子どもBターン完了 | structuring | エスカレーションなし |
| structuring | 整理完了 | ready_for_teacher | MVP（確認スキップ） |
| * | 高リスク検出 | escalated | いつでも |
| ready_for_teacher | 先生確認完了 | closed | unit-api / 先生 UI（将来） |

**P1 追加遷移**（設計保留）:

- structuring → confirming_a → confirming_b → ready_for_teacher

## EmotionGuard ルール（MVP）

### 即時エスカレーショントリガー（ルールベース）

現行パターン（`packages/agents/src/agents/emotion-guard.ts`）:

- 暴力: 殴った, 殴って, 殺す, 怪我, 血が
- いじめ: いじめ
- 自傷: 自殺, 死にたい

### エスカレーション時の振る舞い

1. `session.escalated = true`
2. `session.state = escalated`
3. 子ども向けメッセージ: 「大丈夫？先生を呼ぶね。」（固定または ADK 生成だが裁きなし）
4. FactStructurer / Confirmation は**実行しない**
5. TeacherBrief は `urgent=true`、理由を `suggested_questions` に含める

## Listener ルール

| ルール | 説明 |
|--------|------|
| L-01 | 日本語のみ、小学校向け短文 |
| L-02 | 1子どもずつ。相手の子どもを名指しで非難しない |
| L-03 | 感情の承認: 「そうだったんだね」「話してくれてありがとう」 |
| L-04 | 正誤判断・処罰示唆禁止 |
| L-05 | `needs_more=true` の間は同一 child の listening 状態を維持（P1 API 連携） |

## FactStructurer ルール

| ルール | 説明 |
|--------|------|
| F-01 | facts は観察可能・報告ベース（「A は〜と言った」） |
| F-02 | feelings は「〜と感じた」形式 |
| F-03 | unknowns は確認されていない点のみ |
| F-04 | disagreements は双方の食い違いを中立的に記載 |
| F-05 | agreements は双方が一致した点（空でも可） |

## TeacherBrief ルール

| ルール | 説明 |
|--------|------|
| T-01 | `ai_disclaimer` は常に含める（定数 `AI_DISCLAIMER`） |
| T-02 | `suggested_questions` は先生への確認質問（処罰提案ではない） |
| T-03 | `urgent` は escalated セッションで true |
| T-04 | timeline はセッション主要イベントを時系列で |

## 検証ルール（出力）

| 検証 | タイミング | 失敗時 |
|------|------------|--------|
| Pydantic schema 検証 | 各エージェント出力 | リトライまたは安全なフォールバック文 |
| 禁止語スキャン | プロンプト変更時（CI） | マージブロック |
| 必須フィールド | TeacherBrief 生成時 | 生成失敗として扱う |

## ChildNavigator ルール

| ルール | 説明 |
|--------|------|
| CN-01 | ウェルカムで 1回め / 2回め の順番を説明 |
| CN-02 | 名前登録後、`client_channel` に応じた番終了案内（Web＝ボタン、Kebbi＝頭なで） |
| CN-03 | 裁き・勝敗・処罰の示唆を含めない |
| CN-04 | 子B ハンドオフ時は前の子への感謝 + 名前収集 |

## MVP vs P1 スコープ

| 機能 | MVP (P0) | P1 |
|------|----------|-----|
| ヒアリング（A→B） | ✓ | |
| EmotionGuard（ルール） | ✓ | Gemini 補助 |
| 事実整理 | ✓（ADK） | |
| 確認ループ | 設計のみ | ✓ |
| needs_more によるターン継続 | 簡略（1ターン/人） | ✓ |
