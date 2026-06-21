"""Session state and workflow orchestration."""

from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


class SessionStateName(str, Enum):
    CREATED = "created"
    LISTENING_A = "listening_a"
    LISTENING_B = "listening_b"
    STRUCTURING = "structuring"
    CONFIRMING_A = "confirming_a"
    CONFIRMING_B = "confirming_b"
    READY_FOR_TEACHER = "ready_for_teacher"
    ESCALATED = "escalated"
    CLOSED = "closed"


class ChildTurn(BaseModel):
    child_id: str
    utterance: str


class SessionState(BaseModel):
    session_id: str
    state: SessionStateName
    child_a_label: str = "子どもA"
    child_b_label: str = "子どもB"
    turns_a: list[ChildTurn] = Field(default_factory=list)
    turns_b: list[ChildTurn] = Field(default_factory=list)
    structured: dict[str, Any] | None = None
    escalated: bool = False
    escalation_reason: str | None = None


class SessionOrchestrator:
    """Manages mediation session lifecycle and agent routing."""

    def active_child(self, session: SessionState) -> str | None:
        if session.state == SessionStateName.LISTENING_A:
            return "a"
        if session.state == SessionStateName.LISTENING_B:
            return "b"
        return None

    def select_next_agent(self, session: SessionState) -> str:
        if session.escalated:
            return "teacher_brief"
        mapping = {
            SessionStateName.LISTENING_A: "listener",
            SessionStateName.LISTENING_B: "listener",
            SessionStateName.STRUCTURING: "fact_structurer",
            SessionStateName.CONFIRMING_A: "confirmation",
            SessionStateName.CONFIRMING_B: "confirmation",
            SessionStateName.READY_FOR_TEACHER: "teacher_brief",
            SessionStateName.ESCALATED: "teacher_brief",
        }
        return mapping.get(session.state, "listener")

    def advance_after_turn(self, session: SessionState, child_id: str) -> SessionState:
        if session.state == SessionStateName.LISTENING_A and child_id == "a":
            session.state = SessionStateName.LISTENING_B
        elif session.state == SessionStateName.LISTENING_B and child_id == "b":
            session.state = SessionStateName.STRUCTURING
        return session

    def mark_escalated(self, session: SessionState, reason: str) -> SessionState:
        session.escalated = True
        session.escalation_reason = reason
        session.state = SessionStateName.ESCALATED
        return session

    def mark_ready_for_teacher(self, session: SessionState) -> SessionState:
        session.state = SessionStateName.READY_FOR_TEACHER
        return session
