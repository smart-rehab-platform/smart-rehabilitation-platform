import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createTranslator } from "../../../i18n/index.js";
import { formatAppDateTime } from "../../../i18n/formatters.js";
import {
  applyAdminExerciseLocalization,
  buildAdminExerciseCategoryFilterLabels,
  getAdminExercisesLabels,
  getExerciseCategoryLabel,
  getExerciseMediaTypeLabel,
  getExerciseValidationMessage,
} from "./adminExercisesLocalization.js";
import {
  applyAdminSessionLocalization,
  buildAdminSessionStatusFilterOptions,
  formatAdminSessionDateTimeLabel,
  formatAdminSessionDurationLabel,
  formatAdminSessionStatusLabel,
  getAdminSessionsLabels,
} from "./adminSessionsLocalization.js";
import {
  applyAdminReportLocalization,
  buildAdminReportFilterOptions,
  getAdminReportsLabels,
  getReportTypeDisplayLabel,
} from "./adminReportsLocalization.js";
import { EXERCISE_VALIDATION_KEYS } from "../../specialist-dashboard/utils/specialistExercisesLocalization.js";

describe("adminPhaseA4Localization", () => {
  const translateEn = createTranslator("en");
  const translateAr = createTranslator("ar");

  it("resolves exercises page labels in EN and AR", () => {
    const en = getAdminExercisesLabels(translateEn);
    const ar = getAdminExercisesLabels(translateAr);

    assert.equal(en.title, "Exercises");
    assert.equal(ar.title, "التمارين");
    assert.equal(en.addExercise, "Add Exercise");
    assert.equal(ar.searchPlaceholder, "البحث بالعنوان أو الفئة أو التعليمات...");
    assert.equal(en.clearFilters, "Clear filters");
  });

  it("localizes known exercise category labels via shared specialist keys", () => {
    const category = "speech articulation";
    const enLabel = getExerciseCategoryLabel(category, translateEn);
    const arLabel = getExerciseCategoryLabel(category, translateAr);

    assert.equal(category, "speech articulation");
    assert.notEqual(enLabel, category);
    assert.equal(enLabel, translateEn("specialist.exercises.category.speechArticulation"));
    assert.equal(arLabel, translateAr("specialist.exercises.category.speechArticulation"));
  });

  it("preserves raw or dynamic exercise category names", () => {
    const dynamic = "Custom Clinic Category";
    assert.equal(getExerciseCategoryLabel(dynamic, translateEn), dynamic);
    assert.equal(getExerciseCategoryLabel(dynamic, translateAr), dynamic);
  });

  it("keeps exercise title description and instructions unchanged when applying localization", () => {
    const exercise = {
      title: "Tongue Stretch Hold",
      description: "Hold for 5 seconds.",
      instructions: "Step 1: Open mouth.",
      categoryName: "speech articulation",
      language: "en",
      createdAt: "2026-01-15T10:00:00.000Z",
    };

    const localized = applyAdminExerciseLocalization(exercise, { t: translateEn, locale: "en" });

    assert.equal(localized.title, exercise.title);
    assert.equal(localized.description, exercise.description);
    assert.equal(localized.instructions, exercise.instructions);
    assert.notEqual(localized.categoryLabel, exercise.categoryName);
  });

  it("resolves exercise form and validation labels in EN and AR", () => {
    const en = getAdminExercisesLabels(translateEn);
    const ar = getAdminExercisesLabels(translateAr);

    assert.equal(en.form.createTitle, "Create Exercise");
    assert.equal(ar.form.editTitle, "تعديل التمرين");
    assert.equal(
      getExerciseValidationMessage(EXERCISE_VALIDATION_KEYS.TITLE_REQUIRED, translateEn),
      translateEn("specialist.exercises.validation.titleRequired"),
    );
    assert.equal(
      getExerciseValidationMessage(EXERCISE_VALIDATION_KEYS.TITLE_REQUIRED, translateAr),
      translateAr("specialist.exercises.validation.titleRequired"),
    );
  });

  it("localizes exercise media type labels via shared specialist keys", () => {
    assert.equal(getExerciseMediaTypeLabel("video", translateEn), "Video");
    assert.equal(getExerciseMediaTypeLabel("audio", translateAr), translateAr("specialist.exercises.media.type.audio"));
  });

  it("builds exercise category filter labels without changing raw filter values", () => {
    const filters = ["All", "fluency", "Unknown Category"];
    const options = buildAdminExerciseCategoryFilterLabels(filters, { t: translateEn });

    assert.equal(options[0].value, "All");
    assert.equal(options[1].value, "fluency");
    assert.equal(options[2].value, "Unknown Category");
    assert.equal(options[2].label, "Unknown Category");
    assert.notEqual(options[1].label, "fluency");
  });

  it("resolves sessions page labels in EN and AR", () => {
    const en = getAdminSessionsLabels(translateEn);
    const ar = getAdminSessionsLabels(translateAr);

    assert.equal(en.title, "Sessions");
    assert.equal(ar.title, "الجلسات");
    assert.equal(en.columns.dateTime, "Date & Time");
    assert.equal(ar.markNoShow, "تسجيل غياب");
  });

  it("localizes session status labels while preserving raw API values", () => {
    const statuses = ["scheduled", "completed", "cancelled", "no_show"];

    for (const status of statuses) {
      const label = formatAdminSessionStatusLabel(status, false, translateEn);
      assert.equal(status, status);
      assert.notEqual(label, status);
    }

    assert.equal(
      formatAdminSessionStatusLabel("scheduled", false, translateAr),
      translateAr("parent.sessions.status.scheduled"),
    );
  });

  it("localizes derived not completed status for past scheduled sessions", () => {
    const label = formatAdminSessionStatusLabel("scheduled", true, translateEn);
    assert.equal(label, translateEn("admin.patients.sessionStatus.notCompleted"));
    assert.equal(formatAdminSessionStatusLabel("scheduled", true, translateAr), "غير مكتملة");
  });

  it("formats session dates with active app locale", () => {
    const value = "2026-03-10T14:30:00.000Z";
    const enFormatted = formatAdminSessionDateTimeLabel(value, { locale: "en", t: translateEn });
    const arFormatted = formatAdminSessionDateTimeLabel(value, { locale: "ar", t: translateAr });
    const expectedEn = formatAppDateTime(value, "en")?.replace(", ", " • ");

    assert.equal(enFormatted, expectedEn);
    assert.notEqual(enFormatted, arFormatted);
  });

  it("localizes session duration without changing numeric value", () => {
    const enDuration = formatAdminSessionDurationLabel(45, { t: translateEn });
    const arDuration = formatAdminSessionDurationLabel(45, { t: translateAr });

    assert.match(enDuration, /45/);
    assert.match(arDuration, /45/);
    assert.notEqual(enDuration, arDuration);
  });

  it("keeps patient specialist and location content unchanged in session localization", () => {
    const session = {
      patientName: "Layla Hassan",
      specialistName: "Dr. Sami",
      locationOrLink: "Room 3",
      status: "scheduled",
      scheduledAt: "2026-03-10T09:00:00.000Z",
      durationMinutes: 30,
    };

    const localized = applyAdminSessionLocalization(session, { t: translateEn, locale: "en" });

    assert.equal(localized.patientName, session.patientName);
    assert.equal(localized.specialistName, session.specialistName);
    assert.equal(localized.locationOrLink, session.locationOrLink);
    assert.equal(localized.status, session.status);
  });

  it("builds localized session status filter options", () => {
    const options = buildAdminSessionStatusFilterOptions(translateEn);
    assert.equal(options[0].value, "");
    assert.equal(options.find((item) => item.value === "no_show")?.label, "No Show");
  });

  it("resolves reports page labels in EN and AR", () => {
    const en = getAdminReportsLabels(translateEn);
    const ar = getAdminReportsLabels(translateAr);

    assert.equal(en.title, "Reports");
    assert.equal(ar.title, "التقارير");
    assert.equal(en.pdfActions.generatePdf, "Generate PDF");
    assert.equal(ar.pdfActions.viewPdf, "عرض PDF");
  });

  it("localizes report type labels via shared specialist keys", () => {
    assert.equal(getReportTypeDisplayLabel("weekly", translateEn), "Weekly");
    assert.equal(getReportTypeDisplayLabel("weekly", translateAr), translateAr("specialist.reports.type.weekly"));
    assert.equal(getReportTypeDisplayLabel("assessment", translateEn), "Assessment");
  });

  it("preserves raw report type values in underlying data", () => {
    const report = {
      id: "r-1",
      reportType: "monthly",
      title: "Monthly Progress Report",
      patientName: "Omar",
      createdAt: "2026-02-01T08:00:00.000Z",
      isAiReport: false,
      date: "2026-02-01T08:00:00.000Z",
    };

    const localized = applyAdminReportLocalization(report, { t: translateEn, locale: "en" });

    assert.equal(localized.reportType, "monthly");
    assert.notEqual(localized.categoryLabel, "monthly");
  });

  it("keeps report body content unchanged when applying localization", () => {
    const report = {
      id: "ai-1",
      reportType: "weekly",
      title: "AI Weekly Summary",
      summary: "Patient showed improved articulation this week.",
      patientName: "Noor",
      isAiReport: true,
      isAi: true,
      date: "2026-02-01T08:00:00.000Z",
    };

    const localized = applyAdminReportLocalization(report, { t: translateAr, locale: "ar" });

    assert.equal(localized.summary, report.summary);
    assert.equal(localized.title, report.title);
  });

  it("formats report dates with app locale via localization layer", () => {
    const report = {
      id: "r-2",
      reportType: "weekly",
      date: "2026-01-20T12:00:00.000Z",
      isAiReport: false,
    };

    const en = applyAdminReportLocalization(report, { t: translateEn, locale: "en" });
    const ar = applyAdminReportLocalization(report, { t: translateAr, locale: "ar" });

    assert.ok(en.dateLabel);
    assert.ok(ar.dateLabel);
    assert.notEqual(en.dateLabel, ar.dateLabel);
  });

  it("localizes report filter options and PDF action labels", () => {
    const filters = buildAdminReportFilterOptions(translateAr);
    const weekly = filters.find((item) => item.id === "weekly");

    assert.equal(weekly?.label, translateAr("specialist.reports.filters.weekly"));

    const labels = getAdminReportsLabels(translateEn);
    assert.equal(labels.pdfActions.pdfReady, translateEn("specialist.reports.status.pdfReady"));
  });

  it("falls back safely for unknown report types", () => {
    const unknown = "custom_clinic_report";
    const label = getReportTypeDisplayLabel(unknown, translateEn);
    assert.equal(label, "Custom Clinic Report");
    assert.notEqual(label, unknown);
  });

  it("uses English fallback when translation key is missing", () => {
    const labels = getAdminExercisesLabels(null);
    assert.equal(labels.title, "Exercises");
    assert.equal(getAdminSessionsLabels(null).complete, "Complete");
    assert.equal(getAdminReportsLabels(null).viewDetails, "View Details");
  });
});
