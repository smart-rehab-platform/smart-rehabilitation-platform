#!/usr/bin/env node
/**
 * Parent Case Requests — gender + child image browser/API validation.
 * Run: node backend/scripts/run-case-request-update-validation.js
 */
const fs = require("fs");
const os = require("os");
const path = require("path");

require("dotenv").config({ path: path.join(__dirname, "../.env") });

const WEB_BASE = process.env.WEB_BASE || "http://localhost:5173";
const API_BASE = process.env.API_BASE || "http://127.0.0.1:5000/api/v1";
const PARENT_EMAIL = "fatima.parent@test.com";
const PASSWORD = "Test123456!";

const MINI_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

const results = [];
let tempRequestId = null;
let tempChildName = null;

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

async function getCategoryId(token) {
  const response = await fetch(`${API_BASE}/case-categories`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const payload = await response.json();
  return payload?.data?.[0]?.id;
}

async function runApiChecks(token, categoryId) {
  const auth = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const rejectOther = await fetch(`${API_BASE}/case-intake-requests`, {
    method: "POST",
    headers: auth,
    body: JSON.stringify({
      child_name: "Gender Test",
      date_of_birth: "2018-01-15",
      gender: "other",
      category_id: categoryId,
      case_description: "Should fail gender validation",
      has_previous_diagnosis: false,
      is_currently_receiving_treatment: false,
      preferred_contact_period: "flexible",
    }),
  });
  const rejectOtherBody = await rejectOther.json();
  record(
    "API rejects gender=other",
    rejectOther.status === 400,
    `${rejectOther.status} ${rejectOtherBody?.message || ""}`,
  );

  const rejectEmpty = await fetch(`${API_BASE}/case-intake-requests`, {
    method: "POST",
    headers: auth,
    body: JSON.stringify({
      child_name: "Gender Empty",
      date_of_birth: "2018-01-15",
      gender: "",
      category_id: categoryId,
      case_description: "Should fail empty gender",
      has_previous_diagnosis: false,
      is_currently_receiving_treatment: false,
      preferred_contact_period: "flexible",
    }),
  });
  const rejectEmptyBody = await rejectEmpty.json();
  record(
    "API rejects empty gender",
    rejectEmpty.status === 400,
    `${rejectEmpty.status} ${rejectEmptyBody?.message || ""}`,
  );

  const form = new FormData();
  form.append("child_image", new Blob([MINI_PNG], { type: "image/png" }), "child.png");
  const uploadRes = await fetch(`${API_BASE}/uploads/case-request-child-image`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  const uploadBody = await uploadRes.json();
  record(
    "API upload PNG",
    uploadRes.ok && Boolean(uploadBody?.data?.url),
    uploadBody?.data?.url || uploadBody?.message,
  );

  const badForm = new FormData();
  badForm.append("child_image", new Blob(["pdf"], { type: "application/pdf" }), "bad.pdf");
  const badUpload = await fetch(`${API_BASE}/uploads/case-request-child-image`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: badForm,
  });
  const badUploadBody = await badUpload.json();
  record(
    "API rejects invalid upload",
    badUpload.status === 400,
    `${badUpload.status} ${badUploadBody?.message || ""}`,
  );

  tempChildName = `CaseReq Val ${Date.now()}`;
  const createRes = await fetch(`${API_BASE}/case-intake-requests`, {
    method: "POST",
    headers: auth,
    body: JSON.stringify({
      child_name: tempChildName,
      date_of_birth: "2019-03-10",
      gender: "male",
      category_id: categoryId,
      case_description: "Temporary browser/API validation request.",
      has_previous_diagnosis: false,
      is_currently_receiving_treatment: false,
      preferred_contact_period: "flexible",
      child_image_url: uploadBody?.data?.url,
    }),
  });
  const createBody = await createRes.json();
  tempRequestId = createBody?.data?.id;
  record(
    "API create male with image",
    createRes.ok && Boolean(tempRequestId) && Boolean(createBody?.data?.child_image_url),
    tempRequestId || createBody?.message,
  );

  if (tempRequestId) {
    const detailRes = await fetch(`${API_BASE}/case-intake-requests/${tempRequestId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const detailBody = await detailRes.json();
    record(
      "API detail includes child_image_url",
      Boolean(detailBody?.data?.child_image_url),
      detailBody?.data?.child_image_url || "",
    );

    const patchRes = await fetch(`${API_BASE}/case-intake-requests/${tempRequestId}`, {
      method: "PATCH",
      headers: auth,
      body: JSON.stringify({ case_description: "Updated without replacing image." }),
    });
    const patchBody = await patchRes.json();
    record(
      "API update preserves image when omitted",
      patchRes.ok && Boolean(patchBody?.data?.child_image_url),
      patchBody?.data?.child_image_url || patchBody?.message,
    );
  }
}

async function runBrowserChecks(page, viewports) {
  await loginBrowser(page);

  for (const [label, size] of viewports) {
    await page.setViewportSize(size);
    await page.goto(`${WEB_BASE}/dashboard/parent/case-requests/new`, {
      waitUntil: "domcontentloaded",
    });
    await page.waitForSelector(".pd-case-form", { timeout: 20000 });

    const genderOptions = await page.locator('select option').allTextContents();
    const hasMale = genderOptions.some((text) => /Male/i.test(text));
    const hasFemale = genderOptions.some((text) => /Female/i.test(text));
    const hasOther = genderOptions.some((text) => /Other/i.test(text));
    const hasPreferNot = genderOptions.some((text) => /Prefer not/i.test(text));

    record(`${label}: gender Male present`, hasMale);
    record(`${label}: gender Female present`, hasFemale);
    record(`${label}: gender Other absent`, !hasOther);
    record(`${label}: gender Prefer not absent`, !hasPreferNot);
    record(`${label}: create form loads`, true, `${size.width}x${size.height}`);
  }

  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(`${WEB_BASE}/dashboard/parent/case-requests/new`, {
    waitUntil: "domcontentloaded",
  });
  await page.waitForSelector(".pd-case-form", { timeout: 20000 });

  const pngPath = path.join(os.tmpdir(), `case-req-test-${Date.now()}.png`);
  fs.writeFileSync(pngPath, MINI_PNG);

  await page.locator("#case-request-child-photo").setInputFiles(pngPath);
  const previewVisible = await page.locator(".pd-case-child-photo-img").count();
  record("Preview appears before submission", previewVisible > 0);

  await page.getByRole("button", { name: /Remove selected photo/i }).click();
  const previewAfterClear = await page.locator(".pd-case-child-photo-img").count();
  record("Clear selected preview", previewAfterClear === 0);

  await page.locator("#case-request-child-photo").setInputFiles(pngPath);
  record("Re-select preview", (await page.locator(".pd-case-child-photo-img").count()) > 0);

  if (tempRequestId) {
    await page.goto(`${WEB_BASE}/dashboard/parent/case-requests/${tempRequestId}`, {
      waitUntil: "domcontentloaded",
    });
    await page.waitForSelector(".pd-case-detail-stack", { timeout: 20000 });
    await page.getByRole("heading", { name: tempChildName }).waitFor({ timeout: 10000 });
    const detailAvatar = await page.locator(".pd-case-detail-header .pd-case-child-avatar").count();
    record("Details page shows child avatar", detailAvatar > 0, tempChildName);

    await page.goto(`${WEB_BASE}/dashboard/parent/case-requests`, {
      waitUntil: "domcontentloaded",
    });
    await page.waitForSelector(".pd-task-hub-list", { timeout: 20000 });
    const card = page.locator(".pd-case-request-card").filter({ hasText: tempChildName }).first();
    const listAvatar = await card.locator(".pd-case-child-avatar").count();
    record("List card shows child avatar", listAvatar > 0);

    await page.goto(`${WEB_BASE}/dashboard/parent/case-requests/${tempRequestId}/edit`, {
      waitUntil: "domcontentloaded",
    });
    await page.waitForSelector(".pd-case-form", { timeout: 20000 });
    const editPreview = await page.locator(".pd-case-child-photo .pd-case-child-photo-img, .pd-case-child-photo .pd-avatar").count();
    record("Edit page shows persisted or fallback photo", editPreview > 0);

    await page.locator("textarea").first().fill("Edited description without new photo.");
    await page.getByRole("button", { name: /Update Request/i }).click();
    await page.waitForURL(new RegExp(`/case-requests/${tempRequestId}$`), { timeout: 30000 });
    await page.waitForSelector(".pd-case-detail-stack", { timeout: 20000 });
    const editPersistAvatar = await page.locator(".pd-case-detail-header .pd-case-child-avatar").count();
    record("Save without replacement keeps avatar", editPersistAvatar > 0);
  }

  fs.unlinkSync(pngPath);
}

async function run() {
  console.log(`Case Request update validation — WEB=${WEB_BASE} API=${API_BASE}`);

  const consoleErrors = [];
  let token;
  let categoryId;

  try {
    const session = await loginApi();
    token = session.accessToken;
    categoryId = await getCategoryId(token);
    record("API login", Boolean(token), PARENT_EMAIL);
    record("Category available", Boolean(categoryId), categoryId || "none");
  } catch (error) {
    record("API login", false, error.message);
    process.exitCode = 1;
    return;
  }

  await runApiChecks(token, categoryId);

  const playwright = require("playwright");
  let browser;
  try {
    browser = await playwright.chromium.launch({ headless: true, channel: "msedge" });
  } catch {
    browser = await playwright.chromium.launch({ headless: true });
  }

  const page = await browser.newPage();
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });

  const viewports = [
    ["Desktop", { width: 1280, height: 900 }],
    ["Tablet", { width: 768, height: 1024 }],
    ["Mobile", { width: 390, height: 844 }],
  ];

  try {
    await runBrowserChecks(page, viewports);
  } catch (error) {
    record("Browser validation", false, error.message);
  } finally {
    await browser.close();
  }

  record("No console errors", consoleErrors.length === 0, consoleErrors.slice(0, 3).join(" | "));

  const failed = results.filter((item) => !item.passed);
  console.log(`\nSummary: ${results.length - failed.length}/${results.length} passed`);
  if (tempRequestId) {
    console.log(`Temporary request retained: id=${tempRequestId} name=${tempChildName}`);
  }
  if (failed.length > 0) {
    process.exitCode = 1;
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
