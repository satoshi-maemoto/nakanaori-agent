#!/usr/bin/env node
/**
 * Local browser E2E verification (Playwright).
 * Prerequisites: API :8080, Vite :5173
 */
import { chromium } from "playwright";

const BASE = "http://127.0.0.1:5173";
const checks = [];

function pass(name) {
  checks.push({ name, ok: true });
  console.log(`✅ ${name}`);
}

function fail(name, detail) {
  checks.push({ name, ok: false, detail });
  console.error(`❌ ${name}: ${detail}`);
}

async function waitForApi() {
  for (let i = 0; i < 20; i++) {
    try {
      const res = await fetch("http://127.0.0.1:8080/health");
      if (res.ok) return;
    } catch {
      /* retry */
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error("API not ready on :8080");
}

async function main() {
  await waitForApi();

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(BASE);
    await page.getByRole("heading", { name: "ナカナオリ・エージェント" }).waitFor();
    pass("Home: タイトル表示");

    await page.getByRole("link", { name: "子ども用" }).click();
    await page.getByRole("heading", { name: /子ども用/ }).waitFor();
    pass("Child: 画面遷移");

    await page.getByRole("button", { name: "はじめる" }).click();
    await page.getByText(/セッション:/).waitFor();
    const sessionLine = await page.getByText(/セッション:/).textContent();
    const sessionId = sessionLine?.match(/セッション: ([\w-]+)/)?.[1];
    if (!sessionId) fail("Child: セッション ID 取得", sessionLine ?? "empty");
    else pass(`Child: セッション開始 (${sessionId.slice(0, 8)}…)`);

    const input = page.getByPlaceholder("話したいことを入力...");
    await input.fill("今日、ケンカになった");
    await page.getByRole("button", { name: "送る" }).click();
    await page.getByText("ロボット:").waitFor();
    pass("Child: 子どもA 発話 + ロボット応答");

    await page.getByText(/いま: 子どもB/).waitFor({ timeout: 5000 });
    pass("Child: 子どもB に切替表示");

    await input.fill("向こうが先に言った");
    await page.getByRole("button", { name: "送る" }).click();
    await page.getByText("ロボット:").nth(1).waitFor();
    pass("Child: 子どもB 発話 + ロボット応答");

    await page.goto(`${BASE}/teacher`);
    await page.getByRole("heading", { name: "先生用ダッシュボード" }).waitFor();
    pass("Teacher: 画面遷移");

    await page.getByPlaceholder("セッション ID").fill(sessionId ?? "");
    await page.getByRole("button", { name: "ブリーフを見る" }).click();
    await page.getByText("この整理はAIによるものです").waitFor({ timeout: 5000 });
    pass("Teacher: ai_disclaimer 付きブリーフ表示");

    const facts = await page.getByText("事実:").count();
    if (facts >= 2) pass("Teacher: 子どもA/B 事実セクション");
    else fail("Teacher: 事実セクション", `count=${facts}`);

    // Escalation flow (new session)
    await page.goto(`${BASE}/child`);
    await page.getByRole("button", { name: "はじめる" }).click();
    await page.getByText(/セッション:/).waitFor();
    await input.fill("殴ってしまった");
    await page.getByRole("button", { name: "送る" }).click();
    await page.getByText("（先生を呼んでください）").waitFor({ timeout: 5000 });
    pass("Child: エスカレーション表示");
  } catch (e) {
    fail("Browser E2E", String(e));
  } finally {
    await browser.close();
  }

  const failed = checks.filter((c) => !c.ok);
  console.log(`\n=== Browser E2E: ${checks.length - failed.length}/${checks.length} passed ===`);
  process.exit(failed.length > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
