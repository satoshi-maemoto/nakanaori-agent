import type { SessionState } from "../orchestrator.js";
import { isLlmEnabled, loadPrompt, withRetry } from "../config.js";
import { runLlmAgentJson } from "../llm/adk-runner.js";
import type { StructuredFacts } from "../schemas.js";
import { StructuredFactsSchema } from "../schemas.js";
import { fallbackAnalyzeContradictions } from "./contradiction-analyzer.js";

export class FactStructurerAgent {
  /** LLM analysis (or rule fallback when API key absent). */
  async analyzeSession(session: SessionState): Promise<StructuredFacts> {
    if (!isLlmEnabled()) {
      return this.buildFallbackStructure(session);
    }
    return this.structureViaLlm(session);
  }

  /** @deprecated sync preview — prefer analyzeSession */
  buildPreviewStructure(session: SessionState): StructuredFacts {
    return this.buildFallbackStructure(session);
  }

  async structure(session: SessionState): Promise<StructuredFacts> {
    return this.analyzeSession(session);
  }

  private async structureViaLlm(session: SessionState): Promise<StructuredFacts> {
    const instruction = loadPrompt("fact_structurer");
    const userMessage = JSON.stringify(
      {
        child_a_label: session.child_a_label,
        child_b_label: session.child_b_label,
        turns_a: session.turns_a,
        turns_b: session.turns_b,
        instruction:
          "Extract specific disagreements and teacher_hints for the teacher dashboard. Return JSON matching the schema.",
      },
      null,
      2,
    );

    try {
      return await withRetry(() =>
        runLlmAgentJson("fact_structurer", instruction, userMessage, StructuredFactsSchema),
      );
    } catch {
      return this.buildFallbackStructure(session);
    }
  }

  /** Rule-based fallback when LLM is unavailable or errors. */
  private buildFallbackStructure(session: SessionState): StructuredFacts {
    const factsA = session.turns_a.map((t) => t.utterance);
    const factsB = session.turns_b.map((t) => t.utterance);

    const childA = {
      label: session.child_a_label,
      facts: factsA.length ? factsA : ["（まだ話を聞いていません）"],
      feelings: [] as string[],
      unknowns: [] as string[],
    };
    const childB = {
      label: session.child_b_label,
      facts: factsB.length ? factsB : ["（まだ話を聞いていません）"],
      feelings: [] as string[],
      unknowns: [] as string[],
    };

    const fallback = fallbackAnalyzeContradictions(session);

    return {
      child_a: childA,
      child_b: childB,
      agreements: fallback.agreements,
      disagreements: fallback.disagreements,
      unknowns: fallback.unknowns,
      teacher_hints: fallback.teacher_hints,
    };
  }

  mergeCorrections(
    structured: StructuredFacts,
    childId: string,
    correction: string,
  ): StructuredFacts {
    const side = childId === "a" ? structured.child_a : structured.child_b;
    return {
      ...structured,
      [childId === "a" ? "child_a" : "child_b"]: {
        ...side,
        facts: [...side.facts, `（修正）${correction}`],
      },
    };
  }
}
