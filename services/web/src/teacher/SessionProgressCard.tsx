import type { SessionProgress } from "../api";
import { formatSessionState } from "../lib/session-labels";
import TeacherInsightsPanel, { ConversationHistory } from "../components/brief/TeacherInsightsPanel";

type Props = {
  progress: SessionProgress;
};

export default function SessionProgressCard({ progress }: Props) {
  const turnsA = progress.turns_a.map((t) => t.utterance);
  const turnsB = progress.turns_b.map((t) => t.utterance);
  const showInsights =
    turnsA.length > 0 ||
    turnsB.length > 0;

  return (
    <div className="space-y-4" data-testid="session-progress">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
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
        <h3 className="mb-3 text-sm font-semibold text-slate-800">会話履歴</h3>
        <ConversationHistory
          childALabel={progress.child_a_label}
          childBLabel={progress.child_b_label}
          turnsA={turnsA}
          turnsB={turnsB}
        />
      </div>

      {showInsights && (
        <TeacherInsightsPanel insights={progress.insights} variant="preview" />
      )}
    </div>
  );
}
