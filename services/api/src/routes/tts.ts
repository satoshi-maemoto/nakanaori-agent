import { isTtsConfigured, synthesizeSpeech, type SynthesizeOptions } from "@nakanaori/tts";
import type { Context } from "hono";

type TtsBody = {
  text?: string;
  voice?: string;
  gender?: "male" | "female";
  options?: {
    emotion_level?: { positive?: number; negative?: number };
    speaking_rate?: number;
    profile?: "kebbi_child";
  };
};

export async function handleTtsSynthesize(c: Context) {
  if (!isTtsConfigured()) {
    return c.json(
      {
        detail:
          "Google Cloud TTS is not configured. Set GOOGLE_APPLICATION_CREDENTIALS or GOOGLE_TTS_CREDENTIALS_JSON.",
      },
      503,
    );
  }

  const body = await c.req.json<TtsBody>();
  const text = body.text?.trim();
  if (!text) {
    return c.json({ detail: "text is required" }, 400);
  }

  const options: SynthesizeOptions = {
    speakingRate: body.options?.speaking_rate,
    emotionLevel: body.options?.emotion_level
      ? {
          positive: body.options.emotion_level.positive,
          negative: body.options.emotion_level.negative,
        }
      : undefined,
    voiceName: body.voice?.trim() || undefined,
    avatarGender: body.gender,
    profile: body.options?.profile,
  };

  try {
    const result = await synthesizeSpeech(text, options);
    return c.json({
      success: true,
      data: {
        audioUrl: result.audioUrl,
        format: result.format,
        service: result.service,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "TTS synthesis failed";
    return c.json({ detail: message }, 502);
  }
}
