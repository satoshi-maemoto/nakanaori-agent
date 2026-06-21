# コンポーネントメソッド

## SessionOrchestrator

| メソッド | 入力 | 出力 | 目的 |
|----------|------|------|------|
| `create_session(child_a_label, child_b_label)` | ラベル | `session_id`, `state` | 新規仲介開始 |
| `get_state(session_id)` | session_id | `SessionState` | 現在のワークフロー状態 |
| `advance(session_id, event)` | session_id, event | `SessionState` | 子どもターン、エスカレーション等で遷移 |
| `select_next_agent(session_id)` | session_id | agent_name | Listener、Structurer 等へルーティング |

## ListenerAgent

| メソッド | 入力 | 出力 | 目的 |
|----------|------|------|------|
| `listen_turn(session_id, child_id, utterance)` | session, child, text | `ListenerResponse` | 子ども1発話を処理 |
| `prompt_for_more(session_id, child_id)` | session, child | `string` | supportive な追加質問を生成 |

## EmotionGuardAgent

| メソッド | 入力 | 出力 | 目的 |
|----------|------|------|------|
| `assess_risk(utterance, context)` | text, context | `RiskAssessment` | エスカレーショントリガーをスコア |
| `should_escalate(assessment)` | assessment | `boolean` | 先生への即時通知判定 |

## FactStructurerAgent

| メソッド | 入力 | 出力 | 目的 |
|----------|------|------|------|
| `structure(session_id)` | session_id | `StructuredFacts` | 子どもごとの facts, feelings, unknowns |
| `merge_corrections(session_id, corrections)` | session, corrections | `StructuredFacts` | 子どもの訂正を反映 |

## ConfirmationAgent

| メソッド | 入力 | 出力 | 目的 |
|----------|------|------|------|
| `summarize_for_child(session_id, child_id)` | session, child | `string` | 子ども向け読み返し |
| `process_correction(session_id, child_id, correction)` | session, child, text | `ConfirmationResult` | 受け入れまたは追加詳細を要求 |

## TeacherBriefAgent

| メソッド | 入力 | 出力 | 目的 |
|----------|------|------|------|
| `generate_brief(session_id)` | session_id | `TeacherBrief` | 完全な1枚レポート |
| `format_escalation_brief(session_id, reason)` | session, reason | `TeacherBrief` | 高リスク向け緊急ブリーフ |

## ApiService（REST）

| エンドポイント | メソッド | 目的 |
|----------------|----------|------|
| `/v1/sessions` | POST | セッション作成 |
| `/v1/sessions/{id}` | GET | セッション状態取得 |
| `/v1/sessions/{id}/child-turn` | POST | 子ども発話 |
| `/v1/sessions/{id}/teacher-brief` | GET | 先生レポート |
| `/health` | GET | ヘルスチェック |

## TeacherWebApp

| メソッド / ビュー | 目的 |
|-------------------|------|
| `SessionListView` | 状態付きセッション一覧 |
| `BriefView(session_id)` | 先生ブリーフ表示 |

## ChildWebApp

| メソッド / ビュー | 目的 |
|-------------------|------|
| `ChatView(session_id, child_id)` | アバターとのテキスト会話 |
| `sendMessage(text)` | child-turn を POST |
