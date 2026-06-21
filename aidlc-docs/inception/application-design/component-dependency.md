# Component Dependencies

## Dependency Matrix

| From | To | Relationship |
|------|-----|--------------|
| ChildWebApp | ApiService | HTTP REST |
| TeacherWebApp | ApiService | HTTP REST |
| KebbiClient | ApiService | HTTP REST (sibling repo) |
| ApiService | MediationWorkflowService | Internal |
| MediationWorkflowService | SessionOrchestrator | Internal |
| MediationWorkflowService | ADK Agents | Agent calls |
| SessionOrchestrator | SessionStore | Read/write state |
| ADK Agents | Gemini API | LLM inference |
| EmotionGuardAgent | MediationWorkflowService | Escalation signal |
| TeacherBriefAgent | BriefDeliveryService | Brief storage |

## Communication Patterns

```mermaid
flowchart LR
    subgraph clients [Clients]
        ChildUI[ChildWebApp]
        TeacherUI[TeacherWebApp]
        Kebbi[KebbiClient]
    end

    subgraph api [ApiService]
        Routes[REST_Routes]
        Workflow[MediationWorkflowService]
    end

    subgraph agents [ADK_Agents]
        Orchestrator[SessionOrchestrator]
        Agents[Listener_Structurer_Brief_Guard]
    end

    subgraph external [External]
        Gemini[Gemini_API]
        Store[SessionStore]
    end

    ChildUI --> Routes
    TeacherUI --> Routes
    Kebbi --> Routes
    Routes --> Workflow
    Workflow --> Orchestrator
    Workflow --> Agents
    Orchestrator --> Store
    Agents --> Gemini
```

## Data Flow

1. **Child turn**: Client → POST child-turn → Workflow → Guard → Listener → Store
2. **Structure**: Both heard → Structurer → Store structured facts
3. **Confirm**: Confirmation per child → corrections → Structurer merge
4. **Brief**: TeacherBrief → Store → GET teacher-brief → Teacher UI
5. **Escalate**: Guard triggers → escalate state → escalation brief → Teacher UI

## Kebbi Boundary

- KebbiClient is **not** in this repository
- Contract defined in `clients/kebbi/api-contract.md`
- Reference implementation: `AIxR-CharaTomo-Kebbi` (adapt, do not copy CharaTomo chat flow)
