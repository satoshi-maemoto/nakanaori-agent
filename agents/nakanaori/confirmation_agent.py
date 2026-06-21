"""Confirmation agent — read back summary for child correction."""

from nakanaori.schemas.responses import ConfirmationResult
from nakanaori.schemas.teacher_brief import ChildSide, StructuredFacts


class ConfirmationAgent:
    """Presents child-friendly summary and accepts corrections."""

    def summarize_for_child(self, child_id: str, structured: StructuredFacts) -> str:
        side: ChildSide = structured.child_a if child_id == "a" else structured.child_b
        facts = "、".join(side.facts) if side.facts else "まだないよ"
        return (
            f"こう聞いたよ。「{facts}」。"
            "違っていたら教えてね。"
        )

    def process_correction(
        self,
        child_id: str,
        correction: str,
        structured: StructuredFacts,
    ) -> ConfirmationResult:
        accepted = len(correction.strip()) > 0
        return ConfirmationResult(
            accepted=accepted,
            message="ありがとう、直したよ。" if accepted else "わかった、続けて話してね。",
        )
