import { describe, expect, it } from "vitest";
import { EmotionGuardAgent, MediationWorkflow } from "./index.js";

describe("MediationWorkflow", () => {
  it("creates session in listening_a", () => {
    const wf = new MediationWorkflow();
    const session = wf.createSession("test-session-id");
    expect(session.state).toBe("listening_a");
  });

  it("advances state after child turn", async () => {
    const wf = new MediationWorkflow();
    let session = wf.createSession("s1");
    const [updated, msg, escalated] = await wf.processChildTurn(
      session,
      "a",
      "今日ケンカした",
    );
    session = updated;
    expect(escalated).toBe(false);
    expect(msg).toMatch(/ありがとう|聞い/);
    expect(session.state).toBe("listening_b");
  });

  it("teacher brief includes disclaimer", async () => {
    const wf = new MediationWorkflow();
    let session = wf.createSession("s2");
    [session] = await wf.processChildTurn(session, "a", "消しゴムがなくなった");
    [session] = await wf.processChildTurn(session, "b", "拾っただけ");
    const brief = wf.getTeacherBrief(session);
    expect(brief.ai_disclaimer).toContain("最終的な判断は先生");
  });
});

describe("EmotionGuardAgent", () => {
  it("escalates on high risk", () => {
    const guard = new EmotionGuardAgent();
    const assessment = guard.assessRisk("殴ってしまった");
    expect(assessment.should_escalate).toBe(true);
  });
});
