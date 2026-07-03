// Copyright 2026 Satoshi Maemoto
// SPDX-License-Identifier: Apache-2.0

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

/** Strip markdown fences and extract the first JSON object from LLM text. */
export function extractJsonFromText(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]?.trim()) {
    return fenced[1].trim();
  }
  const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("No JSON in LLM response");
  }
  return jsonMatch[0];
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
    `${instruction}\n\nRespond with valid JSON only. No markdown. Top-level keys must match the schema exactly.`,
    userMessage,
  );
  return schema.parse(JSON.parse(extractJsonFromText(text)));
}
