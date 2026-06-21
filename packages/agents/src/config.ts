import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const PROMPTS_DIR = join(dirname(fileURLToPath(import.meta.url)), "prompts");

export function loadPrompt(name: string): string {
  return readFileSync(join(PROMPTS_DIR, `${name}.md`), "utf-8");
}

export function getGeminiModel(): string {
  return process.env.GEMINI_MODEL ?? "gemini-2.5-flash";
}

export function isLlmEnabled(): boolean {
  return Boolean(process.env.GEMINI_API_KEY ?? process.env.GOOGLE_GENAI_API_KEY);
}

const RETRY_DELAYS_MS = [500, 1000, 2000];

export async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < RETRY_DELAYS_MS.length; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt < RETRY_DELAYS_MS.length - 1) {
        await new Promise((r) => setTimeout(r, RETRY_DELAYS_MS[attempt]));
      }
    }
  }
  throw lastError;
}
