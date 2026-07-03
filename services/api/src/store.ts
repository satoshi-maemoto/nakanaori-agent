// Copyright 2026 Satoshi Maemoto
// SPDX-License-Identifier: Apache-2.0

import type { SessionState } from "@nakanaori/agents";

const sessions = new Map<string, SessionState>();

export function put(session: SessionState): void {
  sessions.set(session.session_id, session);
}

export function get(sessionId: string): SessionState | undefined {
  return sessions.get(sessionId);
}

export function listAll(): SessionState[] {
  return [...sessions.values()];
}
