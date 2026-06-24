import { describe, expect, it } from "vitest";
import { resolveVoiceAudio } from "./resolve-voice-options.js";
import { DEFAULT_VOICE_NAME } from "./prepare-tts-text.js";

describe("resolveVoiceAudio", () => {
  it("maps Web male gender without Kebbi pitch", () => {
    const r = resolveVoiceAudio({ avatarGender: "male" });
    expect(r.voiceName).toBe("ja-JP-Neural2-C");
    expect(r.pitch).toBe(0);
    expect(r.speakingRateBase).toBe(1.0);
  });

  it("maps Web female gender without Kebbi pitch", () => {
    const r = resolveVoiceAudio({ avatarGender: "female" });
    expect(r.voiceName).toBe("ja-JP-Neural2-B");
    expect(r.pitch).toBe(0);
  });

  it("applies kebbi_child profile only when explicitly requested", () => {
    const r = resolveVoiceAudio({ profile: "kebbi_child" });
    expect(r.voiceName).toBe("ja-JP-Neural2-B");
    expect(r.pitch).toBe(2.0);
    expect(r.speakingRateBase).toBe(1.08);
  });

  it("defaults to neutral voice when no options", () => {
    const r = resolveVoiceAudio();
    expect(r.voiceName).toBe(DEFAULT_VOICE_NAME);
    expect(r.pitch).toBe(0);
  });

  it("explicit voice overrides profile and gender", () => {
    const r = resolveVoiceAudio({
      voiceName: "ja-JP-Neural2-C",
      profile: "kebbi_child",
      avatarGender: "female",
    });
    expect(r.voiceName).toBe("ja-JP-Neural2-C");
    expect(r.pitch).toBe(0);
  });
});
