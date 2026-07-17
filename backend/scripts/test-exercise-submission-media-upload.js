/**
 * Parent exercise-submission media upload vs instructional exercise-media.
 * Run: node scripts/test-exercise-submission-media-upload.js
 */
const assert = require("assert");
const fs = require("fs");
const http = require("http");
const os = require("os");
const path = require("path");
const express = require("express");
const multer = require("multer");

const {
  isAllowedExerciseMedia,
  isAllowedExerciseSubmissionMedia,
  MAX_EXERCISE_MEDIA_BYTES,
  sanitizeUploadFilename,
} = require("../src/config/exerciseMedia");
const uploadsController = require("../src/modules/uploads/uploads.controller");
const authorizeRoles = require("../src/middleware/role.middleware");
const { uploadsRoot } = require("../src/config/uploads");

let passed = 0;
const pass = (label) => {
  passed += 1;
  console.log(`  ✓ ${label}`);
};

// --- Config helpers ---
assert.strictEqual(isAllowedExerciseSubmissionMedia("video/mp4", "a.mp4"), true);
assert.strictEqual(isAllowedExerciseSubmissionMedia("video/quicktime", "a.mov"), true);
assert.strictEqual(isAllowedExerciseSubmissionMedia("audio/mpeg", "a.mp3"), true);
assert.strictEqual(isAllowedExerciseSubmissionMedia("image/jpeg", "a.jpg"), true);
assert.strictEqual(isAllowedExerciseSubmissionMedia("image/png", "a.png"), true);
assert.strictEqual(isAllowedExerciseSubmissionMedia("image/webp", "a.webp"), true);
assert.strictEqual(
  isAllowedExerciseSubmissionMedia("application/pdf", "a.pdf"),
  false
);
assert.strictEqual(isAllowedExerciseSubmissionMedia("text/plain", "a.txt"), false);
assert.strictEqual(isAllowedExerciseMedia("application/pdf", "a.pdf"), true);
assert.ok(MAX_EXERCISE_MEDIA_BYTES === 50 * 1024 * 1024);
assert.ok(!sanitizeUploadFilename("../../x.mp4").includes(".."));
pass("submission MIME helpers exclude PDF; instructional still allows PDF");

// --- Route source wiring ---
const routesSource = fs.readFileSync(
  path.join(__dirname, "../src/modules/uploads/uploads.routes.js"),
  "utf8"
);
assert.ok(routesSource.includes('"/exercise-media"'));
assert.ok(routesSource.includes('"/exercise-submission-media"'));
assert.ok(
  routesSource.includes('authorizeRoles("admin", "specialist")')
);
assert.ok(
  routesSource.includes('authorizeRoles("parent", "admin", "specialist")')
);
assert.ok(routesSource.includes("isAllowedExerciseSubmissionMedia"));
pass("routes wire distinct instructional vs submission endpoints");

const createStorage = (destination) =>
  multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, destination),
    filename: (_req, file, cb) =>
      cb(null, sanitizeUploadFilename(file.originalname)),
  });

const uploadExerciseMedia = multer({
  storage: createStorage(uploadsRoot),
  limits: { fileSize: MAX_EXERCISE_MEDIA_BYTES },
  fileFilter: (_req, file, cb) => {
    if (isAllowedExerciseMedia(file.mimetype, file.originalname)) {
      cb(null, true);
      return;
    }
    const error = new Error("Unsupported instructional media type.");
    error.statusCode = 400;
    cb(error);
  },
});

const uploadExerciseSubmissionMedia = multer({
  storage: createStorage(uploadsRoot),
  limits: { fileSize: MAX_EXERCISE_MEDIA_BYTES },
  fileFilter: (_req, file, cb) => {
    if (isAllowedExerciseSubmissionMedia(file.mimetype, file.originalname)) {
      cb(null, true);
      return;
    }
    const error = new Error("Unsupported submission media type.");
    error.statusCode = 400;
    cb(error);
  },
});

const fakeAuthenticate = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Access denied. No token provided",
    });
  }
  try {
    req.user = JSON.parse(
      Buffer.from(header.slice("Bearer ".length), "base64url").toString("utf8")
    );
  } catch (_err) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
  next();
};

const tokenFor = (role) =>
  Buffer.from(JSON.stringify({ id: "u1", role }), "utf8").toString("base64url");

const buildApp = () => {
  const app = express();
  app.post(
    "/api/v1/uploads/exercise-media",
    fakeAuthenticate,
    authorizeRoles("admin", "specialist"),
    (req, res, next) => {
      uploadExerciseMedia.single("file")(req, res, (err) => {
        if (err) return uploadsController.handleUploadError(res, err);
        next();
      });
    },
    uploadsController.uploadExerciseMedia
  );
  app.post(
    "/api/v1/uploads/exercise-submission-media",
    fakeAuthenticate,
    authorizeRoles("parent", "admin", "specialist"),
    (req, res, next) => {
      uploadExerciseSubmissionMedia.single("file")(req, res, (err) => {
        if (err) return uploadsController.handleUploadError(res, err);
        next();
      });
    },
    uploadsController.uploadExerciseSubmissionMedia
  );
  return app;
};

const multipartBody = ({ filename, contentType, bytes }) => {
  const boundary = "----TestBoundary7MA4YWxkTrZu0gW";
  const head = Buffer.from(
    `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="file"; filename="${filename}"\r\n` +
      `Content-Type: ${contentType}\r\n\r\n`
  );
  const tail = Buffer.from(`\r\n--${boundary}--\r\n`);
  return {
    contentType: `multipart/form-data; boundary=${boundary}`,
    body: Buffer.concat([head, Buffer.from(bytes), tail]),
  };
};

const requestUpload = (server, { route, token, filename, contentType, bytes }) =>
  new Promise((resolve, reject) => {
    const { contentType: multipartType, body } = multipartBody({
      filename,
      contentType,
      bytes,
    });
    const address = server.address();
    const req = http.request(
      {
        hostname: "127.0.0.1",
        port: address.port,
        path: route,
        method: "POST",
        headers: {
          "Content-Type": multipartType,
          "Content-Length": body.length,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      },
      (res) => {
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => {
          const raw = Buffer.concat(chunks).toString("utf8");
          let json = null;
          try {
            json = JSON.parse(raw);
          } catch (_err) {
            json = { raw };
          }
          resolve({ status: res.statusCode, body: json });
        });
      }
    );
    req.on("error", reject);
    req.write(body);
    req.end();
  });

(async () => {
  fs.mkdirSync(uploadsRoot, { recursive: true });
  const app = buildApp();
  const server = await new Promise((resolve) => {
    const s = app.listen(0, "127.0.0.1", () => resolve(s));
  });

  try {
    {
      const res = await requestUpload(server, {
        route: "/api/v1/uploads/exercise-submission-media",
        token: tokenFor("parent"),
        filename: "clip.mp4",
        contentType: "video/mp4",
        bytes: Buffer.from("fake-mp4-bytes"),
      });
      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.body.success, true);
      assert.ok(String(res.body.data.url).startsWith("/uploads/"));
      pass("Parent uploads valid MP4 to submission endpoint → success");
    }

    {
      const res = await requestUpload(server, {
        route: "/api/v1/uploads/exercise-submission-media",
        token: tokenFor("parent"),
        filename: "voice.mp3",
        contentType: "audio/mpeg",
        bytes: Buffer.from("fake-mp3-bytes"),
      });
      assert.strictEqual(res.status, 201);
      assert.ok(String(res.body.data.url).startsWith("/uploads/"));
      pass("Parent uploads valid audio to submission endpoint → success");
    }

    {
      const res = await requestUpload(server, {
        route: "/api/v1/uploads/exercise-submission-media",
        filename: "clip.mp4",
        contentType: "video/mp4",
        bytes: Buffer.from("x"),
      });
      assert.strictEqual(res.status, 401);
      pass("Unauthenticated submission upload → 401");
    }

    {
      const res = await requestUpload(server, {
        route: "/api/v1/uploads/exercise-submission-media",
        token: tokenFor("parent"),
        filename: "notes.txt",
        contentType: "text/plain",
        bytes: Buffer.from("hello"),
      });
      assert.ok(res.status === 400 || res.status === 415);
      pass("Unsupported submission file → rejected");
    }

    {
      const res = await requestUpload(server, {
        route: "/api/v1/uploads/exercise-submission-media",
        token: tokenFor("parent"),
        filename: "huge.mp4",
        contentType: "video/mp4",
        bytes: Buffer.alloc(MAX_EXERCISE_MEDIA_BYTES + 1024, 1),
      });
      assert.ok(res.status === 400 || res.status === 413);
      assert.ok(
        String(res.body.message || "")
          .toLowerCase()
          .includes("too large") ||
          String(res.body.message || "")
            .toLowerCase()
            .includes("large")
      );
      pass("Oversized submission file → rejected");
    }

    {
      const res = await requestUpload(server, {
        route: "/api/v1/uploads/exercise-media",
        token: tokenFor("parent"),
        filename: "clip.mp4",
        contentType: "video/mp4",
        bytes: Buffer.from("fake-mp4-bytes"),
      });
      assert.strictEqual(res.status, 403);
      pass("Parent upload to instructional endpoint remains forbidden");
    }

    {
      const res = await requestUpload(server, {
        route: "/api/v1/uploads/exercise-media",
        token: tokenFor("specialist"),
        filename: "clip.mp4",
        contentType: "video/mp4",
        bytes: Buffer.from("fake-mp4-bytes"),
      });
      assert.strictEqual(res.status, 201);
      assert.ok(String(res.body.data.url).startsWith("/uploads/"));
      pass("Specialist upload to instructional endpoint remains successful");
    }

    {
      const res = await requestUpload(server, {
        route: "/api/v1/uploads/exercise-submission-media",
        token: tokenFor("parent"),
        filename: "guide.pdf",
        contentType: "application/pdf",
        bytes: Buffer.from("%PDF-1.4"),
      });
      assert.ok(res.status === 400 || res.status === 415);
      pass("Parent PDF on submission endpoint is rejected");
    }
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }

  console.log(`\nPASS ${passed} exercise-submission media upload checks`);
  console.log(`Script: ${path.basename(__filename)}`);
  console.log(`Temp OS: ${os.tmpdir()}`);
})().catch((error) => {
  console.error("FAIL", error);
  process.exitCode = 1;
});
