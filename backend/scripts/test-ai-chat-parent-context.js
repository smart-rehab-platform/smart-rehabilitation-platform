/**
 * Parent AI assistant context, language, and authorization tests.
 * Run: node scripts/test-ai-chat-parent-context.js
 */
const assert = require("assert");
const fs = require("fs");
const path = require("path");

const {
  buildChatbotPrompt,
  createFallbackReply,
  detectMessageLanguage,
  resolvePatientIdForMessage,
} = require("../src/modules/aiChat/aiChat.service");

const IDS = {
  parent: "66666666-6666-4666-8666-666666666666",
  patientA: "33333333-3333-4333-8333-333333333333",
  patientB: "44444444-4444-4444-8444-444444444444",
  strangerPatient: "99999999-9999-4999-8999-999999999999",
};

const parentUser = { id: IDS.parent, role: "parent", full_name: "Parent User" };

let passed = 0;
const pass = (label) => {
  passed += 1;
  console.log(`  ✓ ${label}`);
};

const contextForPatient = (patientId, name, exercises = []) => ({
  patientProfile: { id: patientId, full_name: name },
  assignedExercises: exercises,
  progressSnapshots: [],
});

(async () => {
  console.log("aiChat parent context");

  assert.strictEqual(detectMessageLanguage("What exercises are assigned?"), "en");
  assert.strictEqual(detectMessageLanguage("ما هي التمارين المعينة؟"), "ar");
  assert.strictEqual(detectMessageLanguage("Hello مرحبا"), "ar");
  pass("detectMessageLanguage picks dominant script");

  const englishPrompt = buildChatbotPrompt({
    user: parentUser,
    question: "What exercises are assigned?",
    patientContext: contextForPatient(IDS.patientA, "Child A"),
    chatHistory: [],
    responseLanguage: "en",
  });
  assert.ok(englishPrompt.includes("Reply entirely in English"));
  assert.ok(englishPrompt.includes("Child A"));
  pass("English prompt includes English reply instruction and patient A context");

  const arabicPrompt = buildChatbotPrompt({
    user: parentUser,
    question: "ما هي التمارين؟",
    patientContext: contextForPatient(IDS.patientB, "Child B"),
    chatHistory: [],
    responseLanguage: "ar",
  });
  assert.ok(arabicPrompt.includes("Reply entirely in Arabic"));
  assert.ok(arabicPrompt.includes("Child B"));
  pass("Arabic prompt includes Arabic reply instruction and patient B context");

  const englishFallback = createFallbackReply({
    question: "Tell me about exercises",
    patientContext: contextForPatient(IDS.patientA, "Child A", [
      { exercise_title: "Breathing Drill" },
    ]),
    userRole: "parent",
    responseLanguage: "en",
  });
  assert.ok(englishFallback.includes("Breathing Drill"));
  pass("English fallback references assigned exercise");

  const arabicFallback = createFallbackReply({
    question: "أخبرني عن التمارين",
    patientContext: contextForPatient(IDS.patientA, "Child A", [
      { exercise_title: "Breathing Drill" },
    ]),
    userRole: "parent",
    responseLanguage: "ar",
  });
  assert.ok(/[\u0600-\u06FF]/.test(arabicFallback));
  pass("Arabic fallback responds in Arabic");

  const serviceSource = fs.readFileSync(
    path.join(__dirname, "../src/modules/aiChat/aiChat.service.js"),
    "utf8"
  );

  {
    let error = null;
    try {
      await resolvePatientIdForMessage({
        user: parentUser,
        patientId: IDS.patientB,
        conversationPatientId: IDS.patientA,
      });
    } catch (err) {
      error = err;
    }
    assert.strictEqual(error?.statusCode, 403);
    pass("child B after child A does not reuse child A conversation context");
  }

  assert.ok(serviceSource.includes("patient_id: row.patient_id"));
  pass("multi-child conversations expose stored patient_id for filtering");

  {
    let error = null;
    try {
      await resolvePatientIdForMessage({
        user: parentUser,
        patientId: null,
        conversationPatientId: IDS.patientA,
      });
    } catch (err) {
      error = err;
    }
    assert.strictEqual(error?.statusCode, 400);
    pass("missing patientId does not default to conversation patient for parent");
  }

  assert.ok(serviceSource.includes("canAccessPatient(patientId, user)"));
  assert.ok(serviceSource.includes("You do not have access to this patient"));
  pass("unauthorized patientId is rejected via canAccessPatient checks");

  assert.ok(serviceSource.includes("collectPatientContext(effectivePatientId)"));
  assert.ok(serviceSource.includes("AND ae.is_active = TRUE"));
  assert.ok(serviceSource.includes("AND status = 'active'"));
  assert.ok(serviceSource.includes("getPatientAiProgressNotesSafe(patientId, client)"));
  assert.ok(serviceSource.includes("client = await pool.connect()"));
  assert.ok(serviceSource.includes("client.release()"));
  assert.ok(!/collectPatientContext[\s\S]*Promise\.all/.test(serviceSource));
  pass("collectPatientContext uses one leased client sequentially, not parallel pool.query burst");

  const freshContextA = contextForPatient(IDS.patientA, "Child A", [
    { exercise_title: "Old Exercise" },
  ]);
  const freshContextB = contextForPatient(IDS.patientA, "Child A", [
    { exercise_title: "Old Exercise" },
    { exercise_title: "Newly Assigned Exercise" },
  ]);
  const promptA = buildChatbotPrompt({
    user: parentUser,
    question: "exercises",
    patientContext: freshContextA,
    chatHistory: [],
    responseLanguage: "en",
  });
  const promptB = buildChatbotPrompt({
    user: parentUser,
    question: "exercises",
    patientContext: freshContextB,
    chatHistory: [],
    responseLanguage: "en",
  });
  assert.ok(promptA.includes("Old Exercise"));
  assert.ok(!promptA.includes("Newly Assigned Exercise"));
  assert.ok(promptB.includes("Newly Assigned Exercise"));
  pass("newly assigned exercise appears when fresh context is loaded per message");

  const serverSource = fs.readFileSync(
    path.join(__dirname, "../src/server.js"),
    "utf8"
  );
  assert.ok(serverSource.includes('.query("SELECT 1")'));
  assert.ok(!/pool\s*\n\s*\.connect\(\)\s*\n\s*\.then/.test(serverSource));
  pass("server startup health check uses pool.query instead of leaking pool.connect()");

  const dbSource = fs.readFileSync(
    path.join(__dirname, "../src/database/db.js"),
    "utf8"
  );
  assert.ok(dbSource.includes("isConnectionExhaustedError"));
  assert.ok(dbSource.includes("logDatabaseError"));
  pass("shared pool logs connection exhaustion safely");

  console.log(`\n${passed} passed`);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
