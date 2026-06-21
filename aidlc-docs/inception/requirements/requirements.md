# Requirements — Nakanaori Agent

## Intent Analysis

### Product Vision

**ナカナオリ・エージェント** is an AI agent that helps children resolve minor conflicts in school by listening to each party, organizing what happened, and preparing a structured brief for the teacher. The AI does not judge who is right or wrong.

**Core philosophy**:

- 「ロボットは裁かない。ただ、話を整理して先生につなぐ。」
- 「主役は人。ロボットは黒子。」

### Problem Statement

| Problem | Description |
|---------|-------------|
| Minor verbal arguments | Small-scale conflicts happen frequently in classrooms |
| Emotions block communication | Children are too upset to explain clearly to each other or adults |
| Teacher overload | Teachers are called every time, creating high workload |

### Target Users

| User | Role |
|------|------|
| Child A / Child B | Conflict parties who need a calm listener |
| Teacher | Makes final decisions; receives organized brief |
| School administrator | Future: oversight and policy (out of MVP scope) |

### Core Workflow

1. **Intervention** — Conflict detected or child requests help
2. **Parallel listening** — Separate sessions with Child A and Child B
3. **Fact structuring** — Separate facts, feelings, and unknowns (no judgment)
4. **Confirmation loop** — Read back summary; children can correct
5. **Teacher handoff** — One-page brief delivered to teacher dashboard

### Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-01 | Create mediation session with two child participants | P0 |
| FR-02 | Conduct individual listening sessions per child | P0 |
| FR-03 | Structure output into facts, feelings, unknowns | P0 |
| FR-04 | Confirmation loop with child correction | P1 |
| FR-05 | Generate teacher brief (timeline, both sides, agreements/disagreements) | P0 |
| FR-06 | Escalate immediately on violence/bullying/self-harm indicators | P0 |
| FR-07 | Web avatar UI for children | P1 |
| FR-08 | Teacher dashboard for brief review | P1 |
| FR-09 | Kebbi robot as physical avatar (sibling repo) | P2 |
| FR-10 | Speech-to-Text / Text-to-Speech integration | P3 |

### Non-Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-01 | No judgment labels in any system output | P0 |
| NFR-02 | Child session data retention ≤ 7 days default | P0 |
| NFR-03 | Teacher brief includes AI disclaimer | P0 |
| NFR-04 | Deploy on Google Cloud Run | P0 |
| NFR-05 | Use Gemini API via ADK | P0 |
| NFR-06 | CI/CD with prompt forbidden-word checks | P0 |
| NFR-07 | Structured logging for agent transitions | P1 |
| NFR-08 | Staging environment with public demo URL | P0 |

### Hackathon Context

- **Event**: DevOps × AI Agent Hackathon 2026
- **Submission deadline**: 2026-07-10
- **Required tech**: Google Cloud Run + Gemini API / ADK
- **Judging criteria**: Agent centrality, approach, usability, practical value, implementation quality

### Out of Scope (MVP)

- Automated punishment or reward decisions
- Long-term behavioral profiling of children
- Parent notification
- Multi-school tenancy
- Integration with school information systems

### Constraints

- Kebbi Android client lives in sibling repo `AIxR-CharaTomo-Kebbi`
- Do not use CharaTomo `POST /api/v1/llm/chat` — session-based API only
- GCP standalone architecture (not AIxR platform extension)
