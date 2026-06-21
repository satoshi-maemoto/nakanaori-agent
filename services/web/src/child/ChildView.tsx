import { useState } from "react";
import { createSession, postChildTurn } from "../api";

export default function ChildView() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [childId, setChildId] = useState<"a" | "b">("a");
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function startSession() {
    setLoading(true);
    try {
      const session = await createSession();
      setSessionId(session.session_id);
      setChildId((session.active_child as "a" | "b") ?? "a");
      setMessages(["セッションを始めたよ。話してね。"]);
    } finally {
      setLoading(false);
    }
  }

  async function sendMessage() {
    if (!sessionId || !input.trim()) return;
    setLoading(true);
    const text = input.trim();
    setInput("");
    setMessages((m) => [...m, `あなた: ${text}`]);
    try {
      const res = await postChildTurn(sessionId, childId, text);
      setMessages((m) => [...m, `ロボット: ${res.agent_message}`]);
      if (res.escalated) {
        setMessages((m) => [...m, "（先生を呼んでください）"]);
      }
    } catch (e) {
      setMessages((m) => [...m, `エラー: ${String(e)}`]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="child-view">
      <h2>子ども用 — 話を聞いてくれるロボット</h2>
      <p>ロボットは裁かない。ただ、話を整理するよ。</p>
      {!sessionId ? (
        <button onClick={startSession} disabled={loading}>はじめる</button>
      ) : (
        <>
          <p>セッション: {sessionId} / いま: 子ども{childId.toUpperCase()}</p>
          <div className="chat-box">
            {messages.map((m, i) => (
              <p key={i}>{m}</p>
            ))}
          </div>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="話したいことを入力..."
            disabled={loading}
          />
          <button onClick={sendMessage} disabled={loading}>送る</button>
        </>
      )}
    </div>
  );
}
