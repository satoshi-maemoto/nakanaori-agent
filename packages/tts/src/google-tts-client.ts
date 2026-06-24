import { TextToSpeechClient, protos } from "@google-cloud/text-to-speech";
import {
  prepareTtsText,
  type SynthesizeOptions,
  type SynthesizeResult,
} from "./prepare-tts-text.js";
import { resolveGoogleApplicationCredentials } from "./resolve-google-credentials.js";
import { resolveVoiceAudio } from "./resolve-voice-options.js";

let client: TextToSpeechClient | null = null;

function getClient(): TextToSpeechClient {
  if (client) return client;

  const json = process.env.GOOGLE_TTS_CREDENTIALS_JSON?.trim();
  if (json) {
    const creds = JSON.parse(json) as {
      client_email?: string;
      private_key?: string;
      project_id?: string;
    };
    client = new TextToSpeechClient({
      projectId: creds.project_id,
      credentials: {
        client_email: creds.client_email,
        private_key: creds.private_key?.replace(/\\n/g, "\n"),
      },
    });
    return client;
  }

  resolveGoogleApplicationCredentials();
  client = new TextToSpeechClient();
  return client;
}

function speakingRateFromEmotion(
  baseRate: number,
  options?: SynthesizeOptions,
): number {
  const pos = options?.emotionLevel?.positive ?? 50;
  const neg = options?.emotionLevel?.negative ?? 50;
  const delta = (pos - neg) / 200;
  return Math.min(1.15, Math.max(0.85, baseRate + delta * 0.1));
}

export async function synthesizeSpeech(
  rawText: string,
  options?: SynthesizeOptions,
): Promise<SynthesizeResult> {
  const text = prepareTtsText(rawText);
  if (!text) {
    throw new Error("TTS text is empty after sanitization");
  }

  const tts = getClient();
  const resolved = resolveVoiceAudio(options);
  const request: protos.google.cloud.texttospeech.v1.ISynthesizeSpeechRequest = {
    input: { text },
    voice: {
      languageCode: "ja-JP",
      name: resolved.voiceName,
      // ssmlGender NEUTRAL is unsupported by Google TTS; voice name alone selects the timbre.
    },
    audioConfig: {
      audioEncoding: protos.google.cloud.texttospeech.v1.AudioEncoding.MP3,
      speakingRate: speakingRateFromEmotion(resolved.speakingRateBase, options),
      pitch: resolved.pitch,
    },
  };

  const [response] = await tts.synthesizeSpeech(request);
  const audio = response.audioContent;
  if (!audio || !(audio instanceof Uint8Array) && typeof audio !== "string") {
    throw new Error("Google Cloud TTS returned empty audio");
  }

  const bytes = audio instanceof Uint8Array ? audio : Buffer.from(audio, "base64");
  const audioUrl = `data:audio/mp3;base64,${Buffer.from(bytes).toString("base64")}`;

  return {
    audioUrl,
    format: "mp3",
    service: "google_cloud",
  };
}

export { prepareTtsText, DEFAULT_VOICE_NAME, isTtsConfigured } from "./prepare-tts-text.js";
