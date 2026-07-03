// Copyright 2026 Satoshi Maemoto
// SPDX-License-Identifier: Apache-2.0

import type { SynthesizeOptions } from "./prepare-tts-text.js";
import { DEFAULT_VOICE_NAME } from "./prepare-tts-text.js";
import {
  kebbiChildProfile,
  voiceForAvatarGender,
  voiceSupportsPitch,
} from "./voice-config.js";

export type ResolvedVoiceAudio = {
  voiceName: string;
  speakingRateBase: number;
  /** Omit from API when undefined (Chirp 3 HD). */
  pitch?: number;
};

function withOptionalPitch(voiceName: string, pitch: number): number | undefined {
  if (!voiceSupportsPitch(voiceName)) return undefined;
  return pitch;
}

/** Voice / pitch resolution — Kebbi profile is opt-in and does not alter Web gender paths. */
export function resolveVoiceAudio(options?: SynthesizeOptions): ResolvedVoiceAudio {
  const explicitVoice = options?.voiceName?.trim();
  if (explicitVoice) {
    return {
      voiceName: explicitVoice,
      speakingRateBase: options?.speakingRate ?? 1.0,
      pitch: withOptionalPitch(explicitVoice, 0),
    };
  }

  if (options?.profile === "kebbi_child") {
    const kebbi = kebbiChildProfile();
    return {
      voiceName: kebbi.voiceName,
      speakingRateBase: options?.speakingRate ?? kebbi.speakingRate,
      pitch: withOptionalPitch(kebbi.voiceName, 0),
    };
  }

  if (options?.avatarGender) {
    const voiceName = voiceForAvatarGender(options.avatarGender);
    return {
      voiceName,
      speakingRateBase: options?.speakingRate ?? 1.0,
      pitch: withOptionalPitch(voiceName, 0),
    };
  }

  const voiceName = process.env.GOOGLE_TTS_VOICE?.trim() || DEFAULT_VOICE_NAME;
  return {
    voiceName,
    speakingRateBase: options?.speakingRate ?? 1.0,
    pitch: withOptionalPitch(voiceName, 0),
  };
}
