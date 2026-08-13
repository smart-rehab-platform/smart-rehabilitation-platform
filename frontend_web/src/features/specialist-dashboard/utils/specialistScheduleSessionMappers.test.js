import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildCreateSessionPayload,
  buildScheduledDateTime,
  getDefaultScheduleDateValue,
  validateScheduleSessionForm,
} from "./specialistScheduleSessionMappers.js";

describe("specialistScheduleSessionMappers", () => {
  it("defaults schedule date to tomorrow", () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const expected = [
      tomorrow.getFullYear(),
      String(tomorrow.getMonth() + 1).padStart(2, "0"),
      String(tomorrow.getDate()).padStart(2, "0"),
    ].join("-");

    assert.equal(getDefaultScheduleDateValue(), expected);
  });

  it("requires patient, title, duration, and future schedule", () => {
    const result = validateScheduleSessionForm({
      title: "",
      patientId: "",
      dateValue: "2020-01-01",
      timeValue: "09:00",
      durationValue: "0",
    });

    assert.equal(result.isValid, false);
    assert.ok(result.errors.title);
    assert.ok(result.errors.patientId);
    assert.ok(result.errors.duration);
    assert.ok(result.errors.dateTime);
  });

  it("builds create payload matching Flutter fields", () => {
    const scheduledAt = buildScheduledDateTime("2030-06-15", "09:30");
    const payload = buildCreateSessionPayload({
      patientId: "patient-1",
      specialistId: "specialist-1",
      scheduledAt,
      durationMinutes: 45,
      locationOrLink: "Room 3",
    });

    assert.deepEqual(payload, {
      patient_id: "patient-1",
      specialist_id: "specialist-1",
      scheduled_at: "2030-06-15T09:30:00.000",
      duration_minutes: 45,
      location_or_link: "Room 3",
    });
  });
});
