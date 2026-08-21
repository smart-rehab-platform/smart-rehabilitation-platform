/**
 * Authorization tests for AI report read/export endpoints.
 * Run: node scripts/test-ai-reports-read-auth.js
 *
 * Does not call Gemini or write PDFs.
 */
const assert = require("assert");

const authenticate = require("../src/middleware/auth.middleware");
const authorizeRoles = require("../src/middleware/role.middleware");

const IDS = {
  specialistA: "11111111-1111-4111-8111-111111111111",
  specialistB: "55555555-5555-4555-8555-555555555555",
  admin: "22222222-2222-4222-8222-222222222222",
  parent: "66666666-6666-4666-8666-666666666666",
  patientA: "33333333-3333-4333-8333-333333333333",
  patientB: "44444444-4444-4444-8444-444444444444",
  reportA: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  reportB: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
};

const reportA = {
  id: IDS.reportA,
  patient_id: IDS.patientA,
  patient_name: "Patient A",
  type: "weekly",
  summary: "{}",
  generated_at: "2026-08-01T00:00:00.000Z",
};

const reportB = {
  id: IDS.reportB,
  patient_id: IDS.patientB,
  patient_name: "Patient B",
  type: "monthly",
  summary: "{}",
  generated_at: "2026-08-02T00:00:00.000Z",
};

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

const dbPath = require.resolve("../src/database/db");
const patientAccessUtilPath = require.resolve("../src/utils/patientAccess");
const pdfPath = require.resolve("../src/modules/aiReports/aiReportPdf.generator");
const servicePath = require.resolve("../src/modules/aiReports/aiReports.service");
const controllerPath = require.resolve("../src/modules/aiReports/aiReports.controller");
const accessMwPath = require.resolve("../src/middleware/patientAccess.middleware");

const dbQueries = [];
let pdfCalls = 0;

require.cache[dbPath] = {
  id: dbPath,
  filename: dbPath,
  loaded: true,
  exports: {
    query: async (sql, params = []) => {
      const normalized = sql.replace(/\s+/g, " ").trim();
      dbQueries.push({ sql: normalized, params });

      if (normalized.includes("UPDATE ai_reports")) {
        return { rows: [] };
      }

      if (normalized.includes("WHERE ar.id")) {
        const id = params[0];
        if (id === IDS.reportA) {
          return { rows: [reportA] };
        }
        if (id === IDS.reportB) {
          return { rows: [reportB] };
        }
        return { rows: [] };
      }

      if (normalized.includes("JOIN patient_specialists")) {
        const specialistId = params[0];
        const rows = specialistId === IDS.specialistA ? [reportA] : [];
        return { rows };
      }

      if (
        normalized.includes("FROM ai_reports ar")
        && normalized.includes("WHERE ar.patient_id")
      ) {
        const patientId = params[0];
        if (patientId === IDS.patientA) {
          return { rows: [reportA] };
        }
        if (patientId === IDS.patientB) {
          return { rows: [reportB] };
        }
        return { rows: [] };
      }

      if (
        normalized.includes("FROM ai_reports ar")
        && normalized.includes("ORDER BY ar.generated_at DESC")
      ) {
        return { rows: [reportB, reportA] };
      }

      if (normalized.includes("FROM ai_reports") && normalized.includes("WHERE patient_id")) {
        const patientId = params[0];
        if (patientId === IDS.patientA) {
          return { rows: [reportA] };
        }
        if (patientId === IDS.patientB) {
          return { rows: [reportB] };
        }
        return { rows: [] };
      }

      return { rows: [] };
    },
  },
};

require.cache[pdfPath] = {
  id: pdfPath,
  filename: pdfPath,
  loaded: true,
  exports: {
    generateAiReportPdfFile: async () => {
      pdfCalls += 1;
      return { publicUrl: "/uploads/ai-reports/test.pdf" };
    },
  },
};

require.cache[patientAccessUtilPath] = {
  id: patientAccessUtilPath,
  filename: patientAccessUtilPath,
  loaded: true,
  exports: {
    patientExists: async (patientId) =>
      patientId === IDS.patientA || patientId === IDS.patientB,
    isSpecialistAssignedToPatient: async (specialistId, patientId) =>
      specialistId === IDS.specialistA && patientId === IDS.patientA,
    isParentLinkedToPatient: async () => false,
    canAccessPatient: async (patientId, user) => {
      if (user?.role === "admin") {
        return true;
      }
      if (user?.role === "specialist") {
        return user.id === IDS.specialistA && patientId === IDS.patientA;
      }
      return false;
    },
  },
};

delete require.cache[accessMwPath];
delete require.cache[servicePath];
delete require.cache[controllerPath];

const requirePatientAccess = require("../src/middleware/patientAccess.middleware");
const aiReportsService = require("../src/modules/aiReports/aiReports.service");
const aiReportsController = require("../src/modules/aiReports/aiReports.controller");

(async () => {
  {
    const { res, next } = await runMiddleware(authenticate, { headers: {} });
    assert.strictEqual(next, false);
    assert.strictEqual(res.statusCode, 401);
    pass("A/F. no token → 401");
  }

  {
    const { res, next } = await runStack(
      [authorizeRoles("admin", "specialist"), aiReportsController.getAllReports],
      {
        user: { id: IDS.parent, role: "parent" },
        headers: {},
      }
    );
    assert.strictEqual(next, false);
    assert.strictEqual(res.statusCode, 403);
    pass("B. Parent GET /ai/reports → 403");
  }

  {
    dbQueries.length = 0;
    const rows = await aiReportsService.getAllReports({
      id: IDS.admin,
      role: "admin",
    });
    assert.strictEqual(rows.length, 2);
    assert.ok(rows.some((row) => row.id === IDS.reportA));
    assert.ok(rows.some((row) => row.id === IDS.reportB));
    assert.ok(dbQueries.some((item) => item.sql.includes("ORDER BY ar.generated_at DESC")));
    assert.ok(dbQueries.every((item) => !item.sql.includes("patient_specialists")));
    pass("C. Admin list → complete unfiltered AI report list");
  }

  {
    dbQueries.length = 0;
    const rows = await aiReportsService.getAllReports({
      id: IDS.specialistA,
      role: "specialist",
    });
    assert.deepStrictEqual(rows.map((row) => row.id), [IDS.reportA]);
    const filtered = dbQueries.find((item) => item.sql.includes("patient_specialists"));
    assert.ok(filtered);
    assert.deepStrictEqual(filtered.params, [IDS.specialistA]);
    pass("D. Specialist A list → only assigned-patient reports");
  }

  {
    dbQueries.length = 0;
    const rows = await aiReportsService.getAllReports({
      id: IDS.specialistB,
      role: "specialist",
    });
    assert.deepStrictEqual(rows, []);
    assert.ok(dbQueries.some((item) => item.sql.includes("patient_specialists")));
    pass("E. Specialist B list → does not include Specialist A patient reports");
  }

  {
    const { res } = await runStack(
      [authorizeRoles("admin", "specialist"), aiReportsController.getReportById],
      {
        user: { id: IDS.admin, role: "admin" },
        params: { id: IDS.reportA },
        headers: {},
      }
    );
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.data.id, IDS.reportA);
    pass("G. Admin can view report detail");
  }

  {
    const { res } = await runStack(
      [authorizeRoles("admin", "specialist"), aiReportsController.getReportById],
      {
        user: { id: IDS.specialistA, role: "specialist" },
        params: { id: IDS.reportA },
        headers: {},
      }
    );
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.data.id, IDS.reportA);
    pass("H. assigned Specialist can view report detail");
  }

  {
    const { res } = await runStack(
      [authorizeRoles("admin", "specialist"), aiReportsController.getReportById],
      {
        user: { id: IDS.specialistA, role: "specialist" },
        params: { id: IDS.reportB },
        headers: {},
      }
    );
    assert.strictEqual(res.statusCode, 403);
    assert.strictEqual(res.body.message, "You do not have access to this patient.");
    pass("I. unassigned Specialist cannot view another Specialist's report");
  }

  {
    const { res } = await runStack(
      [
        authorizeRoles("admin", "specialist"),
        requirePatientAccess("id"),
        aiReportsController.getReportsByPatient,
      ],
      {
        user: { id: IDS.specialistA, role: "specialist" },
        params: { id: IDS.patientA },
        headers: {},
      }
    );
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.count, 1);
    assert.strictEqual(res.body.data[0].id, IDS.reportA);
    pass("J. assigned Specialist can GET patient AI reports");
  }

  {
    const { res } = await runStack(
      [
        authorizeRoles("admin", "specialist"),
        requirePatientAccess("id"),
        aiReportsController.getReportsByPatient,
      ],
      {
        user: { id: IDS.specialistA, role: "specialist" },
        params: { id: IDS.patientB },
        headers: {},
      }
    );
    assert.strictEqual(res.statusCode, 403);
    assert.strictEqual(res.body.data, undefined);
    pass("K. unassigned Specialist denied patient-scoped AI reports");
  }

  {
    pdfCalls = 0;
    const result = await aiReportsService.exportReportPdf(IDS.reportA, {
      id: IDS.admin,
      role: "admin",
    });
    assert.ok(result);
    assert.ok(pdfCalls >= 1);
    pass("L. Admin can export (access allowed before PDF)");
  }

  {
    pdfCalls = 0;
    const result = await aiReportsService.exportReportPdf(IDS.reportA, {
      id: IDS.specialistA,
      role: "specialist",
    });
    assert.ok(result);
    assert.ok(pdfCalls >= 1);
    pass("M. assigned Specialist can export");
  }

  {
    pdfCalls = 0;
    try {
      await aiReportsService.exportReportPdf(IDS.reportB, {
        id: IDS.specialistA,
        role: "specialist",
      });
      assert.fail("expected export to reject");
    } catch (error) {
      assert.strictEqual(error.statusCode, 403);
      assert.strictEqual(error.message, "You do not have access to this patient.");
      assert.strictEqual(pdfCalls, 0);
      pass("N. unassigned Specialist cannot export; PDF generator not invoked");
    }
  }

  {
    const routes = require("../src/modules/aiReports/aiReports.routes");
    const list = routes.stack.find((layer) => layer.route?.path === "/ai/reports" && layer.route.methods.get);
    const detail = routes.stack.find((layer) => layer.route?.path === "/ai/reports/:id" && layer.route.methods.get);
    const byPatient = routes.stack.find((layer) => layer.route?.path === "/patients/:id/ai-reports");
    const weekly = routes.stack.find((layer) => layer.route?.path === "/ai/reports/generate-weekly");
    const monthly = routes.stack.find((layer) => layer.route?.path === "/ai/reports/generate-monthly");

    assert.ok(list);
    assert.ok(detail);
    assert.ok(byPatient);
    assert.strictEqual(list.route.stack.length, 3);
    assert.strictEqual(detail.route.stack.length, 3);
    assert.strictEqual(byPatient.route.stack.length, 4);
    assert.strictEqual(weekly.route.stack.length, 5);
    assert.strictEqual(monthly.route.stack.length, 5);
    pass("route stacks: reads authenticated; Phase 0 generate stacks unchanged");
  }

  console.log(`\n${passed} checks passed.`);
})().catch((error) => {
  console.error("\nFAILED:", error);
  process.exit(1);
});
