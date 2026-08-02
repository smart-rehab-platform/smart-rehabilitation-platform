#!/usr/bin/env node
/**
 * Phase I live validation for Parent Profile.
 * Run: node backend/scripts/run-phase-i-live-validation.js
 */
const path = require("path");

require("dotenv").config({ path: path.join(__dirname, "../.env") });

const WEB_BASE = process.env.WEB_BASE || "http://localhost:5173";
const API_BASE = process.env.API_BASE || "http://127.0.0.1:5000/api/v1";
const PARENT_EMAIL = "fatima.parent@test.com";
const PASSWORD = "Test123456!";

const results = [];
const testNotes = {
  originalValues: {},
  temporaryChanges: [],
  restored: [],
};

function record(name, passed, detail = "") {
  results.push({ name, passed, detail });
  console.log(`${passed ? "PASS" : "FAIL"} ${name}${detail ? ` — ${detail}` : ""}`);
}

async function loginApi(email) {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: PASSWORD }),
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.message || "Login failed");
  return payload.data;
}

async function apiGet(token, urlPath) {
  const response = await fetch(`${API_BASE}${urlPath}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.message || `GET ${urlPath} failed`);
  return payload.data;
}

async function apiPut(token, urlPath, body) {
  const response = await fetch(`${API_BASE}${urlPath}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.message || `PUT ${urlPath} failed`);
  return payload.data;
}

async function loginBrowser(page) {
  await page.goto(`${WEB_BASE}/login`, { waitUntil: "domcontentloaded" });
  await page.locator('input[type="email"]').fill(PARENT_EMAIL);
  await page.locator('input[type="password"]').fill(PASSWORD);
  await page.getByRole("button", { name: /Sign In/i }).last().click();
  await page.waitForURL(/dashboard\/parent/, { timeout: 30000 });
}

async function run() {
  console.log(`Phase I validation — WEB=${WEB_BASE} API=${API_BASE}`);
  const session = await loginApi(PARENT_EMAIL);
  const token = session.accessToken;
  const userId = session.user?.id;

  const me = await apiGet(token, "/auth/me");
  record("GET /auth/me", Boolean(me?.id && me?.email), me?.email || "missing email");

  const parents = await apiGet(token, "/parents");
  const parentRow = Array.isArray(parents)
    ? parents.find((row) => row.user_id === userId || row.userId === userId)
    : null;
  record("GET /parents", Array.isArray(parents), `count=${parents?.length ?? 0}`);

  testNotes.originalValues = {
    full_name: me.full_name,
    phone: me.phone || "",
    address: parentRow?.address || "",
    relationship_notes: parentRow?.relationship_notes || "",
  };

  const playwright = require("playwright");
  let browser;
  try {
    browser = await playwright.chromium.launch({ headless: true, channel: "msedge" });
  } catch {
    browser = await playwright.chromium.launch({ headless: true });
  }

  const page = await browser.newPage();
  const consoleErrors = [];
  const profileNetwork = [];
  let profilePutCount = 0;

  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("response", (res) => {
    const url = res.url();
    if (/\/api\/v1\/(auth\/me|parents|users\/profile)/.test(url)) {
      profileNetwork.push({ status: res.status(), url, method: res.request().method() });
    }
  });
  page.on("request", (req) => {
    if (req.method() === "PUT" && /\/users\/profile\/me/.test(req.url())) {
      profilePutCount += 1;
    }
  });

  await loginBrowser(page);
  record("Parent login", /dashboard\/parent/.test(page.url()), page.url());

  await page.goto(`${WEB_BASE}/dashboard/parent/profile`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".pd-profile-page", { timeout: 20000 });
  record("Direct profile URL", /\/profile/.test(page.url()), page.url());

  const sidebarProfileActive = await page.locator(".pd-nav-item.is-active").filter({ hasText: /^Profile$/i }).count();
  record("Sidebar Profile active state", sidebarProfileActive > 0, `matches=${sidebarProfileActive}`);

  await page.goto(`${WEB_BASE}/dashboard/parent`, { waitUntil: "domcontentloaded" });
  await page.locator(".pd-profile-trigger").click();
  await page.waitForSelector(".pd-profile-dropdown", { timeout: 10000 });
  await page.locator(".pd-dropdown-item").filter({ hasText: "View profile" }).click();
  await page.waitForURL(/\/dashboard\/parent\/profile/, { timeout: 15000 });
  record("Header profile shortcut", /\/profile/.test(page.url()), page.url());

  await page.waitForSelector(".pd-profile-summary-name", { timeout: 15000 });
  const summaryName = await page.locator(".pd-profile-summary-name").innerText();
  record("Profile data loads", summaryName.trim().length > 0, summaryName);

  const emailReadOnly = await page.locator(".pd-profile-account-item dd").filter({ hasText: PARENT_EMAIL }).count();
  record("Email read-only in account section", emailReadOnly > 0, PARENT_EMAIL);

  const saveButton = page.getByRole("button", { name: /Save changes/i });
  record("Save disabled when unchanged", await saveButton.isDisabled(), "initial dirty=false");

  const fullNameInput = page.locator("#pd-profile-full-name");
  const originalFullName = await fullNameInput.inputValue();
  const tempFullName = `${originalFullName}`.endsWith(" (web)")
    ? originalFullName.replace(/ \(web\)$/, "")
    : `${originalFullName} (web)`;

  await fullNameInput.fill(tempFullName);
  record("Save enabled when dirty", !(await saveButton.isDisabled()), "after name edit");

  await saveButton.click();
  await page.waitForSelector(".pd-profile-success", { timeout: 15000 });
  const successVisible = await page.locator(".pd-profile-success").isVisible();
  record("Save success feedback", successVisible, "Profile updated successfully.");
  testNotes.temporaryChanges.push({ field: "full_name", value: tempFullName });

  await page.waitForFunction(
    () => document.querySelector('button[type="submit"]')?.disabled,
    null,
    { timeout: 10000 },
  );
  const updatedSummary = await page.locator(".pd-profile-summary-name").innerText();
  record("Updated value in page", updatedSummary.includes("(web)"), updatedSummary);

  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForSelector("#pd-profile-full-name", { timeout: 15000 });
  const persistedName = await page.locator("#pd-profile-full-name").inputValue();
  record("Refresh preserves updated value", persistedName.includes("(web)"), persistedName);

  await fullNameInput.fill(originalFullName);
  await page.getByRole("button", { name: /Save changes/i }).click();
  await page.waitForSelector(".pd-profile-success", { timeout: 15000 });
  testNotes.restored.push({ field: "full_name", value: originalFullName });
  record("Restore original full name", (await fullNameInput.inputValue()) === originalFullName, originalFullName);

  await fullNameInput.fill("");
  await page.getByRole("button", { name: /Save changes/i }).click();
  const requiredError = await page.locator("#pd-profile-full-name-error").count();
  record("Required full name validation", requiredError > 0, `errors=${requiredError}`);
  await fullNameInput.fill(originalFullName);

  await page.getByRole("button", { name: /^Cancel$/i }).click();
  const afterCancel = await fullNameInput.inputValue();
  record("Cancel restores persisted values", afterCancel === originalFullName, afterCancel);

  const beforeDuplicate = profilePutCount;
  await fullNameInput.fill(`${originalFullName} x`);
  await saveButton.click({ clickCount: 2, delay: 50 });
  await page.waitForSelector(".pd-profile-success", { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(1000);
  record("Duplicate-save prevention", profilePutCount - beforeDuplicate <= 1, `puts=${profilePutCount - beforeDuplicate}`);
  await fullNameInput.fill(originalFullName);
  if (!(await saveButton.isDisabled())) {
    await saveButton.click();
    await page.waitForSelector(".pd-profile-success", { timeout: 15000 }).catch(() => {});
  }

  await page.unroute(/.*/).catch(() => {});
  await page.route(/\/api\/v1\/auth\/me$/i, (route) => {
    if (route.request().method() === "GET") {
      route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ success: false, message: "Simulated profile load failure" }),
      });
      return;
    }
    route.continue();
  });
  await page.goto(`${WEB_BASE}/dashboard/parent/profile`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1200);
  const loadError = await page.locator(".pd-profile-state .pd-inline-error").count();
  record("Profile load error state", loadError > 0, `errors=${loadError}`);
  if (loadError > 0) {
    await page.unroute(/\/api\/v1\/auth\/me$/i);
    await page.getByRole("button", { name: /^Retry$/i }).click();
    await page.waitForSelector(".pd-profile-form", { timeout: 15000 });
    record("Profile load retry", await page.locator(".pd-profile-form").count() > 0, "retry clicked");
  } else {
    await page.unroute(/\/api\/v1\/auth\/me$/i);
    record("Profile load retry", false, "error UI not shown");
  }

  const passwordSection = await page.locator(".pd-profile-password-note").count();
  const passwordForm = await page.locator('input[type="password"]').count();
  record("No password change form", passwordSection > 0 && passwordForm === 0, "reset link only");

  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(`${WEB_BASE}/dashboard/parent/profile`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".pd-profile-page", { timeout: 15000 });
  record("Desktop responsive", await page.locator(".pd-profile-page").isVisible(), "1280x900");

  await page.setViewportSize({ width: 768, height: 1024 });
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForSelector(".pd-profile-page", { timeout: 15000 });
  record("Tablet responsive", await page.locator(".pd-profile-page").isVisible(), "768x1024");

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForSelector(".pd-profile-page", { timeout: 15000 });
  record("Narrow responsive", await page.locator(".pd-profile-page").isVisible(), "390x844");

  const okRequests = profileNetwork.filter((row) => row.status >= 200 && row.status < 300).length;
  record("Profile network requests succeed", okRequests > 0, `ok=${okRequests}/${profileNetwork.length}`);

  const blockingConsoleErrors = consoleErrors.filter((line) => !/401|favicon|Failed to load resource/i.test(line));
  record("No blocking console errors", blockingConsoleErrors.length === 0, blockingConsoleErrors.slice(0, 2).join(" | ") || "clean");

  await browser.close();

  if (parentRow?.id) {
    await apiPut(token, `/parents/${encodeURIComponent(parentRow.id)}/profile`, {
      address: testNotes.originalValues.address || null,
      relationship_notes: testNotes.originalValues.relationship_notes || null,
    });
  }
  await apiPut(token, "/users/profile/me", {
    full_name: testNotes.originalValues.full_name,
    ...(testNotes.originalValues.phone ? { phone: testNotes.originalValues.phone } : {}),
  });
  record("API restore original profile", true, testNotes.originalValues.full_name);

  const failed = results.filter((row) => !row.passed);
  console.log(`\nSummary: ${results.length - failed.length}/${results.length} passed`);
  if (failed.length) {
    process.exitCode = 1;
  }

  console.log("\nTest data:");
  console.log(`- account: ${PARENT_EMAIL}`);
  console.log(`- original full_name: ${testNotes.originalValues.full_name}`);
  console.log(`- temporary changes: ${JSON.stringify(testNotes.temporaryChanges)}`);
  console.log(`- restored: ${JSON.stringify(testNotes.restored)}`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
