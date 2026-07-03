// Copyright 2026 Satoshi Maemoto
// SPDX-License-Identifier: Apache-2.0

/** Web avatar gender → Google Cloud TTS Chirp 3 HD (ja-JP). */
export const TTS_VOICE_BY_AVATAR_GENDER = {
  female: "ja-JP-Chirp3-HD-Zephyr",
  male: "ja-JP-Chirp3-HD-Rasalgethi",
} as const;

export type TtsAvatarGender = keyof typeof TTS_VOICE_BY_AVATAR_GENDER;

/** Default neutral / unset gender — same as Web male (Kuroko robot). */
export const DEFAULT_CHIRP3_VOICE = TTS_VOICE_BY_AVATAR_GENDER.male;

export function voiceForAvatarGender(gender: TtsAvatarGender): string {
  return TTS_VOICE_BY_AVATAR_GENDER[gender];
}

/** Chirp 3 HD rejects pitch in audioConfig (even 0). */
export function voiceSupportsPitch(voiceName: string): boolean {
  return !voiceName.includes("Chirp3-HD");
}

/** Kebbi-only child-facing voice (applied only when `profile: "kebbi_child"`). */
export type TtsKebbiProfile = "kebbi_child";

export type KebbiChildVoiceProfile = {
  voiceName: string;
  speakingRate: number;
};

export const KEBBI_CHILD_VOICE_PROFILE: KebbiChildVoiceProfile = {
  voiceName: "ja-JP-Chirp3-HD-Callirrhoe",
  speakingRate: 1.08,
};

export function kebbiChildProfile(): KebbiChildVoiceProfile {
  return KEBBI_CHILD_VOICE_PROFILE;
}
