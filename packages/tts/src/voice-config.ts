/** Web avatar gender → Google Cloud TTS voice (ja-JP Neural2). */
export const TTS_VOICE_BY_AVATAR_GENDER = {
  female: "ja-JP-Neural2-B",
  male: "ja-JP-Neural2-C",
} as const;

export type TtsAvatarGender = keyof typeof TTS_VOICE_BY_AVATAR_GENDER;

export function voiceForAvatarGender(gender: TtsAvatarGender): string {
  return TTS_VOICE_BY_AVATAR_GENDER[gender];
}
