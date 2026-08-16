import assert from "node:assert/strict";
import { describe, it } from "node:test";
import ar from "../../../i18n/ar.json" with { type: "json" };
import en from "../../../i18n/en.json" with { type: "json" };
import { formatAppDate } from "../../../i18n/formatters.js";
import {
  applyReportDetailLocalization,
  applyReportListItemLocalization,
  buildReportFilterOptions,
  formatReportDateLabel,
  getReportDisplayTitle,
  getReportTypeBadgeLabel,
  getReportTypeDisplayLabel,
} from "./specialistReportsLocalization.js";

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

function buildReportRow(overrides = {}) {
  return {
    id: "report-1",
    sourceType: "standard",
    patientId: "patient-1",
    patientName: "Omar Ali",
    title: "Weekly Progress Report",
    reportType: "weekly",
    categoryLabel: "Weekly",
    typeBadgeLabel: "Weekly",
    summary: "",
    date: new Date("2026-03-15T10:00:00.000Z"),
    dateLabel: "Mar 15, 2026",
    pdfUrl: null,
    isAi: false,
    isPdfReady: false,
    specialistName: "Dr. Sami",
    ...overrides,
  };
}

describe("specialistReportsLocalization", () => {
  it("maps reports page labels in EN/AR", () => {
    assert.equal(tFactory("en")("specialist.reports.title"), "Reports");
    assert.equal(tFactory("ar")("specialist.reports.title"), "التقارير");
    assert.equal(tFactory("en")("specialist.reports.pdf.generate"), "Generate PDF");
    assert.equal(tFactory("ar")("specialist.reports.pdf.generate"), "إنشاء PDF");
  });

  it("maps report type labels in EN/AR for known types", () => {
    assert.equal(getReportTypeDisplayLabel("weekly", tFactory("en")), "Weekly");
    assert.equal(getReportTypeDisplayLabel("weekly", tFactory("ar")), "أسبوعي");
    assert.equal(getReportTypeDisplayLabel("assessment", tFactory("ar")), "التقييم");
  });

  it("preserves raw report type values while localizing display labels", () => {
    const raw = buildReportRow();

    const localized = applyReportListItemLocalization(raw, {
      t: tFactory("ar"),
      locale: "ar",
    });

    assert.equal(raw.reportType, "weekly");
    assert.equal(raw.patientName, "Omar Ali");
    assert.notEqual(localized.typeBadgeLabel, raw.typeBadgeLabel);
    assert.equal(localized.patientName, "Omar Ali");
  });

  it("preserves patient names and generated report body content", () => {
    const raw = buildReportRow({
      isAi: true,
      sourceType: "ai",
      title: "AI Weekly Summary",
      reportType: "weekly",
      summary: "Patient showed steady improvement in mobility exercises.",
      sections: [{
        title: "AI Summary",
        content: "Patient showed steady improvement in mobility exercises.",
      }],
    });

    const localized = applyReportDetailLocalization(raw, {
      t: tFactory("ar"),
      locale: "ar",
    });

    assert.equal(localized.patientName, "Omar Ali");
    assert.equal(localized.summary, "Patient showed steady improvement in mobility exercises.");
    assert.equal(localized.sections[0].content, localized.summary);
  });

  it("formats report dates using app locale", () => {
    const date = new Date("2026-03-15T10:00:00.000Z");
    const enLabel = formatReportDateLabel(date, "en", tFactory("en"));
    const arLabel = formatReportDateLabel(date, "ar", tFactory("ar"));
    assert.equal(enLabel, formatAppDate(date, "en"));
    assert.equal(arLabel, formatAppDate(date, "ar"));
    assert.notEqual(enLabel, arLabel);
  });

  it("localizes standardized report titles without changing raw title", () => {
    const report = buildReportRow();

    const enTitle = getReportDisplayTitle(report, tFactory("en"));
    const arTitle = getReportDisplayTitle(report, tFactory("ar"));

    assert.equal(report.title, "Weekly Progress Report");
    assert.equal(enTitle, "Weekly Progress Report");
    assert.equal(arTitle, "تقرير التقدم الأسبوعي");
  });

  it("localizes AI report UI labels in EN/AR", () => {
    const report = buildReportRow({
      isAi: true,
      sourceType: "ai",
      title: "AI Monthly Summary",
      reportType: "monthly",
      typeBadgeLabel: "AI Monthly",
    });

    const localized = applyReportListItemLocalization(report, {
      t: tFactory("ar"),
      locale: "ar",
    });

    assert.match(localized.typeBadgeLabel, /ذكاء اصطناعي|شهري/);
    assert.equal(localized.aiBadgeLabel, "ذكاء اصطناعي");
    assert.equal(getReportTypeBadgeLabel(report, tFactory("en")), "AI Monthly");
  });

  it("keeps unknown report type values unchanged", () => {
    assert.equal(getReportTypeDisplayLabel("custom_report", tFactory("en")), "Custom Report");
    assert.equal(getReportTypeDisplayLabel("custom_report", tFactory("ar")), "Custom Report");
  });

  it("maps report filters in EN/AR", () => {
    const filters = buildReportFilterOptions(tFactory("ar"));
    assert.equal(filters.find((item) => item.id === "aiReports")?.label, "تقارير الذكاء الاصطناعي");
    assert.equal(filters.find((item) => item.id === "recent")?.label, "الأحدث");
  });

  it("localizes report section headings while leaving generated summary unchanged", () => {
    const raw = buildReportRow({
      isAi: true,
      sourceType: "ai",
      title: "AI Weekly Summary",
      reportType: "weekly",
      summary: "AI generated weekly summary text.",
      sections: [{
        title: "AI Summary",
        content: "AI generated weekly summary text.",
      }],
    });

    const localized = applyReportDetailLocalization(raw, {
      t: tFactory("ar"),
      locale: "ar",
    });

    assert.equal(localized.sections[0].title, "AI Summary");
    assert.equal(localized.sections[0].titleLabel, "ملخص الذكاء الاصطناعي");
    assert.equal(localized.sections[0].content, "AI generated weekly summary text.");
  });
});
