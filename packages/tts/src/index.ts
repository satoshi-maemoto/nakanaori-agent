export { resolveGoogleApplicationCredentials } from "./resolve-google-credentials.js";
export {
  prepareTtsText,
  stripChoiceMarkers,
  normalizeTtsParticleHe,
  removeEmojis,
  stripTtsPausePlaceholders,
  DEFAULT_VOICE_NAME,
  isTtsConfigured,
  type SynthesizeOptions,
  type SynthesizeResult,
  type TtsEmotionLevel,
} from "./prepare-tts-text.js";
export {
  TTS_VOICE_BY_AVATAR_GENDER,
  DEFAULT_CHIRP3_VOICE,
  KEBBI_CHILD_VOICE_PROFILE,
  kebbiChildProfile,
  voiceForAvatarGender,
  voiceSupportsPitch,
  type TtsAvatarGender,
  type TtsKebbiProfile,
  type KebbiChildVoiceProfile,
} from "./voice-config.js";
export { resolveVoiceAudio, type ResolvedVoiceAudio } from "./resolve-voice-options.js";
export { synthesizeSpeech } from "./google-tts-client.js";
