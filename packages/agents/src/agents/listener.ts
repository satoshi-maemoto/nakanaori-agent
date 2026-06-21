import { isLlmEnabled, loadPrompt, withRetry } from "../config.js";
import { runLlmAgentText } from "../llm/adk-runner.js";
import type { ListenerResponse } from "../schemas.js";
import { ListenerResponseSchema } from "../schemas.js";

export class ListenerAgent {
  private stubListenTurn(childLabel: string, utterance: string): ListenerResponse {
    let message = `${childLabel}さん、話してくれてありがとう。ゆっくり聞いているよ。`;
    if (utterance.length > 20) {
      message = `${childLabel}さん、そうだったんだね。もう少し教えてくれる？`;
    }
    return { agent_message: message, needs_more: false };
  }

  async listenTurn(childLabel: string, utterance: string): Promise<ListenerResponse> {
    if (!isLlmEnabled()) {
      return this.stubListenTurn(childLabel, utterance);
    }

    const instruction = loadPrompt("listener");
    const userMessage = `子ども（${childLabel}）の発話: ${utterance}\n\nJSONで agent_message と needs_more を返してください。`;

    try {
      const text = await withRetry(() =>
        runLlmAgentText("listener", instruction, userMessage),
      );
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return ListenerResponseSchema.parse(JSON.parse(jsonMatch[0]));
      }
      return { agent_message: text.trim(), needs_more: false };
    } catch {
      return {
        agent_message: "ごめんね、いまうまく聞けなかった。もう一度話してくれる？",
        needs_more: true,
      };
    }
  }

  promptForMore(childLabel: string): string {
    return `${childLabel}さん、他にも伝えたいことはある？`;
  }
}
