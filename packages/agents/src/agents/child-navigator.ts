import type { SessionState } from "../orchestrator.js";

export const ROBOT_NAME = "ナカナオリ";

/** 名前の返答から呼び名を取り出す（低学年向けの短い入力想定） */
export function extractChildName(utterance: string): string {
  let name = utterance.trim();
  name = name.replace(/^(ぼくは|僕は|わたしは|私は|ぼく|僕|わたし|私)/u, "");
  name = name.replace(/^(名前は|なまえは|名前|なまえ)/u, "").trim();
  name = name.replace(/(です|だよ|だ。|です。|と言います|っていいます|って言います)+$/u, "").trim();
  name = name.replace(/[。！!？?]+$/u, "").trim();
  if (!name) return utterance.trim().slice(0, 12);
  if (name.length > 12) return name.slice(0, 12);
  return name;
}

export class ChildNavigatorAgent {
  sessionWelcome(): string {
    return (
      `こんにちは、${ROBOT_NAME}だよ。` +
      "きみの はなしを きいて、せんせいに つなぐ ロボットだよ。" +
      "だいじょうぶ、ゆっくり でいいよ。ひとりじゃないからね。" +
      "まず、なまえを 教えてくれる？"
    );
  }

  greetingForChild(session: SessionState, childId: "a" | "b", firstContact: boolean): string {
    const name = this.childName(session, childId);
    if (name) {
      return `${name}さん、${ROBOT_NAME}だよ。きみの はなしを きかせて。だいじょうぶ、ゆっくり でいいよ。`;
    }
    if (firstContact) {
      return (
        `${ROBOT_NAME}だよ。きみの はなしを きいて、せんせいに つなぐ ロボットだよ。` +
        "だいじょうぶ、ゆっくり でいいよ。" +
        "なまえを 教えてくれる？"
      );
    }
    return `${ROBOT_NAME}だよ。なまえを 教えてくれる？`;
  }

  afterNameReceived(name: string): string {
    return `${name}さん、よろしくね。きょうの こと、ゆっくり 話してくれる？`;
  }

  handoffToNextChild(session: SessionState, nextChildId: "a" | "b"): string {
    const prevName =
      nextChildId === "b" ? session.child_a_name : session.child_b_name;
    const thanks = prevName ? `${prevName}さん、ありがとう。` : "ありがとう。";
    const nextLabel =
      nextChildId === "a" ? session.child_a_label : session.child_b_label;
    const greeting = this.greetingForChild(session, nextChildId, true);
    return `${thanks}つぎは ${nextLabel} の ばんだよ。${greeting}`;
  }

  displayName(session: SessionState, childId: "a" | "b"): string {
    return this.childName(session, childId) ?? this.childLabel(session, childId);
  }

  childName(session: SessionState, childId: "a" | "b"): string | null {
    return childId === "a" ? session.child_a_name : session.child_b_name;
  }

  childLabel(session: SessionState, childId: "a" | "b"): string {
    return childId === "a" ? session.child_a_label : session.child_b_label;
  }

  isCollectingName(session: SessionState, childId: "a" | "b"): boolean {
    if (this.childName(session, childId)) return false;
    const turns = childId === "a" ? session.turns_a : session.turns_b;
    return turns.length === 0;
  }

  finishMessage(session: SessionState, childId: "a" | "b"): string {
    const name = this.displayName(session, childId);
    return `${name}さん、おつかれさま。先生に つたえるね。`;
  }
}
