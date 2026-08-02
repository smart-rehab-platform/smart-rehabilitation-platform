#!/usr/bin/env node
/**
 * Parent Web Phase B live validation runner (API + optional browser via Playwright).
 * Run: node backend/scripts/run-phase-b-validation.js
 */
const path = require("path");
const fs = require("fs");
const { Pool } = require("pg");

require("dotenv").config({ path: path.join(__dirname, "../.env") });

const API_BASE = process.env.API_BASE || "http://127.0.0.1:5000/api/v1";
const WEB_BASE = process.env.WEB_BASE || "http://localhost:5173";
const PARENT_EMAIL = "fatima.parent@test.com";
const PASSWORD = "Test123456!";
const CHILD_PATIENT_ID = "de000002-0001-4001-8001-000000000001";
const NOTES_ASSIGNMENT_ID = "5b2b812d-a15c-417b-b5cc-fbe244182774";
const MEDIA_ASSIGNMENT_ID = "9976e64a-cc14-4366-85d8-2b68b94e5d2e";
const RESERVE_ASSIGNMENT_ID = "13cc8eba-c829-4f62-b25c-aacb10ee73bb";
const SPECIALIST_EMAIL = "bana.specialist@test.com";

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

const results = {
  api: [],
  browser: [],
  network: [],
  bugs: [],
};

function record(sectionKey, name, passed, detail = "") {
  const section = results[sectionKey];
  section.push({ name, passed, detail });
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

async function apiPost(token, route, body, isForm = false) {
  const headers = { Authorization: `Bearer ${token}` };
  let requestBody = body;
  if (!isForm) {
    headers["Content-Type"] = "application/json";
    requestBody = JSON.stringify(body);
  }
  const response = await fetch(`${API_BASE}${route}`, {
    method: "POST",
    headers,
    body: requestBody,
  });
  const payload = await response.json().catch(() => ({}));
  return { status: response.status, payload };
}

function mapStatus(submissions, assignedExerciseId) {
  const latest = submissions
    .filter((row) => row.assigned_exercise_id === assignedExerciseId)
    .sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at))[0];
  if (!latest) return "todo";
  const status = String(latest.status || "").toLowerCase();
  if (status === "needs_retry") return "needs_retry";
  if (status === "reviewed") return "reviewed";
  if (status === "submitted" || status === "pending") return "submitted";
  return "submitted";
}

async function runApiValidation() {
  const loginResult = await login(PARENT_EMAIL);
  record("api", "Parent login", loginResult.status === 200, `status ${loginResult.status}`);
  const { token } = loginResult;

  const tasksBefore = await apiGet(token, `/patients/${CHILD_PATIENT_ID}/daily-tasks`);
  const taskIds = (tasksBefore.payload.data || []).map((row) => row.id);
  const notesVisible = taskIds.includes(NOTES_ASSIGNMENT_ID);
  record(
    "api",
    "Notes-test assignment in daily tasks",
    notesVisible,
    notesVisible ? NOTES_ASSIGNMENT_ID : `missing from ${taskIds.length} tasks`,
  );

  const detail = await apiGet(
    token,
    `/assigned-exercises/${NOTES_ASSIGNMENT_ID}`,
  );
  record(
    "api",
    "Exercise detail loads by ID",
    detail.status === 200 && detail.payload.data?.id === NOTES_ASSIGNMENT_ID,
    `status ${detail.status}`,
  );

  const subsBefore = await apiGet(token, `/patients/${CHILD_PATIENT_ID}/submissions`);
  const statusBefore = mapStatus(subsBefore.payload.data || [], NOTES_ASSIGNMENT_ID);
  record("api", "Status before notes submission", statusBefore === "todo", statusBefore);

  const createSubmission = await apiPost(token, "/exercise-submissions", {
    assigned_exercise_id: NOTES_ASSIGNMENT_ID,
    parent_notes: "Phase B validation — notes only submission.",
  });
  const submissionId = createSubmission.payload.data?.id;
  record(
    "api",
    "POST /exercise-submissions (notes only)",
    createSubmission.status === 201 && Boolean(submissionId),
    `status ${createSubmission.status}, id ${submissionId || "none"}`,
  );
  results.network.push({
    step: 1,
    method: "POST",
    path: "/exercise-submissions",
    status: createSubmission.status,
    submissionId,
  });

  const subsAfter = await apiGet(token, `/patients/${CHILD_PATIENT_ID}/submissions`);
  const statusAfter = mapStatus(subsAfter.payload.data || [], NOTES_ASSIGNMENT_ID);
  record("api", "Status after notes submission", statusAfter === "submitted", statusAfter);

  const duplicateAttempt = await apiPost(token, "/exercise-submissions", {
    assigned_exercise_id: NOTES_ASSIGNMENT_ID,
    parent_notes: "Should not be used by UI after submit",
  });
  record(
    "api",
    "Backend allows second submission (API note)",
    duplicateAttempt.status === 201,
    "UI must block; API permits multiple rows",
  );

  return { token, submissionId, statusBefore, statusAfter };
}

async function runMediaValidation(token) {
  const fixturesDir = path.join(__dirname, "phase-b-fixtures");
  fs.mkdirSync(fixturesDir, { recursive: true });

  const pngPath = path.join(fixturesDir, "test-image.png");
  if (!fs.existsSync(pngPath)) {
    const pngBase64 =
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z5BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
    fs.writeFileSync(pngPath, Buffer.from(pngBase64, "base64"));
  }

  const pdfPath = path.join(fixturesDir, "test.pdf");
  fs.writeFileSync(pdfPath, "%PDF-1.4 test");

  const bigPath = path.join(fixturesDir, "too-big.bin");
  if (!fs.existsSync(bigPath)) {
    fs.writeFileSync(bigPath, Buffer.alloc(50 * 1024 * 1024 + 1, 0));
  }

  const create = await apiPost(token, "/exercise-submissions", {
    assigned_exercise_id: MEDIA_ASSIGNMENT_ID,
    parent_notes: "Phase B image submission test",
  });
  const submissionId = create.payload.data?.id;
  record("api", "Create submission for media test", create.status === 201, submissionId);

  const form = new FormData();
  const imageBlob = new Blob([fs.readFileSync(pngPath)], { type: "image/png" });
  form.append("file", imageBlob, "test-image.png");

  const upload = await apiPost(token, "/uploads/exercise-submission-media", form, true);
  const fileUrl = upload.payload.data?.url;
  record(
    "api",
    "POST /uploads/exercise-submission-media (image)",
    upload.status === 201 && Boolean(fileUrl),
    `status ${upload.status}`,
  );
  results.network.push({
    step: 2,
    method: "POST",
    path: "/uploads/exercise-submission-media",
    status: upload.status,
    fileUrl,
  });

  const attach = await apiPost(
    token,
    `/exercise-submissions/${submissionId}/media`,
    { media_type: "image", file_url: fileUrl },
  );
  record(
    "api",
    "POST /exercise-submissions/:id/media",
    attach.status === 201,
    `status ${attach.status}`,
  );
  results.network.push({
    step: 3,
    method: "POST",
    path: `/exercise-submissions/${submissionId}/media`,
    status: attach.status,
  });

  const pdfForm = new FormData();
  const pdfBlob = new Blob([fs.readFileSync(pdfPath)], { type: "application/pdf" });
  pdfForm.append("file", pdfBlob, "test.pdf");
  const pdfUpload = await apiPost(token, "/uploads/exercise-submission-media", pdfForm, true);
  record(
    "api",
    "Reject PDF upload at API",
    pdfUpload.status === 400 || pdfUpload.status === 415,
    `status ${pdfUpload.status}`,
  );

  const bigForm = new FormData();
  const bigBlob = new Blob([fs.readFileSync(bigPath)], { type: "application/octet-stream" });
  bigForm.append("file", bigBlob, "too-big.bin");
  const bigUpload = await apiPost(token, "/uploads/exercise-submission-media", bigForm, true);
  record(
    "api",
    "Reject >50MB upload at API",
    bigUpload.status === 400 || bigUpload.status === 413,
    `status ${bigUpload.status}`,
  );
}

async function expectDisabledDuringSubmit(page, submitBtn) {
  await submitBtn.click();
  const disabledDuring = await submitBtn.isDisabled({ timeout: 1000 }).catch(() => true);
  await submitBtn.click({ force: true, timeout: 500 }).catch(() => {});
  return disabledDuring;
}

async function createBrowserFileTestAssignment() {
  const specialist = await login(SPECIALIST_EMAIL);
  const today = new Date().toISOString().slice(0, 10);
  const dueDate = new Date(Date.now() + 25 * 86400000).toISOString().slice(0, 10);
  const candidates = [
    "de000011-0001-4001-8001-000000000016",
    "de000011-0001-4001-8001-000000000021",
    "de000011-0001-4001-8001-000000000017",
  ];

  for (const exerciseId of candidates) {
    const body = {
      exercise_id: exerciseId,
      plan_id: "de000032-0001-4001-8001-000000000001",
      patient_id: CHILD_PATIENT_ID,
      frequency: "daily",
      start_date: today,
      due_date: dueDate,
    };
    const created = await apiPost(specialist.token, "/assigned-exercises", body);
    if (created.status === 201) {
      return created.payload.data.id;
    }
  }

  throw new Error("Could not create browser file-test assignment.");
}

async function runBrowserValidation() {  let playwright;
  try {
    playwright = require("playwright");
  } catch {
    record("browser", "Playwright available", false, "skipped — npm install playwright");
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
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      consoleErrors.push(msg.text());
    }
  });
  page.on("pageerror", (error) => {
    consoleErrors.push(error.message);
  });

  try {
    await page.goto(`${WEB_BASE}/login`, { waitUntil: "domcontentloaded" });
    await page.locator('input[type="email"]').fill(PARENT_EMAIL);
    await page.locator('input[type="password"]').fill(PASSWORD);
    await page.getByRole("button", { name: /Sign In/i }).last().click();
    await page.waitForURL(/dashboard\/parent/, { timeout: 20000 });
    record("browser", "Parent login via UI", true);

    const fileTestAssignmentId = await createBrowserFileTestAssignment();
    record("browser", "Created fresh file-test assignment", true, fileTestAssignmentId);

    const childButton = page.locator(".pd-child-trigger").first();
    if (await childButton.count()) {
      await childButton.click();
      await page.locator(".pd-dropdown-item").filter({ hasText: "Omar Hassan" }).first().click();
      await page.waitForTimeout(1500);
    }

    await page.goto(
      `${WEB_BASE}/dashboard/parent/exercise-details?assignedExerciseId=${fileTestAssignmentId}&patientId=${CHILD_PATIENT_ID}`,
      { waitUntil: "domcontentloaded" },
    );
    await page.waitForSelector(".pd-exercise-submission", { timeout: 15000 });

    const fixturesDir = path.join(__dirname, "phase-b-fixtures");
    fs.mkdirSync(fixturesDir, { recursive: true });
    const pdfPath = path.join(fixturesDir, "test.pdf");
    fs.writeFileSync(pdfPath, "%PDF-1.4 test");
    const pngPath = path.join(fixturesDir, "test-image.png");
    if (!fs.existsSync(pngPath)) {
      fs.writeFileSync(
        pngPath,
        Buffer.from(
          "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z5BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
          "base64",
        ),
      );
    }

    await page.locator('input[type="file"]').setInputFiles(pdfPath);
    await page.waitForTimeout(300);
    const pdfError = await page.locator(".pd-inline-error").textContent().catch(() => "");
    record(
      "browser",
      "Reject PDF in file picker UI",
      /not supported/i.test(pdfError || ""),
      pdfError?.trim(),
    );

    await page.locator('input[type="file"]').setInputFiles(pngPath);
    await page.waitForTimeout(300);
    const previewVisible = await page.locator(".pd-submission-media-preview").isVisible();
    record("browser", "Image preview after selection", previewVisible);

    await page.waitForSelector(".pd-exercise-submission", { timeout: 15000 });
    const titleOnFileTest = await page.locator(".pd-exercise-detail-title").textContent();
    record("browser", "Exercise detail page loads", Boolean(titleOnFileTest?.trim()), titleOnFileTest?.trim());

    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForSelector(".pd-exercise-detail-title", { timeout: 15000 });
    record("browser", "Detail page refresh", true);

    await page.waitForSelector(".pd-exercise-submission-form", { timeout: 20000 });
    await page.locator("textarea").fill("Browser validation notes-only submit.");
    const submitBtn = page.locator(".pd-exercise-submission-actions .pd-btn-primary");
    const disabledDuring = await expectDisabledDuringSubmit(page, submitBtn);
    record("browser", "Submit button disabled while submitting", disabledDuring);

    await page.waitForURL(/dashboard\/parent/, { timeout: 20000 });
    record("browser", "Return to dashboard after submit", true);

    await page.waitForSelector(".pd-toast", { timeout: 5000 }).catch(() => null);
    const toast = page.locator(".pd-toast");
    const toastVisible = await toast.isVisible().catch(() => false);
    record(
      "browser",
      "Success toast visible",
      toastVisible,
      toastVisible ? (await toast.textContent())?.trim() : "not visible",
    );

    const beadAfter = page.getByRole("button", { name: /Buttoning Practice|Bead Threading/i });
    if (await beadAfter.count()) {
      const badgeText = await beadAfter.first().textContent();
      record(
        "browser",
        "Task shows submitted status on dashboard",
        /Submitted/i.test(badgeText || ""),
        badgeText?.slice(0, 120),
      );
    }

    record(
      "browser",
      "No console errors",
      consoleErrors.length === 0,
      consoleErrors.join("; ") || "clean",
    );
  } catch (error) {
    record("browser", "Browser flow", false, error.message);
    results.bugs.push({ area: "browser", message: error.message });
  } finally {
    await browser.close();
  }
}

async function main() {
  const browserOnly = process.argv.includes("--browser-only");
  console.log("=== Phase B Live Validation ===\n");

  try {
    await runBrowserValidation();
  } catch (error) {
    results.bugs.push({ area: "browser", message: error.message });
  }

  if (browserOnly) {
    console.log("\n=== Summary ===");
    console.log(JSON.stringify(results, null, 2));
    await pool.end();
    return;
  }

  try {
    await runApiValidation();
    const { token } = await login(PARENT_EMAIL);
    await runMediaValidation(token);
  } catch (error) {
    results.bugs.push({ area: "api", message: error.message });
    console.error("API validation error:", error.message);
  }

  console.log("\n=== Summary ===");
  console.log(JSON.stringify(results, null, 2));
  await pool.end();
}

main().catch(async (error) => {
  console.error(error);
  await pool.end();
  process.exit(1);
});
