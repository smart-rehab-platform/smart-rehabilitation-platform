import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  EXERCISE_MEDIA_SIZE_MESSAGE,
  EXERCISE_MEDIA_UNSUPPORTED_MESSAGE,
  EXERCISE_MEDIA_MAX_BYTES,
  inferExerciseMediaMimeType,
  validateExerciseMediaFile,
  guessExerciseMediaKind,
} from "./specialistExerciseMediaUtils.js";

describe("specialistExerciseMediaUtils", () => {
  it("infers supported mime types from extension", () => {
    assert.equal(inferExerciseMediaMimeType("demo.mp4", ""), "video/mp4");
    assert.equal(inferExerciseMediaMimeType("notes.pdf", ""), "application/pdf");
  });

  it("rejects unsupported files", () => {
    const file = new File(["hello"], "notes.txt", { type: "text/plain" });
    assert.equal(validateExerciseMediaFile(file), EXERCISE_MEDIA_UNSUPPORTED_MESSAGE);
  });

  it("rejects oversized files", () => {
    const bytes = new Uint8Array(EXERCISE_MEDIA_MAX_BYTES + 1);
    const file = new File([bytes], "large.mp4", { type: "video/mp4" });
    assert.equal(validateExerciseMediaFile(file), EXERCISE_MEDIA_SIZE_MESSAGE);
  });

  it("accepts supported files within size limit", () => {
    const file = new File(["abc"], "photo.png", { type: "image/png" });
    assert.equal(validateExerciseMediaFile(file), null);
  });

  it("guesses media kinds from url/filename", () => {
    assert.equal(guessExerciseMediaKind("/uploads/demo.mov"), "video");
    assert.equal(guessExerciseMediaKind("/uploads/guide.pdf"), "pdf");
    assert.equal(guessExerciseMediaKind("/uploads/track.mp3"), "audio");
  });
});
