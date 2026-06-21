"""Emotion guard — escalation detection for high-risk content."""

import re

from nakanaori.schemas.responses import RiskAssessment

# Triggers requiring immediate teacher escalation (not autonomous resolution)
ESCALATION_PATTERNS = [
    r"殺す",
    r"殴った",
    r"殴って",
    r"いじめ",
    r"自殺",
    r"死にたい",
    r"怪我",
    r"血が",
]


class EmotionGuardAgent:
    """Assesses utterances for violence, bullying, self-harm, abuse signals."""

    def assess_risk(self, utterance: str) -> RiskAssessment:
        text = utterance.strip()
        for pattern in ESCALATION_PATTERNS:
            if re.search(pattern, text):
                return RiskAssessment(
                    should_escalate=True,
                    reason=f"高リスク表現を検出: {pattern}",
                    triggers=[pattern],
                )
        return RiskAssessment(should_escalate=False, reason=None, triggers=[])

    def should_escalate(self, assessment: RiskAssessment) -> bool:
        return assessment.should_escalate
