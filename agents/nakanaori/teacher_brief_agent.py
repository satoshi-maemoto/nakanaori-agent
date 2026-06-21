"""Teacher brief agent — one-page report for the teacher."""

from datetime import datetime, timezone

from nakanaori.orchestrator import SessionState
from nakanaori.schemas.teacher_brief import ChildSide, StructuredFacts, TeacherBrief, TimelineEvent

AI_DISCLAIMER = (
    "この整理はAIによるものです。最終的な判断は先生が行ってください。"
)


class TeacherBriefAgent:
    """Generates neutral teacher brief without judgment labels."""

    def generate_brief(
        self,
        session: SessionState,
        structured: StructuredFacts | None = None,
    ) -> TeacherBrief:
        if structured is None and session.structured:
            structured = StructuredFacts.model_validate(session.structured)

        if structured is None:
            structured = StructuredFacts(
                child_a=ChildSide(label=session.child_a_label, facts=[], feelings=[], unknowns=[]),
                child_b=ChildSide(label=session.child_b_label, facts=[], feelings=[], unknowns=[]),
                agreements=[],
                disagreements=[],
                unknowns=[],
            )

        return TeacherBrief(
            session_id=session.session_id,
            urgent=session.escalated,
            ai_disclaimer=AI_DISCLAIMER,
            timeline=[
                TimelineEvent(
                    at=datetime.now(timezone.utc).isoformat(),
                    event="ブリーフ生成",
                ),
            ],
            child_a=structured.child_a,
            child_b=structured.child_b,
            agreements=structured.agreements,
            disagreements=structured.disagreements,
            unknowns=structured.unknowns,
            suggested_questions=self._suggest_questions(structured),
        )

    def format_escalation_brief(self, session: SessionState, reason: str) -> TeacherBrief:
        brief = self.generate_brief(session)
        brief.urgent = True
        brief.suggested_questions = [
            f"緊急: {reason}",
            "子どもの安全を確認し、必要に応じて保護者・管理職に連絡する",
        ]
        return brief

    def _suggest_questions(self, structured: StructuredFacts) -> list[str]:
        questions: list[str] = []
        if structured.disagreements:
            questions.append("双方の認識の違いについて、事実を確認する")
        if structured.unknowns:
            questions.append("不明点について、両者と一緒に確認する")
        if not questions:
            questions.append("双方の気持ちを聞き、和解の方法を一緒に考える")
        return questions
