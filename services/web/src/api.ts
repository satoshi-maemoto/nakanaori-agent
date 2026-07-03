// Copyright 2026 Satoshi Maemoto
// SPDX-License-Identifier: Apache-2.0

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

export { API_BASE };

export type SessionState = {
  session_id: string;
  state: string;
  child_a_label: string;
  child_b_label: string;
  child_a_name?: string | null;
  child_b_name?: string | null;
  welcome_message?: string;
  active_child?: string;
  escalated?: boolean;
  urgent?: boolean;
};

export type ChildTurnResponse = {
  session_id: string;
  state: string;
  agent_message: string;
  escalated: boolean;
  done_with_child: boolean;
  child_a_name?: string | null;
  child_b_name?: string | null;
  child_a_label?: string;
  child_b_label?: string;
};

export type TeacherBrief = {
  session_id: string;
  urgent: boolean;
  ai_disclaimer: string;
  timeline: Array<{ at: string; event: string }>;
  conversation_a: { label: string; utterances: string[] };
  conversation_b: { label: string; utterances: string[] };
  child_a: ChildSide;
  child_b: ChildSide;
  agreements: string[];
  disagreements: string[];
  unknowns: string[];
  suggested_questions: string[];
  teacher_hints: string[];
};

type ChildSide = {
  label: string;
  facts: string[];
  feelings: string[];
  unknowns: string[];
};

export type SessionInsights = {
  agreements: string[];
  disagreements: string[];
  unknowns: string[];
  teacher_hints: string[];
};

export type SessionProgress = {
  session_id: string;
  state: string;
  child_a_label: string;
  child_b_label: string;
  child_a_name?: string | null;
  child_b_name?: string | null;
  active_child: string | null;
  escalated: boolean;
  urgent: boolean;
  brief_ready: boolean;
  turns_a: Array<{ child_id: string; utterance: string }>;
  turns_b: Array<{ child_id: string; utterance: string }>;
  escalation_reason: string | null;
  insights: SessionInsights;
};

export async function listSessions(): Promise<SessionState[]> {
  const res = await fetch(`${API_BASE}/v1/sessions`);
  if (!res.ok) throw new Error(`listSessions failed: ${res.status}`);
  const data = (await res.json()) as { sessions: SessionState[] };
  return data.sessions;
}

export async function getSessionProgress(sessionId: string): Promise<SessionProgress> {
  const res = await fetch(`${API_BASE}/v1/sessions/${sessionId}/progress`);
  if (!res.ok) throw new Error(`session progress failed: ${res.status}`);
  return res.json();
}

export async function createSession(
  childA = "子どもA",
  childB = "子どもB",
): Promise<SessionState & { welcome_message: string }> {
  const res = await fetch(`${API_BASE}/v1/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ child_a_label: childA, child_b_label: childB }),
  });
  if (!res.ok) throw new Error(`createSession failed: ${res.status}`);
  return res.json();
}

export async function postChildTurn(
  sessionId: string,
  childId: string,
  utterance: string,
  options?: { finishTurn?: boolean },
): Promise<ChildTurnResponse> {
  const res = await fetch(`${API_BASE}/v1/sessions/${sessionId}/child-turn`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      child_id: childId,
      utterance,
      finish_turn: options?.finishTurn ?? false,
    }),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { detail?: string };
    throw new Error(body.detail ?? `child-turn failed: ${res.status}`);
  }
  return res.json();
}

export async function getTeacherBrief(sessionId: string): Promise<TeacherBrief> {
  const res = await fetch(`${API_BASE}/v1/sessions/${sessionId}/teacher-brief`);
  if (!res.ok) throw new Error(`teacher-brief failed: ${res.status}`);
  return res.json();
}
