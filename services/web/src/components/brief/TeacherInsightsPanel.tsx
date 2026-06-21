import { Card, CardContent, CardHeader } from "../ui/card";
import { cn } from "../../lib/utils";

export type TeacherInsights = {
  agreements: string[];
  disagreements: string[];
  unknowns: string[];
  teacher_hints: string[];
};

function InsightList({
  title,
  items,
  className,
  emptyText,
}: {
  title: string;
  items: string[];
  className?: string;
  emptyText?: string;
}) {
  if (!items.length) {
    if (!emptyText) return null;
    return (
      <p className={cn("text-sm text-slate-500", className)}>
        <strong>{title}:</strong> {emptyText}
      </p>
    );
  }
  return (
    <div className={cn("text-sm", className)}>
      <strong className="text-slate-800">{title}</strong>
      <ul className="mt-1 list-inside list-disc space-y-1 text-slate-700">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export function ConversationHistory({
  childALabel,
  childBLabel,
  turnsA,
  turnsB,
}: {
  childALabel: string;
  childBLabel: string;
  turnsA: string[];
  turnsB: string[];
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <TurnColumn label={childALabel} utterances={turnsA} tone="a" />
      <TurnColumn label={childBLabel} utterances={turnsB} tone="b" />
    </div>
  );
}

function TurnColumn({
  label,
  utterances,
  tone,
}: {
  label: string;
  utterances: string[];
  tone: "a" | "b";
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-slate-800">{label}</p>
      {utterances.length === 0 ? (
        <p className="text-sm text-slate-500">まだ 話していません</p>
      ) : (
        <ul className="space-y-1 text-sm text-slate-600">
          {utterances.map((u, i) => (
            <li
              key={i}
              className={cn(
                "rounded-lg px-3 py-2",
                tone === "a" ? "bg-slate-50" : "bg-stone-50",
              )}
            >
              {u}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function TeacherInsightsPanel({
  insights,
  variant = "default",
}: {
  insights: TeacherInsights;
  variant?: "default" | "preview";
}) {
  const hasContent =
    insights.disagreements.length > 0 ||
    insights.agreements.length > 0 ||
    insights.unknowns.length > 0 ||
    insights.teacher_hints.length > 0;

  if (!hasContent) return null;

  return (
    <Card className="border-sky-100 bg-sky-50/40">
      <CardHeader className="pb-2">
        <h3 className="text-base font-semibold text-slate-800">
          {variant === "preview" ? "これまでの整理（途中経過）" : "話の整理と確認ヒント"}
        </h3>
        <p className="text-xs text-slate-600">
          裁くための結論ではなく、先生が確認するときのヒントです。最終判断は先生が行います。
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <InsightList
          title="食い違い・矛盾の可能性"
          items={insights.disagreements}
          className="text-amber-900"
          emptyText="現時点では大きな食い違いは見つかっていません"
        />
        <InsightList
          title="双方が同じと言っていること"
          items={insights.agreements}
          className="text-emerald-900"
        />
        <InsightList
          title="まだ分かっていないこと"
          items={insights.unknowns}
          className="text-slate-600"
        />
        {insights.teacher_hints.length > 0 && (
          <div className="rounded-lg border border-sky-200 bg-white p-3 text-sm text-sky-950">
            <strong>先生への確認ヒント</strong>
            <ul className="mt-2 list-inside list-disc space-y-1">
              {insights.teacher_hints.map((hint, i) => (
                <li key={i}>{hint}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
