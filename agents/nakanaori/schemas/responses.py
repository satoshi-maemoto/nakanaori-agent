"""Agent response schemas."""

from pydantic import BaseModel, Field


class ListenerResponse(BaseModel):
    agent_message: str
    needs_more: bool = False


class RiskAssessment(BaseModel):
    should_escalate: bool
    reason: str | None = None
    triggers: list[str] = Field(default_factory=list)


class ConfirmationResult(BaseModel):
    accepted: bool
    message: str
