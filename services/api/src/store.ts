import type { SessionState } from "@nakanaori/agents";

const sessions = new Map<string, SessionState>();

export function put(session: SessionState): void {
  sessions.set(session.session_id, session);
}

export function get(sessionId: string): SessionState | undefined {
  return sessions.get(sessionId);
}
