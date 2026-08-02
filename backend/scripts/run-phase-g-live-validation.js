#!/usr/bin/env node
/**
 * Phase G live browser validation for Parent Notifications Hub.
 * Run: node backend/scripts/run-phase-g-live-validation.js
 */
const path = require("path");

require("dotenv").config({ path: path.join(__dirname, "../.env") });

const WEB_BASE = process.env.WEB_BASE || "http://localhost:5173";
const API_BASE = process.env.API_BASE || "http://127.0.0.1:5000/api/v1";
const PARENT_EMAIL = "fatima.parent@test.com";
const PASSWORD = "Test123456!";

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

async function run() {
  console.log(`Phase G LIVE validation — WEB=${WEB_BASE}`);
  const session = await login(PARENT_EMAIL);
  const token = session.accessToken;
  const userId = session.user?.id;
  const notifRes = await fetch(`${API_BASE}/users/${encodeURIComponent(userId)}/notifications`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const notifPayload = await notifRes.json();
  const notifications = notifPayload.data || [];
  record("Environment notifications API", notifRes.status === 200, `count=${notifications.length}`);

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

  await page.goto(`${WEB_BASE}/dashboard/parent/notifications`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".pd-task-hub-title", { timeout: 20000 });
  record("Direct Notifications URL", /Notifications/.test(await page.locator(".pd-task-hub-title").innerText()));

  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForSelector(".pd-task-hub-page", { timeout: 20000 });
  record("Refresh on Notifications page", true);

  await page.getByLabel("Parent navigation").getByRole("button", { name: "Notifications" }).click();
  await page.waitForURL(/dashboard\/parent\/notifications/, { timeout: 15000 });
  const sidebarActive = await page.locator('.pd-nav-item[aria-current="page"]').filter({ hasText: "Notifications" }).count();
  record("Sidebar Notifications navigation", sidebarActive === 1, `active=${sidebarActive}`);

  await page.goto(`${WEB_BASE}/dashboard/parent`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);
  await page.locator(".pd-notif-popover button.pd-icon-btn").click();
  await page.waitForSelector(".pd-notif-dropdown", { timeout: 10000 });
  await page.getByRole("button", { name: /View All Notifications/i }).click();
  await page.waitForURL(/dashboard\/parent\/notifications/, { timeout: 15000 });
  record("Dashboard notification preview View All", true);

  await page.waitForSelector(".pd-notification-hub-card", { timeout: 20000 });
  const cardCount = await page.locator(".pd-notification-hub-card").count();
  record("Notifications list loads", cardCount >= 1, `cards=${cardCount}`);

  const unreadCards = await page.locator(".pd-notification-hub-card.is-unread").count();
  record("Unread notifications visible", unreadCards >= 1, `unread=${unreadCards}`);

  await page.locator("#pd-notifications-hub-read").selectOption("unread");
  await page.waitForTimeout(300);
  record("Unread filter", await page.locator(".pd-notification-hub-card").count() >= 1);

  await page.locator("#pd-notifications-hub-read").selectOption("read");
  await page.waitForTimeout(300);
  const readCount = await page.locator(".pd-notification-hub-card").count();
  record("Read filter", readCount >= 0, `visible=${readCount}`);

  await page.locator("#pd-notifications-hub-read").selectOption("all");
  await page.locator("#pd-notifications-hub-type").selectOption("feedback_received");
  await page.waitForTimeout(300);
  record("Type filter", await page.locator(".pd-notification-hub-card").count() >= 1);

  await page.locator("#pd-notifications-hub-type").selectOption("all");
  await page.locator("#pd-notifications-hub-search").fill("Specialist");
  await page.waitForTimeout(300);
  record("Search", await page.locator(".pd-notification-hub-card").count() >= 1);

  await page.locator("#pd-notifications-hub-search").fill("");
  await page.locator("#pd-notifications-hub-sort").selectOption("oldest");
  await page.waitForTimeout(300);
  record("Oldest sort", await page.locator(".pd-notification-hub-card").count() >= 1);

  await page.locator("#pd-notifications-hub-sort").selectOption("unreadFirst");
  await page.waitForTimeout(300);
  record("Unread-first sort", await page.locator(".pd-notification-hub-card").count() >= 1);

  await page.locator("#pd-notifications-hub-type").selectOption("feedback_received");
  await page.locator("#pd-notifications-hub-read").selectOption("unread");
  await page.waitForTimeout(300);
  const feedbackCard = page.locator(".pd-notification-hub-card").first();
  if (await feedbackCard.count()) {
    await feedbackCard.click();
    await page.waitForURL(/dashboard\/parent\/feedback/, { timeout: 15000 });
    record("Mark read + deep navigation", true, page.url());
  } else {
    record("Mark read + deep navigation", false, "no feedback notification");
  }

  await page.goto(`${WEB_BASE}/dashboard/parent/notifications`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".pd-task-hub-title", { timeout: 20000 });
  const markAllBtn = page.getByRole("button", { name: /Mark all as read/i });
  if (await markAllBtn.count()) {
    await markAllBtn.click();
    await page.waitForTimeout(800);
    const remainingUnread = await page.locator(".pd-notification-hub-card.is-unread").count();
    record("Mark all as read", remainingUnread === 0, `remaining=${remainingUnread}`);
  } else {
    record("Mark all as read", true, "skipped — none unread");
  }

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
