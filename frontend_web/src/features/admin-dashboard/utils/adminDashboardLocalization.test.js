import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createTranslator } from "../../../i18n/index.js";
import { ADMIN_NAV_ITEM_DEFS } from "../constants/adminNavigation.js";
import { ADMIN_SIDEBAR_NAV_ROUTE_KEYS } from "../../../routes/adminDashboardRoutes.js";
import {
  applyAdminRecentUserLocalization,
  buildAdminNavItems,
  buildAdminSearchDestinations,
  filterAdminSearchDestinations,
  formatAdminRegisteredLabel,
  formatAdminSystemActivityPeriodLabel,
  getAdminAnalyticsLabels,
  getAdminAnalyticsPeriodOptions,
  getAdminDashboardHomeLabels,
  getAdminRoleLabel,
  getAdminSearchLabels,
  getAdminWeekdayLabels,
  localizeSystemActivityDays,
} from "./adminDashboardLocalization.js";
import { SYSTEM_ACTIVITY_PRESET_OFFSETS } from "./adminDashboardMappers.js";

describe("adminDashboardLocalization", () => {
  const translateEn = createTranslator("en");
  const translateAr = createTranslator("ar");
  const fixedNow = new Date("2026-08-16T12:00:00.000Z");

  it("resolves all admin navigation items in English with stable ids", () => {
    const items = buildAdminNavItems(translateEn);

    assert.equal(items.length, ADMIN_NAV_ITEM_DEFS.length);
    items.forEach((item, index) => {
      assert.equal(item.id, ADMIN_NAV_ITEM_DEFS[index].id);
      assert.equal(item.icon, ADMIN_NAV_ITEM_DEFS[index].icon);
      assert.ok(item.label.length > 0);
      assert.ok(ADMIN_SIDEBAR_NAV_ROUTE_KEYS[item.id]);
    });

    assert.equal(items.find((item) => item.id === "dashboard")?.label, "Home");
    assert.equal(items.find((item) => item.id === "users")?.label, "Users");
    assert.equal(items.find((item) => item.id === "aiCenter")?.label, "AI Center");
  });

  it("resolves all admin navigation items in Arabic with stable ids", () => {
    const items = buildAdminNavItems(translateAr);

    assert.equal(items.length, ADMIN_NAV_ITEM_DEFS.length);
    assert.equal(items.find((item) => item.id === "dashboard")?.label, "الرئيسية");
    assert.equal(items.find((item) => item.id === "users")?.label, "المستخدمون");
    assert.equal(items.find((item) => item.id === "patients")?.label, "المرضى");
    assert.equal(items.find((item) => item.id === "patientAssignments")?.label, "إسناد المرضى");
    assert.equal(items.find((item) => item.id === "caseRequests")?.label, "طلبات الحالات");
    assert.equal(items.find((item) => item.id === "complaints")?.label, "الشكاوى");
    assert.equal(items.find((item) => item.id === "supportRequests")?.label, "طلبات الدعم");
    assert.equal(items.find((item) => item.id === "aiCenter")?.label, "مركز الذكاء الاصطناعي");
    assert.equal(items.find((item) => item.id === "auditLogs")?.label, "سجلات التدقيق");
  });

  it("resolves header search labels in English", () => {
    const labels = getAdminSearchLabels(translateEn);

    assert.equal(labels.placeholder, "Jump to a page...");
    assert.equal(labels.inputAriaLabel, "Jump to a page");
    assert.equal(labels.panelAriaLabel, "Admin pages");
    assert.equal(labels.empty, "No matching pages.");
  });

  it("resolves header search labels in Arabic", () => {
    const labels = getAdminSearchLabels(translateAr);

    assert.equal(labels.placeholder, "انتقل إلى صفحة...");
    assert.equal(labels.inputAriaLabel, "انتقل إلى صفحة");
    assert.equal(labels.panelAriaLabel, "صفحات المسؤول");
    assert.equal(labels.empty, "لا توجد صفحات مطابقة.");
  });

  it("resolves localized admin page labels through search in EN and AR", () => {
    const enDestinations = buildAdminSearchDestinations(translateEn);
    const arDestinations = buildAdminSearchDestinations(translateAr);

    const enUsers = filterAdminSearchDestinations("Users", enDestinations);
    const arUsers = filterAdminSearchDestinations("المستخدمون", arDestinations);

    assert.equal(enUsers.length, 1);
    assert.equal(enUsers[0].id, "users");
    assert.equal(arUsers.length, 1);
    assert.equal(arUsers[0].id, "users");
    assert.equal(enUsers[0].route, arUsers[0].route);
  });

  it("interpolates dashboard greeting names without altering user data", () => {
    assert.equal(
      translateEn("admin.dashboard.welcome", { name: "Alaa" }),
      "Welcome, Alaa",
    );
    assert.equal(
      translateAr("admin.dashboard.welcome", { name: "Alaa" }),
      "مرحبًا، Alaa",
    );

    const labels = getAdminDashboardHomeLabels(translateEn);
    assert.match(labels.subtitle, /rehabilitation platform/i);
  });

  it("localizes role labels through shared role terminology", () => {
    assert.equal(getAdminRoleLabel("admin", translateEn), "Admin");
    assert.equal(getAdminRoleLabel("specialist", translateEn), "Specialist");
    assert.equal(getAdminRoleLabel("parent", translateEn), "Parent");

    assert.equal(getAdminRoleLabel("admin", translateAr), "المسؤول");
    assert.equal(getAdminRoleLabel("specialist", translateAr), "الأخصائي");
    assert.equal(getAdminRoleLabel("parent", translateAr), "ولي الأمر");
  });

  it("formats relative-time labels in EN and AR", () => {
    const justNow = new Date(fixedNow.getTime() - 30 * 1000);
    const fiveMinutesAgo = new Date(fixedNow.getTime() - 5 * 60 * 1000);
    const twoHoursAgo = new Date(fixedNow.getTime() - 2 * 60 * 60 * 1000);
    const yesterday = new Date(fixedNow.getTime() - 26 * 60 * 60 * 1000);
    const threeDaysAgo = new Date(fixedNow.getTime() - 3 * 24 * 60 * 60 * 1000);

    assert.equal(
      formatAdminRegisteredLabel(justNow, fixedNow, { t: translateEn, locale: "en" }),
      "Just now",
    );
    assert.equal(
      formatAdminRegisteredLabel(fiveMinutesAgo, fixedNow, { t: translateEn, locale: "en" }),
      "5m ago",
    );
    assert.equal(
      formatAdminRegisteredLabel(twoHoursAgo, fixedNow, { t: translateEn, locale: "en" }),
      "2h ago",
    );
    assert.equal(
      formatAdminRegisteredLabel(yesterday, fixedNow, { t: translateEn, locale: "en" }),
      "Yesterday",
    );
    assert.equal(
      formatAdminRegisteredLabel(threeDaysAgo, fixedNow, { t: translateEn, locale: "en" }),
      "3d ago",
    );

    assert.equal(
      formatAdminRegisteredLabel(fiveMinutesAgo, fixedNow, { t: translateAr, locale: "ar" }),
      "منذ 5 د",
    );
    assert.equal(
      formatAdminRegisteredLabel(twoHoursAgo, fixedNow, { t: translateAr, locale: "ar" }),
      "منذ 2 س",
    );
  });

  it("localizes recent user rows while preserving raw user data", () => {
    const now = new Date();
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    const localized = applyAdminRecentUserLocalization(
      {
        id: "user-1",
        name: "Sara Ali",
        rawRole: "specialist",
        createdAt: twoHoursAgo,
      },
      { t: translateEn, locale: "en" },
    );

    assert.equal(localized.name, "Sara Ali");
    assert.equal(localized.role, "Specialist");
    assert.equal(localized.registeredLabel, "2h ago");
  });

  it("resolves system analytics period labels in EN and AR", () => {
    const enOptions = getAdminAnalyticsPeriodOptions(translateEn);
    const arOptions = getAdminAnalyticsPeriodOptions(translateAr);

    assert.deepEqual(
      enOptions.map((option) => option.label),
      ["This Week", "Last Week", "Last 2 Weeks", "Last Month"],
    );
    assert.deepEqual(
      arOptions.map((option) => option.label),
      ["هذا الأسبوع", "الأسبوع الماضي", "آخر أسبوعين", "الشهر الماضي"],
    );

    assert.equal(
      formatAdminSystemActivityPeriodLabel(
        { weekOffset: SYSTEM_ACTIVITY_PRESET_OFFSETS.thisWeek },
        { t: translateEn, locale: "en" },
      ),
      "This Week",
    );
    assert.equal(
      formatAdminSystemActivityPeriodLabel(
        { weekOffset: SYSTEM_ACTIVITY_PRESET_OFFSETS.lastMonth },
        { t: translateAr, locale: "ar" },
      ),
      "الشهر الماضي",
    );

    const analyticsLabels = getAdminAnalyticsLabels(translateEn);
    assert.equal(analyticsLabels.title, "System Analytics");
    assert.equal(getAdminAnalyticsLabels(translateAr).title, "تحليلات النظام");
  });

  it("localizes weekday labels without reversing chart day order", () => {
    const enWeekdays = getAdminWeekdayLabels("en");
    const arWeekdays = getAdminWeekdayLabels("ar");

    assert.equal(enWeekdays.length, 7);
    assert.equal(arWeekdays.length, 7);
    assert.match(enWeekdays[0], /Mon/i);
    assert.notDeepEqual(enWeekdays, arWeekdays);

    const localizedDays = localizeSystemActivityDays(
      [
        { label: "Mon", fullLabel: "Monday", activityCount: 3 },
        { label: "Tue", fullLabel: "Tuesday", activityCount: 1 },
        { label: "Wed", fullLabel: "Wednesday", activityCount: 0 },
        { label: "Thu", fullLabel: "Thursday", activityCount: 2 },
        { label: "Fri", fullLabel: "Friday", activityCount: 4 },
        { label: "Sat", fullLabel: "Saturday", activityCount: 0 },
        { label: "Sun", fullLabel: "Sunday", activityCount: 5 },
      ],
      "ar",
    );

    assert.equal(localizedDays[0].activityCount, 3);
    assert.equal(localizedDays[6].activityCount, 5);
    assert.notEqual(localizedDays[0].label, "Mon");
    assert.notEqual(localizedDays[0].fullLabel, "Monday");
  });

  it("falls back to English labels when translation keys are missing", () => {
    const missingKeyTranslator = (key) => key;
    const items = buildAdminNavItems(missingKeyTranslator);

    assert.equal(items.find((item) => item.id === "users")?.label, "Users");
    assert.equal(
      getAdminSearchLabels(missingKeyTranslator).placeholder,
      "Jump to a page...",
    );
    assert.equal(
      formatAdminSystemActivityPeriodLabel(
        { weekOffset: SYSTEM_ACTIVITY_PRESET_OFFSETS.lastWeek },
        { t: missingKeyTranslator, locale: "en" },
      ),
      "Last Week",
    );
  });
});
