// Copyright 2026 Satoshi Maemoto
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from "vitest";
import {
  normalizeTtsParticleHe,
  prepareTtsText,
  stripChoiceMarkers,
} from "./prepare-tts-text.js";

describe("prepareTtsText", () => {
  it("strips choice markers", () => {
    expect(stripChoiceMarkers("こんにちは\n---CT_CHOICES---\n① あ")).toBe(
      "こんにちは\n① あ",
    );
  });

  it("normalizes direction particle へ", () => {
    expect(normalizeTtsParticleHe("やまへ いく")).toContain("え");
  });

  it("preserves いろは へ", () => {
    expect(normalizeTtsParticleHe("はひふへほ")).toBe("はひふへほ");
  });

  it("runs full pipeline", () => {
    const out = prepareTtsText("  こんにちは😀  ");
    expect(out).toBe("こんにちは");
  });
});
