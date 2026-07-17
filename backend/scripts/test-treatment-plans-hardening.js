/**
 * Hardened treatment-plan create/update checks.
 * Run: node scripts/test-treatment-plans-hardening.js
 */
const assert = require("assert");
const path = require("path");

const {
  validateCreateTreatmentPlan,
  validateUpdateTreatmentPlan,
} = require("../src/modules/treatmentPlans/treatmentPlans.validation");

let passed = 0;
const pass = (label) => {
  passed += 1;
  console.log(`  ✓ ${label}`);
};

const runValidation = (fn, body = {}, params = {}) =>
  new Promise((resolve) => {
    const req = { body: { ...body }, params: { ...params } };
    const res = {
      statusCode: 200,
      body: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(payload) {
        this.body = payload;
        resolve({ req, res, next: false });
        return this;
      },
    };
    fn(req, res, () => resolve({ req, res, next: true }));
  });

(async () => {
  {
    const { res, next, req } = await runValidation(validateCreateTreatmentPlan, {
      patient_id: "33333333-3333-4333-8333-333333333333",
      title: "  Speech Plan  ",
      start_date: "2026-07-17",
      end_date: "2026-08-01",
      specialist_id: "should-be-stripped",
      status: "completed",
      description: "ignored",
    });
    assert.strictEqual(next, true);
    assert.strictEqual(req.body.title, "Speech Plan");
    assert.strictEqual(req.body.specialist_id, undefined);
    assert.strictEqual(req.body.status, undefined);
    assert.strictEqual(req.body.description, undefined);
    pass("create validation strips client-owned fields and trims title");
  }

  {
    const { res } = await runValidation(validateCreateTreatmentPlan, {
      patient_id: "33333333-3333-4333-8333-333333333333",
      title: "",
    });
    assert.strictEqual(res.statusCode, 400);
    pass("empty title → 400");
  }

  {
    const { res } = await runValidation(validateCreateTreatmentPlan, {
      title: "Plan",
    });
    assert.strictEqual(res.statusCode, 400);
    pass("missing patient_id → 400");
  }

  {
    const { res } = await runValidation(validateCreateTreatmentPlan, {
      patient_id: "33333333-3333-4333-8333-333333333333",
      title: "Plan",
      start_date: "2026-08-01",
      end_date: "2026-07-01",
    });
    assert.strictEqual(res.statusCode, 400);
    pass("end before start → 400");
  }

  {
    const { res, next } = await runValidation(validateUpdateTreatmentPlan, {
      status: "active",
      title: "Updated",
      start_date: "2026-07-01",
      end_date: "2026-07-31",
    });
    assert.strictEqual(next, true);
    pass("update validation accepts valid status/title/dates");
  }

  {
    const { res } = await runValidation(validateUpdateTreatmentPlan, {
      status: "unknown",
    });
    assert.strictEqual(res.statusCode, 400);
    pass("invalid status → 400");
  }

  // Service authorization / one-active with mocked pool.connect
  const Module = require("module");
  const servicePath = require.resolve(
    "../src/modules/treatmentPlans/treatmentPlans.service.js"
  );
  const dbPath = require.resolve("../src/database/db");
  const notifyPath = require.resolve(
    "../src/modules/notifications/adminNotifications.helper"
  );

  delete require.cache[servicePath];
  delete require.cache[dbPath];

  const IDS = {
    specialist: "11111111-1111-4111-8111-111111111111",
    admin: "22222222-2222-4222-8222-222222222222",
    patient: "33333333-3333-4333-8333-333333333333",
    otherPatient: "44444444-4444-4444-8444-444444444444",
    plan: "66666666-6666-4666-8666-666666666666",
    otherActive: "77777777-7777-4777-8777-777777777777",
    assessment: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  };

  let scenario = {
    patientExists: true,
    linked: true,
    hasActive: false,
    assessment: null,
    existingPlan: null,
  };

  const mockClient = {
    async query(sql, params = []) {
      const normalized = sql.replace(/\s+/g, " ").trim();
      if (normalized === "BEGIN" || normalized === "COMMIT" || normalized === "ROLLBACK") {
        return { rows: [] };
      }
      if (normalized.includes("FROM patients")) {
        return {
          rows: scenario.patientExists
            ? [{ id: IDS.patient, full_name: "Omar" }]
            : [],
        };
      }
      if (normalized.includes("FROM patient_specialists")) {
        return { rows: scenario.linked ? [{ "?column?": 1 }] : [] };
      }
      if (normalized.includes("FROM assessments")) {
        return {
          rows: scenario.assessment ? [scenario.assessment] : [],
        };
      }
      if (
        normalized.includes("FROM treatment_plans") &&
        normalized.includes("status = 'active'")
      ) {
        if (scenario.hasActive) {
          return { rows: [{ id: IDS.otherActive }] };
        }
        return { rows: [] };
      }
      if (normalized.includes("FOR UPDATE")) {
        return {
          rows: scenario.existingPlan ? [scenario.existingPlan] : [],
        };
      }
      if (normalized.startsWith("INSERT INTO treatment_plans")) {
        return {
          rows: [
            {
              id: IDS.plan,
              patient_id: params[0],
              specialist_id: params[1],
              title: params[3],
              status: "active",
            },
          ],
        };
      }
      if (normalized.startsWith("UPDATE treatment_plans")) {
        return {
          rows: [
            {
              ...scenario.existingPlan,
              title: params[1],
              status: params[2],
              start_date: params[3],
              end_date: params[4],
            },
          ],
        };
      }
      if (normalized.startsWith("INSERT INTO treatment_plan_revisions")) {
        return { rows: [{ id: "rev" }] };
      }
      return { rows: [] };
    },
    release() {},
  };

  require.cache[dbPath] = {
    id: dbPath,
    filename: dbPath,
    loaded: true,
    exports: {
      connect: async () => mockClient,
      query: async () => ({ rows: [] }),
    },
  };
  require.cache[notifyPath] = {
    id: notifyPath,
    filename: notifyPath,
    loaded: true,
    exports: {
      notifyAllAdmins: async () => {},
    },
  };

  const service = require("../src/modules/treatmentPlans/treatmentPlans.service.js");

  {
    scenario = {
      patientExists: true,
      linked: true,
      hasActive: false,
      assessment: null,
      existingPlan: null,
    };
    const plan = await service.createTreatmentPlan(
      {
        patient_id: IDS.patient,
        title: "Plan A",
        start_date: "2026-07-17",
      },
      { id: IDS.specialist, role: "specialist" }
    );
    assert.strictEqual(plan.id, IDS.plan);
    pass("linked specialist creates plan → success");
  }

  {
    scenario = {
      patientExists: true,
      linked: false,
      hasActive: false,
      assessment: null,
      existingPlan: null,
    };
    try {
      await service.createTreatmentPlan(
        { patient_id: IDS.patient, title: "Plan B" },
        { id: IDS.specialist, role: "specialist" }
      );
      assert.fail("expected 403");
    } catch (error) {
      assert.strictEqual(error.statusCode, 403);
      pass("unlinked specialist → 403");
    }
  }

  {
    scenario = {
      patientExists: false,
      linked: true,
      hasActive: false,
      assessment: null,
      existingPlan: null,
    };
    try {
      await service.createTreatmentPlan(
        { patient_id: IDS.patient, title: "Plan C" },
        { id: IDS.specialist, role: "specialist" }
      );
      assert.fail("expected 404");
    } catch (error) {
      assert.strictEqual(error.statusCode, 404);
      pass("missing patient → 404");
    }
  }

  {
    scenario = {
      patientExists: true,
      linked: true,
      hasActive: true,
      assessment: null,
      existingPlan: null,
    };
    try {
      await service.createTreatmentPlan(
        { patient_id: IDS.patient, title: "Plan D" },
        { id: IDS.specialist, role: "specialist" }
      );
      assert.fail("expected 409");
    } catch (error) {
      assert.strictEqual(error.statusCode, 409);
      pass("existing active plan → 409");
    }
  }

  {
    scenario = {
      patientExists: true,
      linked: false,
      hasActive: false,
      assessment: null,
      existingPlan: null,
    };
    const plan = await service.createTreatmentPlan(
      { patient_id: IDS.patient, title: "Admin Plan" },
      { id: IDS.admin, role: "admin" }
    );
    assert.strictEqual(plan.title, "Admin Plan");
    pass("admin create → success without specialist link");
  }

  {
    scenario = {
      patientExists: true,
      linked: true,
      hasActive: false,
      assessment: { id: IDS.assessment, patient_id: IDS.otherPatient },
      existingPlan: null,
    };
    try {
      await service.createTreatmentPlan(
        {
          patient_id: IDS.patient,
          title: "Plan E",
          based_on_assessment_id: IDS.assessment,
        },
        { id: IDS.specialist, role: "specialist" }
      );
      assert.fail("expected 400");
    } catch (error) {
      assert.strictEqual(error.statusCode, 400);
      pass("assessment wrong patient → 400");
    }
  }

  {
    scenario = {
      patientExists: true,
      linked: true,
      hasActive: false,
      assessment: null,
      existingPlan: {
        id: IDS.plan,
        patient_id: IDS.patient,
        title: "Old",
        status: "completed",
        start_date: "2026-01-01",
        end_date: null,
        based_on_assessment_id: null,
      },
    };
    const updated = await service.updateTreatmentPlan(
      IDS.plan,
      {
        title: "Reactivated",
        status: "active",
        start_date: "2026-07-01",
        end_date: null,
      },
      { id: IDS.specialist, role: "specialist" }
    );
    assert.strictEqual(updated.status, "active");
    pass("reactivate when no other active plan → success");
  }

  {
    scenario = {
      patientExists: true,
      linked: true,
      hasActive: true,
      assessment: null,
      existingPlan: {
        id: IDS.plan,
        patient_id: IDS.patient,
        title: "Old",
        status: "archived",
        start_date: "2026-01-01",
        end_date: null,
        based_on_assessment_id: null,
      },
    };
    try {
      await service.updateTreatmentPlan(
        IDS.plan,
        {
          title: "Old",
          status: "active",
          start_date: "2026-01-01",
        },
        { id: IDS.specialist, role: "specialist" }
      );
      assert.fail("expected 409");
    } catch (error) {
      assert.strictEqual(error.statusCode, 409);
      pass("reactivate when another active plan exists → 409");
    }
  }

  const routes = require("fs").readFileSync(
    path.join(__dirname, "../src/modules/treatmentPlans/treatmentPlans.routes.js"),
    "utf8"
  );
  assert.ok(routes.includes("validateCreateTreatmentPlan"));
  assert.ok(routes.includes("validateUpdateTreatmentPlan"));
  pass("routes wire create/update validation middleware");

  console.log(`\nPASS ${passed} treatment-plan hardening checks`);
  console.log(`Script: ${path.basename(__filename)}`);
})().catch((error) => {
  console.error("FAIL", error);
  process.exitCode = 1;
});
