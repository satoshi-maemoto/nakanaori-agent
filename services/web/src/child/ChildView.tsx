import { lazy, Suspense, useEffect, useState } from "react";
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

const AvatarCanvas = lazy(() => import("../avatar/AvatarCanvas"));

export default function ChildView() {
  const [gender, setGender] = useState<AvatarGender>(() => loadAvatarGender());
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionState, setSessionState] = useState("created");
  const [childId, setChildId] = useState<"a" | "b">("a");
  const [childALabel, setChildALabel] = useState("子どもA");
  const [childBLabel, setChildBLabel] = useState("子どもB");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [escalated, setEscalated] = useState(false);

  useEffect(() => {
    saveAvatarGender(gender);
  }, [gender]);

  async function startSession() {
    setLoading(true);
    try {
      const session = await createSession();
      setSessionId(session.session_id);
      setSessionState(session.state);
      setChildId((session.active_child as "a" | "b") ?? "a");
      setChildALabel(session.child_a_label);
      setChildBLabel(session.child_b_label);
      setMessages([{ role: "robot", text: childCopy.sessionStartMessage }]);
      setEscalated(false);
    } finally {
      setLoading(false);
    }
  }

  async function sendMessage() {
    if (!sessionId || !input.trim() || escalated) return;
    setLoading(true);
    const text = input.trim();
    setInput("");
    setMessages((m) => [...m, { role: "child", text }]);
    try {
      const res = await postChildTurn(sessionId, childId, text);
      setSessionState(res.state);
      if (res.state === "listening_a") setChildId("a");
      else if (res.state === "listening_b") setChildId("b");
      setSpeaking(true);
      setMessages((m) => [...m, { role: "robot", text: res.agent_message }]);
      window.setTimeout(() => setSpeaking(false), 2000);
      if (res.escalated) {
        setEscalated(true);
        setMessages((m) => [...m, { role: "system", text: childCopy.escalateSystem }]);
      }
    } catch (e) {
      setMessages((m) => [...m, { role: "system", text: `エラー: ${String(e)}` }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell title={childCopy.pageTitle} variant="child" largeTitle>
      <p className="mb-6 text-lg leading-relaxed text-slate-700 md:text-xl">
        {childCopy.subtitle}
      </p>

      {!sessionId ? (
        <div className="mx-auto max-w-lg space-y-5">
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
        <div className="flex flex-col gap-5 lg:flex-row">
          <div className="flex flex-col gap-4 lg:w-[48%]">
            <div className="min-h-[280px] overflow-hidden rounded-2xl border-2 border-sky-100 bg-white/70 shadow-sm sm:min-h-[360px] lg:min-h-[440px] lg:max-h-[520px]">
              <Suspense
                fallback={
                  <div className="flex h-full min-h-[280px] items-center justify-center text-lg text-slate-500">
                    {childCopy.loadingAvatar}
                  </div>
                }
              >
                <AvatarCanvas gender={gender} speaking={speaking} className="h-full min-h-[280px]" />
              </Suspense>
            </div>
            <AvatarGenderPicker
              value={gender}
              onChange={setGender}
              disabled={loading || escalated}
              size="large"
            />
            <TurnProgressBar
              state={sessionState}
              childALabel={childALabel}
              childBLabel={childBLabel}
              size="large"
            />
            <p className="text-center text-lg font-medium text-slate-700">
              {childCopy.turnNow(childId === "a" ? childALabel : childBLabel)}
            </p>
          </div>

          <div className="flex min-h-[360px] flex-1 flex-col rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm md:p-5">
            <div className="mb-4 flex-1 overflow-y-auto">
              <ChatLog messages={messages} size="large" />
            </div>
            {!escalated ? (
              <div className="flex gap-3 border-t border-slate-100 pt-4">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={childCopy.inputPlaceholder}
                  disabled={loading}
                  className="h-14 text-lg"
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                />
                <Button
                  size="xl"
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  className="shrink-0 px-6"
                >
                  {childCopy.sendButton}
                </Button>
              </div>
            ) : (
              <div className="rounded-xl bg-orange-50 p-5 text-center text-lg leading-relaxed text-orange-900">
                {childCopy.escalateBanner}
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
