import { ESCALATION_PATTERNS } from "./patterns.js";
import type { RiskAssessment } from "../schemas.js";

export class EmotionGuardAgent {
  assessRisk(utterance: string): RiskAssessment {
    const text = utterance.trim();
    for (const pattern of ESCALATION_PATTERNS) {
      if (pattern.test(text)) {
        return {
          should_escalate: true,
          reason: `高リスク表現を検出: ${pattern.source}`,
          triggers: [pattern.source],
        };
      }
    }
    return { should_escalate: false, reason: null, triggers: [] };
  }

  shouldEscalate(assessment: RiskAssessment): boolean {
    return assessment.should_escalate;
  }
}
