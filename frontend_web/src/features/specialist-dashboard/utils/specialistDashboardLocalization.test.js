import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createTranslator } from "../../../i18n/index.js";
import { SPECIALIST_NAV_ITEM_DEFS } from "../constants/specialistNavigation.js";
import { SPECIALIST_SIDEBAR_NAV_ROUTE_KEYS } from "../../../routes/specialistDashboardRoutes.js";
import {
  buildSpecialistNavItems,
  formatSpecialistScheduleTime,
  formatSpecialistSessionScheduleLabel,
  formatSpecialistSubmittedAgo,
  getDashboardWeekdayLabels,
  getSpecialistDashboardKpiLabel,
  getSpecialistSessionStatusLabel,
} from "./specialistDashboardLocalization.js";

describe("specialistDashboardLocalization", () => {
  const translateEn = createTranslator("en");
  const translateAr = createTranslator("ar");
  const fixedNow = new Date("2026-03-15T12:00:00.000Z");

  it("resolves all 12 navigation items in English with stable ids", () => {
    const items = buildSpecialistNavItems(translateEn);

    assert.equal(items.length, 12);
    items.forEach((item, index) => {
      assert.equal(item.id, SPECIALIST_NAV_ITEM_DEFS[index].id);
      assert.equal(item.icon, SPECIALIST_NAV_ITEM_DEFS[index].icon);
      assert.ok(item.label.length > 0);
      assert.ok(SPECIALIST_SIDEBAR_NAV_ROUTE_KEYS[item.id]);
    });

    assert.equal(items.find((item) => item.id === "reviews")?.label, "Reviews");
    assert.equal(items.find((item) => item.id === "dashboard")?.label, "Home");
  });

  it("resolves all 12 navigation items in Arabic with stable ids", () => {
    const items = buildSpecialistNavItems(translateAr);

    assert.equal(items.length, 12);
    assert.equal(items.find((item) => item.id === "reviews")?.label, "المراجعات");
    assert.equal(items.find((item) => item.id === "patients")?.label, "المرضى");
    assert.equal(items.find((item) => item.id === "supportRequests")?.label, "الدعم");
  });

  it("resolves dashboard KPI labels in EN and AR", () => {
    assert.equal(getSpecialistDashboardKpiLabel("activeCases", translateEn), "Active Cases");
    assert.equal(getSpecialistDashboardKpiLabel("pendingReviews", translateEn), "Pending Reviews");
    assert.equal(getSpecialistDashboardKpiLabel("todaysSessions", translateEn), "Today's Sessions");
    assert.equal(getSpecialistDashboardKpiLabel("treatmentPlans", translateEn), "Treatment Plans");

    assert.equal(getSpecialistDashboardKpiLabel("activeCases", translateAr), "الحالات النشطة");
    assert.equal(getSpecialistDashboardKpiLabel("todaysSessions", translateAr), "جلسات اليوم");
  });

  it("resolves weekday labels for EN and AR without relying on browser locale", () => {
    const enWeekdays = getDashboardWeekdayLabels("en");
    const arWeekdays = getDashboardWeekdayLabels("ar");

    assert.equal(enWeekdays.length, 7);
    assert.equal(arWeekdays.length, 7);
    assert.match(enWeekdays[0], /Mon/i);
    assert.notDeepEqual(enWeekdays, arWeekdays);
  });

  it("maps known session statuses through i18n and safely falls back for unknown values", () => {
    assert.equal(getSpecialistSessionStatusLabel("scheduled", translateEn), "Scheduled");
    assert.equal(getSpecialistSessionStatusLabel("no_show", translateEn), "No Show");
    assert.equal(getSpecialistSessionStatusLabel("scheduled", translateAr), "مجدولة");
    assert.equal(getSpecialistSessionStatusLabel("custom_status", translateEn), "custom status");
  });

  it("interpolates greeting names without altering provided user data", () => {
    assert.equal(
      translateEn("specialist.dashboard.greeting", { name: "Sara" }),
      "Welcome back, Sara",
    );
    assert.equal(
      translateAr("specialist.dashboard.greeting", { name: "Sara" }),
      "مرحباً بعودتك، Sara",
    );
  });

  it("formats schedule times using app locale rather than hardcoded en-US", () => {
    const sample = new Date("2026-03-15T14:30:00.000Z");
    const enTime = formatSpecialistScheduleTime(sample, "en");
    const arTime = formatSpecialistScheduleTime(sample, "ar");

    assert.ok(enTime);
    assert.ok(arTime);
    assert.notEqual(enTime, arTime);
  });

  it("formats session schedule labels with localized today/tomorrow prefixes", () => {
    const now = new Date(2026, 2, 15, 12, 0, 0);
    const session = {
      scheduledAt: new Date(2026, 2, 15, 15, 0, 0),
      timeLabel: "3:00 PM",
      status: "scheduled",
    };

    const label = formatSpecialistSessionScheduleLabel(session, now, {
      t: translateEn,
      locale: "en",
    });

    assert.match(label, /Today,/);
  });

  it("formats submitted-ago labels with Flutter-aligned wording", () => {
    const thirtyMinutesAgo = new Date(fixedNow.getTime() - 30 * 60 * 1000);
    const submitted = formatSpecialistSubmittedAgo(thirtyMinutesAgo, fixedNow, {
      t: translateEn,
      locale: "en",
    });

    assert.equal(submitted, "Submitted 30m ago");

    const submittedAr = formatSpecialistSubmittedAgo(thirtyMinutesAgo, fixedNow, {
      t: translateAr,
      locale: "ar",
    });

    assert.match(submittedAr, /30/);
  });

  it("falls back to English labels when translator is unavailable", () => {
    assert.equal(getSpecialistDashboardKpiLabel("activeCases", null), "Active Cases");
    assert.equal(getSpecialistSessionStatusLabel("scheduled", null), "Scheduled");
  });
});
