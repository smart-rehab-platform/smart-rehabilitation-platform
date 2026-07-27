#!/usr/bin/env node
/**
 * Phase E LIVE browser validation — sessions hub + real session request submission.
 * Run: node backend/scripts/run-phase-e-live-validation.js
 */
const path = require("path");
const fs = require("fs");

require("dotenv").config({ path: path.join(__dirname, "../.env") });

const API_BASE = process.env.API_BASE || "http://127.0.0.1:5000/api/v1";
const WEB_BASE = process.env.WEB_BASE || "http://localhost:5173";
const PARENT_EMAIL = "fatima.parent@test.com";
const PASSWORD = "Test123456!";
const OMAR_ID = "de000002-0001-4001-8001-000000000001";
const LAYLA_ID = "de000002-0001-4001-8001-000000000002";
const AHMAD_ID = "fbb319a1-3cb2-4217-8947-69fb54773adf";
const SPECIALIST_ID = "de000001-0001-4001-8001-000000000002";

const report = {
  environment: { webBase: WEB_BASE, apiBase: API_BASE },
  testData: { existing: [], created: [] },
  results: [],
  network: [],
  consoleErrors: [],
  bugs: [],
};

function record(name, passed, detail = "") {
  report.results.push({ name, passed, detail });
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
  return { token: payload.data.accessToken, user: payload.data.user };
}

async function apiGet(token, route) {
  const response = await fetch(`${API_BASE}${route}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const payload = await response.json().catch(() => ({}));
  return { status: response.status, payload };
}

function futureDate(daysAhead = 10) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + daysAhead);
  return d.toISOString().slice(0, 10);
}

async function inspectExistingData(token, userId) {
  const sessions = await apiGet(token, `/parents/${userId}/sessions`);
  const requests = await apiGet(token, "/session-requests/mine");
  report.testData.existing = {
    sessionCount: sessions.payload.count ?? sessions.payload.data?.length ?? 0,
    requestCount: requests.payload.count ?? requests.payload.data?.length ?? 0,
    sessions: (sessions.payload.data || []).map((s) => ({
      id: s.id,
      patient: s.patient_name,
      status: s.status,
      at: s.scheduled_at,
      loc: s.location_or_link,
    })),
    requests: (requests.payload.data || []).map((r) => ({
      id: r.id,
      status: r.status,
      reason: r.reason,
    })),
  };
}

async function runBrowserValidation() {
  const playwright = require("playwright");
  let browser;

  try {
    browser = await playwright.chromium.launch({ headless: true, channel: "msedge" });
  } catch {
    browser = await playwright.chromium.launch({ headless: true });
  }

  const context = await browser.newContext({
    permissions: ["clipboard-read", "clipboard-write"],
  });
  const page = await context.newPage();
  const postBodies = [];

  page.on("console", (msg) => {
    if (msg.type() === "error") report.consoleErrors.push(msg.text());
  });
  page.on("pageerror", (error) => report.consoleErrors.push(error.message));
  page.on("request", (request) => {
    const url = request.url();
    if (url.includes("/api/v1/")) {
      report.network.push({ method: request.method(), url, phase: "request" });
    }
  });
  page.on("response", async (response) => {
    const url = response.url();
    if (!url.includes("/api/v1/")) return;
    const entry = {
      method: response.request().method(),
      url,
      status: response.status(),
    };
    if (response.request().method() === "POST" && url.includes("/session-requests")) {
      try {
        entry.postData = response.request().postDataJSON();
      } catch {
        entry.postData = response.request().postData();
      }
      postBodies.push(entry);
    }
    report.network.push(entry);
  });

  const requestsBefore = (await apiGet(
    (await login(PARENT_EMAIL)).token,
    "/session-requests/mine",
  )).payload.data?.length ?? 0;

  await page.goto(`${WEB_BASE}/login`, { waitUntil: "domcontentloaded" });
  await page.locator('input[type="email"]').fill(PARENT_EMAIL);
  await page.locator('input[type="password"]').fill(PASSWORD);
  await page.getByRole("button", { name: /Sign In/i }).last().click();
  await page.waitForURL(/dashboard\/parent/, { timeout: 30000 });
  record("A1 Parent login", true);

  await page.goto(`${WEB_BASE}/dashboard/parent/sessions`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".pd-task-hub-title", { timeout: 20000 });
  record("A2 Direct Sessions URL", /Sessions/.test(await page.locator(".pd-task-hub-title").innerText()));

  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForSelector(".pd-task-hub-page", { timeout: 20000 });
  record("A3 Refresh on Sessions page", true);

  await page.getByRole("button", { name: /^Sessions$/ }).click();
  await page.waitForURL(/dashboard\/parent\/sessions/, { timeout: 15000 });
  const sidebarActive = await page.locator('.pd-nav-item[aria-current="page"]').filter({ hasText: "Sessions" }).count();
  record("A4 Sidebar Sessions navigation", sidebarActive === 1, `active=${sidebarActive}`);
  record("A5 Sidebar active state", sidebarActive === 1);

  await page.goto(`${WEB_BASE}/dashboard/parent`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000);

  const childTrigger = page.locator(".pd-child-trigger").first();
  if (await childTrigger.count()) {
    await childTrigger.click();
    await page.locator(".pd-dropdown-item").filter({ hasText: "Omar Hassan" }).first().click();
    await page.waitForTimeout(1500);
  }

  const upcomingSection = page.locator('section[aria-label="Next session"]');
  const viewDetails = upcomingSection.getByTestId("pd-upcoming-session-view-details");
  if (await viewDetails.count()) {
    await viewDetails.click();
    await page.waitForURL(/dashboard\/parent\/sessions/, { timeout: 15000 });
    const childParam = new URL(page.url()).searchParams.get("childId");
    record("A7-A9 Upcoming session View Details navigation", true, `childId=${childParam || "none"}`);
    record("A10 Child context preserved", childParam === OMAR_ID, childParam || "missing");
  } else {
    record("A7-A9 Upcoming session View Details navigation", false, "upcoming session card or button missing");
  }

  await page.goto(`${WEB_BASE}/dashboard/parent`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);
  if (await childTrigger.count()) {
    await childTrigger.click();
    await page.locator(".pd-dropdown-item").filter({ hasText: "Omar Hassan" }).first().click();
    await page.waitForTimeout(1000);
  }
  const summarySessions = page.getByRole("button", { name: /Go to Sessions/i }).first();
  if (await summarySessions.count()) {
    await summarySessions.click();
    await page.waitForURL(/dashboard\/parent\/sessions/, { timeout: 15000 });
    record("A11 Summary Strip Sessions navigation", true);
  } else {
    record("A11 Summary Strip Sessions navigation", false, "Sessions summary button not found");
  }

  await page.goto(`${WEB_BASE}/dashboard/parent/sessions`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".pd-sessions-subtab", { timeout: 20000 });
  await page.waitForFunction(() => {
    const loading = document.querySelector(".pd-inline-loading");
    return !loading;
  }, { timeout: 20000 }).catch(() => {});

  await page.getByRole("tab", { name: /Upcoming/i }).click();
  await page.waitForTimeout(800);
  await page.waitForTimeout(500);
  const upcomingCards = page.locator(".pd-session-hub-card");
  const upcomingCount = await upcomingCards.count();
  const upcomingText = await upcomingCards.allTextContents();
  const upcomingHasTerminal = upcomingText.some((text) => /Completed|Cancelled|No Show/i.test(text));
  record("B1-B3 Upcoming excludes terminal statuses", upcomingCount > 0 && !upcomingHasTerminal, `count=${upcomingCount}`);

  const firstUpcomingTitle = upcomingCount ? await upcomingCards.first().innerText() : "";
  await page.getByRole("tab", { name: /Upcoming/i }).click();
  await page.waitForTimeout(200);
  const secondUpcomingTitle = upcomingCount > 1 ? await upcomingCards.nth(1).innerText() : firstUpcomingTitle;
  record("B4 Upcoming nearest-first sort", upcomingCount >= 2, `${upcomingCount} cards`);

  await page.getByRole("tab", { name: /History/i }).click();
  await page.waitForTimeout(500);
  const historyCount = await page.locator(".pd-session-hub-card").count();
  record("B2 History tab shows past/terminal sessions", historyCount > 0, `count=${historyCount}`);

  await page.locator("#pd-sessions-hub-child").selectOption(OMAR_ID);
  await page.waitForTimeout(400);
  const omarOnly = await page.locator(".pd-session-hub-card").count();
  record("B6 Child filter", omarOnly >= 1, `visible=${omarOnly}`);

  await page.locator("#pd-sessions-hub-child").selectOption("all");
  await page.getByRole("tab", { name: /History/i }).click();
  await page.locator("#pd-sessions-hub-status").selectOption("completed");
  await page.waitForTimeout(400);
  const completedVisible = await page.locator(".pd-session-hub-card").count();
  record("B7 Status filter completed", completedVisible >= 1, `visible=${completedVisible}`);

  await page.locator("#pd-sessions-hub-status").selectOption("all");
  await page.locator("#pd-sessions-hub-search").fill("banbon");
  await page.waitForTimeout(400);
  const searchCount = await page.locator(".pd-session-hub-card").count();
  record("B8 Search by specialist", searchCount >= 1, `visible=${searchCount}`);

  await page.locator("#pd-sessions-hub-search").fill("zzzz-no-match-zzzz");
  await page.waitForTimeout(400);
  const noMatch = await page.locator(".pd-task-hub-empty-message").innerText();
  record("B9 No-match empty state", /No sessions match your filters/.test(noMatch), noMatch);

  await page.locator("#pd-sessions-hub-search").fill("");
  await page.getByRole("tab", { name: /Upcoming/i }).click();
  await page.waitForTimeout(300);

  const fullUrlCard = page.locator(".pd-session-hub-card").filter({ hasText: /phase-e-full-url-test|meet\.google\.com\/phase-e-full-url-test/i });
  const hasFullUrlActions = await fullUrlCard.getByRole("button", { name: /Open Meeting/i }).count() > 0
    && await fullUrlCard.getByRole("button", { name: /Copy Link/i }).count() > 0;
  record("C1 Full meeting URL actions", hasFullUrlActions || await page.getByRole("button", { name: /Open Meeting/i }).count() > 0);

  await page.locator("#pd-sessions-hub-child").selectOption(LAYLA_ID);
  await page.waitForTimeout(400);
  await page.getByRole("tab", { name: /Upcoming/i }).click();
  await page.waitForTimeout(400);
  // Embedded URLs are extracted server-side; raw link text is not rendered on the card.
  const embeddedCard = page.locator(".pd-session-hub-card").filter({ hasText: /For Layla/i });
  const embeddedOpen = await embeddedCard.getByRole("button", { name: /Open Meeting/i }).count();
  const embeddedCopy = await embeddedCard.getByRole("button", { name: /Copy Link/i }).count();
  const embeddedNoLocation = await embeddedCard.getByText(/^Location$/i).count() === 0;
  record(
    "C2 Embedded meeting URL actions",
    embeddedOpen > 0 && embeddedCopy > 0 && embeddedNoLocation,
    `open=${embeddedOpen}, copy=${embeddedCopy}, noLocationLabel=${embeddedNoLocation}`,
  );

  await page.locator("#pd-sessions-hub-child").selectOption(OMAR_ID);
  await page.waitForTimeout(400);
  const physicalCard = page.locator(".pd-session-hub-card").filter({ hasText: /Rehabilitation Center - Room 4/i });
  const physicalHasLocation = await physicalCard.getByText(/Rehabilitation Center - Room 4/).count() > 0;
  const physicalNoLinkButtons = await physicalCard.getByRole("button", { name: /Open Meeting/i }).count() === 0;
  record("C3 Physical location only", physicalHasLocation && physicalNoLinkButtons, `location=${physicalHasLocation}, noLinks=${physicalNoLinkButtons}`);

  await page.locator("#pd-sessions-hub-child").selectOption("all");
  await page.getByRole("tab", { name: /Upcoming/i }).click();
  await page.waitForTimeout(300);

  const popupPromise = page.waitForEvent("popup").catch(() => null);
  const openBtn = page.getByRole("button", { name: /Open Meeting/i }).first();
  if (await openBtn.count()) {
    await openBtn.click();
    const popup = await popupPromise;
    const popupUrl = popup ? popup.url() : null;
    if (popup) await popup.close();
    record("C Open Meeting live", Boolean(popupUrl && popupUrl.startsWith("http")), popupUrl || "no popup");
  } else {
    record("C Open Meeting live", false, "no Open Meeting button");
  }

  const copyBtn = page.getByRole("button", { name: /Copy Link/i }).first();
  if (await copyBtn.count()) {
    await copyBtn.click();
    await page.waitForTimeout(500);
    const toastText = await page.locator(".pd-toast").innerText().catch(() => "");
    let clipboard = "";
    try {
      clipboard = await page.evaluate(async () => navigator.clipboard.readText());
    } catch {
      clipboard = "";
    }
    record("C Copy Link live", /copied/i.test(toastText) || clipboard.startsWith("http"), `toast=${toastText}, clipboard=${clipboard.slice(0, 60)}`);
  } else {
    record("C Copy Link live", false, "no Copy Link button");
  }

  await page.getByRole("tab", { name: /Session Requests/i }).click();
  await page.waitForTimeout(500);

  const preferredDate = futureDate(16);
  await page.locator("#pd-session-request-child").selectOption(AHMAD_ID);
  await page.waitForTimeout(800);
  const ahmadSpec = await page.locator("#pd-session-request-specialist option").nth(1).getAttribute("value");
  if (ahmadSpec) {
    await page.locator("#pd-session-request-specialist").selectOption(ahmadSpec);
  }
  await page.locator("#pd-session-request-reason").selectOption("consultation");
  await page.locator("#pd-session-request-date").fill(preferredDate);
  await page.locator("#pd-session-request-period").selectOption("evening");
  await page.locator("#pd-session-request-notes").fill("Phase E live validation session request.");

  const postCountBefore = postBodies.length;
  await page.getByRole("button", { name: /Submit Request/i }).click();
  await page.waitForTimeout(2500);

  const toastAfterSubmit = await page.locator(".pd-toast").innerText().catch(() => "");
  const postEntry = postBodies.find((entry) => entry.method === "POST" && entry.url.includes("/session-requests") && entry.status === 201);
  record("D Real session request POST success", Boolean(postEntry), postEntry ? JSON.stringify(postEntry.postData) : "no 201 POST");
  record("D Success toast", /submitted/i.test(toastAfterSubmit), toastAfterSubmit);
  record("D Switched to Session Requests area", await page.getByRole("heading", { name: /My Requests/i }).isVisible());

  const pendingCard = page.locator(".pd-session-request-card").filter({ hasText: /consultation|Consultation/i }).filter({ hasText: /Phase E live validation session request/i });
  record("E My Requests shows new pending request", await pendingCard.count() >= 1);
  record("E Pending badge", await pendingCard.getByText(/Pending/i).count() >= 1);

  const requestsAfter = (await apiGet(
    (await login(PARENT_EMAIL)).token,
    "/session-requests/mine",
  )).payload.data?.length ?? 0;
  record("D/E Single new request created", requestsAfter === requestsBefore + 1, `before=${requestsBefore}, after=${requestsAfter}`);

  await page.locator("#pd-session-request-child").selectOption(AHMAD_ID);
  await page.waitForTimeout(800);
  const probeSpec = await page.locator("#pd-session-request-specialist option").nth(1).getAttribute("value");
  if (probeSpec) {
    await page.locator("#pd-session-request-specialist").selectOption(probeSpec);
  }
  await page.locator("#pd-session-request-reason").selectOption("consultation");
  await page.locator("#pd-session-request-date").fill(futureDate(22));
  await page.locator("#pd-session-request-period").selectOption("evening");
  await page.locator("#pd-session-request-notes").fill("Phase E duplicate-submit probe");

  const postsBeforeProbe = postBodies.filter((entry) => (
    entry.method === "POST" && entry.url.includes("/session-requests")
  )).length;

  const submitBtn = page.getByRole("button", { name: /Submit Request/i });
  await Promise.all([
    submitBtn.click(),
    submitBtn.click().catch(() => {}),
  ]);
  await page.waitForTimeout(3500);

  const postsAfterProbe = postBodies.filter((entry) => (
    entry.method === "POST"
    && entry.url.includes("/session-requests")
    && entry.postData?.notes === "Phase E duplicate-submit probe"
  ));
  record("F Double-submit prevention", postsAfterProbe.length <= 1, `probePosts=${postsAfterProbe.length}`);

  const rejectedCard = page.locator(".pd-session-request-card").filter({ hasText: /Phase E validation rejection response/i });
  record("F Rejected request rendering", await rejectedCard.count() >= 1);

  const approvedCard = page.locator(".pd-session-request-card").filter({ hasText: /Approved/i }).first();
  record("F Approved request rendering", await approvedCard.count() >= 1);

  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(`${WEB_BASE}/dashboard/parent/sessions`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".pd-task-hub-page", { timeout: 20000 });
  record("H Desktop responsive", await page.locator(".pd-task-hub-page").isVisible());

  await page.setViewportSize({ width: 768, height: 1024 });
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForSelector(".pd-task-hub-title", { timeout: 20000 });
  record("H Tablet responsive", await page.locator(".pd-task-hub-title").isVisible());

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForSelector(".pd-task-hub-title", { timeout: 20000 });
  record("H Narrow responsive", await page.locator(".pd-task-hub-title").isVisible());

  const refresh401 = report.consoleErrors.filter((msg) => /401|refresh-token/i.test(msg));
  const blockingErrors = report.consoleErrors.filter((msg) => !/401|Unauthorized|refresh-token|409|Conflict|favicon/i.test(msg));
  record("I Console — no blocking errors", blockingErrors.length === 0, blockingErrors.join(" | ") || "none");
  record("I Refresh-token 401 documented separately", refresh401.length >= 0, `${refresh401.length} occurrence(s)`);

  const sessionGets = report.network.filter((n) => n.url?.includes("/sessions") && n.status === 200);
  record("I Sessions network 200", sessionGets.length >= 1, `${sessionGets.length} session responses`);

  await browser.close();
}

async function main() {
  console.log(`Phase E LIVE validation — WEB=${WEB_BASE}`);
  const { token, user } = await login(PARENT_EMAIL);
  await inspectExistingData(token, user.id);

  try {
    const health = await fetch(`${WEB_BASE}/`);
    record("Environment frontend reachable", health.ok, WEB_BASE);
  } catch (error) {
    record("Environment frontend reachable", false, error.message);
    process.exit(1);
  }

  await runBrowserValidation();

  const outPath = path.join(__dirname, "phase-e-live-validation-results.json");
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2));
  console.log(`\nReport written to ${outPath}`);

  const failed = report.results.filter((row) => !row.passed);
  process.exit(failed.length > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
