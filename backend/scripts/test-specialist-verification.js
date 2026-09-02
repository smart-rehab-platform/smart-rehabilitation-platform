/**
 * Specialist verification foundation tests (no DB required for pure unit checks).
 * Run: node scripts/test-specialist-verification.js
 */
const assert = require("assert");
const Module = require("module");
const path = require("path");

const authValidationPath = path.join(
  __dirname,
  "../src/modules/auth/auth.validation.js"
);
const roleMiddlewarePath = path.join(
  __dirname,
  "../src/middleware/role.middleware.js"
);
const specialistsServicePath = path.join(
  __dirname,
  "../src/modules/specialists/specialists.service.js"
);
const specialistsValidationPath = path.join(
  __dirname,
  "../src/modules/specialists/specialists.validation.js"
);
const refreshTokenPath = path.join(
  __dirname,
  "../src/modules/auth/refreshToken.service.js"
);
const dbPath = path.join(__dirname, "../src/database/db.js");

let passed = 0;
const pass = (label) => {
  passed += 1;
  console.log(`  ✓ ${label}`);
};

const { registerSchema } = require(authValidationPath);
const authorizeRoles = require(roleMiddlewarePath);
const {
  updateSpecialistVerificationSchema,
} = require(specialistsValidationPath);

// --- Validation: specialist requires specialization + license ---
{
  const missingProfile = registerSchema.validate({
    full_name: "Dr Test",
    email: "dr.test@example.com",
    password: "Password1!",
    role: "specialist",
  });
  assert.ok(missingProfile.error, "specialist without profile should fail");
  pass("specialist registration requires specialist_profile");

  const missingLicense = registerSchema.validate({
    full_name: "Dr Test",
    email: "dr.test@example.com",
    password: "Password1!",
    role: "specialist",
    specialist_profile: {
      specialization: "Speech Therapy",
      license_number: "",
    },
  });
  assert.ok(missingLicense.error, "empty license should fail");
  pass("specialist registration requires license_number");

  const validSpecialist = registerSchema.validate({
    full_name: "Dr Test",
    email: "dr.test@example.com",
    password: "Password1!",
    role: "specialist",
    specialist_profile: {
      specialization: "Speech Therapy",
      license_number: "LIC-100",
      years_of_experience: 3,
      bio: "Hello",
    },
  });
  assert.ifError(validSpecialist.error);
  pass("valid specialist registration payload accepted");

  const parentOk = registerSchema.validate({
    full_name: "Parent User",
    email: "parent@example.com",
    password: "Password1!",
    role: "parent",
  });
  assert.ifError(parentOk.error);
  pass("parent registration unchanged (no specialist_profile)");
}

// --- Admin verification body validation ---
{
  assert.ok(
    updateSpecialistVerificationSchema.validate({ status: "pending" }).error
  );
  assert.ifError(
    updateSpecialistVerificationSchema.validate({ status: "approved" }).error
  );
  assert.ifError(
    updateSpecialistVerificationSchema.validate({ status: "rejected" }).error
  );
  pass("verification PATCH body accepts approved/rejected only");
}

// --- formatAuthUser includes verification_status ---
{
  delete require.cache[refreshTokenPath];
  const originalLoad = Module._load;
  Module._load = function mockLoad(request, parent, isMain) {
    const filename = Module._resolveFilename(request, parent, false);
    if (filename === dbPath) {
      return { query: async () => ({ rows: [] }) };
    }
    return originalLoad.call(this, request, parent, isMain);
  };
  delete require.cache[refreshTokenPath];
  const { formatAuthUser } = require(refreshTokenPath);
  Module._load = originalLoad;

  const specialist = formatAuthUser({
    id: "11111111-1111-4111-8111-111111111111",
    full_name: "Spec",
    email: "s@example.com",
    role: "specialist",
    phone: null,
    profile_image_url: null,
    is_email_verified: true,
    verification_status: "pending",
  });
  assert.strictEqual(specialist.verification_status, "pending");

  const parent = formatAuthUser({
    id: "22222222-2222-4222-8222-222222222222",
    full_name: "Parent",
    email: "p@example.com",
    role: "parent",
    phone: null,
    profile_image_url: null,
    is_email_verified: true,
    verification_status: "approved",
  });
  assert.strictEqual(parent.verification_status, null);
  pass("formatAuthUser exposes verification_status for specialists only");
}

// --- authorizeRoles gate ---
{
  const runGate = (user, allowedRoles) =>
    new Promise((resolve) => {
      const middleware = authorizeRoles(...allowedRoles);
      const res = {
        statusCode: 200,
        body: null,
        status(code) {
          this.statusCode = code;
          return this;
        },
        json(payload) {
          this.body = payload;
          resolve({ statusCode: this.statusCode, body: payload });
          return this;
        },
      };
      middleware({ user }, res, () =>
        resolve({ statusCode: 200, body: { next: true } })
      );
    });

  (async () => {
    const pendingBlocked = await runGate(
      { role: "specialist", verification_status: "pending" },
      ["specialist"]
    );
    assert.strictEqual(pendingBlocked.statusCode, 403);
    assert.match(pendingBlocked.body.message, /pending/i);

    const rejectedBlocked = await runGate(
      { role: "specialist", verification_status: "rejected" },
      ["specialist"]
    );
    assert.strictEqual(rejectedBlocked.statusCode, 403);
    assert.match(rejectedBlocked.body.message, /rejected/i);

    const approvedOk = await runGate(
      { role: "specialist", verification_status: "approved" },
      ["admin", "specialist"]
    );
    assert.deepStrictEqual(approvedOk.body, { next: true });

    const parentOk = await runGate({ role: "parent" }, ["parent"]);
    assert.deepStrictEqual(parentOk.body, { next: true });

    const adminOk = await runGate({ role: "admin" }, ["admin"]);
    assert.deepStrictEqual(adminOk.body, { next: true });

    const adminOnSpecialistRoute = await runGate({ role: "admin" }, [
      "admin",
      "specialist",
    ]);
    assert.deepStrictEqual(adminOnSpecialistRoute.body, { next: true });

    pass("pending/rejected specialists blocked from specialist role routes");
    pass("approved specialists and parents/admins unaffected");

    // --- Service updateVerification with mocks ---
    const IDS = {
      specialist: "33333333-3333-4333-8333-333333333333",
      parent: "44444444-4444-4444-8444-444444444444",
    };

    const originalLoad = Module._load;
    Module._load = function mockLoad(request, parent, isMain) {
      const filename = Module._resolveFilename(request, parent, false);
      if (filename === dbPath) {
        return {
          query: async (sql, params) => {
            const normalized = sql.replace(/\s+/g, " ").trim();
            if (normalized.includes("FROM users") && normalized.includes("WHERE id")) {
              const id = params[0];
              if (id === IDS.specialist) {
                return {
                  rows: [
                    {
                      id: IDS.specialist,
                      role: "specialist",
                      full_name: "Spec User",
                      email: "spec@example.com",
                    },
                  ],
                };
              }
              if (id === IDS.parent) {
                return {
                  rows: [
                    {
                      id: IDS.parent,
                      role: "parent",
                      full_name: "Parent User",
                      email: "parent@example.com",
                    },
                  ],
                };
              }
              return { rows: [] };
            }
            if (normalized.includes("UPDATE specialist_profiles")) {
              return {
                rows: [
                  {
                    user_id: IDS.specialist,
                    verification_status: params[0],
                    specialization: "Speech",
                    license_number: "L-1",
                  },
                ],
              };
            }
            return { rows: [] };
          },
        };
      }
      return originalLoad.call(this, request, parent, isMain);
    };

    delete require.cache[specialistsServicePath];
    const specialistsService = require(specialistsServicePath);
    Module._load = originalLoad;

    const approved = await specialistsService.updateSpecialistVerificationByUserId(
      IDS.specialist,
      "approved"
    );
    assert.strictEqual(approved.verification_status, "approved");

    let parentError = null;
    try {
      await specialistsService.updateSpecialistVerificationByUserId(
        IDS.parent,
        "approved"
      );
    } catch (error) {
      parentError = error;
    }
    assert.strictEqual(parentError?.statusCode, 400);

    pass("admin verification service updates specialist status only");

    console.log(`\nSpecialist verification foundation: ${passed} tests passed.`);
  })().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
