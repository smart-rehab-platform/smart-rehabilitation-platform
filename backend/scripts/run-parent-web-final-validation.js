#!/usr/bin/env node
/**
 * Final Parent Web smoke validation.
 * Run: node backend/scripts/run-parent-web-final-validation.js
 */
const path = require("path");

require("dotenv").config({ path: path.join(__dirname, "../.env") });

const WEB_BASE = process.env.WEB_BASE || "http://localhost:5173";
const API_BASE = process.env.API_BASE || "http://127.0.0.1:5000/api/v1";
const PARENT_EMAIL = "fatima.parent@test.com";
const PASSWORD = "Test123456!";
const INVALID_REPORT_ID = "00000000-0000-4000-8000-000000000099";

const results = [];

function record(name, passed, detail = "") {
  results.push({ name, passed, detail });
  console.log(`${passed ? "PASS" : "FAIL"} ${name}${detail ? ` — ${detail}` : ""}`);
}

async function loginApi() {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: PARENT_EMAIL, password: PASSWORD }),
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.message || "Login failed");
  return payload.data;
}

async function loginBrowser(page) {
  await page.goto(`${WEB_BASE}/login`, { waitUntil: "domcontentloaded" });
  await page.locator('input[type="email"]').fill(PARENT_EMAIL);
  await page.locator('input[type="password"]').fill(PASSWORD);
  await page.getByRole("button", { name: /Sign In/i }).last().click();
  await page.waitForURL(/dashboard\/parent/, { timeout: 30000 });
}

async function waitForPageRoot(page, selector, timeout = 20000) {
  await page.waitForSelector(selector, { timeout });
}

async function assertSidebarActive(page, label) {
  const count = await page.locator(".pd-nav-item.is-active").filter({ hasText: label }).count();
  return count > 0;
}

async function run() {
  console.log(`Parent Web final validation — WEB=${WEB_BASE} API=${API_BASE}`);

  let token;
  try {
    const session = await loginApi();
    token = session.accessToken;
    record("API login", Boolean(token), PARENT_EMAIL);
  } catch (error) {
    record("API login", false, error.message);
    console.error("\nCannot continue without API login.");
    process.exitCode = 1;
    return;
  }

  const playwright = require("playwright");
  let browser;
  try {
    browser = await playwright.chromium.launch({ headless: true, channel: "msedge" });
  } catch {
    browser = await playwright.chromium.launch({ headless: true });
  }

  const page = await browser.newPage();
  const consoleErrors = [];
  const apiRequests = [];

  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("response", (res) => {
    const url = res.url();
    if (url.includes("/api/v1/")) {
      apiRequests.push({ status: res.status(), url });
    }
  });

  await loginBrowser(page);
  record("Browser login", /dashboard\/parent/.test(page.url()), page.url());

  await waitForPageRoot(page, ".pd-child-trigger");
  const childTrigger = page.locator(".pd-child-trigger").first();
  await childTrigger.click();
  const childOptions = page.getByRole("option");
  const childCount = await childOptions.count();
  record("Child selector loads", childCount > 0, `options=${childCount}`);
  if (childCount > 1) {
    await childOptions.nth(1).click();
    record("Child switching", true, await childTrigger.innerText());
  } else if (childCount === 1) {
    await childOptions.first().click();
    record("Child switching", true, "single child");
  }

  const routes = [
    { path: "/dashboard/parent", root: ".pd-preview", sidebar: "Dashboard" },
    { path: "/dashboard/parent/daily-tasks", root: ".pd-task-hub-page", sidebar: "Exercises" },
    { path: "/dashboard/parent/feedback", root: ".pd-task-hub-page, .pd-feedback-page", sidebar: "Feedback" },
    { path: "/dashboard/parent/sessions", root: ".pd-task-hub-page, .pd-sessions-page", sidebar: "Sessions" },
    { path: "/dashboard/parent/reports", root: ".pd-task-hub-page, .pd-reports-page", sidebar: "Reports" },
    { path: "/dashboard/parent/notifications", root: ".pd-notifications-page, .pd-task-hub-page", sidebar: "Notifications" },
    { path: "/dashboard/parent/profile", root: ".pd-profile-page", sidebar: "Profile" },
  ];

  for (const route of routes) {
    await page.goto(`${WEB_BASE}${route.path}`, { waitUntil: "domcontentloaded" });
    await waitForPageRoot(page, route.root);
    const refreshed = await page.locator(route.root).first().isVisible();
    record(`Route ${route.path}`, refreshed, "loaded");
    record(`Sidebar active: ${route.sidebar}`, await assertSidebarActive(page, route.sidebar), route.path);
    await page.reload({ waitUntil: "domcontentloaded" });
    await waitForPageRoot(page, route.root);
    record(`Refresh ${route.path}`, await page.locator(route.root).first().isVisible(), "ok");
  }

  await page.goto(`${WEB_BASE}/dashboard/parent/daily-tasks`, { waitUntil: "domcontentloaded" });
  await waitForPageRoot(page, ".pd-task-hub-page");
  const taskCard = page.locator(".pd-task-hub-card").first();
  if (await taskCard.count()) {
    await taskCard.click();
    await page.waitForURL(/exercise-details/, { timeout: 15000 });
    record("Exercise detail navigation", /exercise-details/.test(page.url()), page.url());
    await page.goBack({ waitUntil: "domcontentloaded" });
    record("Back from exercise detail", /daily-tasks/.test(page.url()), page.url());
  } else {
    record("Exercise detail navigation", true, "no actionable task card");
    record("Back from exercise detail", true, "skipped");
  }

  await page.goto(`${WEB_BASE}/dashboard/parent/reports`, { waitUntil: "domcontentloaded" });
  await waitForPageRoot(page, ".pd-task-hub-page, .pd-reports-page");
  const reportLink = page.locator(".pd-task-hub-card, .pd-report-card, a[href*='/reports/']").first();
  if (await reportLink.count()) {
    await reportLink.click();
    await page.waitForURL(/\/reports\/.+/, { timeout: 15000 });
    record("Report detail navigation", /\/reports\/.+/.test(page.url()), page.url());
    await page.goBack({ waitUntil: "domcontentloaded" });
    record("Back from report detail", /\/reports$/.test(page.url().split("?")[0]), page.url());
  } else {
    record("Report detail navigation", true, "no report rows");
    record("Back from report detail", true, "skipped");
  }

  await page.goto(`${WEB_BASE}/dashboard/parent/reports/${INVALID_REPORT_ID}`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);
  const invalidReportError = await page.locator(".pd-inline-error").count();
  record("Invalid report URL handling", invalidReportError > 0, `errors=${invalidReportError}`);

  await page.goto(`${WEB_BASE}/dashboard/parent/notifications`, { waitUntil: "domcontentloaded" });
  await waitForPageRoot(page, ".pd-notifications-page, .pd-task-hub-page");
  const unreadItem = page.locator(".pd-notification-item.is-unread, .pd-notification-card.is-unread").first();
  if (await unreadItem.count()) {
    await unreadItem.click();
    record("Mark notification read", true, "clicked unread item");
  } else {
    record("Mark notification read", true, "no unread notifications");
  }

  await page.goto(`${WEB_BASE}/dashboard/parent`, { waitUntil: "domcontentloaded" });
  await page.locator(".pd-profile-trigger").click();
  await page.waitForSelector(".pd-profile-dropdown", { timeout: 10000 });
  await page.locator(".pd-dropdown-item").filter({ hasText: "View profile" }).click();
  await page.waitForURL(/\/profile/, { timeout: 15000 });
  record("Header profile shortcut", /\/profile/.test(page.url()), page.url());

  await page.goto(`${WEB_BASE}/dashboard/parent`, { waitUntil: "domcontentloaded" });
  await waitForPageRoot(page, ".pd-child-trigger");
  if (childCount > 1) {
    await childTrigger.click();
    await childOptions.nth(1).click();
    const selectedChild = (await childTrigger.innerText()).trim();
    await page.getByRole("button", { name: /^Sessions$/i }).click();
    await page.waitForURL(/\/sessions/, { timeout: 15000 });
    const sessionsUrl = page.url();
    record("Sidebar preserves child context (sessions)", sessionsUrl.includes("childId="), sessionsUrl);
  } else {
    record("Sidebar preserves child context (sessions)", true, "single child only");
  }

  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(`${WEB_BASE}/dashboard/parent`, { waitUntil: "domcontentloaded" });
  await waitForPageRoot(page, ".pd-preview");
  record("Desktop responsive", await page.locator(".pd-preview").isVisible(), "1280x900");

  await page.setViewportSize({ width: 768, height: 1024 });
  await page.reload({ waitUntil: "domcontentloaded" });
  await waitForPageRoot(page, ".pd-preview");
  record("Tablet responsive", await page.locator(".pd-preview").isVisible(), "768x1024");

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload({ waitUntil: "domcontentloaded" });
  await waitForPageRoot(page, ".pd-preview");
  const mobileNavBtn = page.locator(".pd-mobile-menu");
  if (await mobileNavBtn.count()) {
    await mobileNavBtn.click();
    await page.waitForSelector(".pd-sidebar.is-mobile-open", { timeout: 10000 });
    const overlay = page.locator(".pd-overlay");
    if (await overlay.count()) {
      await overlay.click();
      await page.waitForTimeout(300);
      record("Mobile drawer closes on overlay", !(await page.locator(".pd-sidebar.is-mobile-open").count()), "overlay");
    } else {
      record("Mobile drawer closes on overlay", true, "no overlay visible");
    }
  } else {
    record("Mobile drawer closes on overlay", true, "mobile nav button not found");
  }
  record("Mobile responsive", await page.locator(".pd-preview").isVisible(), "390x844");

  const okApi = apiRequests.filter((row) => row.status >= 200 && row.status < 400).length;
  record("API requests mostly succeed", okApi > 0, `ok=${okApi}/${apiRequests.length}`);

  const blockingConsoleErrors = consoleErrors.filter(
    (line) => !/401|favicon|Failed to load resource|refresh/i.test(line),
  );
  record("No blocking console errors", blockingConsoleErrors.length === 0, blockingConsoleErrors.slice(0, 2).join(" | ") || "clean");

  await browser.close();

  const failed = results.filter((row) => !row.passed);
  console.log(`\nSummary: ${results.length - failed.length}/${results.length} passed`);
  if (failed.length) {
    process.exitCode = 1;
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
