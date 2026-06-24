import type { SynthesizeOptions } from "./prepare-tts-text.js";
import { DEFAULT_VOICE_NAME } from "./prepare-tts-text.js";
import { kebbiChildProfile, voiceForAvatarGender } from "./voice-config.js";

export type ResolvedVoiceAudio = {
  voiceName: string;
  speakingRateBase: number;
  pitch: number;
};

/** Voice / pitch resolution — Kebbi profile is opt-in and does not alter Web gender paths. */
export function resolveVoiceAudio(options?: SynthesizeOptions): ResolvedVoiceAudio {
  const explicitVoice = options?.voiceName?.trim();
  if (explicitVoice) {
    return {
      voiceName: explicitVoice,
      speakingRateBase: options?.speakingRate ?? 1.0,
      pitch: 0,
    };
  }

  if (options?.profile === "kebbi_child") {
    const kebbi = kebbiChildProfile();
    return {
      voiceName: kebbi.voiceName,
      speakingRateBase: options?.speakingRate ?? kebbi.speakingRate,
      pitch: kebbi.pitch,
    };
  }

  if (options?.avatarGender) {
    return {
      voiceName: voiceForAvatarGender(options.avatarGender),
      speakingRateBase: options?.speakingRate ?? 1.0,
      pitch: 0,
    };
  }

  return {
    voiceName: process.env.GOOGLE_TTS_VOICE?.trim() || DEFAULT_VOICE_NAME,
    speakingRateBase: options?.speakingRate ?? 1.0,
    pitch: 0,
  };
}
