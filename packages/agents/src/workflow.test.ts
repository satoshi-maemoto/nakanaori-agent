import { describe, expect, it } from "vitest";
import { EmotionGuardAgent, MediationWorkflow } from "./index.js";

describe("MediationWorkflow", () => {
  it("creates session in listening_a", () => {
    const wf = new MediationWorkflow();
    const session = wf.createSession("test-session-id");
    expect(session.state).toBe("listening_a");
    expect(session.child_a_name).toBeNull();
  });

  it("welcome message introduces robot and asks name", () => {
    const wf = new MediationWorkflow();
    expect(wf.getSessionWelcome()).toMatch(/ナカナオリ/);
    expect(wf.getSessionWelcome()).toMatch(/なまえ/);
  });

  it("collects child name on first utterance", async () => {
    const wf = new MediationWorkflow();
    let session = wf.createSession("s1");
    [session] = await wf.processChildTurn(session, "a", "たろうです");
    expect(session.child_a_name).toBe("たろう");
    expect(session.state).toBe("listening_a");
  });

  it("stays on same child until finishTurn", async () => {
    const wf = new MediationWorkflow();
    let session = wf.createSession("s1");
    [session] = await wf.processChildTurn(session, "a", "たろう");
    [session] = await wf.processChildTurn(session, "a", "太郎くんが消しゴム取った");
    expect(session.state).toBe("listening_a");
    [session] = await wf.processChildTurn(session, "a", "もう終わり", {
      finishTurn: true,
    });
    expect(session.state).toBe("listening_b");
  });

  it("advances state after finishTurn with handoff greeting", async () => {
    const wf = new MediationWorkflow();
    let session = wf.createSession("s1");
    [session] = await wf.processChildTurn(session, "a", "たろう");
    const [updated, msg, escalated] = await wf.processChildTurn(
      session,
      "a",
      "今日ケンカした",
      { finishTurn: true },
    );
    session = updated;
    expect(escalated).toBe(false);
    expect(msg).toMatch(/なまえ|ばん|ありがとう/);
    expect(session.state).toBe("listening_b");
  });

  it("teacher brief includes disclaimer", async () => {
    const wf = new MediationWorkflow();
    let session = wf.createSession("s2");
    [session] = await wf.processChildTurn(session, "a", "たろう");
    [session] = await wf.processChildTurn(session, "a", "消しゴムがなくなった", {
      finishTurn: true,
    });
    [session] = await wf.processChildTurn(session, "b", "けんた");
    [session] = await wf.processChildTurn(session, "b", "拾っただけ", {
      finishTurn: true,
    });
    const brief = wf.getTeacherBrief(session);
    expect(brief.ai_disclaimer).toContain("最終的な判断は先生");
    expect(brief.conversation_a.utterances).toContain("消しゴムがなくなった");
    expect(brief.conversation_b.utterances).toContain("拾っただけ");
    expect(brief.child_a.label).toBe("たろう");
    expect(brief.teacher_hints.length).toBeGreaterThan(0);
  });

  it("session insights available during listening", async () => {
    const wf = new MediationWorkflow();
    let session = wf.createSession("s3");
    [session] = await wf.processChildTurn(session, "a", "たろう");
    [session] = await wf.processChildTurn(session, "a", "消しゴムがなくなった", {
      finishTurn: false,
    });
    const insights = await wf.getSessionInsights(session);
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
