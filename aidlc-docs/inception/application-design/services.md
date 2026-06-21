# Services

## MediationWorkflowService

Orchestrates the end-to-end mediation flow.

**Responsibilities**:

- Create sessions and assign initial state (`created` → `listening_a` / `listening_b`)
- After each child turn: invoke EmotionGuard → Listener → check escalation
- When both sides heard: invoke FactStructurer → Confirmation (per child) → TeacherBrief
- On escalation: skip mediation completion; generate escalation brief

**Interactions**:

- Calls SessionOrchestrator for state transitions
- Delegates to ADK agents via agent registry
- Writes to SessionStore

## BriefDeliveryService

Delivers teacher briefs to dashboard.

**Responsibilities**:

- Store generated `TeacherBrief` on session
- Mark `ready_for_teacher` or `escalated`
- Expose via GET `/v1/sessions/{id}/teacher-brief`

## PromptGovernanceService

Ensures output compliance with Nakanaori ethics.

**Responsibilities**:

- Validate agent outputs against forbidden judgment labels
- Run in CI via `scripts/check-prompts.sh`
- Block deployment if prompts violate NAKANAORI-01

## DeploymentService (Operations)

**Responsibilities**:

- Build Docker images for api and web
- Deploy to Cloud Run staging on merge to main
- Configure environment variables (Gemini API key via Secret Manager)
