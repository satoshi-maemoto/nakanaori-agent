import { AI_DISCLAIMER } from "../constants.js";
import type { SessionState } from "../orchestrator.js";
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
        label: session.child_a_label,
        utterances: session.turns_a.map((t) => t.utterance),
      },
      conversation_b: {
        label: session.child_b_label,
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
      teacher_hints: this.buildTeacherHints(structured),
    };
  }

  private resolveStructured(
    session: SessionState,
    structured?: StructuredFacts | null,
  ): StructuredFacts {
    if (structured) return structured;
    if (session.structured) {
      return StructuredFactsSchema.parse(session.structured);
    }
    return {
      child_a: { label: session.child_a_label, facts: [], feelings: [], unknowns: [] },
      child_b: { label: session.child_b_label, facts: [], feelings: [], unknowns: [] },
      agreements: [],
      disagreements: [],
      unknowns: [],
    };
  }

  private buildTimeline(session: SessionState): TeacherBrief["timeline"] {
    const events: TeacherBrief["timeline"] = [
      { at: new Date().toISOString(), event: "セッション開始" },
    ];
    for (const turn of session.turns_a) {
      events.push({
        at: new Date().toISOString(),
        event: `${session.child_a_label}: ${turn.utterance}`,
      });
    }
    for (const turn of session.turns_b) {
      events.push({
        at: new Date().toISOString(),
        event: `${session.child_b_label}: ${turn.utterance}`,
      });
    }
    events.push({ at: new Date().toISOString(), event: "ブリーフ生成" });
    return events;
  }

  private buildTeacherHints(structured: StructuredFacts): string[] {
    const hints: string[] = [];

    for (const disagreement of structured.disagreements) {
      hints.push(
        `食い違い: ${disagreement}。双方に「いつ・どこで・何があったか」をたずねてみてください`,
      );
    }
    for (const unknown of structured.unknowns) {
      hints.push(`まだ分かっていないこと: ${unknown}。一緒に確認してみてください`);
    }
    if (structured.agreements.length) {
      hints.push(
        `双方が同じと言っていること: ${structured.agreements.join("、")}。ここから話を進められます`,
      );
    }
    const hasFeelings =
      structured.child_a.feelings.length > 0 || structured.child_b.feelings.length > 0;
    if (hasFeelings) {
      hints.push("まずはお互いの気持ちを受け止めると、話しやすくなります");
    }
    if (!structured.disagreements.length && !structured.unknowns.length && !hasFeelings) {
      hints.push("双方の気持ちを聞き、和解の方法を一緒に考えてみてください");
    }

    return [...new Set(hints)];
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
