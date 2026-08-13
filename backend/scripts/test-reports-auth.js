/**
 * Authorization tests for regular reports endpoints.
 * Run: node scripts/test-reports-auth.js
 *
 * Does not write PDFs or hit PostgreSQL.
 */
const assert = require("assert");

const authenticate = require("../src/middleware/auth.middleware");
const authorizeRoles = require("../src/middleware/role.middleware");
const { validateCreateReport } = require("../src/modules/reports/reports.validation");

const IDS = {
  specialistA: "11111111-1111-4111-8111-111111111111",
  specialistB: "55555555-5555-4555-8555-555555555555",
  admin: "22222222-2222-4222-8222-222222222222",
  parent: "66666666-6666-4666-8666-666666666666",
  userB: "77777777-7777-4777-8777-777777777777",
  patientA: "33333333-3333-4333-8333-333333333333",
  patientB: "44444444-4444-4444-8444-444444444444",
  reportA: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  reportB: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
};

const reportA = {
  id: IDS.reportA,
  patient_id: IDS.patientA,
  generated_by: IDS.specialistA,
  report_type: "weekly",
  title: "Weekly Progress Report",
  summary: "ok",
  pdf_url: null,
  patient_name: "Patient A",
  generated_by_name: "Specialist A",
  created_at: "2026-08-01T00:00:00.000Z",
};

const reportB = {
  id: IDS.reportB,
  patient_id: IDS.patientB,
  generated_by: IDS.specialistB,
  report_type: "monthly",
  title: "Monthly Progress Report",
  summary: "ok",
  pdf_url: null,
  patient_name: "Patient B",
  generated_by_name: "Specialist B",
  created_at: "2026-08-02T00:00:00.000Z",
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
const notifyPath = require.resolve(
  "../src/modules/notifications/adminNotifications.helper"
);
const pdfPath = require.resolve("../src/modules/reports/reportPdf.generator");
const servicePath = require.resolve("../src/modules/reports/reports.service");
const controllerPath = require.resolve("../src/modules/reports/reports.controller");
const accessMwPath = require.resolve("../src/middleware/patientAccess.middleware");
const routesPath = require.resolve("../src/modules/reports/reports.routes");

const dbQueries = [];
let pdfCalls = 0;
let insertCount = 0;
let lastInsertParams = null;
let notifyCalls = 0;

require.cache[dbPath] = {
  id: dbPath,
  filename: dbPath,
  loaded: true,
  exports: {
    query: async (sql, params = []) => {
      const normalized = sql.replace(/\s+/g, " ").trim();
      dbQueries.push({ sql: normalized, params });

      if (normalized.includes("INSERT INTO reports")) {
        insertCount += 1;
        lastInsertParams = params;
        return {
          rows: [
            {
              id: IDS.reportA,
              patient_id: params[0],
              generated_by: params[1],
              report_type: params[2],
              title: params[3],
              summary: params[4],
              pdf_url: params[5],
            },
          ],
        };
      }

      if (normalized.includes("UPDATE reports")) {
        return { rows: [] };
      }

      if (normalized.includes("SELECT full_name FROM patients")) {
        return { rows: [{ full_name: "Patient A" }] };
      }

      if (normalized.includes("WHERE r.id")) {
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

      if (normalized.includes("FROM reports r") && normalized.includes("ORDER BY r.created_at DESC")) {
        return { rows: [reportA, reportB] };
      }

      if (normalized.includes("FROM reports") && normalized.includes("WHERE patient_id")) {
        const patientId = params[0];
        const rows = [reportA, reportB].filter((row) => row.patient_id === patientId);
        if (normalized.includes("report_type = 'weekly'")) {
          return { rows: rows.filter((row) => row.report_type === "weekly") };
        }
        if (normalized.includes("report_type = 'monthly'")) {
          return { rows: rows.filter((row) => row.report_type === "monthly") };
        }
        return { rows };
      }

      return { rows: [] };
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
    isParentLinkedToPatient: async (parentId, patientId) =>
      parentId === IDS.parent && patientId === IDS.patientA,
    canAccessPatient: async (patientId, user) => {
      if (user?.role === "admin") {
        return true;
      }
      if (user?.role === "specialist") {
        return user.id === IDS.specialistA && patientId === IDS.patientA;
      }
      if (user?.role === "parent") {
        return user.id === IDS.parent && patientId === IDS.patientA;
      }
      return false;
    },
  },
};

require.cache[notifyPath] = {
  id: notifyPath,
  filename: notifyPath,
  loaded: true,
  exports: {
    notifyAllAdmins: async () => {
      notifyCalls += 1;
    },
  },
};

require.cache[pdfPath] = {
  id: pdfPath,
  filename: pdfPath,
  loaded: true,
  exports: {
    generateReportPdfFile: async () => {
      pdfCalls += 1;
      return { publicUrl: "/uploads/reports/test.pdf" };
    },
  },
};

delete require.cache[accessMwPath];
delete require.cache[servicePath];
delete require.cache[controllerPath];
delete require.cache[routesPath];

const requirePatientAccess = require("../src/middleware/patientAccess.middleware");
const reportsController = require("../src/modules/reports/reports.controller");
const reportsService = require("../src/modules/reports/reports.service");
const reportsRoutes = require("../src/modules/reports/reports.routes");

const createStack = [
  authorizeRoles("specialist"),
  validateCreateReport,
  requirePatientAccess.fromBodySpecialistAssignment("patient_id"),
  reportsController.createReport,
];

const listStack = [authorizeRoles("admin", "specialist"), reportsController.getAllReports];
const detailStack = [
  authorizeRoles("admin", "specialist", "parent"),
  reportsController.getReportById,
];
const patientStack = [
  authorizeRoles("admin", "specialist", "parent"),
  requirePatientAccess("id"),
  reportsController.getPatientReports,
];
const weeklyStack = [
  authorizeRoles("admin", "specialist", "parent"),
  requirePatientAccess("id"),
  reportsController.getPatientWeeklyReports,
];
const exportStack = [
  authorizeRoles("admin", "specialist"),
  reportsController.exportReportPdf,
];

const validCreateBody = (overrides = {}) => ({
  patient_id: IDS.patientA,
  report_type: "weekly",
  title: "Weekly Progress Report",
  summary: "Patient made progress.",
  ...overrides,
});

(async () => {
  {
    const { res, next } = await runMiddleware(authenticate, { headers: {} });
    assert.strictEqual(next, false);
    assert.strictEqual(res.statusCode, 401);
    pass("A. no token POST /reports → 401");
  }

  {
    insertCount = 0;
    const { res } = await runStack(createStack, {
      user: { id: IDS.parent, role: "parent" },
      body: validCreateBody(),
    });
    assert.strictEqual(res.statusCode, 403);
    assert.strictEqual(insertCount, 0);
    pass("B. Parent POST /reports → 403, no INSERT");
  }

  {
    insertCount = 0;
    const { res } = await runStack(createStack, {
      user: { id: IDS.admin, role: "admin" },
      body: validCreateBody(),
    });
    assert.strictEqual(res.statusCode, 403);
    assert.strictEqual(insertCount, 0);
    pass("C. Admin POST /reports → 403, no INSERT");
  }

  {
    insertCount = 0;
    notifyCalls = 0;
    lastInsertParams = null;
    const { res } = await runStack(createStack, {
      user: { id: IDS.specialistA, role: "specialist" },
      body: validCreateBody(),
    });
    assert.strictEqual(res.statusCode, 201);
    assert.strictEqual(insertCount, 1);
    assert.strictEqual(lastInsertParams[0], IDS.patientA);
    assert.strictEqual(lastInsertParams[1], IDS.specialistA);
    assert.strictEqual(lastInsertParams[2], "weekly");
    assert.strictEqual(lastInsertParams[5], null);
    assert.strictEqual(notifyCalls, 1);
    pass("D. Specialist A + assigned Patient A → 201");
  }

  {
    insertCount = 0;
    const { res } = await runStack(createStack, {
      user: { id: IDS.specialistA, role: "specialist" },
      body: validCreateBody({ patient_id: IDS.patientB }),
    });
    assert.strictEqual(res.statusCode, 403);
    assert.strictEqual(res.body.message, "You do not have access to this patient.");
    assert.strictEqual(insertCount, 0);
    pass("E. Specialist A + unassigned Patient B → 403, no INSERT");
  }

  {
    insertCount = 0;
    lastInsertParams = null;
    const { req, res } = await runStack(createStack, {
      user: { id: IDS.specialistA, role: "specialist" },
      body: validCreateBody({
        generated_by: IDS.userB,
        pdf_url: "https://evil.example/report.pdf",
      }),
    });
    assert.strictEqual(res.statusCode, 201);
    assert.strictEqual(req.body.generated_by, undefined);
    assert.strictEqual(req.body.pdf_url, undefined);
    assert.strictEqual(lastInsertParams[1], IDS.specialistA);
    assert.strictEqual(lastInsertParams[5], null);
    pass("F. supplied generated_by/pdf_url ignored; generated_by = Specialist A");
  }

  {
    insertCount = 0;
    const { res } = await runStack(createStack, {
      user: { id: IDS.specialistA, role: "specialist" },
      body: validCreateBody({ patient_id: "not-a-uuid" }),
    });
    assert.strictEqual(res.statusCode, 400);
    assert.match(res.body.message, /valid UUID/);
    assert.strictEqual(insertCount, 0);
    pass("G. invalid patient UUID → 400");
  }

  {
    insertCount = 0;
    const { res } = await runStack(createStack, {
      user: { id: IDS.specialistA, role: "specialist" },
      body: validCreateBody({ report_type: "custom" }),
    });
    assert.strictEqual(res.statusCode, 400);
    assert.match(res.body.message, /weekly, monthly, assessment, or progress/);
    assert.strictEqual(insertCount, 0);
    pass("H. invalid report_type → 400");
  }

  {
    const { res, next } = await runMiddleware(authenticate, { headers: {} });
    assert.strictEqual(next, false);
    assert.strictEqual(res.statusCode, 401);
    pass("I. no token GET /reports → 401");
  }

  {
    const { res } = await runStack(listStack, {
      user: { id: IDS.parent, role: "parent" },
    });
    assert.strictEqual(res.statusCode, 403);
    pass("J. Parent GET /reports → rejected");
  }

  {
    dbQueries.length = 0;
    const rows = await reportsService.getAllReports({
      id: IDS.admin,
      role: "admin",
    });
    assert.strictEqual(rows.length, 2);
    assert.ok(rows.some((row) => row.id === IDS.reportA));
    assert.ok(rows.some((row) => row.id === IDS.reportB));
    assert.ok(dbQueries.every((item) => !item.sql.includes("patient_specialists")));
    pass("K. Admin GET /reports → full list");
  }

  {
    dbQueries.length = 0;
    const rows = await reportsService.getAllReports({
      id: IDS.specialistA,
      role: "specialist",
    });
    assert.deepStrictEqual(
      rows.map((row) => row.id),
      [IDS.reportA]
    );
    const filtered = dbQueries.find((item) => item.sql.includes("patient_specialists"));
    assert.ok(filtered);
    assert.deepStrictEqual(filtered.params, [IDS.specialistA]);
    pass("L. Specialist A GET /reports → assigned-patient reports only");
  }

  {
    const { res } = await runStack(detailStack, {
      user: { id: IDS.admin, role: "admin" },
      params: { id: IDS.reportB },
    });
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.data.id, IDS.reportB);
    pass("M. Admin can view any report");
  }

  {
    const { res } = await runStack(detailStack, {
      user: { id: IDS.specialistA, role: "specialist" },
      params: { id: IDS.reportA },
    });
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.data.id, IDS.reportA);
    pass("N. assigned Specialist can view");
  }

  {
    const { res } = await runStack(detailStack, {
      user: { id: IDS.specialistA, role: "specialist" },
      params: { id: IDS.reportB },
    });
    assert.strictEqual(res.statusCode, 403);
    assert.strictEqual(res.body.message, "You do not have access to this patient.");
    pass("O. unassigned Specialist denied detail");
  }

  {
    const { res } = await runStack(detailStack, {
      user: { id: IDS.specialistA, role: "specialist" },
      params: { id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc" },
    });
    assert.strictEqual(res.statusCode, 404);
    pass("O2. missing report → 404");
  }

  {
    const { res } = await runStack(patientStack, {
      user: { id: IDS.specialistA, role: "specialist" },
      params: { id: IDS.patientA },
    });
    assert.strictEqual(res.statusCode, 200);
    pass("P. assigned Specialist GET /patients/:id/reports allowed");
  }

  {
    const { res } = await runStack(patientStack, {
      user: { id: IDS.specialistA, role: "specialist" },
      params: { id: IDS.patientB },
    });
    assert.strictEqual(res.statusCode, 403);
    pass("Q. unassigned Specialist GET /patients/:id/reports denied");
  }

  {
    const { res } = await runStack(weeklyStack, {
      user: { id: IDS.specialistA, role: "specialist" },
      params: { id: IDS.patientB },
    });
    assert.strictEqual(res.statusCode, 403);
    pass("Q2. unassigned Specialist GET weekly sibling denied");
  }

  {
    const { res } = await runStack(patientStack, {
      user: { id: IDS.parent, role: "parent" },
      params: { id: IDS.patientA },
    });
    assert.strictEqual(res.statusCode, 200);
    pass("P2. linked Parent GET /patients/:id/reports still allowed");
  }

  {
    pdfCalls = 0;
    const result = await reportsService.exportReportPdf(IDS.reportB, {
      id: IDS.admin,
      role: "admin",
    });
    assert.ok(result);
    assert.ok(pdfCalls >= 1);
    pass("R. Admin export allowed");
  }

  {
    pdfCalls = 0;
    const result = await reportsService.exportReportPdf(IDS.reportA, {
      id: IDS.specialistA,
      role: "specialist",
    });
    assert.ok(result);
    assert.ok(pdfCalls >= 1);
    pass("S. assigned Specialist export allowed");
  }

  {
    pdfCalls = 0;
    try {
      await reportsService.exportReportPdf(IDS.reportB, {
        id: IDS.specialistA,
        role: "specialist",
      });
      assert.fail("expected export to reject");
    } catch (error) {
      assert.strictEqual(error.statusCode, 403);
      assert.strictEqual(error.message, "You do not have access to this patient.");
      assert.strictEqual(pdfCalls, 0);
      pass("T. unassigned Specialist export denied; PDF generator not called");
    }
  }

  {
    const { res } = await runStack(exportStack, {
      user: { id: IDS.parent, role: "parent" },
      params: { id: IDS.reportA },
    });
    assert.strictEqual(res.statusCode, 403);
    pass("T2. Parent POST export-pdf → 403");
  }

  {
    const { res } = await runStack(detailStack, {
      user: { id: IDS.parent, role: "parent" },
      params: { id: IDS.reportA },
    });
    assert.strictEqual(res.statusCode, 200);
    pass("compat. linked Parent GET /reports/:id still allowed (Parent Web details)");
  }

  {
    const create = reportsRoutes.stack.find(
      (layer) => layer.route?.path === "/reports" && layer.route.methods.post
    );
    const list = reportsRoutes.stack.find(
      (layer) => layer.route?.path === "/reports" && layer.route.methods.get
    );
    const detail = reportsRoutes.stack.find(
      (layer) => layer.route?.path === "/reports/:id" && layer.route.methods.get
    );
    const byPatient = reportsRoutes.stack.find(
      (layer) => layer.route?.path === "/patients/:id/reports"
    );
    const weekly = reportsRoutes.stack.find(
      (layer) => layer.route?.path === "/patients/:id/reports/weekly"
    );
    const monthly = reportsRoutes.stack.find(
      (layer) => layer.route?.path === "/patients/:id/reports/monthly"
    );
    const exportPdf = reportsRoutes.stack.find(
      (layer) => layer.route?.path === "/reports/:id/export-pdf"
    );

    assert.ok(create);
    assert.ok(list);
    assert.ok(detail);
    assert.ok(byPatient);
    assert.ok(weekly);
    assert.ok(monthly);
    assert.ok(exportPdf);
    assert.ok(create.route.stack.length >= 5);
    assert.ok(byPatient.route.stack.length >= 4);
    assert.ok(weekly.route.stack.length >= 4);
    assert.ok(monthly.route.stack.length >= 4);
    pass("U. route stacks include auth/role/patient-access where required");
  }

  console.log(`\n${passed} regular-report auth checks passed.`);
})().catch((error) => {
  console.error("Regular reports auth tests failed:", error);
  process.exit(1);
});
