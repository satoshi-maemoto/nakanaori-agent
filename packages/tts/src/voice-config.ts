/** Web avatar gender → Google Cloud TTS voice (ja-JP Neural2). */
export const TTS_VOICE_BY_AVATAR_GENDER = {
  female: "ja-JP-Neural2-B",
  male: "ja-JP-Neural2-C",
} as const;

export type TtsAvatarGender = keyof typeof TTS_VOICE_BY_AVATAR_GENDER;

export function voiceForAvatarGender(gender: TtsAvatarGender): string {
  return TTS_VOICE_BY_AVATAR_GENDER[gender];
}

/** Kebbi-only bright child-facing voice (applied only when `profile: "kebbi_child"`). */
export type TtsKebbiProfile = "kebbi_child";

export type KebbiChildVoiceProfile = {
  voiceName: string;
  speakingRate: number;
  pitch: number;
};

export const KEBBI_CHILD_VOICE_PROFILE: KebbiChildVoiceProfile = {
  voiceName: "ja-JP-Neural2-B",
  speakingRate: 1.08,
  pitch: 2.0,
};

export function kebbiChildProfile(): KebbiChildVoiceProfile {
  return KEBBI_CHILD_VOICE_PROFILE;
}
