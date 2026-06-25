import { describe, expect, it } from "vitest";
import { EmotionGuardAgent, MediationWorkflow } from "./index.js";

describe("MediationWorkflow", () => {
  it("creates session in listening_a", () => {
    const wf = new MediationWorkflow();
    const session = wf.createSession("test-session-id");
    expect(session.state).toBe("listening_a");
    expect(session.child_a_name).toBeNull();
  });

  it("welcome message introduces robot and explains one turn", () => {
    const wf = new MediationWorkflow();
    expect(wf.getSessionWelcome()).toMatch(/ナカナオリ/);
    expect(wf.getSessionWelcome()).toMatch(/順番に 話して/);
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
    let msg: string;
    [session] = await wf.processChildTurn(session, "a", "たろう");
    [session] = await wf.processChildTurn(session, "a", "消しゴムがなくなった", {
      finishTurn: true,
    });
    [session] = await wf.processChildTurn(session, "b", "けんた");
    [session, msg] = await wf.processChildTurn(session, "b", "拾っただけ", {
      finishTurn: true,
    });
    expect(msg).toMatch(/せんせいに きいた ことを 伝えた/);
    const brief = wf.getTeacherBrief(session);
    expect(brief.ai_disclaimer).toContain("最終的な判断は先生");
    expect(brief.conversation_a.utterances).toContain("消しゴムがなくなった");
    expect(brief.conversation_b.utterances).toContain("拾っただけ");
    expect(brief.child_a.label).toBe("たろう");
    expect(brief.teacher_hints.length).toBeGreaterThan(0);
  });

  it("teacher brief uses collected names over LLM default labels", async () => {
    const wf = new MediationWorkflow();
    let session = wf.createSession("s-names");
    [session] = await wf.processChildTurn(session, "a", "ゆうき");
    [session] = await wf.processChildTurn(session, "a", "左のブランコ 割り込まれた", {
      finishTurn: true,
    });
    [session] = await wf.processChildTurn(session, "b", "けんた");
    [session] = await wf.processChildTurn(session, "b", "右のブランコ 先だった", {
      finishTurn: true,
    });
    session = {
      ...session,
      structured: {
        child_a: {
          label: "子どもA",
          facts: ["テスト"],
          feelings: [],
          unknowns: [],
        },
        child_b: {
          label: "子どもB",
          facts: ["テスト"],
          feelings: [],
          unknowns: [],
        },
        agreements: [],
        disagreements: [],
        unknowns: [],
        teacher_hints: [],
      },
    };
    const brief = wf.getTeacherBrief(session);
    expect(brief.child_a.label).toBe("ゆうき");
    expect(brief.child_b.label).toBe("けんた");
    expect(brief.conversation_a.label).toBe("ゆうき");
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
