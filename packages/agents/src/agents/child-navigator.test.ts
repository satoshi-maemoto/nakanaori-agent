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

  it("welcome explains turn order", () => {
    expect(nav.sessionWelcome()).toMatch(/順番に 話して/);
    expect(nav.sessionWelcome()).toMatch(/なまえ/);
    expect(nav.sessionWelcome()).not.toMatch(/1回め、2回め/);
  });

  it("afterNameReceived explains finish button", () => {
    expect(nav.afterNameReceived("たろう", "a")).toMatch(/1回めの ばん/);
    expect(nav.afterNameReceived("たろう", "a")).toMatch(/話し終わったら/);
    expect(nav.afterNameReceived("けんた", "b")).toMatch(/2回めの ばん/);
  });

  it("finishMessage tells child to consult teacher", () => {
    const session = { ...baseSession(), child_b_name: "けんた", state: SessionStateName.LISTENING_B };
    expect(nav.finishMessage(session, "b")).toMatch(/せんせいに きいた ことを 伝えた/);
    expect(nav.finishMessage(session, "b")).toMatch(/相談/);
  });

  it("handoff greets next child", () => {
    const session = { ...baseSession(), child_a_name: "たろう" };
    const msg = nav.handoffToNextChild(session, "b");
    expect(msg).toMatch(/たろう/);
    expect(msg).toMatch(/つぎの 子の ばん/);
    expect(msg).toMatch(/なまえ/);
    expect(msg).not.toMatch(/子どもB/);
  });
});
