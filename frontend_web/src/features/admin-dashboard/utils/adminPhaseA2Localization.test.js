import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createTranslator } from "../../../i18n/index.js";
import {
  applyAdminUserLocalization,
  formatAdminPresenceLabel,
  getAdminUsersLabels,
  getAdminUserRoleOptions,
  validateAddUserFormLocalized,
} from "./adminUsersLocalization.js";
import {
  applyAdminPatientLocalization,
  formatAdminPatientGender,
  formatAdminPreviousSessionDateTime,
  getAdminPatientsLabels,
  getAdminPatientDetailsLabels,
} from "./adminPatientsLocalization.js";
import {
  formatAdminRelationshipLabel,
  getAdminAssignmentsLabels,
  getAdminRelationshipOptions,
} from "./adminPatientAssignmentsLocalization.js";

describe("adminPhaseA2Localization", () => {
  const translateEn = createTranslator("en");
  const translateAr = createTranslator("ar");
  const fixedNow = new Date("2026-08-16T12:00:00.000Z");

  it("resolves users page labels in EN and AR", () => {
    const en = getAdminUsersLabels(translateEn);
    const ar = getAdminUsersLabels(translateAr);

    assert.equal(en.title, "Users");
    assert.equal(ar.title, "المستخدمون");
    assert.equal(en.columns.lastSeen, "Last Seen");
    assert.equal(ar.columns.lastSeen, "آخر ظهور");
  });

  it("localizes role labels through shared roles.* without changing raw values", () => {
    const user = applyAdminUserLocalization(
      {
        id: "1",
        fullName: "Sara",
        email: "s@x.com",
        role: "specialist",
        isActive: true,
        roleTone: "cyan",
        avatarInitial: "S",
      },
      { t: translateEn, locale: "en" },
    );

    assert.equal(user.role, "specialist");
    assert.equal(user.roleLabel, "Specialist");
    assert.equal(
      applyAdminUserLocalization(user, { t: translateAr, locale: "ar" }).roleLabel,
      "الأخصائي",
    );
  });

  it("localizes active/inactive status labels in EN and AR", () => {
    const en = getAdminUsersLabels(translateEn);
    const ar = getAdminUsersLabels(translateAr);

    assert.equal(en.statusActive, "Active");
    assert.equal(en.statusInactive, "Inactive");
    assert.equal(ar.statusActive, "نشط");
    assert.equal(ar.statusInactive, "غير نشط");
  });

  it("formats presence/last-seen labels in EN and AR", () => {
    const online = formatAdminPresenceLabel({ isOnline: true }, fixedNow, {
      t: translateEn,
      locale: "en",
    });
    const twoHoursAgo = formatAdminPresenceLabel(
      { isOnline: false, lastSeen: new Date(fixedNow.getTime() - 2 * 60 * 60 * 1000) },
      fixedNow,
      { t: translateEn, locale: "en" },
    );
    const arPresence = formatAdminPresenceLabel(
      { isOnline: false, lastSeen: new Date(fixedNow.getTime() - 45 * 60 * 1000) },
      fixedNow,
      { t: translateAr, locale: "ar" },
    );

    assert.equal(online, "Online");
    assert.equal(twoHoursAgo, "Last seen 2h ago");
    assert.equal(arPresence, "آخر ظهور منذ 45 د");
  });

  it("validates add-user form messages in EN and AR", () => {
    const enError = validateAddUserFormLocalized(
      { fullName: "", email: "", password: "", role: "" },
      { isPasswordValid: () => false },
      { t: translateEn, locale: "en" },
    );
    const arError = validateAddUserFormLocalized(
      { fullName: "", email: "", password: "", role: "" },
      { isPasswordValid: () => false },
      { t: translateAr, locale: "ar" },
    );

    assert.equal(enError, "Full name is required.");
    assert.equal(arError, "الاسم الكامل مطلوب.");
  });

  it("preserves user names and emails during localization", () => {
    const localized = applyAdminUserLocalization(
      {
        id: "1",
        fullName: "Alaa Hassan",
        email: "alaa@example.com",
        role: "admin",
        isActive: true,
      },
      { t: translateEn, locale: "en" },
    );

    assert.equal(localized.fullName, "Alaa Hassan");
    assert.equal(localized.email, "alaa@example.com");
  });

  it("resolves patients page labels and gender labels in EN and AR", () => {
    assert.equal(getAdminPatientsLabels(translateEn).title, "Patients");
    assert.equal(getAdminPatientsLabels(translateAr).title, "المرضى");
    assert.equal(formatAdminPatientGender("male", { t: translateEn }), "Male");
    assert.equal(formatAdminPatientGender("female", { t: translateAr }), "أنثى");
  });

  it("preserves patient names and diagnosis text during localization", () => {
    const patient = applyAdminPatientLocalization(
      {
        id: "p1",
        fullName: "Omar Ali",
        gender: "male",
        condition: "Cerebral Palsy",
        initials: "OA",
      },
      { t: translateEn, locale: "en" },
    );

    assert.equal(patient.fullName, "Omar Ali");
    assert.equal(patient.condition, "Cerebral Palsy");
    assert.equal(patient.conditionLabel, "Cerebral Palsy");
  });

  it("formats previous session date/time using active locale", () => {
    const sample = new Date("2026-03-10T14:30:00.000Z");
    const enLabel = formatAdminPreviousSessionDateTime(sample, { t: translateEn, locale: "en" });
    const arLabel = formatAdminPreviousSessionDateTime(sample, { t: translateAr, locale: "ar" });

    assert.ok(enLabel);
    assert.ok(arLabel);
    assert.notEqual(enLabel, arLabel);
  });

  it("localizes session status display while preserving raw API values", () => {
    const patient = applyAdminPatientLocalization(
      {
        id: "p1",
        fullName: "Test",
        gender: "male",
        condition: null,
        previousSession: {
          id: "s1",
          scheduledAt: new Date("2026-03-01T10:00:00.000Z"),
          status: "completed",
          isPastScheduledNotCompleted: false,
          statusTone: "success",
        },
      },
      { t: translateAr, locale: "ar" },
    );

    assert.equal(patient.previousSession.status, "completed");
    assert.notEqual(patient.previousSession.statusLabel, "Completed");
  });

  it("resolves patient detail section labels in EN and AR", () => {
    const en = getAdminPatientDetailsLabels(translateEn);
    const ar = getAdminPatientDetailsLabels(translateAr);

    assert.equal(en.back, "Back to Patients");
    assert.equal(ar.back, "العودة إلى المرضى");
    assert.equal(en.stats.activeGoals, "Active Goals");
    assert.equal(ar.stats.pendingReviews, "المراجعات المعلّقة");
  });

  it("localizes assignments page and relationship labels in EN and AR", () => {
    const en = getAdminAssignmentsLabels(translateEn);
    const ar = getAdminAssignmentsLabels(translateAr);

    assert.equal(en.title, "Patient Assignments");
    assert.equal(ar.title, "إسناد المرضى");
    assert.equal(formatAdminRelationshipLabel("mother", { t: translateEn }), "Mother");
    assert.equal(formatAdminRelationshipLabel("father", { t: translateAr }), "الأب");
  });

  it("preserves raw relationship values and user names in assignment mappers", () => {
    const link = {
      parentId: "p1",
      parentName: "Nadia Ali",
      relationship: "mother",
      email: "n@x.com",
    };

    assert.equal(link.relationship, "mother");
    assert.equal(link.parentName, "Nadia Ali");
    assert.equal(
      formatAdminRelationshipLabel(link.relationship, { t: translateAr }),
      "الأم",
    );
  });

  it("exposes relationship options with stable raw values", () => {
    const options = getAdminRelationshipOptions({ t: translateEn, locale: "en" });
    assert.deepEqual(options.map((option) => option.value), ["mother", "father", "guardian", "other"]);
    assert.equal(options[0].label, "Mother");
  });

  it("falls back to English labels when translation keys are missing", () => {
    const missing = (key) => key;
    assert.equal(getAdminUsersLabels(missing).title, "Users");
    assert.equal(getAdminPatientsLabels(missing).searchPlaceholder, "Search patients or condition");
    assert.equal(getAdminAssignmentsLabels(missing).unlink, "Unlink");
    assert.equal(getAdminUserRoleOptions(missing)[0].label, "Admin");
  });
});
