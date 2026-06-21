# Nakanaori Ethics Extension

Rules for the Nakanaori Agent — a non-judgmental conflict mediation assistant for children.

## Rule: NAKANAORI-01 — No Judgment Labels

**Rule**: The system must never label a child as "bad", "wrong", "guilty", "at fault", or assign moral blame in any output (prompts, API responses, teacher briefs, UI text).

**Verification**:

- Prompt files in `agents/nakanaori/prompts/` contain no judgment labels
- API response schemas exclude fields like `guilty_party`, `winner`, `verdict`
- `scripts/check-prompts.sh` passes in CI
- Teacher brief uses neutral framing: "A felt...", "B said..."

## Rule: NAKANAORI-02 — Fact vs Emotion Separation

**Rule**: Structured outputs must separate observable facts, reported feelings, and unresolved questions.

**Verification**:

- `TeacherBrief` schema includes `facts`, `feelings`, `unknowns` sections
- FactStructurerAgent output validates against schema
- No mixing of "X is wrong because..." in facts section

## Rule: NAKANAORI-03 — Immediate Escalation for High Risk

**Rule**: Violence, bullying, self-harm, or abuse indicators must trigger immediate teacher escalation. The AI must not attempt to resolve these autonomously.

**Verification**:

- EmotionGuardAgent detects escalation triggers
- Session state transitions to `escalated` without completing mediation
- Teacher receives urgent notification flag in brief

## Rule: NAKANAORI-04 — Human is the Decision Maker

**Rule**: All teacher briefs and UI must state that the AI organizes information only; the teacher makes final decisions.

**Verification**:

- Teacher dashboard displays disclaimer text
- TeacherBrief includes `ai_disclaimer` field
- No automated punishment or reward recommendations

## Rule: NAKANAORI-05 — Data Retention Limits

**Rule**: Child session data must be short-lived. Default retention is 7 days unless teacher archives for records.

**Verification**:

- Infrastructure docs specify retention policy
- Firestore/session TTL or cleanup job documented
- No long-term child behavioral profiling

## Rule: NAKANAORI-06 — Kuroko Persona

**Rule**: The robot/avatar persona supports and organizes; it does not dominate the conversation or perform as authority figure.

**Verification**:

- Listener prompts use supportive, calm tone
- UI copy reflects "主役は人。ロボットは黒子。"
- Robot speaks to facilitate, not to lecture
