# Requirement Verification Questions

Fill in each `[Answer]:` tag below. AI-DLC will not proceed to Construction until all answers are complete.

## Deployment & Environment

### Q1: Primary deployment target for hackathon demo?

- [A] Cloud Run only (API + static web on same service)
- [B] Cloud Run API + separate Cloud Run web service
- [C] Cloud Run API + Firebase Hosting for web

[Answer]:

### Q2: GCP project and region preference?

- [A] asia-northeast1 (Tokyo)
- [B] us-central1
- [C] Other (specify)

[Answer]:

## Session & Data

### Q3: Session state storage for MVP?

- [A] Firestore
- [B] In-memory only (demo; no persistence)
- [C] ADK session state only

[Answer]:

### Q4: Child data retention period?

- [A] 7 days (default per ethics rules)
- [B] 24 hours (demo only)
- [C] Until teacher archives

[Answer]:

## Client Priority

### Q5: Which client should be demo-ready first for 7/10 submission?

- [A] Teacher dashboard + text-based child UI (web)
- [B] API only with demo script / curl
- [C] Kebbi physical robot demo (requires sibling repo work)

[Answer]:

## Authentication

### Q6: Authentication for hackathon MVP?

- [A] No auth (demo mode with session IDs)
- [B] Simple teacher password / API key
- [C] Firebase Auth

[Answer]:

## Language

### Q7: Primary language for child interaction?

- [A] Japanese only
- [B] Japanese + English
- [C] Configurable per school

[Answer]:

## Escalation

### Q8: How should teacher receive urgent escalation?

- [A] Flag on dashboard only (teacher polls)
- [B] Dashboard + optional email (future)
- [C] Real-time WebSocket push to teacher UI

[Answer]:
