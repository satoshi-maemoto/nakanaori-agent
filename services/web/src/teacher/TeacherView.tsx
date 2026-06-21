import { useCallback, useEffect, useState } from "react";
import {
  createSession,
  getSessionProgress,
  getTeacherBrief,
  listSessions,
  type SessionProgress,
  type SessionState,
  type TeacherBrief,
} from "../api";
import BriefCard from "../components/brief/BriefCard";
import AppShell, { AiDisclaimerBanner } from "../components/layout/AppShell";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import ActiveSessionList from "./ActiveSessionList";
import SessionProgressCard from "./SessionProgressCard";

export default function TeacherView() {
  const [sessions, setSessions] = useState<SessionState[]>([]);
  const [sessionId, setSessionId] = useState("");
  const [brief, setBrief] = useState<TeacherBrief | null>(null);
  const [progress, setProgress] = useState<SessionProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const refreshSessions = useCallback(async () => {
    try {
      const list = await listSessions();
      setSessions(list);
    } catch (e) {
      setError(String(e));
    }
  }, []);

  useEffect(() => {
    void refreshSessions();
    const timer = window.setInterval(() => void refreshSessions(), 5000);
    return () => window.clearInterval(timer);
  }, [refreshSessions]);

  async function loadSessionDetail(id: string) {
    setSessionId(id);
    setError(null);
    setLoading(true);
    setBrief(null);
    setProgress(null);
    try {
      const p = await getSessionProgress(id);
      setProgress(p);
      if (p.brief_ready) {
        const b = await getTeacherBrief(id);
        setBrief(b);
      }
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  async function loadBriefFromInput() {
    if (!sessionId.trim()) return;
    await loadSessionDetail(sessionId.trim());
  }

  async function createDemoSession() {
    setError(null);
    setLoading(true);
    try {
      const s = await createSession();
      await refreshSessions();
      await loadSessionDetail(s.session_id);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell title="先生用ダッシュボード" variant="teacher">
      <p className="mb-4 text-slate-600">
        子ども双方の話を整理したブリーフを確認できます。最終判断は先生が行います。
      </p>

      <ActiveSessionList
        sessions={sessions}
        selectedId={sessionId || null}
        onSelect={(id) => void loadSessionDetail(id)}
        loading={loading}
        onRefresh={() => void refreshSessions()}
      />

      <details className="mb-6 rounded-xl border border-slate-200 bg-white/80 px-4 py-3">
        <summary className="cursor-pointer text-sm font-medium text-slate-700">
          セッション ID を 直接入力（上級者向け）
        </summary>
        <div className="mt-3 flex flex-wrap gap-2">
          <Input
            className="max-w-md flex-1 font-mono text-sm"
            value={sessionId}
            onChange={(e) => setSessionId(e.target.value)}
            placeholder="セッション ID"
          />
          <Button onClick={() => void loadBriefFromInput()} disabled={loading || !sessionId.trim()}>
            表示
          </Button>
          <Button variant="secondary" onClick={() => void createDemoSession()} disabled={loading}>
            新規セッション（デモ用）
          </Button>
        </div>
      </details>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error.includes("400") && !error.includes("listSessions")
            ? "ブリーフの準備ができていません。下の進行状況を確認してください。"
            : error}
        </div>
      )}

      {loading && (
        <p className="mb-4 text-sm text-slate-500">読み込み中…</p>
      )}

      {progress && !brief && (
        <SessionProgressCard progress={progress} />
      )}

      {brief && (
        <>
          <AiDisclaimerBanner text={brief.ai_disclaimer} />
          <BriefCard brief={brief} />
        </>
      )}
    </AppShell>
  );
}
