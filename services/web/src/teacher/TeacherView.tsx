import { useState } from "react";
import { createSession, getTeacherBrief, type TeacherBrief } from "../api";

export default function TeacherView() {
  const [sessionId, setSessionId] = useState("");
  const [brief, setBrief] = useState<TeacherBrief | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadBrief() {
    if (!sessionId.trim()) return;
    setError(null);
    try {
      const b = await getTeacherBrief(sessionId.trim());
      setBrief(b);
    } catch (e) {
      setError(String(e));
      setBrief(null);
    }
  }

  async function createAndShow() {
    setError(null);
    try {
      const { createSession } = await import("../api");
      const s = await createSession();
      setSessionId(s.session_id);
    } catch (e) {
      setError(String(e));
    }
  }

  return (
    <div className="teacher-view">
      <h2>先生用ダッシュボード</h2>
      <div>
        <input
          value={sessionId}
          onChange={(e) => setSessionId(e.target.value)}
          placeholder="セッション ID"
        />
        <button onClick={loadBrief}>ブリーフを見る</button>
        <button onClick={createAndShow}>新規セッション ID を取得</button>
      </div>
      {error && <p>{error}</p>}
      {brief && (
        <div className={`brief-card ${brief.urgent ? "urgent" : ""}`}>
          <div className="disclaimer">{brief.ai_disclaimer}</div>
          <h3>子どもA — {brief.child_a.label}</h3>
          <p><strong>事実:</strong> {brief.child_a.facts.join("、")}</p>
          <p><strong>気持ち:</strong> {brief.child_a.feelings.join("、")}</p>
          <h3>子どもB — {brief.child_b.label}</h3>
          <p><strong>事実:</strong> {brief.child_b.facts.join("、")}</p>
          <p><strong>気持ち:</strong> {brief.child_b.feelings.join("、")}</p>
          <p><strong>不一致:</strong> {brief.disagreements.join("、")}</p>
          <p><strong>不明点:</strong> {brief.unknowns.join("、")}</p>
          <p><strong>確認の提案:</strong> {brief.suggested_questions.join("、")}</p>
        </div>
      )}
    </div>
  );
}
