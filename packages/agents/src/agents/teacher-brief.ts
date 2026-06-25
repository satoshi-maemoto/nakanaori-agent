import type { SessionState } from "../orchestrator.js";
import { childDisplayLabel, overlayStructuredDisplayNames } from "../display-labels.js";
import { AI_DISCLAIMER } from "../constants.js";
import type { SessionInsights, StructuredFacts, TeacherBrief } from "../schemas.js";
import { StructuredFactsSchema } from "../schemas.js";

export class TeacherBriefAgent {
  generateBrief(session: SessionState, structured?: StructuredFacts | null): TeacherBrief {
    const facts = this.resolveStructured(session, structured);
    const insights = this.buildInsights(facts);

    return {
      session_id: session.session_id,
      urgent: session.escalated,
      ai_disclaimer: AI_DISCLAIMER,
      timeline: this.buildTimeline(session),
      conversation_a: {
        label: childDisplayLabel(session, "a"),
        utterances: session.turns_a.map((t) => t.utterance),
      },
      conversation_b: {
        label: childDisplayLabel(session, "b"),
        utterances: session.turns_b.map((t) => t.utterance),
      },
      child_a: facts.child_a,
      child_b: facts.child_b,
      agreements: facts.agreements,
      disagreements: facts.disagreements,
      unknowns: facts.unknowns,
      suggested_questions: this.suggestQuestions(facts),
      teacher_hints: insights.teacher_hints,
    };
  }

  formatEscalationBrief(session: SessionState, reason: string): TeacherBrief {
    const brief = this.generateBrief(session);
    return {
      ...brief,
      urgent: true,
      teacher_hints: [
        `早めの確認: ${reason}`,
        "子どもの安全を確認し、必要に応じて保護者・管理職に連絡する",
        ...brief.teacher_hints,
      ],
      suggested_questions: [
        `緊急: ${reason}`,
        "子どもの安全を確認し、必要に応じて保護者・管理職に連絡する",
      ],
    };
  }

  buildInsights(structured: StructuredFacts): SessionInsights {
    return {
      agreements: structured.agreements,
      disagreements: structured.disagreements,
      unknowns: structured.unknowns,
      teacher_hints:
        structured.teacher_hints.length > 0
          ? structured.teacher_hints
          : this.buildGenericHints(structured),
    };
  }

  private resolveStructured(
    session: SessionState,
    structured?: StructuredFacts | null,
  ): StructuredFacts {
    if (structured) {
      return overlayStructuredDisplayNames(structured, session);
    }
    if (session.structured) {
      return overlayStructuredDisplayNames(
        StructuredFactsSchema.parse(session.structured),
        session,
      );
    }
    if (session.analysis_snapshot) {
      return overlayStructuredDisplayNames(
        StructuredFactsSchema.parse(session.analysis_snapshot),
        session,
      );
    }
    return {
      child_a: { label: childDisplayLabel(session, "a"), facts: [], feelings: [], unknowns: [] },
      child_b: { label: childDisplayLabel(session, "b"), facts: [], feelings: [], unknowns: [] },
      agreements: [],
      disagreements: [],
      unknowns: [],
      teacher_hints: [],
    };
  }

  private buildTimeline(session: SessionState): TeacherBrief["timeline"] {
    const events: TeacherBrief["timeline"] = [
      { at: new Date().toISOString(), event: "セッション開始" },
    ];
    for (const turn of session.turns_a) {
      events.push({
        at: new Date().toISOString(),
        event: `${childDisplayLabel(session, "a")}: ${turn.utterance}`,
      });
    }
    for (const turn of session.turns_b) {
      events.push({
        at: new Date().toISOString(),
        event: `${childDisplayLabel(session, "b")}: ${turn.utterance}`,
      });
    }
    events.push({ at: new Date().toISOString(), event: "ブリーフ生成" });
    return events;
  }

  private buildGenericHints(structured: StructuredFacts): string[] {
    const hints: string[] = [];
    for (const d of structured.disagreements) {
      hints.push(`食い違い「${d}」について、双方に同じ論点を順番に聞く`);
    }
    for (const u of structured.unknowns) {
      hints.push(`不明点「${u}」を、二人そろって確認する`);
    }
    if (!hints.length) {
      hints.push("双方の気持ちを聞き、和解の方法を一緒に考える");
    }
    return hints;
  }

  private suggestQuestions(structured: StructuredFacts): string[] {
    if (structured.teacher_hints.length) {
      return structured.teacher_hints.slice(0, 5);
    }
    const questions: string[] = [];
    for (const d of structured.disagreements) {
      questions.push(`確認: ${d}`);
    }
    if (!questions.length) {
      questions.push("双方の気持ちを聞き、和解の方法を一緒に考える");
    }
    return questions;
  }
}
