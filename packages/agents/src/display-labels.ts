import type { SessionState } from "./orchestrator.js";
import type { StructuredFacts } from "./schemas.js";

/** 収集済みの名前があれば優先、なければセッション作成時ラベル（子どもA 等） */
export function childDisplayLabel(session: SessionState, childId: "a" | "b"): string {
  if (childId === "a") {
    return session.child_a_name ?? session.child_a_label;
  }
  return session.child_b_name ?? session.child_b_label;
}

export function withDisplayLabels(session: SessionState): SessionState {
  return {
    ...session,
    child_a_label: childDisplayLabel(session, "a"),
    child_b_label: childDisplayLabel(session, "b"),
  };
}

/** LLM 整理結果の label を、セッション上の実名で上書き */
export function overlayStructuredDisplayNames(
  structured: StructuredFacts,
  session: SessionState,
): StructuredFacts {
  return {
    ...structured,
    child_a: { ...structured.child_a, label: childDisplayLabel(session, "a") },
    child_b: { ...structured.child_b, label: childDisplayLabel(session, "b") },
  };
}
