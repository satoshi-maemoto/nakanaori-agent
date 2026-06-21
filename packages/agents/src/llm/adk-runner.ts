import { InMemoryRunner, LlmAgent } from "@google/adk";
import type { z } from "zod";
import { getGeminiModel } from "../config.js";

type AdkEvent = {
  content?: { parts?: Array<{ text?: string }> };
  errorCode?: string;
  errorMessage?: string;
};

async function extractTextFromEvents(events: AsyncIterable<AdkEvent>): Promise<string> {
  let lastText = "";
  for await (const event of events) {
    if (event.errorCode) {
      throw new Error(`Gemini API error ${event.errorCode}: ${event.errorMessage ?? "unknown"}`);
    }
    for (const part of event.content?.parts ?? []) {
      if (part.text) lastText = part.text;
    }
  }
  if (!lastText.trim()) {
    throw new Error("Empty LLM response");
  }
  return lastText;
}

export async function runLlmAgentText(
  name: string,
  instruction: string,
  userMessage: string,
): Promise<string> {
  const agent = new LlmAgent({
    name,
    model: getGeminiModel(),
    instruction,
    includeContents: "none",
  });
  const runner = new InMemoryRunner({ agent, appName: "nakanaori" });
  const events = runner.runEphemeral({
    userId: "nakanaori",
    newMessage: { role: "user", parts: [{ text: userMessage }] },
  });
  return extractTextFromEvents(events);
}

export async function runLlmAgentJson<T extends z.ZodType>(
  name: string,
  instruction: string,
  userMessage: string,
  schema: T,
): Promise<z.infer<T>> {
  const text = await runLlmAgentText(
    name,
    `${instruction}\n\nRespond with valid JSON only.`,
    userMessage,
  );
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("No JSON in LLM response");
  }
  return schema.parse(JSON.parse(jsonMatch[0]));
}
