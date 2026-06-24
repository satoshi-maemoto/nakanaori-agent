import { describe, expect, it } from "vitest";
import {
  KEBBI_CHILD_VOICE_PROFILE,
  TTS_VOICE_BY_AVATAR_GENDER,
  kebbiChildProfile,
  voiceForAvatarGender,
} from "./voice-config.js";

describe("voiceForAvatarGender", () => {
  it("maps female robot to Neural2-B", () => {
    expect(voiceForAvatarGender("female")).toBe("ja-JP-Neural2-B");
  });

  it("maps male robot to Neural2-C", () => {
    expect(voiceForAvatarGender("male")).toBe("ja-JP-Neural2-C");
  });

  it("exports stable voice table", () => {
    expect(TTS_VOICE_BY_AVATAR_GENDER).toEqual({
      female: "ja-JP-Neural2-B",
      male: "ja-JP-Neural2-C",
    });
  });
});

describe("kebbiChildProfile", () => {
  it("returns bright child-facing defaults", () => {
    expect(kebbiChildProfile()).toEqual(KEBBI_CHILD_VOICE_PROFILE);
    expect(KEBBI_CHILD_VOICE_PROFILE.pitch).toBeGreaterThan(0);
  });
});
