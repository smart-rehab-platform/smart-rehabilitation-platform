#!/usr/bin/env node
/**
 * Phase F live browser validation for Parent Reports Hub.
 * Run: node backend/scripts/run-phase-f-live-validation.js
 */
const path = require("path");

require("dotenv").config({ path: path.join(__dirname, "../.env") });

const WEB_BASE = process.env.WEB_BASE || "http://localhost:5173";
const API_BASE = process.env.API_BASE || "http://127.0.0.1:5000/api/v1";
const PARENT_EMAIL = "fatima.parent@test.com";
const PASSWORD = "Test123456!";
const OMAR_ID = "de000002-0001-4001-8001-000000000001";

const results = [];

function record(name, passed, detail = "") {
  results.push({ name, passed, detail });
  console.log(`${passed ? "PASS" : "FAIL"} ${name}${detail ? ` — ${detail}` : ""}`);
}

async function login(email) {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: PASSWORD }),
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.message || "Login failed");
  return payload.data.accessToken;
}

async function run() {
  console.log(`Phase F LIVE validation — WEB=${WEB_BASE}`);
  const token = await login(PARENT_EMAIL);
  const reportsRes = await fetch(`${API_BASE}/dashboard/parent/reports`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const reportsPayload = await reportsRes.json();
  const reports = reportsPayload.data || [];
  record("Environment reports API", reportsRes.status === 200, `count=${reports.length}`);

  const playwright = require("playwright");
  let browser;
  try {
    browser = await playwright.chromium.launch({ headless: true, channel: "msedge" });
  } catch {
    browser = await playwright.chromium.launch({ headless: true });
  }

  const page = await browser.newPage();
  const consoleErrors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (error) => consoleErrors.push(error.message));

  await page.goto(`${WEB_BASE}/login`, { waitUntil: "domcontentloaded" });
  await page.locator('input[type="email"]').fill(PARENT_EMAIL);
  await page.locator('input[type="password"]').fill(PASSWORD);
  await page.getByRole("button", { name: /Sign In/i }).last().click();
  await page.waitForURL(/dashboard\/parent/, { timeout: 30000 });
  record("Parent login", true);

  await page.goto(`${WEB_BASE}/dashboard/parent/reports`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".pd-task-hub-title", { timeout: 20000 });
  record("Direct Reports URL", /Reports/.test(await page.locator(".pd-task-hub-title").innerText()));

  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForSelector(".pd-task-hub-page", { timeout: 20000 });
  record("Refresh on Reports page", true);

  await page.getByRole("button", { name: /^Reports$/ }).click();
  await page.waitForURL(/dashboard\/parent\/reports/, { timeout: 15000 });
  const sidebarActive = await page.locator('.pd-nav-item[aria-current="page"]').filter({ hasText: "Reports" }).count();
  record("Sidebar Reports navigation", sidebarActive === 1, `active=${sidebarActive}`);

  await page.goto(`${WEB_BASE}/dashboard/parent`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2500);
  const childTrigger = page.locator(".pd-child-trigger").first();
  if (await childTrigger.count()) {
    await childTrigger.click();
    await page.locator(".pd-dropdown-item").filter({ hasText: "Omar Hassan" }).first().click();
    await page.waitForTimeout(2000);
  }
  const latestUpdates = page.locator('section[aria-label="Latest updates"]');
  const seeAll = latestUpdates.getByRole("button", { name: /See All/i });
  if (await seeAll.count()) {
    await seeAll.click();
    await page.waitForURL(/dashboard\/parent\/reports/, { timeout: 15000 });
    record("Dashboard Latest Updates See all", true);
  } else {
    record("Dashboard Latest Updates See all", false, "button missing");
  }

  await page.goto(`${WEB_BASE}/dashboard/parent`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000);
  const reportCard = latestUpdates.locator(".pd-latest-update-card").filter({ hasText: /Progress|Report/i }).first();
  if (await reportCard.count()) {
    await reportCard.click();
    await page.waitForURL(/dashboard\/parent\/reports\//, { timeout: 15000 });
    record("Dashboard latest report card navigation", true, page.url());
  } else {
    record("Dashboard latest report card navigation", false, "card missing");
  }

  await page.goto(`${WEB_BASE}/dashboard/parent/reports`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".pd-report-hub-card", { timeout: 20000 });
  const cardCount = await page.locator(".pd-report-hub-card").count();
  record("Reports list loads", cardCount >= 1, `cards=${cardCount}`);

  await page.locator("#pd-reports-hub-child").selectOption(OMAR_ID);
  await page.waitForTimeout(400);
  const omarCards = await page.locator(".pd-report-hub-card").count();
  record("Child filter", omarCards >= 1, `visible=${omarCards}`);

  await page.locator("#pd-reports-hub-child").selectOption("all");
  await page.locator("#pd-reports-hub-type").selectOption("monthly");
  await page.waitForTimeout(400);
  const monthlyCards = await page.locator(".pd-report-hub-card").count();
  record("Type filter monthly", monthlyCards >= 1, `visible=${monthlyCards}`);

  await page.locator("#pd-reports-hub-type").selectOption("all");
  await page.locator("#pd-reports-hub-search").fill("Layla");
  await page.waitForTimeout(400);
  const searchCards = await page.locator(".pd-report-hub-card").count();
  record("Search by child name", searchCards >= 1, `visible=${searchCards}`);

  await page.locator("#pd-reports-hub-search").fill("zzzz-no-match");
  await page.waitForTimeout(400);
  const noMatch = await page.locator(".pd-task-hub-empty-message").innerText();
  record("No-match empty state", /No reports match your filters/.test(noMatch), noMatch);

  await page.locator("#pd-reports-hub-search").fill("");
  await page.locator("#pd-reports-hub-sort").selectOption("reportType");
  await page.waitForTimeout(300);
  record("Report-type sort", await page.locator(".pd-report-hub-card").count() >= 1);

  const firstReportId = reports[0]?.id;
  if (firstReportId) {
    await page.goto(`${WEB_BASE}/dashboard/parent/reports/${firstReportId}`, { waitUntil: "domcontentloaded" });
    await page.waitForSelector(".pd-report-detail-card", { timeout: 20000 });
    record("Direct report detail URL", true, firstReportId);

    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForSelector(".pd-report-detail-title", { timeout: 20000 });
    record("Detail refresh", true);

    const popupPromise = page.waitForEvent("popup").catch(() => null);
    const openBtn = page.getByRole("button", { name: /Open Report/i }).first();
    if (await openBtn.count()) {
      await openBtn.click();
      const popup = await popupPromise;
      const popupUrl = popup ? popup.url() : null;
      if (popup) await popup.close();
      record("Open Report live", Boolean(popupUrl && popupUrl.startsWith("http")), popupUrl || "no popup");
    } else {
      record("Open Report live", false, "no button");
    }
  } else {
    record("Direct report detail URL", false, "no report id");
    record("Detail refresh", false, "no report id");
    record("Open Report live", false, "no report id");
  }

  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(`${WEB_BASE}/dashboard/parent/reports`, { waitUntil: "domcontentloaded" });
  record("Desktop responsive", await page.locator(".pd-task-hub-page").isVisible());

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForSelector(".pd-task-hub-page", { timeout: 20000 });
  record("Narrow responsive", await page.locator(".pd-task-hub-page").isVisible());

  const blockingErrors = consoleErrors.filter((msg) => !/401|Unauthorized|refresh-token|favicon/i.test(msg));
  record("Console no blocking errors", blockingErrors.length === 0, blockingErrors.join(" | ") || "none");

  await browser.close();

  const failed = results.filter((row) => !row.passed);
  process.exit(failed.length > 0 ? 1 : 0);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
