import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildAdminUsersPath } from "../../../routes/adminDashboardRoutes.js";
import {
  ADMIN_RECENT_USERS_SECTION_ID,
  ADMIN_SUMMARY_KPI_ACTIONS,
  getAdminSummaryKpiAction,
} from "./adminDashboardNavigation.js";

describe("adminDashboardNavigation", () => {
  it("routes New Signups KPI to the Recent Users section instead of Users", () => {
    const action = getAdminSummaryKpiAction("newSignupsThisWeek");

    assert.equal(action?.kind, "scroll");
    assert.equal(action?.targetId, ADMIN_RECENT_USERS_SECTION_ID);
    assert.notEqual(action?.kind, "route");
  });

  it("keeps Users KPI routing to the Users page", () => {
    const action = getAdminSummaryKpiAction("totalUsers");

    assert.deepEqual(action, { kind: "route", routeKey: "users" });
  });

  it("keeps Specialists KPI routing to specialist-filtered Users", () => {
    const action = getAdminSummaryKpiAction("totalSpecialists");

    assert.deepEqual(action, {
      kind: "route",
      routeKey: "users",
      navOptions: { role: "specialist" },
    });
    assert.equal(
      buildAdminUsersPath("specialist"),
      "/dashboard/admin/users?role=specialist",
    );
  });

  it("keeps Patients KPI routing unchanged", () => {
    const action = getAdminSummaryKpiAction("totalPatients");

    assert.deepEqual(action, { kind: "route", routeKey: "patients" });
  });

  it("exposes stable Recent Users section id for scroll targeting", () => {
    assert.equal(ADMIN_RECENT_USERS_SECTION_ID, "admin-recent-users");
    assert.equal(
      ADMIN_SUMMARY_KPI_ACTIONS.newSignupsThisWeek.targetId,
      "admin-recent-users",
    );
  });

  it("is locale-independent", () => {
    const enAction = getAdminSummaryKpiAction("newSignupsThisWeek");
    const arAction = getAdminSummaryKpiAction("newSignupsThisWeek");

    assert.deepEqual(enAction, arAction);
  });
});
