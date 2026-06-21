"""Teacher brief endpoint."""

from fastapi import APIRouter, HTTPException

from nakanaori.orchestrator import SessionStateName
from nakanaori.schemas.teacher_brief import TeacherBrief
from nakanaori.workflow import MediationWorkflow
from nakanaori_api.store import get

router = APIRouter(tags=["teacher-brief"])
workflow = MediationWorkflow()

ALLOWED_STATES = {
    SessionStateName.READY_FOR_TEACHER,
    SessionStateName.ESCALATED,
}


@router.get("/sessions/{session_id}/teacher-brief", response_model=TeacherBrief)
def teacher_brief(session_id: str) -> TeacherBrief:
    session = get(session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="session not found")

    if session.state not in ALLOWED_STATES:
        raise HTTPException(
            status_code=400,
            detail=f"brief not ready; state is {session.state.value}",
        )

    return workflow.get_teacher_brief(session)
