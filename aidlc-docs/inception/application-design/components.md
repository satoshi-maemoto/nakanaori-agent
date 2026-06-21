# Components

## Agent Layer (ADK + Gemini)

| Component | Responsibility |
|-----------|----------------|
| SessionOrchestrator | Workflow state machine; selects next agent; manages session lifecycle |
| ListenerAgent | Individual child hearing; supportive prompts; collects utterances |
| EmotionGuardAgent | Monitors for escalation triggers; pauses workflow on high risk |
| FactStructurerAgent | Builds fact/feeling/unknown structure from both sides |
| ConfirmationAgent | Presents summary to child; processes corrections |
| TeacherBriefAgent | Generates teacher one-page brief with disclaimer |

## Service Layer

| Component | Responsibility |
|-----------|----------------|
| ApiService | FastAPI on Cloud Run; REST endpoints; auth (demo mode MVP) |
| SessionStore | Persists session state (Firestore or in-memory for demo) |

## Client Layer

| Component | Responsibility |
|-----------|----------------|
| TeacherWebApp | Dashboard: session list, brief view, escalation alerts |
| ChildWebApp | Web avatar UI: talk to robot, see responses |
| KebbiClient | Sibling repo Android app; HTTP client to ApiService |

## Infrastructure

| Component | Responsibility |
|-----------|----------------|
| CloudRunDeployment | API and web container deployment |
| CICDPipeline | GitHub Actions: lint, test, prompt check, deploy staging |
