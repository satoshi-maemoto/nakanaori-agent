/** 先生画面用 — セッション状態の日本語ラベル */
export const sessionStateLabel: Record<string, string> = {
  created: "準備中",
  listening_a: "子どもA の番",
  listening_b: "子どもB の番",
  structuring: "話を整理中",
  confirming_a: "確認中（A）",
  confirming_b: "確認中（B）",
  ready_for_teacher: "ブリーフ準備完了",
  escalated: "先生対応が必要",
  closed: "終了",
};

export function formatSessionState(state: string): string {
  return sessionStateLabel[state] ?? state;
}
