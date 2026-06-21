import type { StructuredFacts } from "../schemas.js";
import type { ConfirmationResult } from "../schemas.js";

export class ConfirmationAgent {
  summarizeForChild(childId: string, structured: StructuredFacts): string {
    const side = childId === "a" ? structured.child_a : structured.child_b;
    const facts = side.facts.length ? side.facts.join("、") : "まだないよ";
    return `こう聞いたよ。「${facts}」。違っていたら教えてね。`;
  }

  processCorrection(
    _childId: string,
    correction: string,
    _structured: StructuredFacts,
  ): ConfirmationResult {
    const accepted = correction.trim().length > 0;
    return {
      accepted,
      message: accepted ? "ありがとう、直したよ。" : "わかった、続けて話してね。",
    };
  }
}
