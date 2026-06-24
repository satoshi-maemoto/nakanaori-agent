import { ROBOT_NAME } from "./child-navigator.js";
import { isLlmEnabled, loadPrompt, withRetry } from "../config.js";
import { runLlmAgentText } from "../llm/adk-runner.js";
import type { ListenerResponse } from "../schemas.js";
import { ListenerResponseSchema } from "../schemas.js";

export type ListenerContext = {
  /** Same child's earlier utterances in this session (excluding the current one). */
  priorUtterances: string[];
};

export class ListenerAgent {
  private stubListenTurn(
    childName: string,
    utterance: string,
    prior: string[],
  ): ListenerResponse {
    const story = [...prior, utterance].join(" ");
    const hasEraser = /けしゴム|消しゴム/.test(story);
    const hasLook = /ピンク|うさぎ|水色|星|模様/.test(story);
    const hasWhenWhere = /机|床|休み時間|放課後|国語|じかん|時間/.test(story);
    const hasAction = /取った|とった|ひろった|拾った|もってた|なくな/.test(story);

    if (prior.length >= 2 || utterance.length > 45) {
      return {
        agent_message: `${childName}さん、話してくれてありがとう。他にも伝えたいことはある？なければ「番を おわる」を 押してね。`,
        needs_more: false,
      };
    }

    if (hasEraser && hasLook && hasWhenWhere) {
      return {
        agent_message: `${childName}さん、そうだったんだね。だいじょうぶ、ゆっくり教えてくれてありがとう。他にもある？`,
        needs_more: false,
      };
    }

    if (hasAction && !hasLook && hasEraser) {
      return {
        agent_message: `${childName}さん、そうだったんだね。そのけしゴムは、どんな見た目だった？`,
        needs_more: false,
      };
    }

    if (hasAction) {
      return {
        agent_message: `${childName}さん、そうだったんだね。だいじょうぶ、もう少し教えてくれる？`,
        needs_more: false,
      };
    }

    return {
      agent_message: `${childName}さん、話してくれてありがとう。${ROBOT_NAME}、ゆっくり聞いているよ。`,
      needs_more: false,
    };
  }

  async listenTurn(
    childName: string,
    utterance: string,
    context: ListenerContext = { priorUtterances: [] },
  ): Promise<ListenerResponse> {
    if (!isLlmEnabled()) {
      return this.stubListenTurn(childName, utterance, context.priorUtterances);
    }

    const instruction = loadPrompt("listener");
    const historyBlock =
      context.priorUtterances.length > 0
        ? `これまでの発話（同じ子・このセッション）:\n${context.priorUtterances.map((u, i) => `${i + 1}. ${u}`).join("\n")}\n\n`
        : "";

    const userMessage =
      `${historyBlock}` +
      `いまの発話（${childName}さん）: ${utterance}\n` +
      `ロボット名: ${ROBOT_NAME}\n` +
      "JSONで agent_message と needs_more を返してください。";

    try {
      const text = await withRetry(() =>
        runLlmAgentText("listener", instruction, userMessage),
      );
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return ListenerResponseSchema.parse(JSON.parse(jsonMatch[0]));
      }
      const trimmed = text.trim();
      if (!trimmed) {
        throw new Error("Empty listener response");
      }
      return { agent_message: trimmed, needs_more: false };
    } catch {
      return {
        agent_message: "ごめんね、いまうまく聞けなかった。もう一度話してくれる？",
        needs_more: true,
      };
    }
  }

  promptForMore(childName: string): string {
    return `${childName}さん、他にも伝えたいことはある？`;
  }
}
