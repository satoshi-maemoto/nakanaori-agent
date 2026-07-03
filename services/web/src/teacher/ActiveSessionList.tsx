// Copyright 2026 Satoshi Maemoto
// SPDX-License-Identifier: Apache-2.0

import type { SessionState } from "../api";
import { displayChildLabel, formatSessionState } from "../lib/session-labels";
import { cn } from "../lib/utils";

type Props = {
  sessions: SessionState[];
  selectedId: string | null;
  onSelect: (sessionId: string) => void;
  loading?: boolean;
  onRefresh: () => void;
};

export default function ActiveSessionList({
  sessions,
  selectedId,
  onSelect,
  loading,
  onRefresh,
}: Props) {
  return (
    <section className="mb-6" data-testid="active-sessions">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-slate-900">進行中のセッション</h2>
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="text-sm text-sky-700 hover:text-sky-900 disabled:opacity-50"
        >
          更新
        </button>
      </div>
      {sessions.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white/60 px-4 py-6 text-center text-sm text-slate-600">
          いま 進行中の セッションは ありません。
          <br />
          子ども画面で「はじめる」を 押すと ここに 表示されます。
        </p>
      ) : (
        <ul className="space-y-2">
          {sessions.map((s) => {
            const selected = s.session_id === selectedId;
            const briefReady =
              s.state === "ready_for_teacher" || s.state === "escalated";
            const labelA = displayChildLabel(s, "a");
            const labelB = displayChildLabel(s, "b");
            const activeLabel =
              s.active_child === "a"
                ? labelA
                : s.active_child === "b"
                  ? labelB
                  : null;
            return (
              <li key={s.session_id}>
                <button
                  type="button"
                  data-testid={`session-row-${s.session_id.slice(0, 8)}`}
                  onClick={() => onSelect(s.session_id)}
                  className={cn(
                    "w-full rounded-xl border px-4 py-3 text-left transition-colors",
                    selected
                      ? "border-sky-400 bg-sky-50 ring-2 ring-sky-200"
                      : "border-slate-200 bg-white hover:border-slate-300",
                  )}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-slate-900">
                      {labelA} / {labelB}
                    </span>
                    {s.urgent && (
                      <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-800">
                        急ぎ
                      </span>
                    )}
                    {briefReady && (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-800">
                        ブリーフ可
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-slate-600">
                    {formatSessionState(s.state)}
                    {activeLabel && ` — ${activeLabel} の番`}
                  </p>
                  <p className="mt-1 font-mono text-xs text-slate-400">
                    ID: {s.session_id.slice(0, 8)}…
                  </p>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
