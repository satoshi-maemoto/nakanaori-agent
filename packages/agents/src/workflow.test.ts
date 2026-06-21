import { describe, expect, it } from "vitest";
import { EmotionGuardAgent, MediationWorkflow } from "./index.js";

describe("MediationWorkflow", () => {
  it("creates session in listening_a", () => {
    const wf = new MediationWorkflow();
    const session = wf.createSession("test-session-id");
    expect(session.state).toBe("listening_a");
  });

  it("stays on same child until finishTurn", async () => {
    const wf = new MediationWorkflow();
    let session = wf.createSession("s1");
    [session] = await wf.processChildTurn(session, "a", "太郎くんが");
    expect(session.state).toBe("listening_a");
    [session] = await wf.processChildTurn(session, "a", "消しゴム取った", {
      finishTurn: true,
    });
    expect(session.state).toBe("listening_b");
  });

  it("advances state after finishTurn", async () => {
    const wf = new MediationWorkflow();
    let session = wf.createSession("s1");
    const [updated, msg, escalated] = await wf.processChildTurn(
      session,
      "a",
      "今日ケンカした",
      { finishTurn: true },
    );
    session = updated;
    expect(escalated).toBe(false);
    expect(msg).toMatch(/ありがとう|聞い|ばん/);
    expect(session.state).toBe("listening_b");
  });

  it("teacher brief includes disclaimer", async () => {
    const wf = new MediationWorkflow();
    let session = wf.createSession("s2");
    [session] = await wf.processChildTurn(session, "a", "消しゴムがなくなった", {
      finishTurn: true,
    });
    [session] = await wf.processChildTurn(session, "b", "拾っただけ", {
      finishTurn: true,
    });
    const brief = wf.getTeacherBrief(session);
    expect(brief.ai_disclaimer).toContain("最終的な判断は先生");
    expect(brief.conversation_a.utterances).toContain("消しゴムがなくなった");
    expect(brief.conversation_b.utterances).toContain("拾っただけ");
    expect(brief.teacher_hints.length).toBeGreaterThan(0);
  });

  it("session insights available during listening", async () => {
    const wf = new MediationWorkflow();
    let session = wf.createSession("s3");
    [session] = await wf.processChildTurn(session, "a", "消しゴムがなくなった", {
      finishTurn: false,
    });
    const insights = wf.getSessionInsights(session);
    expect(insights.teacher_hints.length).toBeGreaterThan(0);
  });
});

describe("EmotionGuardAgent", () => {
  it("escalates on high risk", () => {
    const guard = new EmotionGuardAgent();
    const assessment = guard.assessRisk("殴ってしまった");
    expect(assessment.should_escalate).toBe(true);
  });
});
