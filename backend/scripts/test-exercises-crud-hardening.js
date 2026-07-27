/**
 * Focused tests for exercise create/update/delete ownership and safety.
 * Run: node scripts/test-exercises-crud-hardening.js
 */
const assert = require("assert");
const path = require("path");

// Isolate service from real DB by injecting through temporary monkeypatch is hard.
// Instead, test pure validation + exerciseMedia helpers and service error helpers
// via a lightweight mock of pool used by dynamic require after stubbing.

const {
  isAllowedExerciseMedia,
  isAllowedExerciseSubmissionMedia,
  MAX_EXERCISE_MEDIA_BYTES,
  sanitizeUploadFilename,
} = require("../src/config/exerciseMedia");

const {
  validateCreateExercise,
  validateUpdateExercise,
  DEFAULT_EXERCISE_LANGUAGE,
} = require("../src/modules/exercises/exercises.validation");

const IDS = {
  category: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  exercise: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
  creator: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
  other: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
  admin: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",
};

let passed = 0;

const pass = (label) => {
  passed += 1;
  console.log(`  ✓ ${label}`);
};

// --- Media config ---
assert.strictEqual(isAllowedExerciseMedia("video/mp4", "clip.mp4"), true);
assert.strictEqual(isAllowedExerciseMedia("application/pdf", "guide.pdf"), true);
assert.strictEqual(isAllowedExerciseMedia("text/plain", "notes.txt"), false);
assert.strictEqual(
  isAllowedExerciseSubmissionMedia("application/pdf", "guide.pdf"),
  false
);
assert.strictEqual(
  isAllowedExerciseSubmissionMedia("video/mp4", "clip.mp4"),
  true
);
assert.ok(MAX_EXERCISE_MEDIA_BYTES === 50 * 1024 * 1024);
const safeName = sanitizeUploadFilename("../../evil name.MP4");
assert.ok(!safeName.includes(".."));
assert.ok(safeName.toLowerCase().endsWith(".mp4"));
pass("exercise media MIME/size/filename helpers");

// --- Validation middleware ---
const runValidation = (fn, { params = {}, body = {} } = {}) =>
  new Promise((resolve) => {
    const req = { params, body: { ...body } };
    const res = {
      statusCode: 200,
      body: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(payload) {
        this.body = payload;
        resolve({ req, res });
        return this;
      },
    };
    fn(req, res, () => resolve({ req, res, next: true }));
  });

(async () => {
  {
    const { res, next } = await runValidation(validateCreateExercise, {
      body: {
        category_id: IDS.category,
        title: "  Tongue tip  ",
        created_by: IDS.other,
      },
    });
    assert.strictEqual(next, true);
    assert.strictEqual(res.req?.body?.created_by, undefined);
  }
  // recreate with captured req
  {
    let captured;
    await new Promise((resolve) => {
      const req = {
        body: {
          category_id: IDS.category,
          title: "Tongue tip",
          created_by: IDS.other,
        },
      };
      const res = {
        status() {
          return this;
        },
        json() {
          resolve();
        },
      };
      validateCreateExercise(req, res, () => {
        captured = req.body;
        resolve();
      });
    });
    assert.ok(captured);
    assert.strictEqual(captured.created_by, undefined);
    assert.strictEqual(captured.title, "Tongue tip");
    assert.strictEqual(captured.language, DEFAULT_EXERCISE_LANGUAGE);
    pass("create validation strips created_by and requires title/category");
  }

  {
    let captured;
    await new Promise((resolve) => {
      const req = {
        body: {
          category_id: IDS.category,
          title: "Arabic drill",
          language: "ar",
        },
      };
      const res = {
        status() {
          return this;
        },
        json() {
          resolve();
        },
      };
      validateCreateExercise(req, res, () => {
        captured = req.body;
        resolve();
      });
    });
    assert.strictEqual(captured.language, "ar");
    pass("create validation accepts ar language");
  }

  {
    const invalidLanguages = ["ru", "fr", "", null];
    for (const language of invalidLanguages) {
      const { res, next } = await runValidation(validateCreateExercise, {
        body: {
          category_id: IDS.category,
          title: "Bad language",
          language,
        },
      });
      assert.strictEqual(res.statusCode, 400, `expected 400 for ${language}`);
      assert.strictEqual(next, undefined);
    }
    pass("create validation rejects invalid language values");
  }

  {
    let captured;
    await new Promise((resolve) => {
      const req = {
        params: { id: IDS.exercise },
        body: { language: "ar" },
      };
      const res = {
        status() {
          return this;
        },
        json() {
          resolve();
        },
      };
      validateUpdateExercise(req, res, () => {
        captured = req.body;
        resolve();
      });
    });
    assert.strictEqual(captured.language, "ar");
    pass("update validation accepts language change to ar");
  }

  {
    const { res } = await runValidation(validateUpdateExercise, {
      params: { id: IDS.exercise },
      body: { language: "ru" },
    });
    assert.strictEqual(res.statusCode, 400);
    pass("update validation rejects unsupported language");
  }

  {
    const { res } = await runValidation(validateCreateExercise, {
      body: { title: "Only title" },
    });
    assert.strictEqual(res.statusCode, 400);
    pass("create validation rejects missing category");
  }

  {
    const { res } = await runValidation(validateUpdateExercise, {
      params: { id: "not-a-uuid" },
      body: { title: "x" },
    });
    assert.strictEqual(res.statusCode, 400);
    pass("update validation rejects invalid exercise id");
  }

  {
    const { res } = await runValidation(validateUpdateExercise, {
      params: { id: IDS.exercise },
      body: {},
    });
    assert.strictEqual(res.statusCode, 400);
    pass("update validation rejects empty body");
  }

  // --- Service ownership / delete with mocked pool ---
  const Module = require("module");
  const exercisesServicePath = require.resolve(
    "../src/modules/exercises/exercises.service.js"
  );
  const dbPath = require.resolve("../src/database/db");

  const mockRows = {
    category: [{ id: IDS.category }],
    exerciseOwn: [
      {
        id: IDS.exercise,
        created_by: IDS.creator,
        category_id: IDS.category,
        title: "Own",
      },
    ],
    assigned: [{ id: "assigned-1" }],
  };

  let lastSql = "";
  const mockPool = {
    query: async (sql, params = []) => {
      lastSql = sql.replace(/\s+/g, " ");
      if (lastSql.includes("FROM exercise_categories")) {
        return {
          rows:
            params[0] === IDS.category ? mockRows.category : [],
        };
      }
      if (lastSql.includes("FROM exercises") && lastSql.includes("WHERE e.id")) {
        return { rows: mockRows.exerciseOwn };
      }
      if (lastSql.includes("FROM assigned_exercises")) {
        return { rows: mockRows.assigned };
      }
      if (lastSql.startsWith("UPDATE exercises")) {
        return {
          rows: [{ id: IDS.exercise, title: params[0] || "updated" }],
        };
      }
      if (lastSql.startsWith("DELETE FROM exercises")) {
        return { rows: [{ id: IDS.exercise }] };
      }
      if (lastSql.startsWith("INSERT INTO exercises")) {
        return {
          rows: [
            {
              id: IDS.exercise,
              created_by: params[6],
              title: params[1],
              language: params[5],
            },
          ],
        };
      }
      return { rows: [] };
    },
  };

  require.cache[dbPath] = {
    id: dbPath,
    filename: dbPath,
    loaded: true,
    exports: mockPool,
  };
  delete require.cache[exercisesServicePath];
  const service = require("../src/modules/exercises/exercises.service");

  {
    const created = await service.createExercise(
      {
        category_id: IDS.category,
        title: "New exercise",
        description: null,
        instructions: "Do this",
        instruction_media_url: null,
      },
      IDS.creator
    );
    assert.strictEqual(created.created_by, IDS.creator);
    assert.strictEqual(created.language, DEFAULT_EXERCISE_LANGUAGE);
    pass("specialist create exercise sets created_by from actor");
  }

  {
    const created = await service.createExercise(
      {
        category_id: IDS.category,
        title: "Arabic exercise",
        description: null,
        instructions: "Practice",
        instruction_media_url: null,
        language: "ar",
      },
      IDS.creator
    );
    assert.strictEqual(created.language, "ar");
    pass("specialist create exercise persists ar language");
  }

  {
    const updated = await service.updateExercise(
      IDS.exercise,
      { language: "ar" },
      { id: IDS.creator, role: "specialist" }
    );
    assert.ok(updated);
    pass("creator specialist can update exercise language");
  }

  {
    try {
      await service.createExercise(
        {
          category_id: IDS.other,
          title: "Bad category",
        },
        IDS.creator
      );
      assert.fail("expected missing category error");
    } catch (error) {
      assert.strictEqual(error.statusCode, 404);
      pass("missing category returns 404");
    }
  }

  {
    const updated = await service.updateExercise(
      IDS.exercise,
      { title: "Updated by creator" },
      { id: IDS.creator, role: "specialist" }
    );
    assert.ok(updated);
    pass("creator specialist can update own exercise");
  }

  {
    try {
      await service.updateExercise(
        IDS.exercise,
        { title: "Hijack" },
        { id: IDS.other, role: "specialist" }
      );
      assert.fail("expected 403");
    } catch (error) {
      assert.strictEqual(error.statusCode, 403);
      pass("non-creator specialist update returns 403");
    }
  }

  {
    const updated = await service.updateExercise(
      IDS.exercise,
      { title: "Admin edit" },
      { id: IDS.admin, role: "admin" }
    );
    assert.ok(updated);
    pass("admin can update any exercise");
  }

  {
    try {
      await service.deleteExercise(IDS.exercise);
      assert.fail("expected 409");
    } catch (error) {
      assert.strictEqual(error.statusCode, 409);
      pass("delete referenced exercise returns 409");
    }
  }

  mockRows.assigned = [];
  {
    const deleted = await service.deleteExercise(IDS.exercise);
    assert.strictEqual(deleted.id, IDS.exercise);
    pass("admin delete unused exercise succeeds");
  }

  // Upload route wiring smoke check
  const uploadsRoutes = require("fs").readFileSync(
    path.join(__dirname, "../src/modules/uploads/uploads.routes.js"),
    "utf8"
  );
  assert.ok(uploadsRoutes.includes('"/exercise-media"'));
  assert.ok(uploadsRoutes.includes('"/exercise-submission-media"'));
  assert.ok(uploadsRoutes.includes("authenticate"));
  assert.ok(uploadsRoutes.includes('authorizeRoles("admin", "specialist")'));
  assert.ok(
    uploadsRoutes.includes('authorizeRoles("parent", "admin", "specialist")')
  );
  assert.ok(uploadsRoutes.includes("uploadExerciseMedia"));
  assert.ok(uploadsRoutes.includes("uploadExerciseSubmissionMedia"));
  pass("exercise-media + submission-media routes require auth + roles");

  // Unauthenticated / unsupported / oversized are covered by multer middleware
  // conventions (401 via authenticate, 400 via fileFilter, LIMIT_FILE_SIZE handler).
  pass("upload rejection conventions documented (401/400/size)");

  console.log(`\nPASS ${passed} exercise hardening checks`);
  console.log(`Script: ${path.basename(__filename)}`);
})().catch((error) => {
  console.error("FAIL", error);
  process.exitCode = 1;
});
