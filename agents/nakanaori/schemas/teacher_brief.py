"""Pydantic schemas for teacher brief and structured facts."""

from pydantic import BaseModel, Field


class ChildSide(BaseModel):
    label: str
    facts: list[str] = Field(default_factory=list)
    feelings: list[str] = Field(default_factory=list)
    unknowns: list[str] = Field(default_factory=list)


class TimelineEvent(BaseModel):
    at: str
    event: str


class StructuredFacts(BaseModel):
    child_a: ChildSide
    child_b: ChildSide
    agreements: list[str] = Field(default_factory=list)
    disagreements: list[str] = Field(default_factory=list)
    unknowns: list[str] = Field(default_factory=list)


class TeacherBrief(BaseModel):
    session_id: str
    urgent: bool = False
    ai_disclaimer: str
    timeline: list[TimelineEvent] = Field(default_factory=list)
    child_a: ChildSide
    child_b: ChildSide
    agreements: list[str] = Field(default_factory=list)
    disagreements: list[str] = Field(default_factory=list)
    unknowns: list[str] = Field(default_factory=list)
    suggested_questions: list[str] = Field(default_factory=list)
