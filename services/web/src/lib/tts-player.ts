import type { AvatarGender } from "../avatar/model-config";

/** Play MP3 from Nakanaori TTS API (data URI or https URL). */
export type TtsPlayback = {
  stop: () => void;
  finished: Promise<void>;
};

export async function playTtsAudio(audioUrl: string): Promise<TtsPlayback> {
  const audio = new Audio(audioUrl);
  const finished = new Promise<void>((resolve, reject) => {
    audio.addEventListener("ended", () => resolve());
    audio.addEventListener("error", () => reject(new Error("TTS playback failed")));
  });
  await audio.play();
  return {
    stop: () => {
      audio.pause();
      audio.currentTime = 0;
    },
    finished,
  };
}

function ttsEndpoint(apiBase: string): string {
  const base = apiBase.replace(/\/$/, "");
  return base ? `${base}/v1/tts/synthesize` : "/v1/tts/synthesize";
}

export async function synthesizeAndPlay(
  apiBase: string,
  text: string,
  gender?: AvatarGender,
): Promise<TtsPlayback> {
  const res = await fetch(ttsEndpoint(apiBase), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text,
      ...(gender ? { gender } : {}),
    }),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { detail?: string };
    throw new Error(body.detail ?? `TTS API failed: ${res.status}`);
  }
  const json = (await res.json()) as {
    data?: { audioUrl?: string };
  };
  const url = json.data?.audioUrl;
  if (!url) throw new Error("TTS response missing audioUrl");
  return playTtsAudio(url);
}
