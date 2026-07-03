// Copyright 2026 Satoshi Maemoto
// SPDX-License-Identifier: Apache-2.0

/** Structured JSON logs for Cloud Logging (Operations / まわす). */

export type AgentLogEvent =
  | "session.created"
  | "session.child_turn"
  | "session.escalated"
  | "session.ready_for_teacher"
  | "session.insights_refresh";

export type AgentLogFields = {
  event: AgentLogEvent;
  session_id: string;
  state: string;
  previous_state?: string;
  agent_name?: string;
  escalated?: boolean;
  child_id?: string;
  finish_turn?: boolean;
  escalation_reason?: string | null;
  client_channel?: string;
};

function shouldLog(): boolean {
  const level = (process.env.LOG_LEVEL ?? "INFO").toUpperCase();
  return level !== "OFF" && level !== "SILENT";
}

/** Emit one JSON line to stdout (Cloud Run → Cloud Logging jsonPayload). */
export function logAgentEvent(fields: AgentLogFields): void {
  if (!shouldLog()) return;

  const payload = {
    severity: fields.escalated ? "WARNING" : "INFO",
    service: "nakanaori-api",
    git_sha: process.env.GIT_SHA ?? null,
    timestamp: new Date().toISOString(),
    ...fields,
  };

  console.log(JSON.stringify(payload));
}

export function logServiceStart(port: number, hostname: string): void {
  if (!shouldLog()) return;
  console.log(
    JSON.stringify({
      severity: "INFO",
      service: "nakanaori-api",
      event: "service.start",
      git_sha: process.env.GIT_SHA ?? null,
      hostname,
      port,
      llm_enabled: Boolean(
        process.env.GEMINI_API_KEY ?? process.env.GOOGLE_GENAI_API_KEY,
      ),
      timestamp: new Date().toISOString(),
    }),
  );
}
