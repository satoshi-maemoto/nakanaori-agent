// Copyright 2026 Satoshi Maemoto
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from "vitest";
import { resolveVoiceAudio } from "./resolve-voice-options.js";
import { DEFAULT_VOICE_NAME } from "./prepare-tts-text.js";

describe("resolveVoiceAudio", () => {
  it("maps Web male gender to Chirp3 Rasalgethi without pitch", () => {
    const r = resolveVoiceAudio({ avatarGender: "male" });
    expect(r.voiceName).toBe("ja-JP-Chirp3-HD-Rasalgethi");
    expect(r.pitch).toBeUndefined();
    expect(r.speakingRateBase).toBe(1.0);
  });

  it("maps Web female gender to Chirp3 Zephyr without pitch", () => {
    const r = resolveVoiceAudio({ avatarGender: "female" });
    expect(r.voiceName).toBe("ja-JP-Chirp3-HD-Zephyr");
    expect(r.pitch).toBeUndefined();
  });

  it("applies kebbi_child profile only when explicitly requested", () => {
    const r = resolveVoiceAudio({ profile: "kebbi_child" });
    expect(r.voiceName).toBe("ja-JP-Chirp3-HD-Callirrhoe");
    expect(r.pitch).toBeUndefined();
    expect(r.speakingRateBase).toBe(1.08);
  });

  it("defaults to neutral Chirp3 voice when no options", () => {
    const r = resolveVoiceAudio();
    expect(r.voiceName).toBe(DEFAULT_VOICE_NAME);
    expect(r.pitch).toBeUndefined();
  });

  it("explicit Neural2 voice keeps pitch support", () => {
    const r = resolveVoiceAudio({
      voiceName: "ja-JP-Neural2-C",
      profile: "kebbi_child",
      avatarGender: "female",
    });
    expect(r.voiceName).toBe("ja-JP-Neural2-C");
    expect(r.pitch).toBe(0);
  });
});
