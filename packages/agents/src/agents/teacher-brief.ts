import { AI_DISCLAIMER } from "../constants.js";
import type { SessionState } from "../orchestrator.js";
import type { StructuredFacts, TeacherBrief } from "../schemas.js";
import { StructuredFactsSchema } from "../schemas.js";

export class TeacherBriefAgent {
  generateBrief(session: SessionState, structured?: StructuredFacts | null): TeacherBrief {
    let facts = structured ?? null;
    if (!facts && session.structured) {
      facts = StructuredFactsSchema.parse(session.structured);
    }
    if (!facts) {
      facts = {
        child_a: { label: session.child_a_label, facts: [], feelings: [], unknowns: [] },
        child_b: { label: session.child_b_label, facts: [], feelings: [], unknowns: [] },
        agreements: [],
        disagreements: [],
        unknowns: [],
      };
    }

    return {
      session_id: session.session_id,
      urgent: session.escalated,
      ai_disclaimer: AI_DISCLAIMER,
      timeline: [{ at: new Date().toISOString(), event: "ブリーフ生成" }],
      child_a: facts.child_a,
      child_b: facts.child_b,
      agreements: facts.agreements,
      disagreements: facts.disagreements,
      unknowns: facts.unknowns,
      suggested_questions: this.suggestQuestions(facts),
    };
  }

  formatEscalationBrief(session: SessionState, reason: string): TeacherBrief {
    const brief = this.generateBrief(session);
    return {
      ...brief,
      urgent: true,
      suggested_questions: [
        `緊急: ${reason}`,
        "子どもの安全を確認し、必要に応じて保護者・管理職に連絡する",
      ],
    };
  }

  private suggestQuestions(structured: StructuredFacts): string[] {
    const questions: string[] = [];
    if (structured.disagreements.length) {
      questions.push("双方の認識の違いについて、事実を確認する");
    }
    if (structured.unknowns.length) {
      questions.push("不明点について、両者と一緒に確認する");
    }
    if (!questions.length) {
      questions.push("双方の気持ちを聞き、和解の方法を一緒に考える");
    }
    return questions;
  }
}
