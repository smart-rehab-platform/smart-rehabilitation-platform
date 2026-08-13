import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildProfessionalUpdatePayload,
  buildUserUpdatePayload,
  findSpecialistProfileRow,
  formatOptionalProfileValue,
  mapProfileToFormValues,
  validateSpecialistProfileForm,
} from "./specialistProfileFormUtils.js";

describe("specialistProfileFormUtils", () => {
  it("finds specialist profile row by user id", () => {
    const rows = [
      { id: "sp-1", user_id: "user-1", specialization: "Speech" },
      { id: "sp-2", user_id: "user-2", specialization: "OT" },
    ];

    assert.deepEqual(findSpecialistProfileRow(rows, "user-2"), rows[1]);
    assert.equal(findSpecialistProfileRow(rows, "missing"), null);
  });

  it("formats optional values with em dash", () => {
    assert.equal(formatOptionalProfileValue(null), "—");
    assert.equal(formatOptionalProfileValue("Bio text"), "Bio text");
  });

  it("validates full name and years of experience like Flutter", () => {
    assert.deepEqual(validateSpecialistProfileForm({ fullName: "" }), {
      fullName: "Full name is required",
    });
    assert.deepEqual(validateSpecialistProfileForm({
      fullName: "Name",
      yearsOfExperience: "-1",
    }), {
      yearsOfExperience: "Years of experience must be a valid number",
    });
    assert.deepEqual(validateSpecialistProfileForm({
      fullName: "Name",
      yearsOfExperience: "3",
    }), {});
  });

  it("builds update payloads for backend endpoints", () => {
    assert.deepEqual(buildUserUpdatePayload({
      fullName: " Specialist A ",
      phone: " 059 ",
    }), {
      full_name: "Specialist A",
      phone: "059",
    });

    assert.deepEqual(buildProfessionalUpdatePayload({
      specialization: " Speech ",
      licenseNumber: "",
      bio: "Bio",
      yearsOfExperience: "4",
    }), {
      specialization: "Speech",
      license_number: null,
      bio: "Bio",
      years_of_experience: 4,
    });
  });

  it("maps profile bundle to form values", () => {
    const bundle = {
      fullName: "A",
      phone: "",
      specialization: "",
      licenseNumber: "",
      yearsOfExperience: 2,
      bio: "Bio",
    };

    assert.deepEqual(mapProfileToFormValues(bundle), {
      fullName: "A",
      phone: "",
      specialization: "",
      licenseNumber: "",
      yearsOfExperience: "2",
      bio: "Bio",
    });
  });
});
