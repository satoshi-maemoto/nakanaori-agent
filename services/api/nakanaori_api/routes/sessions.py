"""Session creation and status."""

import uuid

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from nakanaori.orchestrator import SessionStateName
from nakanaori.workflow import MediationWorkflow
from nakanaori_api.store import get, put

router = APIRouter(tags=["sessions"])
workflow = MediationWorkflow()


class CreateSessionRequest(BaseModel):
    child_a_label: str = "子どもA"
    child_b_label: str = "子どもB"


class SessionResponse(BaseModel):
    session_id: str
    state: str
    child_a_label: str
    child_b_label: str
    active_child: str | None = None
    escalated: bool = False
    urgent: bool = False


def _to_response(session) -> SessionResponse:
    active = workflow.orchestrator.active_child(session)
    return SessionResponse(
        session_id=session.session_id,
        state=session.state.value,
        child_a_label=session.child_a_label,
        child_b_label=session.child_b_label,
        active_child=active,
        escalated=session.escalated,
        urgent=session.escalated,
    )


@router.post("/sessions", status_code=201, response_model=SessionResponse)
def create_session(body: CreateSessionRequest) -> SessionResponse:
    session_id = str(uuid.uuid4())
    session = workflow.create_session(
        session_id,
        child_a_label=body.child_a_label,
        child_b_label=body.child_b_label,
    )
    put(session)
    return _to_response(session)


@router.get("/sessions/{session_id}", response_model=SessionResponse)
def get_session(session_id: str) -> SessionResponse:
    session = get(session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="session not found")
    return _to_response(session)
