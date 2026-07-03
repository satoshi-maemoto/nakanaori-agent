// Copyright 2026 Satoshi Maemoto
// SPDX-License-Identifier: Apache-2.0

import { lazy, Suspense, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { createSession, postChildTurn } from "../api";
import type { ChatMessage } from "../components/chat/ChatBubble";
import { ChatLog } from "../components/chat/ChatBubble";
import { TurnProgressBar } from "../components/chat/TurnProgress";
import AppShell from "../components/layout/AppShell";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import AvatarGenderPicker from "../avatar/AvatarGenderPicker";
import type { AvatarGender } from "../avatar/model-config";
import { childCopy } from "../lib/child-copy";
import { loadAvatarGender, saveAvatarGender } from "../lib/avatar-storage";
import { useRobotTts } from "../lib/use-robot-tts";
import {
  type SpeechInputErrorCode,
  useSpeechInput,
} from "../lib/use-speech-input";
import { cn } from "../lib/utils";

const AvatarCanvas = lazy(() => import("../avatar/AvatarCanvas"));

/** 1段組で「ながれ」を自動で畳む子ども発話数 */
const FLOW_AUTO_COLLAPSE_AFTER = 2;

function syncChildIdFromState(state: string): "a" | "b" | null {
  if (state === "listening_a") return "a";
  if (state === "listening_b") return "b";
  return null;
}

function displayChildName(
  childId: "a" | "b",
  names: { a: string | null; b: string | null },
  labels: { a: string; b: string },
): string {
  const name = childId === "a" ? names.a : names.b;
  return name ?? (childId === "a" ? labels.a : labels.b);
}

function FlowStepsCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-sky-100 bg-sky-50/80 px-4 py-3",
        className,
      )}
    >
      <p className="mb-2 text-sm font-semibold text-sky-900">{childCopy.flowTitle}</p>
      <ol className="space-y-1 text-sm leading-relaxed text-sky-950">
        {childCopy.flowSteps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
    </div>
  );
}

function FlowStepsCollapsible({
  expanded,
  onToggle,
}: {
  expanded: boolean;
  onToggle: () => void;
}) {
  if (!expanded) {
    return (
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between rounded-xl border border-sky-100 bg-sky-50/80 px-4 py-2.5 text-left text-sm text-sky-900"
        data-testid="flow-steps-collapsed"
      >
        <span className="font-semibold">{childCopy.flowTitle}</span>
        <span className="text-sky-700">{childCopy.flowCollapsedHint}</span>
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-sky-100 bg-sky-50/80 px-4 py-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-sky-900">{childCopy.flowTitle}</p>
        <button
          type="button"
          onClick={onToggle}
          className="shrink-0 text-xs font-medium text-sky-700 underline-offset-2 hover:underline"
        >
          {childCopy.flowClose}
        </button>
      </div>
      <ol className="space-y-1 text-sm leading-relaxed text-sky-950">
        {childCopy.flowSteps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
    </div>
  );
}

function voiceErrorMessage(code: SpeechInputErrorCode): string {
  switch (code) {
    case "not-supported":
      return childCopy.voiceUnsupported;
    case "permission-denied":
      return childCopy.voicePermissionDenied;
    case "no-speech":
      return childCopy.voiceNoSpeech;
    case "network":
      return childCopy.voiceNetwork;
    default:
      return childCopy.voiceError;
  }
}

export default function ChildView() {
  const [gender, setGender] = useState<AvatarGender>(() => loadAvatarGender());
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionState, setSessionState] = useState("created");
  const [childId, setChildId] = useState<"a" | "b">("a");
  const [childALabel, setChildALabel] = useState("子どもA");
  const [childBLabel, setChildBLabel] = useState("子どもB");
  const [childAName, setChildAName] = useState<string | null>(null);
  const [childBName, setChildBName] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [escalated, setEscalated] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [confirmingFinish, setConfirmingFinish] = useState(false);
  const [flowExpanded, setFlowExpanded] = useState(true);
  const composingRef = useRef(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const { speak: speakRobot, stop: stopRobotTts } = useRobotTts(gender);
  const {
    supported: voiceSupported,
    listening: voiceListening,
    toggle: toggleVoice,
    stop: stopVoice,
  } = useSpeechInput({
    onTranscript: setInput,
    onError: (code) => {
      setMessages((m) => [...m, { role: "system", text: voiceErrorMessage(code) }]);
    },
  });

  const childMessageCount = messages.filter((m) => m.role === "child").length;
  const flowCompact = childMessageCount >= FLOW_AUTO_COLLAPSE_AFTER;

  useEffect(() => {
    saveAvatarGender(gender);
  }, [gender]);

  useEffect(() => {
    if (flowCompact) setFlowExpanded(false);
  }, [flowCompact]);

  useEffect(() => {
    const el = chatScrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, confirmingFinish, sessionComplete]);

  function syncNamesFromResponse(res: {
    child_a_name?: string | null;
    child_b_name?: string | null;
    child_a_label?: string;
    child_b_label?: string;
  }) {
    if (res.child_a_name !== undefined) setChildAName(res.child_a_name);
    if (res.child_b_name !== undefined) setChildBName(res.child_b_name);
    if (res.child_a_label) setChildALabel(res.child_a_label);
    if (res.child_b_label) setChildBLabel(res.child_b_label);
  }

  useEffect(() => {
    if (speaking) stopVoice();
  }, [speaking, stopVoice]);

  async function startSession() {
    setLoading(true);
    try {
      const session = await createSession();
      setSessionId(session.session_id);
      setSessionState(session.state);
      setChildId((session.active_child as "a" | "b") ?? "a");
      setChildALabel(session.child_a_label);
      setChildBLabel(session.child_b_label);
      setChildAName(session.child_a_name ?? null);
      setChildBName(session.child_b_name ?? null);
      setMessages([{ role: "robot", text: session.welcome_message }]);
      setEscalated(false);
      setSessionComplete(false);
      setConfirmingFinish(false);
      setFlowExpanded(true);
      setSpeaking(true);
      void speakRobot(session.welcome_message).finally(() => setSpeaking(false));
    } finally {
      setLoading(false);
    }
  }

  async function submitTurn(finishTurn: boolean) {
    if (!sessionId || escalated || sessionComplete || loading) return;
    stopVoice();
    const text = input.trim();
    if (!text && !finishTurn) return;

    const activeChildId = childId;
    setLoading(true);
    setConfirmingFinish(false);
    if (text) {
      setMessages((m) => [...m, { role: "child", text, childId: activeChildId }]);
      setInput("");
    }

    try {
      const res = await postChildTurn(sessionId, activeChildId, text, { finishTurn });
      setSessionState(res.state);
      syncNamesFromResponse(res);
      const nextChild = syncChildIdFromState(res.state);
      if (nextChild) setChildId(nextChild);
      const robotText = res.agent_message;
      setMessages((m) => [...m, { role: "robot", text: robotText }]);
      setSpeaking(true);
      void speakRobot(robotText).finally(() => setSpeaking(false));
      if (res.escalated) {
        setEscalated(true);
        setMessages((m) => [...m, { role: "system", text: childCopy.escalateSystem }]);
      } else if (res.done_with_child) {
        setSessionComplete(true);
      }
    } catch (e) {
      if (text) setInput((prev) => (prev ? prev : text));
      setMessages((m) => [...m, { role: "system", text: String(e) }]);
    } finally {
      setLoading(false);
    }
  }

  function handleInputKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter" || e.shiftKey) return;
    if (e.nativeEvent.isComposing || composingRef.current) return;
    e.preventDefault();
    void submitTurn(false);
  }

  function requestFinishTurn() {
    if (!canFinishTurn) return;
    setConfirmingFinish(true);
  }

  function handleVoiceToggle() {
    if (!voiceSupported || loading || confirmingFinish || sessionComplete || speaking) return;
    void (async () => {
      if (!voiceListening) {
        stopRobotTts();
        setSpeaking(false);
        // TTS 再生直後はマイク取得が失敗しやすいので少し待つ
        await new Promise((r) => setTimeout(r, 300));
      }
      toggleVoice(input);
    })();
  }

  const canSend =
    Boolean(input.trim()) && !loading && !confirmingFinish && !sessionComplete;
  const canFinishTurn =
    !loading &&
    !confirmingFinish &&
    !sessionComplete &&
    (sessionState === "listening_a" || sessionState === "listening_b");

  const names = { a: childAName, b: childBName };
  const labels = { a: childALabel, b: childBLabel };
  const activeName = displayChildName(childId, names, labels);
  const isLastTurn = childId === "b" && sessionState === "listening_b";
  const canUseVoice =
    voiceSupported &&
    !loading &&
    !speaking &&
    !confirmingFinish &&
    !sessionComplete &&
    !escalated;

  return (
    <AppShell title={childCopy.pageTitle} variant="child" largeTitle>
      <p className="mb-4 text-lg leading-relaxed text-slate-700 md:text-xl">
        {childCopy.subtitle}
      </p>

      {!sessionId ? (
        <div className="mx-auto max-w-lg space-y-5">
          <FlowStepsCard />
          <label className="block text-lg font-medium text-slate-800">
            {childCopy.genderLabel}
          </label>
          <AvatarGenderPicker
            value={gender}
            onChange={setGender}
            disabled={loading}
            size="large"
          />
          <Button
            size="xl"
            className="w-full"
            onClick={startSession}
            disabled={loading}
          >
            {childCopy.startButton}
          </Button>
        </div>
      ) : (
        <div className="flex max-h-[calc(100dvh-9rem)] flex-col gap-3 overflow-hidden lg:max-h-[calc(100dvh-10rem)] lg:flex-row lg:gap-5">
          <div className="flex shrink-0 flex-col gap-2 lg:w-[48%] lg:gap-4">
            <div
              className={cn(
                "overflow-hidden rounded-2xl border-2 border-sky-100 bg-white/70 shadow-sm",
                flowCompact
                  ? "h-[min(160px,24dvh)] sm:h-[min(200px,28dvh)]"
                  : "h-[min(240px,32dvh)] sm:h-[min(280px,34dvh)]",
                "lg:h-[min(420px,50dvh)] lg:min-h-[300px]",
              )}
            >
              <Suspense
                fallback={
                  <div className="flex h-full items-center justify-center text-lg text-slate-500">
                    {childCopy.loadingAvatar}
                  </div>
                }
              >
                <AvatarCanvas
                  gender={gender}
                  speaking={speaking}
                  className="h-full w-full"
                />
              </Suspense>
            </div>
            <AvatarGenderPicker
              value={gender}
              onChange={(g) => {
                stopRobotTts();
                setSpeaking(false);
                setGender(g);
              }}
              disabled={loading || escalated || sessionComplete}
              size="large"
            />
            <TurnProgressBar
              state={sessionState}
              childALabel={displayChildName("a", names, labels)}
              childBLabel={displayChildName("b", names, labels)}
              size="large"
            />
            <p className="text-center text-lg font-medium text-slate-700">
              {childCopy.turnNow(activeName, childId)}
            </p>
            {!sessionComplete && !escalated ? (
              <>
                <div className="lg:hidden">
                  <FlowStepsCollapsible
                    expanded={flowExpanded}
                    onToggle={() => setFlowExpanded((v) => !v)}
                  />
                </div>
                <FlowStepsCard className="hidden lg:block" />
              </>
            ) : null}
          </div>

          <div
            className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white/90 shadow-sm max-lg:min-h-[min(320px,42dvh)]"
            data-testid="child-chat-panel"
          >
            <div
              ref={chatScrollRef}
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 md:px-5"
            >
              <ChatLog messages={messages} size="large" />
            </div>
            {sessionComplete ? (
              <div className="shrink-0 space-y-2 border-t border-emerald-100 bg-emerald-50 px-4 py-5 text-center md:px-5">
                <p className="text-lg font-semibold leading-relaxed text-emerald-900">
                  {childCopy.completeBanner}
                </p>
                <p className="text-base text-emerald-800">{childCopy.completeSub}</p>
              </div>
            ) : escalated ? (
              <div className="rounded-xl bg-orange-50 p-5 text-center text-lg leading-relaxed text-orange-900">
                {childCopy.escalateBanner}
              </div>
            ) : confirmingFinish ? (
              <div
                className="shrink-0 space-y-4 border-t border-amber-100 bg-amber-50 px-4 py-5 md:px-5"
                data-testid="finish-confirm-panel"
              >
                <p className="whitespace-pre-line text-lg leading-relaxed text-amber-950">
                  {childCopy.confirmFinish(activeName, isLastTurn)}
                </p>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    variant="secondary"
                    size="lg"
                    className="flex-1"
                    onClick={() => setConfirmingFinish(false)}
                    disabled={loading}
                  >
                    {childCopy.confirmNo}
                  </Button>
                  <Button
                    size="lg"
                    className="flex-1"
                    onClick={() => void submitTurn(true)}
                    disabled={loading}
                  >
                    {childCopy.confirmYes}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="shrink-0 flex flex-col gap-3 border-t border-slate-100 px-4 py-4 md:px-5">
                <div className="flex gap-2 sm:gap-3">
                  {voiceSupported ? (
                    <Button
                      type="button"
                      variant={voiceListening ? "destructive" : "secondary"}
                      size="xl"
                      onClick={handleVoiceToggle}
                      disabled={!canUseVoice}
                      className={cn(
                        "shrink-0 px-4 sm:px-5",
                        voiceListening && "animate-pulse",
                      )}
                      aria-pressed={voiceListening}
                      aria-label={childCopy.voiceButtonTitle}
                      data-testid="voice-input-button"
                    >
                      <span aria-hidden="true" className="text-2xl leading-none">
                        {voiceListening ? "🎙️" : "🎤"}
                      </span>
                      <span className="sr-only sm:not-sr-only sm:ml-2 sm:text-lg">
                        {voiceListening ? childCopy.voiceButtonListening : childCopy.voiceButton}
                      </span>
                    </Button>
                  ) : null}
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={childCopy.inputPlaceholder}
                    disabled={loading}
                    className="h-14 min-w-0 flex-1 text-lg"
                    aria-label={childCopy.inputPlaceholder}
                    onCompositionStart={() => {
                      composingRef.current = true;
                    }}
                    onCompositionEnd={() => {
                      composingRef.current = false;
                    }}
                    onKeyDown={handleInputKeyDown}
                  />
                  <Button
                    size="xl"
                    onClick={() => void submitTurn(false)}
                    disabled={!canSend}
                    className="shrink-0 px-4 sm:px-6"
                  >
                    {childCopy.sendButton}
                  </Button>
                </div>
                <p className="text-center text-sm text-slate-500">{childCopy.sendHint}</p>
                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full"
                  disabled={!canFinishTurn}
                  onClick={requestFinishTurn}
                >
                  {childCopy.finishTurnButton}
                </Button>
              </div>
            )}
          </div>
          <span data-testid="session-id" className="sr-only">
            {sessionId}
          </span>
        </div>
      )}
    </AppShell>
  );
}
