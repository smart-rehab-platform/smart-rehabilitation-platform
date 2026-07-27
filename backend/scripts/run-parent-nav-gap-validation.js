#!/usr/bin/env node
/**
 * Validate Parent Web navigation for implemented modules.
 * Run: node backend/scripts/run-parent-nav-gap-validation.js
 */
const path = require("path");

require("dotenv").config({ path: path.join(__dirname, "../.env") });

const WEB_BASE = process.env.WEB_BASE || "http://localhost:5173";
const PARENT_EMAIL = "fatima.parent@test.com";
const PASSWORD = "Test123456!";

const IMPLEMENTED_ROUTES = [
  {
    path: "/dashboard/parent/children",
    heading: /My Children/i,
    sidebarId: "children",
  },
  {
    path: "/dashboard/parent/case-requests",
    heading: /Case Requests/i,
    sidebarId: "cases",
  },
  {
    path: "/dashboard/parent/progress",
    heading: /Progress/i,
    sidebarId: "progress",
  },
  {
    path: "/dashboard/parent/messages",
    heading: /Messages/i,
    sidebarId: "messages",
  },
];

const UNAVAILABLE_MESSAGES = [
  "My Children is not available on web yet.",
  "Case requests are not available on web yet.",
  "Progress details are not available on web yet.",
  "Messages is not available on web yet.",
  "This feature is not available on web yet.",
];

const results = [];

function record(name, passed, detail = "") {
  results.push({ name, passed, detail });
  console.log(`${passed ? "PASS" : "FAIL"} ${name}${detail ? ` — ${detail}` : ""}`);
}

async function loginBrowser(page) {
  await page.goto(`${WEB_BASE}/login`, { waitUntil: "domcontentloaded" });
  await page.locator('input[type="email"]').fill(PARENT_EMAIL);
  await page.locator('input[type="password"]').fill(PASSWORD);
  await page.getByRole("button", { name: /Sign In/i }).last().click();
  await page.waitForURL(/dashboard\/parent/, { timeout: 30000 });
}

async function assertNoUnavailableToast(page) {
  for (const message of UNAVAILABLE_MESSAGES) {
    const count = await page.locator(".pd-toast").filter({ hasText: message }).count();
    if (count > 0) {
      return message;
    }
  }
  return null;
}

async function run() {
  console.log(`Parent nav validation — WEB=${WEB_BASE}`);
  const playwright = require("playwright");
  let browser;
  try {
    browser = await playwright.chromium.launch({ headless: true, channel: "msedge" });
  } catch {
    browser = await playwright.chromium.launch({ headless: true });
  }

  const page = await browser.newPage();
  const consoleErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });

  await loginBrowser(page);

  for (const route of IMPLEMENTED_ROUTES) {
    await page.goto(`${WEB_BASE}${route.path}`, { waitUntil: "networkidle" });
    const finalPath = new URL(page.url()).pathname;
    const redirectedToDashboard = finalPath === "/dashboard/parent";
    const onExpectedRoute = finalPath === route.path || finalPath.startsWith(`${route.path}/`);

    record(
      `Direct URL opens ${route.path}`,
      onExpectedRoute && !redirectedToDashboard,
      `final=${finalPath}`,
    );

    const headingVisible = await page.getByRole("heading", { name: route.heading }).count();
    record(
      `${route.path} renders real page heading`,
      headingVisible > 0,
      headingVisible > 0 ? "heading found" : "heading missing",
    );

    const toastMessage = await assertNoUnavailableToast(page);
    record(
      `${route.path} has no unavailable toast`,
      !toastMessage,
      toastMessage || "no toast",
    );

    await page.reload({ waitUntil: "networkidle" });
    const reloadPath = new URL(page.url()).pathname;
    record(
      `${route.path} refresh keeps route`,
      reloadPath === route.path || reloadPath.startsWith(`${route.path}/`),
      `final=${reloadPath}`,
    );
  }

  await page.goto(`${WEB_BASE}/dashboard/parent`, { waitUntil: "networkidle" });
  await page.waitForSelector(".pd-progress-view-btn", { timeout: 15000 });
  await page.locator(".pd-progress-view-btn").click();
  await page.waitForLoadState("networkidle");
  const childDetailPath = new URL(page.url()).pathname;
  record(
    "Child card View Details opens child details",
    /\/dashboard\/parent\/children\/[^/]+$/.test(childDetailPath),
    `final=${childDetailPath}`,
  );
  record(
    "View Details has no unavailable toast",
    !(await assertNoUnavailableToast(page)),
    (await assertNoUnavailableToast(page)) || "no toast",
  );

  const sidebarChecks = [
    { label: "My Children", path: "/dashboard/parent/children" },
    { label: "Case Requests", path: "/dashboard/parent/case-requests" },
    { label: "Progress", path: "/dashboard/parent/progress" },
    { label: "Messages", path: "/dashboard/parent/messages" },
  ];

  for (const item of sidebarChecks) {
    await page.goto(`${WEB_BASE}/dashboard/parent`, { waitUntil: "domcontentloaded" });
    await page.waitForSelector(".pd-sidebar-nav", { timeout: 15000 });
    await page.getByRole("complementary", { name: "Parent navigation" })
      .getByRole("button", { name: new RegExp(`^${item.label}$`, "i") })
      .click();
    await page.waitForLoadState("networkidle");
    const finalPath = new URL(page.url()).pathname;
    record(
      `Sidebar ${item.label} opens real route`,
      finalPath === item.path || finalPath.startsWith(`${item.path}/`),
      `final=${finalPath}`,
    );
    record(
      `Sidebar ${item.label} has no unavailable toast`,
      !(await assertNoUnavailableToast(page)),
      (await assertNoUnavailableToast(page)) || "no toast",
    );
  }

  record(
    "No console errors during validation",
    consoleErrors.length === 0,
    consoleErrors.slice(0, 3).join(" | ") || "clean",
  );

  await browser.close();

  const failed = results.filter((row) => !row.passed);
  console.log(`\nSummary: ${results.length - failed.length}/${results.length} passed`);
  if (failed.length) process.exitCode = 1;
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
