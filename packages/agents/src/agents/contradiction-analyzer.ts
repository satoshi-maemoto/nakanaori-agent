import type { SessionState } from "../orchestrator.js";
import type { StructuredFacts } from "../schemas.js";

type FallbackAnalysis = Pick<
  StructuredFacts,
  "agreements" | "disagreements" | "unknowns" | "teacher_hints"
>;

function sideText(session: SessionState, childId: "a" | "b"): string {
  const turns = childId === "a" ? session.turns_a : session.turns_b;
  return turns.map((t) => t.utterance).join(" ");
}

function label(session: SessionState, childId: "a" | "b"): string {
  if (childId === "a") {
    return session.child_a_name ?? session.child_a_label;
  }
  return session.child_b_name ?? session.child_b_label;
}

function unique(items: string[]): string[] {
  return [...new Set(items)];
}

/**
 * Rule-based fallback when GEMINI_API_KEY is unset or LLM fails.
 * Production path uses FactStructurerAgent + LLM.
 */
export function fallbackAnalyzeContradictions(session: SessionState): FallbackAnalysis {
  const textA = sideText(session, "a");
  const textB = sideText(session, "b");
  const nameA = label(session, "a");
  const nameB = label(session, "b");

  const disagreements: string[] = [];
  const unknowns: string[] = [];
  const agreements: string[] = [];
  const teacher_hints: string[] = [];

  const hasA = textA.length > 0;
  const hasB = textB.length > 0;

  if (!hasA && !hasB) {
    return { agreements, disagreements, unknowns, teacher_hints };
  }

  if (hasA && !hasB) {
    unknowns.push(`${nameB} の話はまだ聞いていません`);
    teacher_hints.push(
      `${nameB} の番が来たら、同じ出来事について聞き、${nameA} の言い分と並べて整理する`,
    );
    return { agreements, disagreements, unknowns, teacher_hints };
  }

  if (!hasA && hasB) {
    unknowns.push(`${nameA} の話はまだ聞いていません`);
    return { agreements, disagreements, unknowns, teacher_hints };
  }

  if (/取っ|とっ/.test(textA) && /拾|ひろっ/.test(textB)) {
    disagreements.push(
      `${nameA}は「取られた」と言い、${nameB}は「拾っただけ」と言っている`,
    );
    teacher_hints.push(
      "「取った」か「拾った」か。双方に、手に取る直前の場所と動きを順番に聞く（責めず、事実だけ）",
    );
  }

  if (/机|つくえ/.test(textA) && /床|おちて/.test(textB)) {
    disagreements.push(
      `${nameA}は机の上と言い、${nameB}は床と言っている`,
    );
    teacher_hints.push(
      "消しゴムが机にあったのか床にあったのか、時間帯ごとに一緒に確認する",
    );
  }

  if (/ピンク|うさぎ/.test(textA) && /水色|星/.test(textB)) {
    disagreements.push(
      `${nameA}はピンクうさぎ、${nameB}は水色星と、消しゴムの見た目が異なる`,
    );
    unknowns.push("二人が話している消しゴムは同じ1つか");
    teacher_hints.push(
      "二人に消しゴムを見せてもらい、同じものについて話しているか確かめる",
    );
  }

  if (/かりた.*ない/.test(textA) && /かし借り|貸し借り/.test(textB)) {
    disagreements.push(
      `${nameA}は貸し借りなし、${nameB}は普段から貸し借りしていると言っている`,
    );
    teacher_hints.push("「今回」と「普段の習慣」を分けて、事実だけ聞く");
  }

  if (disagreements.length === 0) {
    disagreements.push("双方の説明に、細部で認識の差がありそうです");
    teacher_hints.push("会話履歴で食い違う部分を、二人にそれぞれ確認する");
  }

  if (unknowns.length === 0) {
    unknowns.push("争点の物が同じか、所有者、いつ・どこで何が起きたか");
  }

  return {
    agreements: unique(agreements),
    disagreements: unique(disagreements),
    unknowns: unique(unknowns),
    teacher_hints: unique(teacher_hints),
  };
}
