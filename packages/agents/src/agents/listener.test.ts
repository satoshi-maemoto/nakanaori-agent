// Copyright 2026 Satoshi Maemoto
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from "vitest";
import { ListenerAgent } from "./listener.js";

describe("ListenerAgent", () => {
  it("does not re-ask eraser appearance when already in prior utterances", async () => {
    const listener = new ListenerAgent();
    const res = await listener.listenTurn("ゆうき", "休み時間に 見たら なくなってた。", {
      priorUtterances: [
        "きょう こくごの じかん、けんたが ぼくの けしゴム 取った！",
        "ピンクで うさぎの けしゴム。",
      ],
    });
    expect(res.agent_message).not.toMatch(/どんな.*もの|見た目|何だった/);
  });
});
