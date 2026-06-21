import type { SessionProgress } from "../api";
import { formatSessionState } from "../lib/session-labels";

type Props = {
  progress: SessionProgress;
};

function TurnList({
  label,
  turns,
}: {
  label: string;
  turns: Array<{ utterance: string }>;
}) {
  if (turns.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        {label}: まだ 話していません
      </p>
    );
  }
  return (
    <div>
      <p className="mb-1 text-sm font-medium text-slate-700">{label}</p>
      <ul className="space-y-1 text-sm text-slate-600">
        {turns.map((t, i) => (
          <li key={i} className="rounded-lg bg-slate-50 px-3 py-2">
            {t.utterance}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function SessionProgressCard({ progress }: Props) {
  return (
    <div
      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
      data-testid="session-progress"
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-slate-800">
          {formatSessionState(progress.state)}
        </span>
        {progress.urgent && (
          <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-800">
            急ぎ
          </span>
        )}
        {!progress.brief_ready && (
          <span className="text-xs text-slate-500">ブリーフは まだ 準備中</span>
        )}
      </div>
      {progress.escalation_reason && (
        <p className="mb-3 rounded-lg bg-orange-50 px-3 py-2 text-sm text-orange-900">
          理由: {progress.escalation_reason}
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <TurnList label={progress.child_a_label} turns={progress.turns_a} />
        <TurnList label={progress.child_b_label} turns={progress.turns_b} />
      </div>
    </div>
  );
}
