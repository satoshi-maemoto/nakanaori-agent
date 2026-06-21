# Component Methods

## SessionOrchestrator

| Method | Input | Output | Purpose |
|--------|-------|--------|---------|
| `create_session(child_a_label, child_b_label)` | labels | `session_id`, `state` | Start new mediation |
| `get_state(session_id)` | session_id | `SessionState` | Current workflow state |
| `advance(session_id, event)` | session_id, event | `SessionState` | Transition on child turn, escalation, etc. |
| `select_next_agent(session_id)` | session_id | agent_name | Route to Listener, Structurer, etc. |

## ListenerAgent

| Method | Input | Output | Purpose |
|--------|-------|--------|---------|
| `listen_turn(session_id, child_id, utterance)` | session, child, text | `ListenerResponse` | Process one child utterance |
| `prompt_for_more(session_id, child_id)` | session, child | `string` | Generate supportive follow-up question |

## EmotionGuardAgent

| Method | Input | Output | Purpose |
|--------|-------|--------|---------|
| `assess_risk(utterance, context)` | text, context | `RiskAssessment` | Score escalation triggers |
| `should_escalate(assessment)` | assessment | `boolean` | Immediate teacher alert |

## FactStructurerAgent

| Method | Input | Output | Purpose |
|--------|-------|--------|---------|
| `structure(session_id)` | session_id | `StructuredFacts` | facts, feelings, unknowns per child |
| `merge_corrections(session_id, corrections)` | session, corrections | `StructuredFacts` | Apply child corrections |

## ConfirmationAgent

| Method | Input | Output | Purpose |
|--------|-------|--------|---------|
| `summarize_for_child(session_id, child_id)` | session, child | `string` | Child-friendly readback |
| `process_correction(session_id, child_id, correction)` | session, child, text | `ConfirmationResult` | Accept or request more detail |

## TeacherBriefAgent

| Method | Input | Output | Purpose |
|--------|-------|--------|---------|
| `generate_brief(session_id)` | session_id | `TeacherBrief` | Full one-page report |
| `format_escalation_brief(session_id, reason)` | session, reason | `TeacherBrief` | Urgent brief for high-risk |

## ApiService (REST)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/v1/sessions` | POST | Create session |
| `/v1/sessions/{id}` | GET | Session state |
| `/v1/sessions/{id}/child-turn` | POST | Child utterance |
| `/v1/sessions/{id}/teacher-brief` | GET | Teacher report |
| `/health` | GET | Health check |

## TeacherWebApp

| Method / View | Purpose |
|---------------|---------|
| `SessionListView` | List sessions with status |
| `BriefView(session_id)` | Display teacher brief |

## ChildWebApp

| Method / View | Purpose |
|---------------|---------|
| `ChatView(session_id, child_id)` | Text conversation with avatar |
| `sendMessage(text)` | POST child-turn |
