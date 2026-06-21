const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

export type SessionState = {
  session_id: string;
  state: string;
  child_a_label: string;
  child_b_label: string;
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
};

export type TeacherBrief = {
  session_id: string;
  urgent: boolean;
  ai_disclaimer: string;
  timeline: Array<{ at: string; event: string }>;
  child_a: ChildSide;
  child_b: ChildSide;
  agreements: string[];
  disagreements: string[];
  unknowns: string[];
  suggested_questions: string[];
};

type ChildSide = {
  label: string;
  facts: string[];
  feelings: string[];
  unknowns: string[];
};

export async function createSession(
  childA = "子どもA",
  childB = "子どもB",
): Promise<SessionState> {
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
): Promise<ChildTurnResponse> {
  const res = await fetch(`${API_BASE}/v1/sessions/${sessionId}/child-turn`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ child_id: childId, utterance }),
  });
  if (!res.ok) throw new Error(`child-turn failed: ${res.status}`);
  return res.json();
}

export async function getTeacherBrief(sessionId: string): Promise<TeacherBrief> {
  const res = await fetch(`${API_BASE}/v1/sessions/${sessionId}/teacher-brief`);
  if (!res.ok) throw new Error(`teacher-brief failed: ${res.status}`);
  return res.json();
}
