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
    await page.getByRole("heading", { name: /はなしを きいてくれる ロボット/ }).waitFor();
    pass("Child: 画面遷移");

    await page.getByRole("button", { name: "はじめる" }).click();
    await page.getByPlaceholder("はなしたい ことを かいて…").waitFor();
    pass("Child: セッション開始");

    const sessionId = await page.getByTestId("session-id").textContent();
    if (!sessionId?.trim()) fail("Child: session-id", "empty");
    else pass(`Child: session captured (${sessionId.trim().slice(0, 8)}…)`);

    const input = page.getByPlaceholder("はなしたい ことを かいて…");
    await input.fill("今日、ケンカになった");
    await page.getByRole("button", { name: "おくる" }).click();
    await page.getByText("ロボット").first().waitFor();
    pass("Child: 子どもA 発話 + ロボット応答");

    await page.getByRole("button", { name: "つぎの ばん" }).click();
    await page.getByText(/子どもB.*の ばん|子ども B.*の ばん/).waitFor({ timeout: 8000 });
    pass("Child: 子どもB に切替表示");

    await input.fill("向こうが先に言った");
    await page.getByRole("button", { name: "おくる" }).click();
    await page.getByText("ロボット").nth(1).waitFor();
    await page.getByRole("button", { name: "つぎの ばん" }).click();
    pass("Child: 子どもB 発話 + ロボット応答");

    await page.goto(`${BASE}/teacher`);
    await page.getByRole("heading", { name: "先生用ダッシュボード" }).waitFor();
    pass("Teacher: 画面遷移");

    await page.getByTestId("active-sessions").waitFor();
    const prefix = sessionId.trim().slice(0, 8);
    await page.getByTestId(`session-row-${prefix}`).click();
    pass("Teacher: 進行中セッション一覧から選択");

    await page.getByText("この整理はAIによるものです").waitFor({ timeout: 8000 });
    pass("Teacher: ai_disclaimer 付きブリーフ表示");

    const facts = await page.getByText("事実:").count();
    if (facts >= 2) pass("Teacher: 子どもA/B 事実セクション");
    else fail("Teacher: 事実セクション", `count=${facts}`);

    await page.goto(`${BASE}/child`);
    await page.getByRole("button", { name: "はじめる" }).click();
    const inputEsc = page.getByPlaceholder("はなしたい ことを かいて…");
    await inputEsc.waitFor();
    await inputEsc.fill("殴ってしまった");
    await page.getByRole("button", { name: "おくる" }).click();
    await page.getByText("せんせいを よんでね").waitFor({ timeout: 8000 });
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
