import { describe, expect, it } from "vitest";
import {
  childDisplayLabel,
  overlayStructuredDisplayNames,
  withDisplayLabels,
} from "./display-labels.js";
import type { SessionState } from "./orchestrator.js";

function baseSession(overrides: Partial<SessionState> = {}): SessionState {
  return {
    session_id: "s1",
    state: "listening_a",
    child_a_label: "子どもA",
    child_b_label: "子どもB",
    child_a_name: "ゆうき",
    child_b_name: null,
    turns_a: [],
    turns_b: [],
    structured: null,
    analysis_cache_key: null,
    analysis_snapshot: null,
    escalated: false,
    escalation_reason: null,
    client_channel: "web",
    ...overrides,
  };
}

describe("display labels", () => {
  it("prefers collected name over default label", () => {
    const session = baseSession();
    expect(childDisplayLabel(session, "a")).toBe("ゆうき");
    expect(childDisplayLabel(session, "b")).toBe("子どもB");
  });

  it("withDisplayLabels copies names into label fields", () => {
    const labeled = withDisplayLabels(baseSession({ child_b_name: "けんた" }));
    expect(labeled.child_a_label).toBe("ゆうき");
    expect(labeled.child_b_label).toBe("けんた");
  });

  it("overlays LLM structured labels with session names", () => {
    const structured = overlayStructuredDisplayNames(
      {
        child_a: { label: "子どもA", facts: [], feelings: [], unknowns: [] },
        child_b: { label: "子どもB", facts: [], feelings: [], unknowns: [] },
        agreements: [],
        disagreements: [],
        unknowns: [],
        teacher_hints: [],
      },
      baseSession({ child_b_name: "けんた" }),
    );
    expect(structured.child_a.label).toBe("ゆうき");
    expect(structured.child_b.label).toBe("けんた");
  });
});
