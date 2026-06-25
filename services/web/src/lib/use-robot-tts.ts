import { useCallback, useEffect, useRef } from "react";
import { API_BASE } from "../api";
import type { AvatarGender } from "../avatar/model-config";
import { synthesizeAndPlay, type TtsPlayback } from "./tts-player";

/** Speak robot text with gender-matched voice; stops any in-flight playback. */
export function useRobotTts(gender: AvatarGender) {
  const playbackRef = useRef<TtsPlayback | null>(null);
  const genderRef = useRef(gender);
  genderRef.current = gender;

  const stop = useCallback(() => {
    playbackRef.current?.stop();
    playbackRef.current = null;
  }, []);

  useEffect(() => () => stop(), [stop]);

  const speak = useCallback(
    async (text: string): Promise<boolean> => {
      const trimmed = text.trim();
      if (!trimmed) return false;

      stop();
      try {
        const playback = await synthesizeAndPlay(API_BASE, trimmed, genderRef.current);
        playbackRef.current = playback;
        await playback.finished;
        return true;
      } catch (err) {
        console.warn("[TTS] playback skipped:", err);
        return false;
      } finally {
        if (playbackRef.current) playbackRef.current = null;
      }
    },
    [stop],
  );

  return { speak, stop };
}
