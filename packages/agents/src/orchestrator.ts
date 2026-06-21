export const AI_DISCLAIMER =
  "この整理はAIによるものです。最終的な判断は先生が行ってください。";

export const SessionStateName = {
  CREATED: "created",
  LISTENING_A: "listening_a",
  LISTENING_B: "listening_b",
  STRUCTURING: "structuring",
  CONFIRMING_A: "confirming_a",
  CONFIRMING_B: "confirming_b",
  READY_FOR_TEACHER: "ready_for_teacher",
  ESCALATED: "escalated",
  CLOSED: "closed",
} as const;

export type SessionStateName =
  (typeof SessionStateName)[keyof typeof SessionStateName];

export interface ChildTurn {
  child_id: string;
  utterance: string;
}

export interface SessionState {
  session_id: string;
  state: SessionStateName;
  child_a_label: string;
  child_b_label: string;
  child_a_name: string | null;
  child_b_name: string | null;
  turns_a: ChildTurn[];
  turns_b: ChildTurn[];
  structured: Record<string, unknown> | null;
  /** Cache key for LLM analysis snapshot (turn content hash). */
  analysis_cache_key: string | null;
  /** Latest LLM structured analysis for in-progress teacher insights. */
  analysis_snapshot: Record<string, unknown> | null;
  escalated: boolean;
  escalation_reason: string | null;
}

export class SessionOrchestrator {
  activeChild(session: SessionState): string | null {
    if (session.state === SessionStateName.LISTENING_A) return "a";
    if (session.state === SessionStateName.LISTENING_B) return "b";
    return null;
  }

  selectNextAgent(session: SessionState): string {
    if (session.escalated) return "teacher_brief";
    const mapping: Partial<Record<SessionStateName, string>> = {
      [SessionStateName.LISTENING_A]: "listener",
      [SessionStateName.LISTENING_B]: "listener",
      [SessionStateName.STRUCTURING]: "fact_structurer",
      [SessionStateName.CONFIRMING_A]: "confirmation",
      [SessionStateName.CONFIRMING_B]: "confirmation",
      [SessionStateName.READY_FOR_TEACHER]: "teacher_brief",
      [SessionStateName.ESCALATED]: "teacher_brief",
    };
    return mapping[session.state] ?? "listener";
  }

  advanceAfterTurn(session: SessionState, childId: string): SessionState {
    if (session.state === SessionStateName.LISTENING_A && childId === "a") {
      return { ...session, state: SessionStateName.LISTENING_B };
    }
    if (session.state === SessionStateName.LISTENING_B && childId === "b") {
      return { ...session, state: SessionStateName.STRUCTURING };
    }
    return session;
  }

  markEscalated(session: SessionState, reason: string): SessionState {
    return {
      ...session,
      escalated: true,
      escalation_reason: reason,
      state: SessionStateName.ESCALATED,
    };
  }

  markReadyForTeacher(session: SessionState): SessionState {
    return { ...session, state: SessionStateName.READY_FOR_TEACHER };
  }
}
