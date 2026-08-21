/**
 * Authorization tests for AI report generation endpoints.
 * Run: node scripts/test-ai-reports-generate-auth.js
 *
 * Does not call Gemini or insert into ai_reports.
 */
const assert = require("assert");

const authenticate = require("../src/middleware/auth.middleware");
const authorizeRoles = require("../src/middleware/role.middleware");
const {
  validateGenerateReport,
} = require("../src/modules/aiReports/aiReports.validation");

const IDS = {
  specialistA: "11111111-1111-4111-8111-111111111111",
  specialistB: "55555555-5555-4555-8555-555555555555",
  admin: "22222222-2222-4222-8222-222222222222",
  parent: "66666666-6666-4666-8666-666666666666",
  patientA: "33333333-3333-4333-8333-333333333333",
  patientB: "44444444-4444-4444-8444-444444444444",
  missing: "99999999-9999-4999-8999-999999999999",
};

const yesterday = () => {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date.toISOString().slice(0, 10);
};

const lastWeekStart = () => {
  const date = new Date();
  date.setDate(date.getDate() - 7);
  return date.toISOString().slice(0, 10);
};

const validBody = (patientId = IDS.patientA) => ({
  patient_id: patientId,
  period_start: lastWeekStart(),
  period_end: yesterday(),
});

let passed = 0;
const pass = (label) => {
  passed += 1;
  console.log(`  ✓ ${label}`);
};

const createRes = (resolve) => ({
  statusCode: 200,
  body: null,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(payload) {
    this.body = payload;
    resolve();
    return this;
  },
});

const runMiddleware = (fn, req) =>
  new Promise((resolve) => {
    const res = createRes(() => resolve({ req, res, next: false }));
    Promise.resolve(fn(req, res, () => resolve({ req, res, next: true }))).catch(
      (error) => {
        res.status(500).json({ success: false, message: error.message });
      }
    );
  });

const runStack = async (middlewares, req) => {
  let result = { req, res: { statusCode: 200, body: null }, next: true };
  for (const fn of middlewares) {
    result = await runMiddleware(fn, req);
    if (!result.next) {
      return result;
    }
  }
  return result;
};

const accessPath = require.resolve("../src/middleware/patientAccess.middleware");
const patientAccessUtilPath = require.resolve("../src/utils/patientAccess");
const servicePath = require.resolve("../src/modules/aiReports/aiReports.service");
const controllerPath = require.resolve("../src/modules/aiReports/aiReports.controller");

let accessState = {
  exists: true,
  assignedPairs: new Set([`${IDS.specialistA}:${IDS.patientA}`]),
};

const mockPatientAccessUtils = {
  patientExists: async (patientId) => {
    if (!accessState.exists) {
      return false;
    }
    return patientId === IDS.patientA || patientId === IDS.patientB;
  },
  isSpecialistAssignedToPatient: async (specialistId, patientId) =>
    accessState.assignedPairs.has(`${specialistId}:${patientId}`),
  isParentLinkedToPatient: async () => false,
  canAccessPatient: async (patientId, user) => {
    if (user?.role === "admin") {
      return true;
    }
    if (user?.role === "specialist") {
      return accessState.assignedPairs.has(`${user.id}:${patientId}`);
    }
    return false;
  },
};

const generationCalls = [];
const mockAiReportsService = {
  generateReport: async (payload) => {
    generationCalls.push(payload);
    return {
      id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      patient_id: payload.patient_id,
      type: payload.type,
      period_start: payload.period_start,
      period_end: payload.period_end,
      summary: "{}",
    };
  },
  getAllReports: async () => [],
  getReportById: async () => null,
  getReportsByPatient: async () => [],
  exportReportPdf: async () => null,
};

delete require.cache[patientAccessUtilPath];
delete require.cache[accessPath];
delete require.cache[servicePath];
delete require.cache[controllerPath];

require.cache[patientAccessUtilPath] = {
  id: patientAccessUtilPath,
  filename: patientAccessUtilPath,
  loaded: true,
  exports: mockPatientAccessUtils,
};
require.cache[servicePath] = {
  id: servicePath,
  filename: servicePath,
  loaded: true,
  exports: mockAiReportsService,
};

const requirePatientAccess = require("../src/middleware/patientAccess.middleware");
const aiReportsController = require("../src/modules/aiReports/aiReports.controller");

const specialistStack = (handler) => [
  authorizeRoles("specialist"),
  validateGenerateReport,
  requirePatientAccess.fromBodySpecialistAssignment("patient_id"),
  handler,
];

(async () => {
  {
    const { res, next } = await runMiddleware(authenticate, {
      headers: {},
    });
    assert.strictEqual(next, false);
    assert.strictEqual(res.statusCode, 401);
    pass("A. unauthenticated weekly/monthly stack: no token → 401");
  }

  {
    const { res, next } = await runMiddleware(authenticate, {
      headers: { authorization: "Basic abc" },
    });
    assert.strictEqual(next, false);
    assert.strictEqual(res.statusCode, 401);
    pass("A. unauthenticated: non-Bearer header → 401");
  }

  for (const [role, userId, label] of [
    ["parent", IDS.parent, "B. authenticated Parent"],
    ["admin", IDS.admin, "C. authenticated Admin"],
  ]) {
    for (const [name, handler] of [
      ["weekly", aiReportsController.generateWeeklyReport],
      ["monthly", aiReportsController.generateMonthlyReport],
    ]) {
      generationCalls.length = 0;
      const { res, next } = await runStack(specialistStack(handler), {
        user: { id: userId, role },
        body: validBody(),
        headers: {},
      });
      assert.strictEqual(next, false);
      assert.strictEqual(res.statusCode, 403);
      assert.strictEqual(generationCalls.length, 0);
      pass(`${label} ${name} → 403, generation not executed`);
    }
  }

  for (const [name, handler] of [
    ["weekly", aiReportsController.generateWeeklyReport],
    ["monthly", aiReportsController.generateMonthlyReport],
  ]) {
    generationCalls.length = 0;
    const { res, next } = await runStack(specialistStack(handler), {
      user: { id: IDS.specialistA, role: "specialist" },
      body: {
        ...validBody(IDS.patientB),
        specialist_id: IDS.specialistB,
      },
      headers: {},
    });
    assert.strictEqual(next, false);
    assert.strictEqual(res.statusCode, 403);
    assert.strictEqual(generationCalls.length, 0);
    pass(`D. Specialist A + Patient B (${name}) → 403, generation not executed`);
  }

  for (const [name, handler, type] of [
    ["weekly", aiReportsController.generateWeeklyReport, "weekly"],
    ["monthly", aiReportsController.generateMonthlyReport, "monthly"],
  ]) {
    generationCalls.length = 0;
    const body = {
      ...validBody(IDS.patientA),
      specialist_id: IDS.specialistB,
    };
    const { res } = await runStack(specialistStack(handler), {
      user: { id: IDS.specialistA, role: "specialist" },
      body,
      headers: {},
    });
    assert.strictEqual(res.statusCode, 201);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(generationCalls.length, 1);
    assert.deepStrictEqual(generationCalls[0], {
      patient_id: IDS.patientA,
      period_start: body.period_start,
      period_end: body.period_end,
      type,
      generated_by: IDS.specialistA,
      language: "en",
    });
    assert.strictEqual(generationCalls[0].specialist_id, undefined);
    assert.strictEqual(body.specialist_id, undefined);
    pass(`E. Specialist A + assigned Patient A (${name}) → 201, generation reached`);
  }

  {
    generationCalls.length = 0;
    const body = {
      ...validBody(IDS.patientA),
      language: "ar-SA",
    };
    const { res } = await runStack(
      specialistStack(aiReportsController.generateWeeklyReport),
      {
        user: { id: IDS.specialistA, role: "specialist" },
        body,
        headers: {},
      }
    );
    assert.strictEqual(res.statusCode, 201);
    assert.strictEqual(generationCalls.length, 1);
    assert.strictEqual(generationCalls[0].language, "ar");
    pass("E2. language=ar-SA → normalized to ar and passed to generation");
  }

  {
    generationCalls.length = 0;
    const { res, next } = await runStack(
      specialistStack(aiReportsController.generateWeeklyReport),
      {
        user: { id: IDS.specialistA, role: "specialist" },
        body: {
          ...validBody(IDS.patientA),
          language: "fr",
        },
        headers: {},
      }
    );
    assert.strictEqual(next, false);
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(generationCalls.length, 0);
    pass("E3. unsupported language → 400, generation not executed");
  }

  {
    generationCalls.length = 0;
    const { res, next } = await runStack(
      specialistStack(aiReportsController.generateWeeklyReport),
      {
        user: { id: IDS.specialistA, role: "specialist" },
        body: { period_start: lastWeekStart(), period_end: yesterday() },
        headers: {},
      }
    );
    assert.strictEqual(next, false);
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(generationCalls.length, 0);
    pass("F. missing patient_id → 400, generation not executed");
  }

  {
    generationCalls.length = 0;
    const { res, next } = await runStack(
      specialistStack(aiReportsController.generateMonthlyReport),
      {
        user: { id: IDS.specialistA, role: "specialist" },
        body: {
          patient_id: IDS.patientA,
          period_start: yesterday(),
          period_end: lastWeekStart(),
        },
        headers: {},
      }
    );
    assert.strictEqual(next, false);
    assert.strictEqual(res.statusCode, 400);
    assert.match(res.body.message, /period_start cannot be after period_end/);
    assert.strictEqual(generationCalls.length, 0);
    pass("F. period_start after period_end → 400");
  }

  {
    generationCalls.length = 0;
    const futureEnd = new Date();
    futureEnd.setDate(futureEnd.getDate() + 3);
    const year = futureEnd.getFullYear();
    const month = String(futureEnd.getMonth() + 1).padStart(2, "0");
    const day = String(futureEnd.getDate()).padStart(2, "0");
    const { res, next } = await runStack(
      specialistStack(aiReportsController.generateWeeklyReport),
      {
        user: { id: IDS.specialistA, role: "specialist" },
        body: {
          patient_id: IDS.patientA,
          period_start: lastWeekStart(),
          period_end: `${year}-${month}-${day}`,
        },
        headers: {},
      }
    );
    assert.strictEqual(next, false);
    assert.strictEqual(res.statusCode, 400);
    assert.match(res.body.message, /has not ended yet/);
    assert.strictEqual(generationCalls.length, 0);
    pass("F. period_end after today → 400");
  }

  {
    generationCalls.length = 0;
    accessState.exists = false;
    const { res, next } = await runStack(
      specialistStack(aiReportsController.generateWeeklyReport),
      {
        user: { id: IDS.specialistA, role: "specialist" },
        body: validBody(IDS.missing),
        headers: {},
      }
    );
    accessState.exists = true;
    assert.strictEqual(next, false);
    assert.strictEqual(res.statusCode, 404);
    assert.strictEqual(generationCalls.length, 0);
    pass("G/H. missing patient → 404, no generateReport call (no Gemini / no INSERT)");
  }

  {
    const routes = require("../src/modules/aiReports/aiReports.routes");
    const weekly = routes.stack.find(
      (layer) => layer.route?.path === "/ai/reports/generate-weekly"
    );
    const monthly = routes.stack.find(
      (layer) => layer.route?.path === "/ai/reports/generate-monthly"
    );
    const exportPdf = routes.stack.find(
      (layer) => layer.route?.path === "/ai/reports/:id/export-pdf"
    );

    assert.ok(weekly);
    assert.ok(monthly);
    assert.ok(exportPdf);
    assert.strictEqual(weekly.route.stack.length, 5);
    assert.strictEqual(monthly.route.stack.length, 5);
    assert.strictEqual(exportPdf.route.stack.length, 3);
    pass("route stacks: generate has auth+role+validation+assignment; export-pdf unchanged (3 layers)");
  }

  console.log(`\n${passed} checks passed.`);
})().catch((error) => {
  console.error("\nFAILED:", error);
  process.exit(1);
});
