# Nakanaori Agent — Agent Guide

AI-DLC + GCP monorepo for **ナカナオリ・エージェント** (school conflict mediation).

## Philosophy

- 「ロボットは裁かない。ただ、話を整理して先生につなぐ。」
- 「主役は人。ロボットは黒子。」

## AI-DLC Workflow

Start in Cursor:

```text
Using AI-DLC, ナカナオリ・エージェントの Inception を続行してください。
aidlc-docs/inception/ のシード内容を検証し、requirement-verification-questions の [Answer]: を埋めてから Application Design を承認フローで進めてください。
```

Artifacts live in `aidlc-docs/`. Rules: `.cursor/rules/ai-dlc-workflow.mdc`, `.aidlc-rule-details/`.

Update AI-DLC rules: `bash scripts/setup-aidlc.sh`

## Repository Map

| Path | Purpose |
|------|---------|
| `agents/nakanaori/` | ADK agent stubs, prompts, schemas |
| `services/api/` | FastAPI on Cloud Run |
| `services/web/` | React teacher + child UI |
| `clients/kebbi/` | API contract (implementation external) |
| `aidlc-docs/` | Inception / Construction artifacts |
| `docs/` | Architecture, demo, DevOps, hackathon |
| `.cursor/rules/` | Cursor rules (product + hackathon) |

## Units of Work (Construction)

1. `unit-agent-core` — `agents/nakanaori/`
2. `unit-api` — `services/api/`
3. `unit-web-teacher` / `unit-web-child` — `services/web/src/teacher`, `child`
4. `unit-devops` — `.github/workflows/`, `scripts/`
5. `unit-kebbi-contract` — `clients/kebbi/api-contract.md`

## Kebbi (Sibling Repository)

- **Path**: `/Users/maemoto/Documents/GitHub/AIxR-CharaTomo-Kebbi`
- **Contract**: `clients/kebbi/api-contract.md`
- Do **not** use CharaTomo `POST /api/v1/llm/chat`
- When API changes: update contract here + implement `NakanaoriApi.kt` in Kebbi repo

## Local Development

```bash
# Agents tests
cd agents && pip install -e ".[dev]" && pytest -q

# API
cd agents && pip install -e .
cd ../services/api && pip install -e . && uvicorn nakanaori_api.main:app --reload --port 8080

# Web
cd services/web && npm install && npm run dev

# Prompt check
bash scripts/check-prompts.sh
```

## GCP

- Runtime: Cloud Run (`asia-northeast1` default)
- AI: Gemini API + ADK (wire in agent stubs)
- Secret: `GEMINI_API_KEY` via Secret Manager in staging

## Ethics (mandatory)

See `.cursor/rules/nakanaori-product.mdc` and `.aidlc-rule-details/extensions/child-safety/nakanaori/`.

- No judgment labels in outputs
- Escalate violence/bullying/self-harm immediately
- Teacher brief always includes AI disclaimer

## Hackathon

- Event: DevOps × AI Agent Hackathon 2026
- Deadline: 2026-07-10
- Checklist: `docs/hackathon-submission.md`
- Demo script: `docs/demo-scenario.md`
