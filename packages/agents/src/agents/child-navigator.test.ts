import { describe, expect, it } from "vitest";
import { ChildNavigatorAgent, extractChildName } from "./child-navigator.js";
import { SessionStateName, type SessionState } from "../orchestrator.js";

function baseSession(): SessionState {
  return {
    session_id: "s1",
    state: SessionStateName.LISTENING_A,
    child_a_label: "子どもA",
    child_b_label: "子どもB",
    child_a_name: null,
    child_b_name: null,
    turns_a: [],
    turns_b: [],
    structured: null,
    analysis_cache_key: null,
    analysis_snapshot: null,
    escalated: false,
    escalation_reason: null,
  };
}

describe("extractChildName", () => {
  it("strips polite suffixes", () => {
    expect(extractChildName("たろうです")).toBe("たろう");
    expect(extractChildName("ぼくはけんただよ")).toBe("けんた");
  });
});

describe("ChildNavigatorAgent", () => {
  const nav = new ChildNavigatorAgent();

  it("welcome includes self intro and name ask", () => {
    expect(nav.sessionWelcome()).toMatch(/ナカナオリ/);
    expect(nav.sessionWelcome()).toMatch(/なまえ/);
    expect(nav.sessionWelcome()).toMatch(/だいじょうぶ/);
  });

  it("handoff greets next child", () => {
    const session = { ...baseSession(), child_a_name: "たろう" };
    const msg = nav.handoffToNextChild(session, "b");
    expect(msg).toMatch(/たろう/);
    expect(msg).toMatch(/なまえ/);
  });
});
