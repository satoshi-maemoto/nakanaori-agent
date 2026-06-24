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
  voiceForAvatarGender,
  type TtsAvatarGender,
} from "./voice-config.js";
export { synthesizeSpeech } from "./google-tts-client.js";
