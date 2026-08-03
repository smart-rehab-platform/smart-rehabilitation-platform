#!/usr/bin/env node
/**
 * Parent profile image display validation.
 * Run: node backend/scripts/run-parent-profile-image-validation.js
 */
const fs = require("fs");
const os = require("os");
const path = require("path");

require("dotenv").config({ path: path.join(__dirname, "../.env") });

const WEB_BASE = process.env.WEB_BASE || "http://localhost:5173";
const API_BASE = process.env.API_BASE || "http://localhost:5000/api/v1";
const EMAIL = "fatima.parent@test.com";
const PASSWORD = "Test123456!";

const MINI_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

const results = [];

function record(name, passed, detail = "") {
  results.push({ name, passed, detail });
  console.log(`${passed ? "PASS" : "FAIL"} ${name}${detail ? ` — ${detail}` : ""}`);
}

async function loginApi() {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.message || "Login failed");
  return payload.data;
}

async function run() {
  console.log(`Profile image validation — WEB=${WEB_BASE} API=${API_BASE}`);

  const session = await loginApi();
  const token = session.accessToken;
  record("API login", Boolean(token));

  const form = new FormData();
  form.append("image", new Blob([MINI_PNG], { type: "image/png" }), "profile.png");
  const uploadRes = await fetch(`${API_BASE}/users/profile/image`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  const uploadBody = await uploadRes.json();
  const relativeUrl = uploadBody?.data?.profile_image_url;
  record("Upload returns URL", uploadRes.ok && Boolean(relativeUrl), relativeUrl || uploadBody?.message);

  const apiOrigin = API_BASE.replace(/\/api\/v1\/?$/, "");
  const absoluteUrl = relativeUrl ? `${apiOrigin}${relativeUrl}` : null;

  const imgRes = await fetch(absoluteUrl);
  const corp = imgRes.headers.get("cross-origin-resource-policy");
  record("Image GET 200", imgRes.status === 200, String(imgRes.status));
  record("CORP cross-origin", corp === "cross-origin", corp || "missing");

  const meRes = await fetch(`${API_BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const meBody = await meRes.json();
  record("/auth/me has image URL", meBody?.data?.profile_image_url === relativeUrl, meBody?.data?.profile_image_url);

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

  await page.goto(`${WEB_BASE}/login`, { waitUntil: "domcontentloaded" });
  await page.locator('input[type="email"]').fill(EMAIL);
  await page.locator('input[type="password"]').fill(PASSWORD);
  await page.getByRole("button", { name: /Sign In/i }).last().click();
  await page.waitForURL(/dashboard\/parent/, { timeout: 30000 });

  await page.goto(`${WEB_BASE}/dashboard/parent/profile`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".pd-profile-layout", { timeout: 20000 });

  const pngPath = path.join(os.tmpdir(), `profile-test-${Date.now()}.png`);
  fs.writeFileSync(pngPath, MINI_PNG);

  const fileInput = page.locator('.pd-profile-avatar-upload input[type="file"]');
  await fileInput.setInputFiles(pngPath);
  record("Preview appears", (await page.locator(".pd-profile-avatar-photo").count()) > 0);

  await page.getByRole("button", { name: /Save changes/i }).click();
  await page.waitForSelector('.pd-form-success, [class*="success"]', { timeout: 15000 }).catch(() => null);
  const successVisible = await page.getByText(/Profile updated successfully/i).count();
  record("Save success message", successVisible > 0);

  await page.waitForTimeout(1500);
  const summaryImg = page.locator(".pd-profile-summary-photo");
  const imgLoaded = await summaryImg.evaluate(async (img) => {
    if (!(img instanceof HTMLImageElement)) return false;
    if (!img.complete || img.naturalWidth === 0) {
      await new Promise((resolve) => {
        img.addEventListener("load", resolve, { once: true });
        img.addEventListener("error", resolve, { once: true });
      });
    }
    return img.naturalWidth > 0;
  }).catch(() => false);
  record("Profile summary shows real image", imgLoaded);

  const headerImg = page.locator(".pd-profile-trigger .pd-avatar-photo").first();
  const headerLoaded = await headerImg.evaluate(async (img) => {
    if (!(img instanceof HTMLImageElement)) return false;
    if (!img.complete || img.naturalWidth === 0) {
      await new Promise((resolve) => {
        img.addEventListener("load", resolve, { once: true });
        img.addEventListener("error", resolve, { once: true });
      });
    }
    return img.naturalWidth > 0;
  }).catch(() => false);
  record("Header avatar shows real image", headerLoaded);

  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForSelector(".pd-profile-layout", { timeout: 20000 });
  const afterRefresh = await page.locator(".pd-profile-summary-photo").evaluate(async (img) => {
    if (!(img instanceof HTMLImageElement)) return false;
    if (!img.complete || img.naturalWidth === 0) {
      await new Promise((resolve) => {
        img.addEventListener("load", resolve, { once: true });
        img.addEventListener("error", resolve, { once: true });
      });
    }
    return img.naturalWidth > 0;
  }).catch(() => false);
  record("Refresh preserves image", afterRefresh);

  const blockedCorp = consoleErrors.some((line) =>
    line.includes("ERR_BLOCKED_BY_RESPONSE.NotSameOrigin"),
  );
  record("No NotSameOrigin console error", !blockedCorp);

  fs.unlinkSync(pngPath);
  await browser.close();

  const failed = results.filter((item) => !item.passed);
  console.log(`\nSummary: ${results.length - failed.length}/${results.length} passed`);
  if (failed.length) process.exitCode = 1;
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
