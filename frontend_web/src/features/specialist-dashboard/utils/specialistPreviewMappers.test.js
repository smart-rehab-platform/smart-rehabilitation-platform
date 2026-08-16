import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildRecentPatientProgressPreview,
  buildSpecialistPatientProgressList,
} from "./specialistPreviewMappers.js";

const patients = [
  { id: "patient-1", full_name: "Layla Hassan", profile_image_url: "https://example.com/layla.jpg" },
  { id: "patient-2", full_name: "Omar Ali" },
  { id: "patient-3", full_name: "Sara Noor" },
];

const snapshots = [
  {
    patient_id: "patient-1",
    improvement_percentage: 72,
    period_start: "2026-01-01",
    created_at: "2026-01-02T10:00:00.000Z",
  },
  {
    patient_id: "patient-2",
    average_performance: 0.55,
    period_start: "2026-01-05",
    created_at: "2026-01-06T10:00:00.000Z",
  },
  {
    patient_id: "patient-1",
    improvement_percentage: 80,
    period_start: "2026-01-10",
    created_at: "2026-01-11T10:00:00.000Z",
  },
  {
    patient_id: "patient-3",
    improvement_percentage: 41,
    period_start: "2026-01-03",
    created_at: "2026-01-04T10:00:00.000Z",
  },
];

describe("specialistPreviewMappers progress", () => {
  it("builds full and preview lists from the same progress definition", () => {
    const full = buildSpecialistPatientProgressList(patients, snapshots);
    const preview = buildRecentPatientProgressPreview(patients, snapshots, { limit: 4 });

    assert.equal(full.length, 3);
    assert.equal(preview.length, 3);
    assert.deepEqual(
      preview.map((item) => ({ patientId: item.patientId, percent: item.percent })),
      full.slice(0, 4).map((item) => ({ patientId: item.patientId, percent: item.percent })),
    );
  });

  it("preserves patient names and uses latest snapshot percent per patient", () => {
    const full = buildSpecialistPatientProgressList(patients, snapshots);

    const layla = full.find((item) => item.patientId === "patient-1");
    const omar = full.find((item) => item.patientId === "patient-2");

    assert.equal(layla.patientName, "Layla Hassan");
    assert.equal(omar.patientName, "Omar Ali");
    assert.equal(layla.percent, 80);
    assert.equal(omar.percent, 55);
    assert.equal(layla.profileImageUrl, "https://example.com/layla.jpg");
  });

  it("sorts by latest snapshot time descending", () => {
    const full = buildSpecialistPatientProgressList(patients, snapshots);
    assert.deepEqual(full.map((item) => item.patientId), ["patient-1", "patient-2", "patient-3"]);
  });

  it("returns empty list when assigned patients have no progress snapshots", () => {
    const full = buildSpecialistPatientProgressList(patients, []);
    assert.deepEqual(full, []);
  });
});
