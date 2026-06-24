import { randomUUID } from "node:crypto";
import {
  MediationWorkflow,
  SessionStateName,
  type SessionState,
} from "@nakanaori/agents";
import { Hono } from "hono";
import { cors } from "hono/cors";
import * as store from "./store.js";
import { handleTtsSynthesize } from "./routes/tts.js";

const workflow = new MediationWorkflow();

function toResponse(session: SessionState) {
  return {
    session_id: session.session_id,
    state: session.state,
    child_a_label: session.child_a_label,
    child_b_label: session.child_b_label,
    child_a_name: session.child_a_name,
    child_b_name: session.child_b_name,
    active_child: workflow.orchestrator.activeChild(session),
    escalated: session.escalated,
    urgent: session.escalated,
  };
}

export const app = new Hono();

app.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type"],
  }),
);

app.get("/", (c) =>
  c.json({
    service: "nakanaori-api",
    philosophy: "主役は人。ロボットは黒子。",
  }),
);

app.get("/health", (c) => c.json({ status: "ok" }));

app.post("/v1/tts/synthesize", handleTtsSynthesize);

app.get("/v1/sessions", (c) => {
  const items = store
    .listAll()
    .filter((s) => s.state !== SessionStateName.CLOSED)
    .map(toResponse);
  return c.json({ sessions: items });
});

app.post("/v1/sessions", async (c) => {
  const body = await c.req.json<{ child_a_label?: string; child_b_label?: string }>();
  const sessionId = randomUUID();
  const session = workflow.createSession(
    sessionId,
    body.child_a_label ?? "子どもA",
    body.child_b_label ?? "子どもB",
  );
  store.put(session);
  return c.json(
    {
      ...toResponse(session),
      welcome_message: workflow.getSessionWelcome(),
    },
    201,
  );
});

app.get("/v1/sessions/:sessionId", (c) => {
  const session = store.get(c.req.param("sessionId"));
  if (!session) return c.json({ detail: "session not found" }, 404);
  return c.json(toResponse(session));
});

app.post("/v1/sessions/:sessionId/child-turn", async (c) => {
  const sessionId = c.req.param("sessionId");
  const session = store.get(sessionId);
  if (!session) return c.json({ detail: "session not found" }, 404);

  if (
    session.state === SessionStateName.CLOSED ||
    session.state === SessionStateName.READY_FOR_TEACHER
  ) {
    return c.json({ detail: "session not accepting turns" }, 400);
  }

  const body = await c.req.json<{
    child_id: string;
    utterance?: string;
    finish_turn?: boolean;
  }>();
  const childId = body.child_id;
  if (childId !== "a" && childId !== "b") {
    return c.json({ detail: "invalid child_id" }, 400);
  }

  const active = workflow.orchestrator.activeChild(session);
  if (active && childId !== active) {
    const label =
      active === "a" ? session.child_a_label : session.child_b_label;
    return c.json({ detail: `いまは ${label} の番です` }, 400);
  }

  const utterance = body.utterance?.trim() ?? "";
  const finishTurn = body.finish_turn === true;
  if (!utterance && !finishTurn) {
    return c.json({ detail: "utterance required" }, 400);
  }

  let updated: SessionState;
  let agentMessage: string;
  let escalated: boolean;
  try {
    [updated, agentMessage, escalated] = await workflow.processChildTurn(
      session,
      childId,
      utterance,
      { finishTurn },
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return c.json({ detail: msg }, 400);
  }
  store.put(updated);

  const done =
    updated.state === SessionStateName.READY_FOR_TEACHER ||
    updated.state === SessionStateName.ESCALATED;

    return c.json({
    session_id: updated.session_id,
    state: updated.state,
    agent_message: agentMessage,
    escalated: escalated || updated.escalated,
    done_with_child: done,
    active_child: workflow.orchestrator.activeChild(updated),
    child_a_name: updated.child_a_name,
    child_b_name: updated.child_b_name,
    child_a_label: updated.child_a_label,
    child_b_label: updated.child_b_label,
  });
});

app.get("/v1/sessions/:sessionId/progress", async (c) => {
  let session = store.get(c.req.param("sessionId"));
  if (!session) return c.json({ detail: "session not found" }, 404);

  const briefReady =
    session.state === SessionStateName.READY_FOR_TEACHER ||
    session.state === SessionStateName.ESCALATED;

  const { insights, session: refreshedSession } =
    await workflow.refreshSessionInsights(session);
  store.put(refreshedSession);

  return c.json({
    session_id: refreshedSession.session_id,
    state: refreshedSession.state,
    child_a_label: refreshedSession.child_a_label,
    child_b_label: refreshedSession.child_b_label,
    child_a_name: refreshedSession.child_a_name,
    child_b_name: refreshedSession.child_b_name,
    active_child: workflow.orchestrator.activeChild(refreshedSession),
    escalated: refreshedSession.escalated,
    urgent: refreshedSession.escalated,
    brief_ready: briefReady,
    turns_a: refreshedSession.turns_a,
    turns_b: refreshedSession.turns_b,
    escalation_reason: refreshedSession.escalation_reason,
    insights,
  });
});

app.get("/v1/sessions/:sessionId/teacher-brief", (c) => {
  const session = store.get(c.req.param("sessionId"));
  if (!session) return c.json({ detail: "session not found" }, 404);

  if (
    session.state !== SessionStateName.READY_FOR_TEACHER &&
    session.state !== SessionStateName.ESCALATED
  ) {
    return c.json(
      { detail: `brief not ready; state is ${session.state}` },
      400,
    );
  }

  return c.json(workflow.getTeacherBrief(session));
});
