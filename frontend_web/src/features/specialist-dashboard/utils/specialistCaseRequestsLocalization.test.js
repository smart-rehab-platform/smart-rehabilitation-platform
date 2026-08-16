import assert from "node:assert/strict";
import { describe, it } from "node:test";
import ar from "../../../i18n/ar.json" with { type: "json" };
import en from "../../../i18n/en.json" with { type: "json" };
import {
  applyCaseRequestListItemLocalization,
  buildCaseRequestStatusFilters,
  formatCaseRequestDisplayDate,
  getCaseRequestCategoryLabel,
  getCaseRequestStatusLabel,
} from "./specialistCaseRequestsLocalization.js";

function tFactory(locale) {
  const messages = locale === "ar" ? ar : en;
  return (key, params) => {
    const parts = key.split(".");
    let value = messages;
    for (const part of parts) {
      value = value?.[part];
    }
    if (typeof value !== "string") {
      return key;
    }
    return Object.entries(params || {}).reduce(
      (result, [name, paramValue]) => result.replace(`{${name}}`, String(paramValue)),
      value,
    );
  };
}

describe("specialistCaseRequestsLocalization", () => {
  it("maps all case request status values consistently in EN/AR", () => {
    const statuses = [
      "pending",
      "assigned",
      "under_assessment",
      "accepted",
      "rejected",
      "converted_to_patient",
    ];

    assert.deepEqual(
      statuses.map((status) => getCaseRequestStatusLabel(status, tFactory("en"))),
      [
        "Pending Review",
        "Specialist Assigned",
        "Under Assessment",
        "Accepted",
        "Rejected",
        "Profile Created",
      ],
    );

    assert.equal(getCaseRequestStatusLabel("converted_to_patient", tFactory("en")), "Profile Created");
    assert.equal(getCaseRequestStatusLabel("converted_to_patient", tFactory("ar")), "تم إنشاء الملف");
  });

  it("builds localized status filters with unchanged API ids", () => {
    const filters = buildCaseRequestStatusFilters(tFactory("ar"));
    assert.equal(filters.find((item) => item.id === "assigned")?.apiValue, "assigned");
    assert.equal(filters.find((item) => item.id === "converted_to_patient")?.label, "تم إنشاء الملف");
    assert.equal(filters.find((item) => item.id === "all")?.label, "جميع الحالات");
  });

  it("formats case request dates using app locale", () => {
    const value = "2026-07-26T14:22:00.000Z";
    assert.match(formatCaseRequestDisplayDate(value, "en"), /Jul/);
    assert.match(formatCaseRequestDisplayDate(value, "ar"), /يوليو|‏/);
  });

  it("maps known categories and preserves unknown free-text categories", () => {
    assert.equal(
      getCaseRequestCategoryLabel("Behavioral Therapy", tFactory("en")),
      "Behavioral Therapy",
    );
    assert.equal(
      getCaseRequestCategoryLabel("Behavioral Therapy", tFactory("ar")),
      "العلاج السلوكي",
    );
    assert.equal(getCaseRequestCategoryLabel("Custom Clinic Category", tFactory("en")), "Custom Clinic Category");
  });

  it("localizes list presentation without changing child or status values", () => {
    const item = {
      id: "req-1",
      childName: "bana",
      status: "converted_to_patient",
      assignedAt: new Date("2026-07-26T14:22:00.000Z"),
      submittedAt: null,
      attachmentCount: 2,
      category: { name: "Behavioral Therapy" },
    };

    const localized = applyCaseRequestListItemLocalization(item, {
      t: tFactory("ar"),
      locale: "ar",
    });

    assert.equal(localized.childName, "bana");
    assert.equal(localized.status, "converted_to_patient");
    assert.equal(localized.statusLabel, "تم إنشاء الملف");
    assert.match(localized.dateLabel, /تعيين/);
    assert.equal(localized.attachmentCountLabel, "2 مرفقات");
  });
});
