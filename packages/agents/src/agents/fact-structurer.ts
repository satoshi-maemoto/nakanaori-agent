import type { SessionState } from "../orchestrator.js";
import { isLlmEnabled, loadPrompt, withRetry } from "../config.js";
import { runLlmAgentText, extractJsonFromText } from "../llm/adk-runner.js";
import type { StructuredFacts } from "../schemas.js";
import { StructuredFactsSchema } from "../schemas.js";
import { fallbackAnalyzeContradictions } from "./contradiction-analyzer.js";

const STRUCTURED_FACTS_SHAPE_EXAMPLE = `{
  "child_a": {
    "label": "子どもA",
    "facts": ["Aは〜と言った"],
    "feelings": ["Aは〜と感じた"],
    "unknowns": []
  },
  "child_b": {
    "label": "子どもB",
    "facts": ["Bは〜と言った"],
    "feelings": [],
    "unknowns": []
  },
  "agreements": [],
  "disagreements": ["AはXと言い、BはYと言っている"],
  "unknowns": ["同じ物について話しているか未確認"],
  "teacher_hints": ["二人に見せてもらい、同じ1つについて話しているか確かめる"]
}`;

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

  private buildLlmUserMessage(session: SessionState, suffix = ""): string {
    const payload = {
      child_a_label: session.child_a_label,
      child_b_label: session.child_b_label,
      turns_a: session.turns_a,
      turns_b: session.turns_b,
      instruction:
        "Structure the session for the teacher dashboard. Return JSON with child_a, child_b, agreements, disagreements, unknowns, teacher_hints.",
      required_shape: STRUCTURED_FACTS_SHAPE_EXAMPLE,
    };
    return JSON.stringify(payload, null, 2) + suffix;
  }

  private utterancesExcludingName(
    turns: SessionState["turns_a"],
    name: string | null,
  ): string[] {
    return turns
      .map((t) => t.utterance)
      .filter((u) => !name || u.trim() !== name.trim());
  }

  /** Coerce common flat LLM shapes into the expected nested schema. */
  private coalesceStructuredFacts(raw: unknown, session: SessionState): unknown {
    if (!raw || typeof raw !== "object") return raw;
    const r = raw as Record<string, unknown>;
    if (r.child_a && r.child_b) return raw;

    const factsA = this.utterancesExcludingName(
      session.turns_a,
      session.child_a_name,
    );
    const factsB = this.utterancesExcludingName(
      session.turns_b,
      session.child_b_name,
    );

    return {
      child_a: {
        label: session.child_a_label,
        facts: factsA.length ? factsA : ["（まだ話を聞いていません）"],
        feelings: [],
        unknowns: [],
      },
      child_b: {
        label: session.child_b_label,
        facts: factsB.length ? factsB : ["（まだ話を聞いていません）"],
        feelings: [],
        unknowns: [],
      },
      agreements: Array.isArray(r.agreements) ? r.agreements : [],
      disagreements: Array.isArray(r.disagreements)
        ? r.disagreements
        : Array.isArray(r.facts)
          ? (r.facts as string[])
          : [],
      unknowns: Array.isArray(r.unknowns) ? r.unknowns : [],
      teacher_hints: Array.isArray(r.teacher_hints) ? r.teacher_hints : [],
    };
  }

  private parseStructuredResponse(
    text: string,
    session: SessionState,
  ): StructuredFacts {
    const jsonStr = extractJsonFromText(text);
    const raw = JSON.parse(jsonStr);
    const coalesced = this.coalesceStructuredFacts(raw, session);
    return StructuredFactsSchema.parse(coalesced);
  }

  private async callLlmOnce(
    instruction: string,
    userMessage: string,
    session: SessionState,
  ): Promise<StructuredFacts> {
    const text = await runLlmAgentText(
      "fact_structurer",
      `${instruction}\n\nRespond with valid JSON only. No markdown fences. Top-level keys MUST be: child_a, child_b, agreements, disagreements, unknowns, teacher_hints.`,
      userMessage,
    );
    return this.parseStructuredResponse(text, session);
  }

  private async structureViaLlm(session: SessionState): Promise<StructuredFacts> {
    const instruction = loadPrompt("fact_structurer");
    const initialMessage = this.buildLlmUserMessage(session);
    const repairMessage =
      initialMessage +
      "\n\nYour previous JSON was invalid or missing child_a/child_b. " +
      "Reply with ONLY JSON matching this exact shape (fill with session content):\n" +
      STRUCTURED_FACTS_SHAPE_EXAMPLE;

    try {
      try {
        return await withRetry(() =>
          this.callLlmOnce(instruction, initialMessage, session),
        );
      } catch {
        return await this.callLlmOnce(instruction, repairMessage, session);
      }
    } catch (err) {
      if (process.env.NODE_ENV !== "production") {
        console.warn(
          "[fact_structurer] LLM parse failed, using rule fallback:",
          err instanceof Error ? err.message : err,
        );
      }
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
