import type { SessionState } from "../orchestrator.js";
import { isLlmEnabled, loadPrompt, withRetry } from "../config.js";
import { runLlmAgentJson } from "../llm/adk-runner.js";
import type { StructuredFacts } from "../schemas.js";
import { StructuredFactsSchema } from "../schemas.js";

export class FactStructurerAgent {
  private stubStructure(session: SessionState): StructuredFacts {
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

    const disagreements: string[] = [];
    if (factsA.length && factsB.length) {
      disagreements.push("双方の説明に食い違いがある可能性");
    }

    return {
      child_a: childA,
      child_b: childB,
      agreements: [],
      disagreements,
      unknowns: ["詳細は先生が確認する必要があります"],
    };
  }

  async structure(session: SessionState): Promise<StructuredFacts> {
    if (!isLlmEnabled()) {
      return this.stubStructure(session);
    }

    const instruction = loadPrompt("fact_structurer");
    const userMessage = JSON.stringify(
      {
        child_a_label: session.child_a_label,
        child_b_label: session.child_b_label,
        turns_a: session.turns_a,
        turns_b: session.turns_b,
      },
      null,
      2,
    );

    try {
      return await withRetry(() =>
        runLlmAgentJson("fact_structurer", instruction, userMessage, StructuredFactsSchema),
      );
    } catch {
      return this.stubStructure(session);
    }
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
