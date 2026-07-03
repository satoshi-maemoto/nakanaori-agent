// Copyright 2026 Satoshi Maemoto
// SPDX-License-Identifier: Apache-2.0

import { Card, CardContent, CardHeader } from "../ui/card";
import { cn } from "../../lib/utils";
import ConfirmationGuidePanel from "./ConfirmationGuidePanel";

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
  const hasContext =
    insights.disagreements.length > 0 ||
    insights.agreements.length > 0 ||
    insights.unknowns.length > 0;

  if (!hasContext && insights.teacher_hints.length === 0) return null;

  return (
    <div className="space-y-4">
      <ConfirmationGuidePanel hints={insights.teacher_hints} variant="hero" />

      {hasContext && (
        <Card className="border-slate-200 bg-slate-50/50">
          <CardHeader className="pb-2">
            <h3 className="text-base font-semibold text-slate-800">
              {variant === "preview" ? "これまでの整理（参考）" : "話の整理（参考）"}
            </h3>
            <p className="text-xs text-slate-500">
              会話履歴を並べた整理です。上の「確認の進め方」を優先してください。
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <InsightList
              title="何が食い違っているか"
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
          </CardContent>
        </Card>
      )}
    </div>
  );
}
