import type { TeacherBrief } from "../../api";
import { Card, CardContent, CardHeader } from "../ui/card";
import { cn } from "../../lib/utils";

function SideBlock({
  title,
  facts,
  feelings,
  unknowns,
  tone,
}: {
  title: string;
  facts: string[];
  feelings: string[];
  unknowns: string[];
  tone: "a" | "b";
}) {
  return (
    <div className={cn("rounded-lg p-4", tone === "a" ? "bg-slate-50" : "bg-stone-50")}>
      <h3 className="mb-3 font-semibold text-slate-800">{title}</h3>
      <Section label="事実" items={facts} className="text-slate-700" />
      <Section label="気持ち" items={feelings} className="text-amber-900" />
      <Section label="不明" items={unknowns} className="text-slate-500 border-l-2 border-dashed border-slate-300 pl-2" />
    </div>
  );
}

function Section({
  label,
  items,
  className,
}: {
  label: string;
  items: string[];
  className?: string;
}) {
  if (!items.length) return null;
  return (
    <p className={cn("mb-2 text-sm", className)}>
      <strong>{label}:</strong> {items.join("、") || "—"}
    </p>
  );
}

export default function BriefCard({ brief }: { brief: TeacherBrief }) {
  return (
    <Card className={cn(brief.urgent && "border-2 border-orange-500 shadow-md")}>
      {brief.urgent && (
        <div className="bg-orange-100 px-5 py-2 text-sm font-medium text-orange-900">
          ⚠ 早めの確認が必要な内容が含まれています
        </div>
      )}
      <CardHeader>
        <h2 className="text-lg font-semibold">先生向けブリーフ</h2>
        {brief.timeline?.length > 0 && (
          <ul className="mt-2 text-xs text-slate-500">
            {brief.timeline.map((t, i) => (
              <li key={i}>
                {t.at} — {t.event}
              </li>
            ))}
          </ul>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <SideBlock
            title={`子どもA — ${brief.child_a.label}`}
            facts={brief.child_a.facts}
            feelings={brief.child_a.feelings}
            unknowns={brief.child_a.unknowns}
            tone="a"
          />
          <SideBlock
            title={`子どもB — ${brief.child_b.label}`}
            facts={brief.child_b.facts}
            feelings={brief.child_b.feelings}
            unknowns={brief.child_b.unknowns}
            tone="b"
          />
        </div>
        {brief.disagreements.length > 0 && (
          <p className="text-sm text-slate-700">
            <strong>食い違い:</strong> {brief.disagreements.join("、")}
          </p>
        )}
        {brief.unknowns.length > 0 && (
          <p className="text-sm text-slate-600">
            <strong>全体の不明点:</strong> {brief.unknowns.join("、")}
          </p>
        )}
        {brief.suggested_questions.length > 0 && (
          <div className="rounded-lg bg-sky-50 p-3 text-sm text-sky-900">
            <strong>確認の提案:</strong>
            <ul className="mt-1 list-inside list-disc">
              {brief.suggested_questions.map((q, i) => (
                <li key={i}>{q}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
