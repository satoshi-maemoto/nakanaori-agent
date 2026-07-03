// Copyright 2026 Satoshi Maemoto
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from "vitest";
import { fallbackAnalyzeContradictions } from "./contradiction-analyzer.js";
import { SessionStateName, type SessionState } from "../orchestrator.js";

function eraserSession(): SessionState {
  return {
    session_id: "demo",
    state: SessionStateName.LISTENING_B,
    child_a_label: "子どもA",
    child_b_label: "子どもB",
    child_a_name: "ゆうき",
    child_b_name: "けんた",
    turns_a: [
      {
        child_id: "a",
        utterance:
          "きょう こくごの じかん、けんたが ぼくの けしゴム 取った！ ピンクで うさぎの けしゴム。",
      },
    ],
    turns_b: [
      {
        child_id: "b",
        utterance:
          "ちがう！ 水色で 星の けしゴムを 床で ひろっただけ。かし借り してる。",
      },
    ],
    structured: null,
    analysis_cache_key: null,
    analysis_snapshot: null,
    escalated: false,
    escalation_reason: null,
  };
}

describe("fallbackAnalyzeContradictions", () => {
  it("extracts concrete disagreements for stub mode", () => {
    const result = fallbackAnalyzeContradictions(eraserSession());
    expect(result.disagreements.length).toBeGreaterThan(0);
    expect(result.teacher_hints.length).toBeGreaterThan(0);
  });
});
