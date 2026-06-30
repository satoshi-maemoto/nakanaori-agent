import { useCallback, useEffect, useRef, useState } from "react";

export type SpeechInputErrorCode =
  | "not-supported"
  | "permission-denied"
  | "no-speech"
  | "network"
  | "aborted"
  | "unknown";

type UseSpeechInputOptions = {
  lang?: string;
  onTranscript: (text: string) => void;
  onError?: (code: SpeechInputErrorCode) => void;
};

function getSpeechRecognitionCtor(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;
}

export function isSpeechInputSupported(): boolean {
  return getSpeechRecognitionCtor() !== null;
}

/** Browser microphone speech-to-text via Web Speech API (ja-JP). */
export function useSpeechInput({
  lang = "ja-JP",
  onTranscript,
  onError,
}: UseSpeechInputOptions) {
  const [listening, setListening] = useState(false);
  const [supported] = useState(() => isSpeechInputSupported());
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const baseTextRef = useRef("");
  const onTranscriptRef = useRef(onTranscript);
  const onErrorRef = useRef(onError);
  onTranscriptRef.current = onTranscript;
  onErrorRef.current = onError;

  const stop = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return;
    recognition.onresult = null;
    recognition.onerror = null;
    recognition.onend = null;
    try {
      recognition.stop();
    } catch {
      /* already stopped */
    }
    recognitionRef.current = null;
    setListening(false);
  }, []);

  const start = useCallback(
    (baseText = "") => {
      if (!supported) {
        onErrorRef.current?.("not-supported");
        return;
      }
      stop();

      const Ctor = getSpeechRecognitionCtor();
      if (!Ctor) {
        onErrorRef.current?.("not-supported");
        return;
      }

      baseTextRef.current = baseText;
      const recognition = new Ctor();
      recognition.lang = lang;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event) => {
        let finalText = "";
        let interimText = "";
        for (let i = 0; i < event.results.length; i++) {
          const transcript = event.results[i][0]?.transcript ?? "";
          if (event.results[i].isFinal) {
            finalText += transcript;
          } else {
            interimText += transcript;
          }
        }
        onTranscriptRef.current(baseTextRef.current + finalText + interimText);
      };

      recognition.onerror = (event) => {
        if (event.error === "aborted") return;
        const code: SpeechInputErrorCode =
          event.error === "not-allowed"
            ? "permission-denied"
            : event.error === "no-speech"
              ? "no-speech"
              : event.error === "network"
                ? "network"
                : "unknown";
        onErrorRef.current?.(code);
      };

      recognition.onend = () => {
        recognitionRef.current = null;
        setListening(false);
      };

      recognitionRef.current = recognition;
      try {
        recognition.start();
        setListening(true);
      } catch {
        recognitionRef.current = null;
        setListening(false);
        onErrorRef.current?.("unknown");
      }
    },
    [lang, stop, supported],
  );

  const toggle = useCallback(
    (baseText = "") => {
      if (listening) {
        stop();
        return;
      }
      start(baseText);
    },
    [listening, start, stop],
  );

  useEffect(() => () => stop(), [stop]);

  return { supported, listening, start, stop, toggle };
}
