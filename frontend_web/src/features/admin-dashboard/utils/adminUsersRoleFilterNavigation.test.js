import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createTranslator } from "../../../i18n/index.js";
import {
  ADMIN_WEB_ROUTES,
  buildAdminUsersPath,
  parseAdminUsersRoleParam,
} from "../../../routes/adminDashboardRoutes.js";
import { filterAdminUsers } from "./adminUsersMappers.js";
import { getAdminUsersRoleFilterOptions } from "./adminUsersLocalization.js";

describe("adminUsersRoleFilterNavigation", () => {
  it("builds the Users route with role=specialist for the Specialists KPI deep link", () => {
    assert.equal(
      buildAdminUsersPath("specialist"),
      `${ADMIN_WEB_ROUTES.users}?role=specialist`,
    );
  });

  it("builds the plain Users route when no role is provided", () => {
    assert.equal(buildAdminUsersPath(null), ADMIN_WEB_ROUTES.users);
    assert.equal(buildAdminUsersPath(undefined), ADMIN_WEB_ROUTES.users);
    assert.equal(buildAdminUsersPath(""), ADMIN_WEB_ROUTES.users);
  });

  it("parses role=specialist into the specialist raw filter value", () => {
    assert.equal(parseAdminUsersRoleParam("specialist"), "specialist");
    assert.equal(parseAdminUsersRoleParam("SPECIALIST"), "specialist");
    assert.equal(parseAdminUsersRoleParam(" specialist "), "specialist");
  });

  it("defaults to All when the role query param is missing or invalid", () => {
    assert.equal(parseAdminUsersRoleParam(null), null);
    assert.equal(parseAdminUsersRoleParam(undefined), null);
    assert.equal(parseAdminUsersRoleParam(""), null);
    assert.equal(parseAdminUsersRoleParam("all"), null);
    assert.equal(parseAdminUsersRoleParam("unknown"), null);
    assert.equal(parseAdminUsersRoleParam("الأخصائي"), null);
  });

  it("accepts only the existing supported role filter values", () => {
    assert.equal(parseAdminUsersRoleParam("admin"), "admin");
    assert.equal(parseAdminUsersRoleParam("parent"), "parent");
  });

  it("filters users to specialists using the existing role filter logic", () => {
    const users = [
      { id: "1", role: "admin", fullName: "Admin User", email: "admin@test.com" },
      { id: "2", role: "specialist", fullName: "Spec User", email: "spec@test.com" },
      { id: "3", role: "parent", fullName: "Parent User", email: "parent@test.com" },
    ];

    const filtered = filterAdminUsers(users, { roleFilter: "specialist" });

    assert.equal(filtered.length, 1);
    assert.equal(filtered[0].role, "specialist");
  });

  it("keeps role filter values locale-independent while labels differ by locale", () => {
    const translateEn = createTranslator("en");
    const translateAr = createTranslator("ar");
    const enFilters = getAdminUsersRoleFilterOptions(translateEn);
    const arFilters = getAdminUsersRoleFilterOptions(translateAr);
    const enSpecialist = enFilters.find((filter) => filter.id === "specialist");
    const arSpecialist = arFilters.find((filter) => filter.id === "specialist");

    assert.equal(enSpecialist.value, "specialist");
    assert.equal(arSpecialist.value, "specialist");
    assert.notEqual(enSpecialist.label, arSpecialist.label);
    assert.equal(parseAdminUsersRoleParam(enSpecialist.value), "specialist");
    assert.equal(parseAdminUsersRoleParam(arSpecialist.value), "specialist");
  });
});
