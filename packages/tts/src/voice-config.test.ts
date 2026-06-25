import { describe, expect, it } from "vitest";
import {
  KEBBI_CHILD_VOICE_PROFILE,
  TTS_VOICE_BY_AVATAR_GENDER,
  kebbiChildProfile,
  voiceForAvatarGender,
  voiceSupportsPitch,
} from "./voice-config.js";

describe("voiceForAvatarGender", () => {
  it("maps female robot to Chirp3 Zephyr", () => {
    expect(voiceForAvatarGender("female")).toBe("ja-JP-Chirp3-HD-Zephyr");
  });

  it("maps male robot to Chirp3 Rasalgethi", () => {
    expect(voiceForAvatarGender("male")).toBe("ja-JP-Chirp3-HD-Rasalgethi");
  });

  it("exports stable voice table", () => {
    expect(TTS_VOICE_BY_AVATAR_GENDER).toEqual({
      female: "ja-JP-Chirp3-HD-Zephyr",
      male: "ja-JP-Chirp3-HD-Rasalgethi",
    });
  });
});

describe("voiceSupportsPitch", () => {
  it("returns false for Chirp 3 HD voices", () => {
    expect(voiceSupportsPitch("ja-JP-Chirp3-HD-Callirrhoe")).toBe(false);
  });

  it("returns true for legacy Neural2 voices", () => {
    expect(voiceSupportsPitch("ja-JP-Neural2-B")).toBe(true);
  });
});

describe("kebbiChildProfile", () => {
  it("returns Callirrhoe with slightly faster rate", () => {
    expect(kebbiChildProfile()).toEqual(KEBBI_CHILD_VOICE_PROFILE);
    expect(KEBBI_CHILD_VOICE_PROFILE.voiceName).toBe("ja-JP-Chirp3-HD-Callirrhoe");
    expect(KEBBI_CHILD_VOICE_PROFILE.speakingRate).toBe(1.08);
  });
});
