import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildCreateUserPayload,
  mapAdminUserRecord,
  validateAddUserForm,
} from "./adminUsersMappers.js";

describe("adminUsersMappers specialist verification", () => {
  it("maps specialist professional and verification fields from GET /users rows", () => {
    const mapped = mapAdminUserRecord({
      id: "11111111-1111-4111-8111-111111111111",
      full_name: "Bana Specialist",
      email: "bana@example.com",
      role: "specialist",
      is_active: true,
      specialization: "Speech Therapy",
      license_number: "LIC-22",
      verification_status: "pending",
    });

    assert.equal(mapped.specialization, "Speech Therapy");
    assert.equal(mapped.licenseNumber, "LIC-22");
    assert.equal(mapped.verificationStatus, "pending");
  });

  it("builds create payload with specialist_profile for specialists only", () => {
    const specialistPayload = buildCreateUserPayload({
      fullName: "New Spec",
      email: "spec@example.com",
      password: "Password1!",
      role: "specialist",
      specialization: "OT",
      licenseNumber: "L-9",
    });

    assert.deepEqual(specialistPayload.specialist_profile, {
      specialization: "OT",
      license_number: "L-9",
    });

    const parentPayload = buildCreateUserPayload({
      fullName: "Parent",
      email: "parent@example.com",
      password: "Password1!",
      role: "parent",
    });

    assert.equal(parentPayload.specialist_profile, undefined);
  });

  it("requires specialization and license when creating specialists", () => {
    const error = validateAddUserForm(
      {
        fullName: "New Spec",
        email: "spec@example.com",
        password: "Password1!",
        role: "specialist",
        specialization: "",
        licenseNumber: "",
      },
      { isPasswordValid: () => true },
    );

    assert.match(error, /Specialization/i);
  });
});
