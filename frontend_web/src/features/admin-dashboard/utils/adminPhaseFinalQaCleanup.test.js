import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createTranslator } from "../../../i18n/index.js";
import { getAdminWeekdayLabels } from "./adminDashboardLocalization.js";
import {
  applyAdminPatientDetailsLocalization,
} from "./adminPatientsLocalization.js";
import {
  formatAuditActionLabel,
  formatAuditEntityLabel,
} from "./adminAuditLogsLocalization.js";
import {
  getAdminNotificationsLabels,
} from "./adminNotificationsLocalization.js";
import { localizeProfileErrorMessage as localizeAdminProfileErrorMessage } from "./adminProfileLocalization.js";

describe("adminPhaseFinalQaCleanup", () => {
  const translateEn = createTranslator("en");
  const translateAr = createTranslator("ar");

  it("uses shared specialist shell brand keys for admin sidebar branding", () => {
    assert.equal(translateEn("specialist.shell.brandTitle"), "Smart Rehabilitation");
    assert.equal(translateEn("specialist.shell.brandSubtitle"), "Where Recovery Never Stops");
    assert.equal(translateAr("specialist.shell.brandTitle"), "Smart Rehabilitation");
    assert.equal(translateAr("specialist.shell.brandSubtitle"), "Where Recovery Never Stops");
  });

  it("localizes admin weekday fallback labels in EN and AR", () => {
    const enShort = getAdminWeekdayLabels("en", "short");
    const arShort = getAdminWeekdayLabels("ar", "short");

    assert.equal(enShort.length, 7);
    assert.equal(arShort.length, 7);
    assert.equal(enShort[0], "Mon");
    assert.notEqual(arShort[0], "Mon");
    assert.match(arShort[0], /[\u0600-\u06FF]/);
  });

  it("re-localizes patient note and submission timestamps without changing raw data", () => {
    const details = {
      diagnosis: "Cerebral palsy",
      notes: [{
        id: "n1",
        note: "Clinical note body",
        specialistName: "Dr. Noor",
        createdAt: "2026-02-02T09:00:00.000Z",
        createdAtLabel: "Feb 2, 2026, 12:00 PM",
      }],
      recentSubmissions: [{
        id: "s1",
        reviewStatus: "reviewed",
        reviewStatusRaw: "reviewed",
        mediaTypeLabel: "Video",
        submittedAt: "2026-03-01T10:00:00.000Z",
        submittedAtLabel: "Mar 1, 2026, 1:00 PM",
      }],
    };

    const en = applyAdminPatientDetailsLocalization(details, { t: translateEn, locale: "en" });
    const ar = applyAdminPatientDetailsLocalization(details, { t: translateAr, locale: "ar" });

    assert.equal(en.notes[0].note, "Clinical note body");
    assert.equal(en.notes[0].createdAt, "2026-02-02T09:00:00.000Z");
    assert.notEqual(en.notes[0].createdAtLabel, ar.notes[0].createdAtLabel);
    assert.notEqual(en.recentSubmissions[0].submittedAtLabel, ar.recentSubmissions[0].submittedAtLabel);
  });

  it("localizes admin profile session image refresh error", () => {
    const message = "Session refresh did not return the updated profile image.";
    const ar = localizeAdminProfileErrorMessage(message, translateAr);

    assert.notEqual(ar, message);
    assert.match(ar, /[\u0600-\u06FF]/);
  });

  it("localizes support attachment validation and upload error keys", () => {
    const invalidEn = translateEn("supportRequests.errors.attachmentInvalidType");
    const invalidAr = translateAr("supportRequests.errors.attachmentInvalidType");
    const largeAr = translateAr("supportRequests.errors.attachmentTooLarge");
    const urlAr = translateAr("supportRequests.errors.attachmentUrlMissing");

    assert.match(invalidEn, /Unsupported attachment type/i);
    assert.notEqual(invalidEn, invalidAr);
    assert.match(invalidAr, /[\u0600-\u06FF]/);
    assert.match(largeAr, /[\u0600-\u06FF]/);
    assert.match(urlAr, /[\u0600-\u06FF]/);
  });

  it("uses generic localized fallback keys for unknown case assignment errors", () => {
    const assignFailed = translateAr("admin.caseRequests.toast.assignFailed");
    const categoryMismatch = translateAr("admin.caseRequests.toast.specialistCategoryMismatch");
    const stalePending = translateAr("admin.caseRequests.toast.stalePending");

    assert.match(assignFailed, /[\u0600-\u06FF]/);
    assert.match(categoryMismatch, /[\u0600-\u06FF]/);
    assert.match(stalePending, /[\u0600-\u06FF]/);
    assert.notEqual(assignFailed, "Failed to assign specialist.");
  });

  it("maps known specialist category mismatch assignment message key", () => {
    const en = translateEn("admin.caseRequests.toast.specialistCategoryMismatch");
    const ar = translateAr("admin.caseRequests.toast.specialistCategoryMismatch");

    assert.match(en, /case category/i);
    assert.notEqual(en, ar);
  });

  it("uses localized unknown audit code fallbacks in Arabic", () => {
    const action = formatAuditActionLabel("future_custom_action", translateAr);
    const entity = formatAuditEntityLabel("future_custom_entity", translateAr);

    assert.equal(action, translateAr("admin.audit.unknownAction"));
    assert.equal(entity, translateAr("admin.audit.unknownEntity"));
    assert.ok(!/Future Custom Action/.test(action));
    assert.ok(!/Future Custom Entity/.test(entity));
  });

  it("uses localized admin role for greeting fallback", () => {
    assert.equal(translateEn("roles.admin"), "Admin");
    assert.equal(translateAr("roles.admin"), "المسؤول");
  });

  it("exposes localized notifications refresh label", () => {
    const en = getAdminNotificationsLabels(translateEn);
    const ar = getAdminNotificationsLabels(translateAr);

    assert.equal(en.refresh, "Refresh");
    assert.equal(ar.refresh, "تحديث");
  });
});
