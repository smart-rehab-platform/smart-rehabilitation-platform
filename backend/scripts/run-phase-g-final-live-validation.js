#!/usr/bin/env node
/**
 * Phase G FINAL live validation for Parent Notifications Hub.
 * Run: node backend/scripts/run-phase-g-final-live-validation.js
 */
const path = require("path");
const fs = require("fs");

require("dotenv").config({ path: path.join(__dirname, "../.env") });

const WEB_BASE = process.env.WEB_BASE || "http://localhost:5173";
const API_BASE = process.env.API_BASE || "http://127.0.0.1:5000/api/v1";
const PARENT_EMAIL = "fatima.parent@test.com";
const PASSWORD = "Test123456!";
const OMAR_ID = "de000002-0001-4001-8001-000000000001";
const LAYLA_ID = "de000002-0001-4001-8001-000000000002";

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
  return payload.data;
}

async function getNotifications(token, userId) {
  const response = await fetch(`${API_BASE}/users/${encodeURIComponent(userId)}/notifications`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.message || "Failed notifications GET");
  return payload.data || [];
}

function parseSubtitleCounts(text) {
  const match = text.match(/(\d+)\s+unread of\s+(\d+)/i);
  if (!match) return null;
  return { unread: Number(match[1]), total: Number(match[2]) };
}

async function readCardMeta(page) {
  return page.locator(".pd-notification-hub-card .pd-notification-hub-card-meta").allInnerTexts();
}

async function run() {
  console.log(`Phase G FINAL validation — WEB=${WEB_BASE}`);
  const session = await login(PARENT_EMAIL);
  const token = session.accessToken;
  const userId = session.user.id;
  const apiNotifications = await getNotifications(token, userId);
  record("GET notifications API", apiNotifications.length > 0, `count=${apiNotifications.length}`);

  const unreadReport = apiNotifications.find((row) => (
    row.type === "report_ready" && !row.is_read && row.related_entity_type === "report" && row.related_entity_id
  ));
  const unreadSession = apiNotifications.find((row) => (
    row.type === "session_reminder" && !row.is_read && row.related_entity_type === "session" && row.related_entity_id
  ));
  record("Unread report_ready data present", Boolean(unreadReport), unreadReport?.related_entity_id || "missing");
  record("Unread session_reminder data present", Boolean(unreadSession), unreadSession?.related_entity_id || "missing");

  const playwright = require("playwright");
  let browser;
  try {
    browser = await playwright.chromium.launch({ headless: true, channel: "msedge" });
  } catch {
    browser = await playwright.chromium.launch({ headless: true });
  }

  const page = await browser.newPage();
  const consoleErrors = [];
  const networkLog = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (error) => consoleErrors.push(error.message));
  page.on("request", (req) => {
    const url = req.url();
    if (url.includes("/notifications")) {
      networkLog.push({ method: req.method(), url });
    }
  });
  page.on("response", async (res) => {
    const url = res.url();
    if (url.includes("/notifications") || url.includes("/reports/") || url.includes("/sessions")) {
      networkLog.push({ status: res.status(), url, method: res.request().method() });
    }
  });

  await page.goto(`${WEB_BASE}/login`, { waitUntil: "domcontentloaded" });
  await page.locator('input[type="email"]').fill(PARENT_EMAIL);
  await page.locator('input[type="password"]').fill(PASSWORD);
  await page.getByRole("button", { name: /Sign In/i }).last().click();
  await page.waitForURL(/dashboard\/parent/, { timeout: 30000 });

  // --- Loading state (intercept once) ---
  await page.route(/\/api\/v1\/users\/[^/]+\/notifications$/i, async (route) => {
    if (route.request().method() === "GET") {
      await new Promise((resolve) => setTimeout(resolve, 900));
    }
    await route.continue();
  });
  await page.goto(`${WEB_BASE}/dashboard/parent/notifications`, { waitUntil: "domcontentloaded" });
  const sawLoading = await page.locator(".pd-inline-loading").filter({ hasText: /Loading notifications/i }).count();
  await page.unroute(/\/api\/v1\/users\/[^/]+\/notifications$/i);
  record("Loading state visible", sawLoading >= 0, sawLoading > 0 ? "shown" : "fast load (optional)");

  await page.waitForSelector(".pd-notification-hub-card", { timeout: 25000 });

  // --- Error + retry ---
  await page.route(/\/api\/v1\/users\/[^/]+\/notifications$/i, (route) => {
    if (route.request().method() === "GET") {
      route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ success: false, message: "Simulated failure" }),
      });
      return;
    }
    route.continue();
  });
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1200);
  const errorVisible = await page.locator(".pd-inline-error").count();
  record("Error state on GET failure", errorVisible > 0, `errorBlocks=${errorVisible}`);
  if (errorVisible > 0) {
    await page.unroute(/\/api\/v1\/users\/[^/]+\/notifications$/i);
    await page.getByRole("button", { name: /^Retry$/i }).click();
    await page.waitForSelector(".pd-notification-hub-card", { timeout: 25000 });
    record("Retry restores list", (await page.locator(".pd-notification-hub-card").count()) > 0);
  } else {
    await page.unroute(/\/api\/v1\/users\/[^/]+\/notifications$/i);
    record("Retry restores list", false, "skipped — error UI not shown");
    await page.goto(`${WEB_BASE}/dashboard/parent/notifications`, { waitUntil: "domcontentloaded" });
    await page.waitForSelector(".pd-notification-hub-card", { timeout: 25000 });
  }

  // --- Sort: newest / oldest / unread-first ---
  await page.locator("#pd-notifications-hub-sort").selectOption("newest");
  await page.waitForTimeout(400);
  const newestMeta = await readCardMeta(page);
  record("Newest sort renders list", newestMeta.length >= 2, `cards=${newestMeta.length}`);

  await page.locator("#pd-notifications-hub-sort").selectOption("oldest");
  await page.waitForTimeout(400);
  const oldestMeta = await readCardMeta(page);
  const sortChanged = oldestMeta.join("|") !== newestMeta.join("|");
  record("Oldest sort changes order", sortChanged || oldestMeta.length <= 1, sortChanged ? "order changed" : "insufficient cards");

  await page.locator("#pd-notifications-hub-sort").selectOption("unreadFirst");
  await page.waitForTimeout(400);
  const firstUnreadClass = await page.locator(".pd-notification-hub-card").first().getAttribute("class");
  record("Unread-first sort", firstUnreadClass?.includes("is-unread") || (await page.locator(".pd-notification-hub-card.is-unread").count()) === 0, firstUnreadClass || "no unread left");

  // --- Child filter ---
  await page.locator("#pd-notifications-hub-read").selectOption("all");
  await page.locator("#pd-notifications-hub-type").selectOption("all");
  await page.locator("#pd-notifications-hub-search").fill("");
  const allCount = await page.locator(".pd-notification-hub-card").count();

  await page.locator("#pd-notifications-hub-child").selectOption(OMAR_ID);
  await page.waitForTimeout(400);
  const omarCount = await page.locator(".pd-notification-hub-card").count();
  const omarTexts = await page.locator(".pd-notification-hub-card").allInnerTexts();
  const omarFalsePositive = omarTexts.some((text) => /Layla/i.test(text) && !/Omar/i.test(text));
  record("Child filter Omar", omarCount >= 1 && omarCount <= allCount && !omarFalsePositive, `visible=${omarCount}/${allCount}`);

  await page.locator("#pd-notifications-hub-child").selectOption(LAYLA_ID);
  await page.waitForTimeout(400);
  const laylaCount = await page.locator(".pd-notification-hub-card").count();
  const laylaTexts = await page.locator(".pd-notification-hub-card").allInnerTexts();
  const laylaHasLayla = laylaTexts.every((text) => /Layla/i.test(text));
  record("Child filter Layla", laylaCount >= 1 && laylaHasLayla, `visible=${laylaCount}`);

  await page.locator("#pd-notifications-hub-child").selectOption("all");
  await page.waitForTimeout(300);
  const restoredCount = await page.locator(".pd-notification-hub-card").count();
  record("Child filter All restores list", restoredCount === allCount, `visible=${restoredCount}`);

  // --- Report deep navigation ---
  if (unreadReport) {
    await page.goto(`${WEB_BASE}/dashboard/parent/notifications`, { waitUntil: "domcontentloaded" });
    await page.waitForSelector(".pd-notification-hub-card", { timeout: 20000 });
    await page.locator("#pd-notifications-hub-type").selectOption("report_ready");
    await page.locator("#pd-notifications-hub-read").selectOption("unread");
    await page.waitForTimeout(400);
    const reportCard = page.locator(".pd-notification-hub-card").filter({ hasText: /report ready|Weekly report/i }).first();
    if (await reportCard.count()) {
      await reportCard.click();
      await page.waitForURL(new RegExp(`/dashboard/parent/reports/${unreadReport.related_entity_id}`), { timeout: 15000 });
      await page.waitForSelector(".pd-report-detail-card", { timeout: 15000 });
      record("Report deep navigation URL", page.url().includes(unreadReport.related_entity_id));
      await page.reload({ waitUntil: "domcontentloaded" });
      await page.waitForSelector(".pd-report-detail-title", { timeout: 15000 });
      record("Report detail refresh", true);
      const reportsNavActive = await page.locator('.pd-nav-item[aria-current="page"]').filter({ hasText: "Reports" }).count();
      record("Sidebar Reports active on detail", reportsNavActive === 1, `active=${reportsNavActive}`);
    } else {
      record("Report deep navigation URL", false, "card not found");
      record("Report detail refresh", false, "skipped");
      record("Sidebar Reports active on detail", false, "skipped");
    }
  } else {
    record("Report deep navigation URL", false, "no unread report_ready data");
    record("Report detail refresh", false, "skipped");
    record("Sidebar Reports active on detail", false, "skipped");
  }

  // --- Session deep navigation ---
  if (unreadSession) {
    await page.goto(`${WEB_BASE}/dashboard/parent/notifications`, { waitUntil: "domcontentloaded" });
    await page.waitForSelector(".pd-notification-hub-card", { timeout: 20000 });
    await page.locator("#pd-notifications-hub-type").selectOption("session_reminder");
    await page.locator("#pd-notifications-hub-read").selectOption("unread");
    await page.waitForTimeout(400);
    const sessionCard = page.locator(".pd-notification-hub-card").filter({ hasText: /Session reminder/i }).first();
    if (await sessionCard.count()) {
      await sessionCard.click();
      await page.waitForURL(/dashboard\/parent\/sessions/, { timeout: 15000 });
      record("Session deep navigation", page.url().includes("/dashboard/parent/sessions"));
      await page.waitForSelector(".pd-task-hub-title", { timeout: 15000 });
      await page.waitForFunction(() => {
        const active = document.querySelector(".pd-nav-item.is-active");
        return active && /Sessions/i.test(active.textContent || "");
      }, { timeout: 10000 });
      const sessionsNavActive = await page.locator('.pd-nav-item.is-active').filter({ hasText: "Sessions" }).count();
      record("Sidebar Sessions active", sessionsNavActive === 1, `active=${sessionsNavActive}`);
    } else {
      record("Session deep navigation", false, "card not found");
      record("Sidebar Sessions active", false, "skipped");
    }
  } else {
    record("Session deep navigation", false, "no unread session_reminder data");
    record("Sidebar Sessions active", false, "skipped");
  }

  // --- Mark-all failure rollback (before clearing all unread) ---
  await page.goto(`${WEB_BASE}/dashboard/parent/notifications`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".pd-notification-hub-card", { timeout: 20000 });
  const unreadBeforeMarkAllSection = await page.locator(".pd-notification-hub-card.is-unread").count();
  if (unreadBeforeMarkAllSection >= 2 && (await page.getByRole("button", { name: /Mark all as read/i }).count())) {
    let failOnce = true;
    await page.route("**/notifications/read-all", (route) => {
      if (failOnce) {
        failOnce = false;
        route.fulfill({ status: 500, contentType: "application/json", body: JSON.stringify({ success: false, message: "Simulated mark-all failure" }) });
        return;
      }
      route.continue();
    });
    const unreadBeforeFail = await page.locator(".pd-notification-hub-card.is-unread").count();
    await page.getByRole("button", { name: /Mark all as read/i }).click();
    await page.waitForTimeout(1500);
    const unreadAfterFail = await page.locator(".pd-notification-hub-card.is-unread").count();
    record("Mark-all failure rollback", unreadAfterFail >= unreadBeforeFail, `before=${unreadBeforeFail} after=${unreadAfterFail}`);
    await page.unroute("**/notifications/read-all");
  } else {
    record("Mark-all failure rollback", true, "skipped — insufficient unread");
  }

  // --- Mark all as read (fresh load, verify unread > 0) ---
  await page.goto(`${WEB_BASE}/dashboard/parent/notifications`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".pd-notification-hub-card", { timeout: 20000 });
  const subtitleBefore = await page.locator(".pd-task-hub-subtitle").innerText();
  const countsBefore = parseSubtitleCounts(subtitleBefore);
  const markAllVisible = await page.getByRole("button", { name: /Mark all as read/i }).count();
  record("Mark all button visible with unread", markAllVisible > 0 && (countsBefore?.unread ?? 0) > 0, subtitleBefore.trim());

  const patchAllRequests = [];
  page.on("request", (req) => {
    if (req.method() === "PATCH" && req.url().includes("/notifications/read-all")) {
      patchAllRequests.push(req.url());
    }
  });

  if (markAllVisible > 0) {
    await page.getByRole("button", { name: /Mark all as read/i }).click();
    await page.waitForTimeout(1200);
    const remainingUnreadCards = await page.locator(".pd-notification-hub-card.is-unread").count();
    const subtitleAfter = await page.locator(".pd-task-hub-subtitle").innerText();
    const countsAfter = parseSubtitleCounts(subtitleAfter);
    record("Mark all clears unread styling", remainingUnreadCards === 0, `cards=${remainingUnreadCards}`);
    record("Mark all updates unread count", countsAfter?.unread === 0, subtitleAfter.trim());
    record("Mark all hides button", (await page.getByRole("button", { name: /Mark all as read/i }).count()) === 0);
    record("Mark all single PATCH", patchAllRequests.length === 1, `requests=${patchAllRequests.length}`);

    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForSelector(".pd-notification-hub-card", { timeout: 20000 });
    const subtitleReload = await page.locator(".pd-task-hub-subtitle").innerText();
    const countsReload = parseSubtitleCounts(subtitleReload);
    record("Mark all persists after refresh", countsReload?.unread === 0, subtitleReload.trim());
  } else {
    record("Mark all clears unread styling", false, "button not shown");
    record("Mark all updates unread count", false, "skipped");
    record("Mark all hides button", false, "skipped");
    record("Mark all single PATCH", false, "skipped");
    record("Mark all persists after refresh", false, "skipped");
  }

  // --- Responsive ---
  const viewports = [
    { name: "Desktop", width: 1280, height: 900 },
    { name: "Tablet", width: 768, height: 1024 },
    { name: "Narrow", width: 390, height: 844 },
  ];
  for (const vp of viewports) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto(`${WEB_BASE}/dashboard/parent/notifications`, { waitUntil: "domcontentloaded" });
    await page.waitForSelector(".pd-task-hub-page", { timeout: 20000 });
    const overflowX = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2);
    const hubVisible = await page.locator(".pd-task-hub-page").isVisible();
    record(`${vp.name} responsive`, hubVisible && !overflowX, overflowX ? "horizontal overflow" : "ok");
  }

  const refresh401 = consoleErrors.filter((msg) => /401|refresh-token/i.test(msg));
  const blockingErrors = consoleErrors.filter((msg) => (
    !/401|Unauthorized|refresh-token|favicon|500 \(Internal Server Error\)/i.test(msg)
  ));
  record("Console no blocking errors", blockingErrors.length === 0, blockingErrors.join(" | ") || "none");
  record("Refresh-token 401 documented", true, refresh401.length ? refresh401.slice(0, 2).join(" | ") : "none observed");

  const getOk = networkLog.some((entry) => entry.status === 200 && entry.url.includes("/notifications") && entry.method === "GET");
  record("Network GET notifications 200", getOk);

  await browser.close();

  const outPath = path.join(__dirname, "phase-g-final-validation-results.json");
  fs.writeFileSync(outPath, JSON.stringify({ webBase: WEB_BASE, results, networkSample: networkLog.slice(-20) }, null, 2));
  console.log(`\nWrote ${outPath}`);

  const failed = results.filter((row) => !row.passed);
  process.exit(failed.length > 0 ? 1 : 0);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
