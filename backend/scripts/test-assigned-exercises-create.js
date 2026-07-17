/**
 * Focused unit-style tests for hardened POST /assigned-exercises create logic.
 * Run: node scripts/test-assigned-exercises-create.js
 */
const assert = require("assert");
const path = require("path");

const {
  createAssignedExerciseWithDb
} = require("../src/modules/assignedExercises/assignedExercises.service");

const IDS = {
  specialist: "11111111-1111-4111-8111-111111111111",
  admin: "22222222-2222-4222-8222-222222222222",
  patient: "33333333-3333-4333-8333-333333333333",
  otherPatient: "44444444-4444-4444-8444-444444444444",
  exercise: "55555555-5555-4555-8555-555555555555",
  plan: "66666666-6666-4666-8666-666666666666",
  inactivePlan: "77777777-7777-4777-8777-777777777777",
  missing: "99999999-9999-4999-8999-999999999999",
  assignment: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"
};

const baseBody = {
  exercise_id: IDS.exercise,
  plan_id: IDS.plan,
  patient_id: IDS.patient,
  frequency: "daily",
  start_date: "2026-07-17",
  due_date: "2026-07-31"
};

const createMockDb = ({
  linked = true,
  patientExists = true,
  exerciseExists = true,
  plan = {
    id: IDS.plan,
    patient_id: IDS.patient,
    status: "active"
  },
  duplicate = false,
  failInsertCode = null
} = {}) => {
  const calls = [];

  const client = {
    async query(sql, params = []) {
      const normalized = sql.replace(/\s+/g, " ").trim();
      calls.push({ sql: normalized, params });

      if (normalized === "BEGIN" || normalized === "COMMIT" || normalized === "ROLLBACK") {
        return { rows: [] };
      }

      if (normalized.includes("FROM patients")) {
        return {
          rows: patientExists ? [{ id: params[0] }] : []
        };
      }

      if (normalized.includes("FROM patient_specialists")) {
        return { rows: linked ? [{ "?column?": 1 }] : [] };
      }

      if (normalized.includes("FROM exercises")) {
        return {
          rows: exerciseExists ? [{ id: params[0] }] : []
        };
      }

      if (normalized.includes("FROM treatment_plans")) {
        if (!plan || plan.id !== params[0]) {
          return { rows: [] };
        }
        return { rows: [plan] };
      }

      if (normalized.includes("FROM assigned_exercises") && normalized.includes("is_active = TRUE")) {
        return {
          rows: duplicate ? [{ id: IDS.assignment }] : []
        };
      }

      if (normalized.startsWith("INSERT INTO assigned_exercises")) {
        if (failInsertCode) {
          const error = new Error("db failure");
          error.code = failInsertCode;
          throw error;
        }

        return {
          rows: [
            {
              id: IDS.assignment,
              exercise_id: params[0],
              plan_id: params[1],
              patient_id: params[2],
              assigned_by: params[3],
              frequency: params[4],
              start_date: params[5] || "2026-07-17",
              due_date: params[6] || null,
              is_active: true
            }
          ]
        };
      }

      throw new Error(`Unexpected SQL in mock: ${normalized}`);
    },
    release() {}
  };

  return {
    calls,
    async connect() {
      return client;
    }
  };
};

const expectError = async (fn, statusCode, messageIncludes) => {
  try {
    await fn();
    assert.fail("Expected error was not thrown");
  } catch (error) {
    assert.strictEqual(error.statusCode, statusCode, error.message);
    if (messageIncludes) {
      assert.ok(
        String(error.message).includes(messageIncludes),
        `Expected message to include "${messageIncludes}", got "${error.message}"`
      );
    }
  }
};

const run = async () => {
  let passed = 0;

  // 1. Specialist assigns to linked patient with valid active plan → success
  {
    const db = createMockDb({ linked: true });
    const row = await createAssignedExerciseWithDb(
      db,
      baseBody,
      IDS.specialist,
      { id: IDS.specialist, role: "specialist" }
    );
    assert.strictEqual(row.id, IDS.assignment);
    assert.strictEqual(row.assigned_by, IDS.specialist);
    passed += 1;
  }

  // 2. Specialist assigns to unlinked patient → 403
  {
    const db = createMockDb({ linked: false });
    await expectError(
      () =>
        createAssignedExerciseWithDb(
          db,
          baseBody,
          IDS.specialist,
          { id: IDS.specialist, role: "specialist" }
        ),
      403,
      "You do not have access to this patient."
    );
    passed += 1;
  }

  // 3. Missing patient → 404
  {
    const db = createMockDb({ patientExists: false });
    await expectError(
      () =>
        createAssignedExerciseWithDb(
          db,
          baseBody,
          IDS.specialist,
          { role: "specialist" }
        ),
      404,
      "Patient not found."
    );
    passed += 1;
  }

  // 4. Missing exercise → 404
  {
    const db = createMockDb({ exerciseExists: false });
    await expectError(
      () =>
        createAssignedExerciseWithDb(
          db,
          baseBody,
          IDS.specialist,
          { role: "specialist" }
        ),
      404,
      "Exercise not found."
    );
    passed += 1;
  }

  // 5. Missing plan → 404
  {
    const db = createMockDb({
      plan: null
    });
    // Force plan lookup miss by using mismatched id in body vs mock
    const dbMiss = createMockDb({
      plan: { id: IDS.inactivePlan, patient_id: IDS.patient, status: "active" }
    });
    await expectError(
      () =>
        createAssignedExerciseWithDb(
          dbMiss,
          baseBody,
          IDS.specialist,
          { role: "specialist" }
        ),
      404,
      "Treatment plan not found."
    );
    passed += 1;
  }

  // 6. Plan belongs to a different patient → 400
  {
    const db = createMockDb({
      plan: {
        id: IDS.plan,
        patient_id: IDS.otherPatient,
        status: "active"
      }
    });
    await expectError(
      () =>
        createAssignedExerciseWithDb(
          db,
          baseBody,
          IDS.specialist,
          { role: "specialist" }
        ),
      400,
      "The treatment plan does not belong to this patient."
    );
    passed += 1;
  }

  // 7. Inactive plan → 409
  {
    const db = createMockDb({
      plan: {
        id: IDS.plan,
        patient_id: IDS.patient,
        status: "archived"
      }
    });
    await expectError(
      () =>
        createAssignedExerciseWithDb(
          db,
          baseBody,
          IDS.specialist,
          { role: "specialist" }
        ),
      409,
      "An active treatment plan is required"
    );
    passed += 1;
  }

  // 8. Due date before start date → 400
  {
    const db = createMockDb();
    await expectError(
      () =>
        createAssignedExerciseWithDb(
          db,
          {
            ...baseBody,
            start_date: "2026-07-20",
            due_date: "2026-07-10"
          },
          IDS.specialist,
          { role: "specialist" }
        ),
      400,
      "Due date cannot be before the start date."
    );
    passed += 1;
  }

  // 9. Invalid frequency → 400
  {
    const db = createMockDb();
    await expectError(
      () =>
        createAssignedExerciseWithDb(
          db,
          { ...baseBody, frequency: "hourly" },
          IDS.specialist,
          { role: "specialist" }
        ),
      400,
      "frequency must be one of"
    );
    passed += 1;
  }

  // 10. Valid admin assignment → success (no specialist link required)
  {
    const db = createMockDb({ linked: false });
    const row = await createAssignedExerciseWithDb(
      db,
      baseBody,
      IDS.admin,
      { id: IDS.admin, role: "admin" }
    );
    assert.strictEqual(row.assigned_by, IDS.admin);
    const specialistCheck = db.calls.some((call) =>
      call.sql.includes("FROM patient_specialists")
    );
    assert.strictEqual(specialistCheck, false);
    passed += 1;
  }

  // 11. Invalid IDs / FK style failures do not return generic untyped 500
  {
    const db = createMockDb({ failInsertCode: "23503" });
    await expectError(
      () =>
        createAssignedExerciseWithDb(
          db,
          baseBody,
          IDS.admin,
          { role: "admin" }
        ),
      404,
      "Patient, exercise, or treatment plan was not found."
    );
    passed += 1;
  }

  // 12. Duplicate identical active assignment → 409
  {
    const db = createMockDb({ duplicate: true });
    await expectError(
      () =>
        createAssignedExerciseWithDb(
          db,
          baseBody,
          IDS.specialist,
          { role: "specialist" }
        ),
      409,
      "This exercise is already assigned with the same schedule."
    );
    passed += 1;
  }

  console.log(`PASS ${passed}/12 assigned-exercises create checks`);
  console.log(`Script: ${path.basename(__filename)}`);
};

run().catch((error) => {
  console.error("FAIL", error);
  process.exitCode = 1;
});
