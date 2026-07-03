// Copyright 2026 Satoshi Maemoto
// SPDX-License-Identifier: Apache-2.0

/** 先生画面用 — セッション状態の日本語ラベル */
export const sessionStateLabel: Record<string, string> = {
  created: "準備中",
  listening_a: "1回め の番",
  listening_b: "2回め の番",
  structuring: "話を整理中",
  confirming_a: "確認中（1回め）",
  confirming_b: "確認中（2回め）",
  ready_for_teacher: "ブリーフ準備完了",
  escalated: "先生対応が必要",
  closed: "終了",
};

export function formatSessionState(state: string): string {
  return sessionStateLabel[state] ?? state;
}

type ChildSide = {
  child_a_name?: string | null;
  child_b_name?: string | null;
  child_a_label: string;
  child_b_label: string;
};

/** 収集済みの名前があれば優先（先生ダッシュボード表示用） */
export function displayChildLabel(
  session: ChildSide,
  childId: "a" | "b",
): string {
  if (childId === "a") {
    return session.child_a_name?.trim() || session.child_a_label;
  }
  return session.child_b_name?.trim() || session.child_b_label;
}
