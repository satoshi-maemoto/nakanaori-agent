"""Fact structurer — separates facts, feelings, and unknowns."""

from nakanaori.orchestrator import SessionState
from nakanaori.schemas.teacher_brief import ChildSide, StructuredFacts


class FactStructurerAgent:
    """Builds neutral structured facts from both children's turns."""

    def structure(self, session: SessionState) -> StructuredFacts:
        facts_a = [t.utterance for t in session.turns_a]
        facts_b = [t.utterance for t in session.turns_b]

        child_a = ChildSide(
            label=session.child_a_label,
            facts=facts_a or ["（まだ話を聞いていません）"],
            feelings=[],
            unknowns=[],
        )
        child_b = ChildSide(
            label=session.child_b_label,
            facts=facts_b or ["（まだ話を聞いていません）"],
            feelings=[],
            unknowns=[],
        )

        disagreements: list[str] = []
        if facts_a and facts_b:
            disagreements.append("双方の説明に食い違いがある可能性")

        return StructuredFacts(
            child_a=child_a,
            child_b=child_b,
            agreements=[],
            disagreements=disagreements,
            unknowns=["詳細は先生が確認する必要があります"],
        )

    def merge_corrections(
        self,
        structured: StructuredFacts,
        child_id: str,
        correction: str,
    ) -> StructuredFacts:
        side = structured.child_a if child_id == "a" else structured.child_b
        side.facts.append(f"（修正）{correction}")
        return structured
