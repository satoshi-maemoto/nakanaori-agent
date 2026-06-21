"""Child turn endpoint."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from nakanaori.orchestrator import SessionStateName
from nakanaori.workflow import MediationWorkflow
from nakanaori_api.store import get, put

router = APIRouter(tags=["child-turn"])
workflow = MediationWorkflow()


class ChildTurnRequest(BaseModel):
    child_id: str = Field(pattern="^[ab]$")
    utterance: str = Field(min_length=1)


class ChildTurnResponse(BaseModel):
    session_id: str
    state: str
    agent_message: str
    escalated: bool
    done_with_child: bool = False


@router.post("/sessions/{session_id}/child-turn", response_model=ChildTurnResponse)
def child_turn(session_id: str, body: ChildTurnRequest) -> ChildTurnResponse:
    session = get(session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="session not found")

    if session.state in (SessionStateName.CLOSED, SessionStateName.READY_FOR_TEACHER):
        raise HTTPException(status_code=400, detail="session not accepting turns")

    session, agent_message, escalated = workflow.process_child_turn(
        session,
        body.child_id,
        body.utterance,
    )
    put(session)

    done = session.state in (
        SessionStateName.READY_FOR_TEACHER,
        SessionStateName.ESCALATED,
    )

    return ChildTurnResponse(
        session_id=session.session_id,
        state=session.state.value,
        agent_message=agent_message,
        escalated=escalated or session.escalated,
        done_with_child=done,
    )
