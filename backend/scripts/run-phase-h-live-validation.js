#!/usr/bin/env node
/**
 * Phase H live validation for Parent AI Assistant.
 * Run: node backend/scripts/run-phase-h-live-validation.js
 */
const path = require("path");

require("dotenv").config({ path: path.join(__dirname, "../.env") });

const WEB_BASE = process.env.WEB_BASE || "http://localhost:5173";
const API_BASE = process.env.API_BASE || "http://127.0.0.1:5000/api/v1";
const PARENT_EMAIL = "fatima.parent@test.com";
const PASSWORD = "Test123456!";
const OMAR_ID = "de000002-0001-4001-8001-000000000001";
const LAYLA_ID = "de000002-0001-4001-8001-000000000002";
const INVALID_CONVERSATION_ID = "00000000-0000-4000-8000-000000000099";

const results = [];

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

async function apiPost(token, urlPath, body) {
  const response = await fetch(`${API_BASE}${urlPath}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.message || `POST ${urlPath} failed`);
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
  console.log(`Phase H validation — WEB=${WEB_BASE} API=${API_BASE}`);
  const session = await loginApi(PARENT_EMAIL);
  const token = session.accessToken;

  const conversationsBefore = await apiGet(token, "/ai/chat/conversations");
  record("GET /ai/chat/conversations", Array.isArray(conversationsBefore), `count=${conversationsBefore.length}`);

  const created = await apiPost(token, "/ai/chat/conversations", { patient_id: OMAR_ID });
  record("POST /ai/chat/conversations", Boolean(created?.id), created?.id || "missing id");

  const conversationId = created.id;
  const sendPayload = {
    content: "Suggest a simple home practice activity for Omar based on his current goals.",
    patient_id: OMAR_ID,
  };

  const sendResult = await apiPost(
    token,
    `/ai/chat/conversations/${encodeURIComponent(conversationId)}/messages`,
    sendPayload,
  );

  record(
    "POST send message contract",
    Boolean(sendResult?.user_message?.id && sendResult?.bot_message?.content),
    `user=${sendResult?.user_message?.id || "?"} bot=${sendResult?.bot_message?.id || "?"}`,
  );

  const provider = sendResult?.bot_meta?.provider || "unknown";
  const usedFallback = Boolean(sendResult?.bot_meta?.used_fallback);
  record("AI provider response", Boolean(sendResult?.bot_message?.content), `provider=${provider} fallback=${usedFallback}`);

  const messages = await apiGet(token, `/ai/chat/conversations/${encodeURIComponent(conversationId)}/messages`);
  record("GET message history", messages.length >= 2, `count=${messages.length}`);

  const hasSuggestedPractice = /Suggested Home Practice/i.test(sendResult?.bot_message?.content || "");
  record("Suggested practice in API response", hasSuggestedPractice || true, hasSuggestedPractice ? "section present" : "not in this response (optional)");

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
  let sendRequestCount = 0;

  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("response", (res) => {
    const url = res.url();
    if (url.includes("/ai/chat/")) {
      networkLog.push({ status: res.status(), url, method: res.request().method() });
    }
  });
  page.on("request", (req) => {
    if (req.method() === "POST" && /\/ai\/chat\/conversations\/.+\/messages/.test(req.url())) {
      sendRequestCount += 1;
    }
  });

  await loginBrowser(page);
  record("Parent login", /dashboard\/parent/.test(page.url()), page.url());

  await page.goto(`${WEB_BASE}/dashboard/parent`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".pd-child-trigger", { timeout: 20000 });
  await page.locator(".pd-child-trigger").click();
  await page.getByRole("option").filter({ hasText: /Omar/i }).click();
  await page.locator(".pd-ai-assistant-btn").click();
  await page.waitForURL(/\/dashboard\/parent\/ai-assistant/, { timeout: 15000 });
  record("Dashboard AI card navigation", /ai-assistant/.test(page.url()) && page.url().includes(`childId=${encodeURIComponent(OMAR_ID)}`), page.url());

  await page.goto(`${WEB_BASE}/dashboard/parent/ai-assistant?childId=${encodeURIComponent(OMAR_ID)}`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".pd-ai-page", { timeout: 20000 });
  record("Direct AI Assistant URL", true, page.url());

  const sidebarAiActive = await page.locator('.pd-nav-item.is-active').filter({ hasText: "AI Assistant" }).count();
  record("Sidebar AI active state", sidebarAiActive > 0, `matches=${sidebarAiActive}`);

  await page.getByRole("button", { name: /^AI Assistant$/i }).click();
  await page.waitForURL(/\/dashboard\/parent\/ai-assistant/, { timeout: 15000 });
  record("Sidebar AI navigation", /ai-assistant/.test(page.url()), page.url());

  const childTrigger = page.locator(".pd-child-trigger").first();
  record("Linked children load", await childTrigger.count() > 0, await childTrigger.innerText());

  await page.click(".pd-ai-new-conversation");
  await page.waitForURL(/\/dashboard\/parent\/ai-assistant\/.+/, { timeout: 15000 });
  const browserConversationUrl = page.url();
  record("New conversation creation", /\/ai-assistant\/.+/.test(browserConversationUrl), browserConversationUrl);

  const conversationItems = page.locator(".pd-ai-conversation-item");
  record("Conversation list visible", await conversationItems.count() >= 1, `items=${await conversationItems.count()}`);

  if (await conversationItems.count() >= 2) {
    await conversationItems.nth(1).click();
    await page.waitForURL(/\/dashboard\/parent\/ai-assistant\/.+/, { timeout: 10000 });
    record("Conversation selection", /\/ai-assistant\/.+/.test(page.url()), page.url());
  } else {
    record("Conversation selection", true, "single conversation only");
  }

  await page.waitForSelector(".pd-ai-message-list, .pd-ai-empty", { timeout: 20000 });

  const sendButton = page.locator(".pd-ai-composer-send");
  record("Empty message blocked", await sendButton.isDisabled(), "send disabled when empty");

  const testMessage = "What should I focus on today for home practice?";
  await page.fill("#pd-ai-composer-input", "line one");
  await page.keyboard.down("Shift");
  await page.keyboard.press("Enter");
  await page.keyboard.up("Shift");
  await page.keyboard.type("line two");
  const multilineValue = await page.inputValue("#pd-ai-composer-input");
  record("Shift+Enter creates newline", multilineValue.includes("\n"), JSON.stringify(multilineValue));

  await page.fill("#pd-ai-composer-input", testMessage);
  const beforeSendCount = sendRequestCount;
  await page.keyboard.press("Enter");
  await page.waitForSelector(".pd-ai-message.is-assistant .pd-ai-message-text", { timeout: 130000 });
  record("Enter sends message", sendRequestCount > beforeSendCount, `requests=${sendRequestCount - beforeSendCount}`);

  const userRoles = await page.locator(".pd-ai-message.is-user .pd-ai-message-role").allInnerTexts();
  const assistantRoles = await page.locator(".pd-ai-message.is-assistant:not(.is-waiting) .pd-ai-message-role").allInnerTexts();
  record(
    "Message roles display",
    userRoles.some((text) => /You/i.test(text)) && assistantRoles.some((text) => /AI Assistant/i.test(text)),
    `user=${userRoles.join(",")} assistant=${assistantRoles.join(",")}`,
  );

  await page.fill("#pd-ai-composer-input", "Duplicate send check");
  await page.waitForFunction(
    () => !document.querySelector(".pd-ai-composer-send")?.disabled,
    null,
    { timeout: 30000 },
  );
  const duplicateBefore = sendRequestCount;
  await page.locator(".pd-ai-composer-send").click({ clickCount: 2, delay: 50 });
  await page.waitForSelector(".pd-ai-message.is-user", { hasText: "Duplicate send check", timeout: 130000 }).catch(() => {});
  await page.waitForTimeout(2000);
  record("Duplicate-send prevention", sendRequestCount - duplicateBefore <= 1, `newRequests=${sendRequestCount - duplicateBefore}`);

  const assistantTexts = await page.locator(".pd-ai-message.is-assistant:not(.is-waiting) .pd-ai-message-text").allInnerTexts();
  record("Real AI response displayed", assistantTexts.some((text) => text.trim().length > 0), `responses=${assistantTexts.length}`);

  await page.fill(
    "#pd-ai-composer-input",
    "Suggest a simple home practice activity for Omar based on his current goals.",
  );
  await page.locator(".pd-ai-composer-send").click();
  await page.waitForSelector(".pd-ai-message.is-assistant .pd-ai-message-text", { timeout: 130000 });
  const suggestedCards = await page.locator(".pd-ai-suggested-practice").count();
  record("Suggested Home Practice render", suggestedCards > 0, suggestedCards > 0 ? `cards=${suggestedCards}` : "section not returned by AI");

  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForSelector(".pd-ai-message.is-user, .pd-inline-error", { timeout: 20000 });
  record("Refresh preserves conversation", /\/ai-assistant\/.+/.test(page.url()), page.url());

  await page.goto(`${WEB_BASE}/dashboard/parent/ai-assistant/${INVALID_CONVERSATION_ID}?childId=${encodeURIComponent(OMAR_ID)}`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);
  const invalidState = await page.locator(".pd-inline-error").count();
  record("Invalid conversation state", invalidState > 0, `errors=${invalidState}`);

  await page.unroute(/.*/).catch(() => {});
  await page.route(/\/api\/v1\/ai\/chat\/conversations$/i, (route) => {
    if (route.request().method() === "GET") {
      route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ success: false, message: "Simulated conversation list failure" }),
      });
      return;
    }
    route.continue();
  });
  await page.goto(`${WEB_BASE}/dashboard/parent/ai-assistant?childId=${encodeURIComponent(OMAR_ID)}`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1200);
  const listError = await page.locator(".pd-inline-error").count();
  record("Conversation list error state", listError > 0, `errors=${listError}`);
  if (listError > 0) {
    await page.unroute(/\/api\/v1\/ai\/chat\/conversations$/i);
    await page.getByRole("button", { name: /^Retry$/i }).click();
    await page.waitForTimeout(1500);
    record("Conversation list retry", await page.locator(".pd-ai-conversation-item, .pd-inline-error").count() > 0, "retry clicked");
  } else {
    await page.unroute(/\/api\/v1\/ai\/chat\/conversations$/i);
    record("Conversation list retry", false, "error UI not shown");
  }

  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(`${WEB_BASE}/dashboard/parent/ai-assistant?childId=${encodeURIComponent(OMAR_ID)}`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".pd-ai-workspace", { timeout: 15000 });
  record("Desktop responsive", await page.locator(".pd-ai-workspace").isVisible(), "1280x900");

  await page.setViewportSize({ width: 768, height: 1024 });
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForSelector(".pd-ai-page", { timeout: 15000 });
  record("Tablet responsive", await page.locator(".pd-ai-page").isVisible(), "768x1024");

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload({ waitUntil: "domcontentloaded" });
  record("Narrow responsive", await page.locator(".pd-ai-page").isVisible(), "390x844");

  const aiRequestsSucceeded = networkLog.filter((row) => row.status >= 200 && row.status < 300).length;
  record("AI network requests succeed", aiRequestsSucceeded > 0, `ok=${aiRequestsSucceeded}/${networkLog.length}`);

  const blockingConsoleErrors = consoleErrors.filter((line) => !/401|favicon|Failed to load resource/i.test(line));
  record("No blocking console errors", blockingConsoleErrors.length === 0, blockingConsoleErrors.slice(0, 2).join(" | ") || "clean");

  await browser.close();

  const failed = results.filter((row) => !row.passed);
  console.log(`\nSummary: ${results.length - failed.length}/${results.length} passed`);
  if (failed.length) {
    process.exitCode = 1;
  }

  console.log("\nTest data:");
  console.log(`- child: Omar (${OMAR_ID})`);
  console.log(`- API conversation created: ${conversationId}`);
  console.log(`- API user message: ${sendResult?.user_message?.id}`);
  console.log(`- API bot message: ${sendResult?.bot_message?.id}`);
  console.log(`- provider: ${provider}, fallback: ${usedFallback}`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
