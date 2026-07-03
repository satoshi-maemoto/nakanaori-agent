// Copyright 2026 Satoshi Maemoto
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from "vitest";
import { extractJsonFromText } from "./adk-runner.js";

describe("extractJsonFromText", () => {
  it("extracts JSON from markdown fence", () => {
    const raw = 'Here:\n```json\n{"a":1}\n```';
    expect(JSON.parse(extractJsonFromText(raw))).toEqual({ a: 1 });
  });

  it("extracts bare JSON object", () => {
    expect(JSON.parse(extractJsonFromText('{"child_a":{}}'))).toEqual({ child_a: {} });
  });
});
