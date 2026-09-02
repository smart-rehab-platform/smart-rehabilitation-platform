import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  SPECIALIST_VERIFICATION_PENDING_PATH,
  SPECIALIST_VERIFICATION_REJECTED_PATH,
  canAccessRoute,
  getSpecialistVerificationStatus,
  homeForUser,
  isApprovedSpecialist,
} from "./roleRouting.js";

describe("roleRouting specialist verification", () => {
  it("routes specialists by verification_status", () => {
    assert.equal(
      homeForUser({ role: "specialist", verification_status: "approved" }),
      "/dashboard/specialist",
    );
    assert.equal(
      homeForUser({ role: "specialist", verification_status: "pending" }),
      SPECIALIST_VERIFICATION_PENDING_PATH,
    );
    assert.equal(
      homeForUser({ role: "specialist", verification_status: "rejected" }),
      SPECIALIST_VERIFICATION_REJECTED_PATH,
    );
    assert.equal(
      homeForUser({ role: "specialist" }),
      SPECIALIST_VERIFICATION_PENDING_PATH,
    );
  });

  it("leaves parent and admin homes unchanged", () => {
    assert.equal(homeForUser({ role: "parent" }), "/dashboard/parent");
    assert.equal(homeForUser({ role: "admin" }), "/dashboard/admin");
  });

  it("blocks unapproved specialists from clinical dashboard routes", () => {
    const pending = { role: "specialist", verification_status: "pending" };
    const approved = { role: "specialist", verification_status: "approved" };

    assert.equal(canAccessRoute("specialist", "/dashboard/specialist", pending), false);
    assert.equal(canAccessRoute("specialist", "/dashboard/specialist/patients", pending), false);
    assert.equal(canAccessRoute("specialist", "/dashboard/specialist", approved), true);
    assert.equal(isApprovedSpecialist(pending), false);
    assert.equal(getSpecialistVerificationStatus(pending), "pending");
  });
});
