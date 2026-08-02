#!/usr/bin/env node
/**
 * Parent Web Phase D live validation (API + browser via Playwright).
 * Run: node backend/scripts/run-phase-d-validation.js
 */
const path = require("path");

require("dotenv").config({ path: path.join(__dirname, "../.env") });

const API_BASE = process.env.API_BASE || "http://127.0.0.1:5000/api/v1";
const WEB_BASE = process.env.WEB_BASE || "http://localhost:5173";
const PARENT_EMAIL = "fatima.parent@test.com";
const PASSWORD = "Test123456!";
const OMAR_ID = "de000002-0001-4001-8001-000000000001";
const LAYLA_ID = "de000002-0001-4001-8001-000000000002";

const results = {
  api: [],
  browser: [],
  network: [],
  bugs: [],
  testData: [],
};

function record(sectionKey, name, passed, detail = "") {
  results[sectionKey].push({ name, passed, detail });
  const label = sectionKey === "api" ? "API" : sectionKey === "browser" ? "Browser" : "Net";
  const mark = passed ? "PASS" : "FAIL";
  console.log(`${mark} [${label}] ${name}${detail ? ` — ${detail}` : ""}`);
}

async function login(email) {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: PASSWORD }),
  });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.message || `Login failed (${response.status})`);
  }
  return { token: payload.data.accessToken, user: payload.data.user, status: response.status };
}

async function apiGet(token, route) {
  const response = await fetch(`${API_BASE}${route}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const payload = await response.json().catch(() => ({}));
  return { status: response.status, payload };
}

async function runApiValidation() {
  const loginResult = await login(PARENT_EMAIL);
  record("api", "Parent login", loginResult.status === 200, loginResult.user.email);
  const { token } = loginResult;

  for (const [label, patientId] of [["Omar", OMAR_ID], ["Layla", LAYLA_ID]]) {
    const reviews = await apiGet(token, `/patients/${patientId}/reviews`);
    record(
      "api",
      `${label} reviews endpoint`,
      reviews.status === 200,
      `status ${reviews.status}, count ${reviews.payload.count ?? reviews.payload.data?.length ?? 0}`,
    );
    results.network.push({
      method: "GET",
      path: `/patients/${patientId}/reviews`,
      status: reviews.status,
    });

    for (const row of reviews.payload.data || []) {
      const hasTitle = Boolean(row.exercise_title);
      const hasSpecialist = Boolean(row.specialist_name);
      const ratingOk = row.performance_rating == null || Number(row.performance_rating) <= 10;
      record(
        "api",
        `${label} review fields (${row.exercise_title || row.id})`,
        hasTitle && hasSpecialist && ratingOk,
        `retry=${row.requires_retry}, rating=${row.performance_rating}`,
      );
    }
  }

  const omarReviews = await apiGet(token, `/patients/${OMAR_ID}/reviews`);
  const hasRetry = (omarReviews.payload.data || []).some((row) => row.requires_retry === true);
  const hasReviewed = (omarReviews.payload.data || []).some((row) => row.requires_retry === false);
  record("api", "Requires retry review exists", hasRetry);
  record("api", "Normal reviewed submission exists", hasReviewed);

  const laylaReviews = await apiGet(token, `/patients/${LAYLA_ID}/reviews`);
  record("api", "Second child has reviews", (laylaReviews.payload.data || []).length > 0);
}

async function runBrowserValidation() {
  let playwright;
  try {
    playwright = require("playwright");
  } catch {
    record("browser", "Playwright available", false, "skipped — install playwright");
    return;
  }

  let browser;
  try {
    browser = await playwright.chromium.launch({ headless: true, channel: "msedge" });
  } catch {
    try {
      browser = await playwright.chromium.launch({ headless: true, channel: "chrome" });
    } catch (launchError) {
      record("browser", "Browser launch", false, launchError.message);
      return;
    }
  }

  const context = await browser.newContext();
  const page = await context.newPage();
  const consoleErrors = [];
  const reactWarnings = [];
  const networkFailures = [];

  page.on("console", (msg) => {
    const text = msg.text();
    if (msg.type() === "error") {
      consoleErrors.push(text);
    }
    if (/react/i.test(text) && /warn/i.test(text)) {
      reactWarnings.push(text);
    }
  });
  page.on("pageerror", (error) => {
    consoleErrors.push(error.message);
  });
  page.on("response", (response) => {
    const url = response.url();
    if (url.includes("/api/v1/patients/") && url.includes("/reviews")) {
      networkFailures.push({
        url,
        status: response.status(),
        ok: response.ok(),
      });
    }
  });

  try {
    await page.goto(`${WEB_BASE}/login`, { waitUntil: "domcontentloaded" });
    await page.locator('input[type="email"]').fill(PARENT_EMAIL);
    await page.locator('input[type="password"]').fill(PASSWORD);
    await page.getByRole("button", { name: /Sign In/i }).last().click();
    await page.waitForURL(/dashboard\/parent/, { timeout: 25000 });
    record("browser", "1. Parent login", true);

    await page.goto(`${WEB_BASE}/dashboard/parent/feedback`, { waitUntil: "domcontentloaded" });
    await page.waitForSelector(".pd-task-hub-title", { timeout: 20000 });
    record("browser", "2. Direct URL /dashboard/parent/feedback", /Exercise Feedback/.test(await page.locator(".pd-task-hub-title").innerText()));

    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForSelector(".pd-feedback-card", { timeout: 20000 });
    record("browser", "4. Refresh reloads data", true);

    const cards = page.locator(".pd-feedback-card");
    const cardCount = await cards.count();
    record("browser", "5. Review cards appear", cardCount >= 3, `count=${cardCount}`);

    const titles = await cards.locator(".pd-task-hub-card-title").allTextContents();
    record(
      "browser",
      "6. Exercise titles present",
      titles.some((title) => /Balance Line Walk|R-Sound|Breathing|Hhhhh/.test(title)),
      titles.join(", "),
    );

    const childLines = await cards.locator(".pd-task-hub-card-child").allTextContents();
    record(
      "browser",
      "7. Child names present",
      childLines.some((line) => /Omar Hassan/.test(line)) && childLines.some((line) => /Layla/.test(line)),
      childLines.join(" | "),
    );

    const metaText = await page.locator(".pd-task-hub-card-meta").allTextContents();
    record(
      "browser",
      "8. Specialist name when returned",
      metaText.some((text) => /banbon/i.test(text)),
      metaText.join(" | "),
    );

    const quotes = await page.locator(".pd-feedback-quote").allTextContents();
    record(
      "browser",
      "9. Feedback text correct",
      quotes.some((quote) => /Phase D validation/.test(quote)) || quotes.some((quote) => /needs some help/i.test(quote)),
      `${quotes.length} quotes`,
    );

    record(
      "browser",
      "10. Review dates shown",
      metaText.some((text) => /Review date/i.test(text)),
    );

    const ratingLines = await page.locator(".pd-task-hub-card-meta").locator("span").allTextContents();
    record(
      "browser",
      "11. Performance rating only when present",
      ratingLines.some((line) => /\/10/.test(line)),
      ratingLines.filter((line) => /\/10/.test(line)).join(", "),
    );

    const reviewedBadge = page.locator(".pd-status-badge").filter({ hasText: "Reviewed" });
    record("browser", "12. Normal reviewed badge", await reviewedBadge.count() >= 1, `count=${await reviewedBadge.count()}`);

    const retryBadge = page.locator(".pd-status-badge").filter({ hasText: "Needs Retry" });
    const retryPill = page.locator(".pd-feedback-retry-badge");
    record(
      "browser",
      "13. Requires retry badge and styling",
      await retryBadge.count() >= 1 && await retryPill.count() >= 1,
      `status=${await retryBadge.count()}, pill=${await retryPill.count()}`,
    );

    await page.locator("#pd-feedback-hub-search").fill("Balance");
    await page.waitForTimeout(300);
    const searchCount = await page.locator(".pd-feedback-card").count();
    record("browser", "14. Search by exercise title", searchCount === 1, `visible=${searchCount}`);
    await page.locator("#pd-feedback-hub-search").fill("");

    await page.locator("#pd-feedback-hub-child").selectOption(LAYLA_ID);
    await page.waitForTimeout(300);
    const laylaCount = await page.locator(".pd-feedback-card").count();
    record("browser", "15. Child filter", laylaCount >= 1, `visible=${laylaCount}`);
    await page.locator("#pd-feedback-hub-child").selectOption("all");

    await page.locator("#pd-feedback-hub-status").selectOption("needs_retry");
    await page.waitForTimeout(300);
    const retryOnly = await page.locator(".pd-feedback-card").count();
    record("browser", "16. Status filter (needs retry)", retryOnly >= 1, `visible=${retryOnly}`);
    await page.locator("#pd-feedback-hub-status").selectOption("all");

    await page.locator("#pd-feedback-hub-child").selectOption("all");
    await page.locator("#pd-feedback-hub-status").selectOption("all");
    await page.locator("#pd-feedback-hub-sort").selectOption("newest");
    await page.waitForTimeout(200);
    const newestFirst = await cards.first().locator(".pd-task-hub-card-title").innerText();
    const newestTitles = await cards.locator(".pd-task-hub-card-title").allTextContents();
    const july25Titles = newestTitles.filter((title) => /Balance Line Walk|Hhhhh/.test(title));
    record(
      "browser",
      "17. Newest sort",
      july25Titles.length >= 1 && /Balance Line Walk|Hhhhh/.test(newestFirst),
      newestFirst,
    );

    await page.locator("#pd-feedback-hub-sort").selectOption("oldest");
    await page.waitForTimeout(200);
    const oldestFirst = await cards.first().locator(".pd-task-hub-card-title").innerText();
    record("browser", "18. Oldest sort", /Breathing/.test(oldestFirst), oldestFirst);

    await page.locator("#pd-feedback-hub-sort").selectOption("alphabetical");
    await page.waitForTimeout(200);
    const alphaFirst = await cards.first().locator(".pd-task-hub-card-title").innerText();
    record("browser", "19. Alphabetical sort", /Balance Line Walk/.test(alphaFirst), alphaFirst);

    await page.locator("#pd-feedback-hub-child").selectOption("all");
    await page.locator("#pd-feedback-hub-status").selectOption("all");
    await page.locator("#pd-feedback-hub-sort").selectOption("retryFirst");
    await page.waitForTimeout(200);
    const retryFirstTitle = await cards.first().locator(".pd-task-hub-card-title").innerText();
    record("browser", "20. Requires-retry-first sort", /Balance Line Walk/.test(retryFirstTitle), retryFirstTitle);

    await page.locator("#pd-feedback-hub-search").fill("zzzz-no-match-zzzz");
    await page.waitForTimeout(300);
    const noMatchText = await page.locator(".pd-task-hub-empty-message").innerText();
    record("browser", "22. No-match filter state", /No reviews match your filters/.test(noMatchText), noMatchText);
    await page.locator("#pd-feedback-hub-search").fill("");

    await page.goto(`${WEB_BASE}/dashboard/parent`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2000);
    const childTrigger = page.locator(".pd-child-trigger").first();
    if (await childTrigger.count()) {
      await childTrigger.click();
      await page.locator(".pd-dropdown-item").filter({ hasText: "Omar Hassan" }).first().click();
      await page.waitForTimeout(1500);
    }
    await page.getByRole("button", { name: /^Feedback$/ }).click();
    await page.waitForURL(/dashboard\/parent\/feedback/, { timeout: 15000 });
    const feedbackNavActive = await page.locator('.pd-nav-item[aria-current="page"]').filter({ hasText: "Feedback" }).count();
    record("browser", "23. Sidebar Feedback navigation", feedbackNavActive === 1, `active=${feedbackNavActive}`);

    await page.goto(`${WEB_BASE}/dashboard/parent`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2000);
    if (await childTrigger.count()) {
      await childTrigger.click();
      await page.locator(".pd-dropdown-item").filter({ hasText: "Omar Hassan" }).first().click();
      await page.waitForTimeout(1500);
    }
    const viewFeedbackBtn = page.getByRole("button", { name: /View Feedback/i }).first();
    if (await viewFeedbackBtn.count()) {
      await viewFeedbackBtn.click();
      await page.waitForURL(/dashboard\/parent\/feedback/, { timeout: 15000 });
      record("browser", "24. Latest Updates → View Feedback", true);
    } else {
      record("browser", "24. Latest Updates → View Feedback", false, "button not found");
    }

    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(`${WEB_BASE}/dashboard/parent/feedback`, { waitUntil: "domcontentloaded" });
    await page.waitForSelector(".pd-task-hub-filters", { timeout: 15000 });
    record("browser", "25a. Desktop responsive", await page.locator(".pd-task-hub-filters").isVisible());

    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForSelector(".pd-task-hub-page", { timeout: 15000 });
    record("browser", "25b. Tablet responsive", await page.locator(".pd-task-hub-page").isVisible());

    await page.setViewportSize({ width: 390, height: 844 });
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForSelector(".pd-task-hub-title", { timeout: 15000 });
    record("browser", "25c. Narrow responsive", await page.locator(".pd-task-hub-title").isVisible());

    const reviewRequestsOk = networkFailures.every((entry) => entry.ok);
    record("browser", "28. Review network requests success", reviewRequestsOk, JSON.stringify(networkFailures));

    const benign401 = consoleErrors.every((message) => /401|Unauthorized|refresh-token/i.test(message));
    record(
      "browser",
      "26. No console errors",
      consoleErrors.length === 0 || benign401,
      consoleErrors.join(" | ") || "none",
    );
    record("browser", "27. No React warnings", reactWarnings.length === 0, reactWarnings.join(" | ") || "none");

    results.consoleErrors = consoleErrors;
    results.reactWarnings = reactWarnings;
    results.network = networkFailures;
  } catch (error) {
    record("browser", "Browser flow", false, error.message);
    results.bugs.push({ message: error.message, stack: error.stack });
  } finally {
    await browser.close();
  }
}

async function main() {
  console.log(`Phase D validation — WEB=${WEB_BASE} API=${API_BASE}`);
  await runApiValidation();
  await runBrowserValidation();

  const outPath = path.join(__dirname, "phase-d-validation-results.json");
  require("fs").writeFileSync(outPath, JSON.stringify(results, null, 2));
  console.log(`\nResults written to ${outPath}`);

  const failed = [...results.api, ...results.browser].filter((row) => !row.passed);
  process.exit(failed.length > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
