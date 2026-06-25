import { resolveGoogleApplicationCredentials } from "./resolve-google-credentials.js";
import type { TtsAvatarGender, TtsKebbiProfile } from "./voice-config.js";

/** Display marker that must not be read aloud. */
export const CHOICES_DISPLAY_MARKER = "---CT_CHOICES---";

const EMOJI_RE =
  /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}\u{200D}\u{20E3}]/gu;

/** Remove {{pause:N}} style placeholders. */
export function stripTtsPausePlaceholders(text: string): string {
  return text.replace(/\{\{pause:\d+\}\}/gi, "");
}

/** Remove common emoji from TTS input. */
export function removeEmojis(text: string): string {
  return text.replace(EMOJI_RE, "");
}

/** Strip choice markers from assistant text before TTS. */
export function stripChoiceMarkers(text: string): string {
  if (!text) return text;
  let t = text
    .split(/\r?\n/)
    .filter((line) => line.trim() !== CHOICES_DISPLAY_MARKER)
    .join("\n");
  t = t.split(CHOICES_DISPLAY_MARKER).join("");
  return t.replace(/\n{3,}/g, "\n\n").trim();
}

function isHifuHeHoSyllableContext(s: string, heIndex: number): boolean {
  let i = heIndex - 1;
  while (i >= 0 && /\s/.test(s[i]!)) i--;
  if (i < 0 || (s[i] !== "ひ" && s[i] !== "ふ")) return false;
  let j = heIndex + 1;
  while (j < s.length && /\s/.test(s[j]!)) j++;
  return j < s.length && s[j] === "ほ";
}

/** Normalize particle へ → え for clearer Japanese TTS. */
export function normalizeTtsParticleHe(text: string): string {
  if (!text) return text;
  const stash: string[] = [];
  const pushToken = (literal: string): string => {
    const id = stash.length;
    stash.push(literal);
    return `\uE000${id}\uE001`;
  };
  let t = text.replace(/は\s*ひ\s*ふ\s*へ\s*ほ/g, (m) => pushToken(m.replace(/\s+/g, "")));
  t = t.replace(/([ひふ])\s*へ\s*([ほ])/g, (_m, a: string, b: string) => pushToken(`${a}へ${b}`));
  t = t.replace(/(?<!の)への/g, "えの");
  t = t.replace(/へは/g, "えわ");
  t = t.replace(/へも/g, "えも");
  t = t.replace(/へを/g, "えを");
  const motion =
    "いく|いき|いって|いった|いけ|きた|きて|きます|かえる|かえって|かえった|こい|むかう|むかって|のぼる|のぼって|おりる|おりて|つく|ついて|とどく|とどいて|すすむ|すすんで|はいる|はいって|でる|でて|でかける|でかけて|もどる|もどって";
  const reMotion = new RegExp(`(?<=[ぁ-んー0-9）〕、？\\s])へ(?=\\s*(?:${motion}))`, "g");
  t = t.replace(reMotion, (match, offset: number, s: string) =>
    isHifuHeHoSyllableContext(s, offset) ? match : "え",
  );
  for (let i = 0; i < stash.length; i++) {
    t = t.replace(`\uE000${i}\uE001`, stash[i]!);
  }
  return t;
}

/** Full pipeline for agent_message / welcome_message before synthesis. */
export function prepareTtsText(raw: string): string {
  let t = stripChoiceMarkers(raw);
  t = stripTtsPausePlaceholders(t);
  t = removeEmojis(t);
  t = normalizeTtsParticleHe(t);
  return t.trim();
}

export type TtsEmotionLevel = {
  positive?: number;
  negative?: number;
};

export type SynthesizeOptions = {
  emotionLevel?: TtsEmotionLevel;
  speakingRate?: number;
  /** Explicit Google voice name (e.g. ja-JP-Chirp3-HD-Rasalgethi). */
  voiceName?: string;
  /** Web: map female/male robot to ja-JP Chirp 3 HD voices. */
  avatarGender?: TtsAvatarGender;
  /** Kebbi: bright child-facing profile (explicit opt-in only). */
  profile?: TtsKebbiProfile;
};

export type SynthesizeResult = {
  audioUrl: string;
  format: "mp3";
  service: "google_cloud";
};

/** Default voice for Kuroko robot when gender unset (Chirp 3 HD male). */
export const DEFAULT_VOICE_NAME = "ja-JP-Chirp3-HD-Rasalgethi";

export function isTtsConfigured(): boolean {
  if (process.env.GOOGLE_TTS_CREDENTIALS_JSON?.trim()) return true;
  return resolveGoogleApplicationCredentials() !== null;
}
