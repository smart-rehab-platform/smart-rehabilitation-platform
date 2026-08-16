import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createTranslator } from "../../../i18n/index.js";
import { formatAppDate, formatAppDateTime } from "../../../i18n/formatters.js";
import {
  applyAdminAiCenterLocalization,
  formatAdminAiCenterDateLabel,
  formatAdminAiRecommendationStatusLabel,
  getAdminAiCenterLabels,
} from "./adminAiCenterLocalization.js";
import {
  getRecommendationTypeLabel,
  getRecommendationStatusMeta,
} from "../../specialist-dashboard/utils/specialistAiRecommendationsLocalization.js";
import {
  applyAdminAuditLogLocalization,
  AUDIT_ACTION_CODES,
  AUDIT_ENTITY_CODES,
  buildLocalizedAuditActionOptions,
  buildLocalizedAuditEntityOptions,
  formatAuditActionLabel,
  formatAuditDateTimeLabel,
  formatAuditEntityLabel,
  getAdminAuditLogsLabels,
} from "./adminAuditLogsLocalization.js";
import { mapAdminAuditLog } from "./adminAuditLogsMappers.js";
import { AUDIT_ACTION_FALLBACKS, AUDIT_ENTITY_FALLBACKS } from "./adminAuditLogsConstants.js";

describe("adminPhaseA5Localization", () => {
  const translateEn = createTranslator("en");
  const translateAr = createTranslator("ar");

  it("resolves AI Center page labels in EN and AR", () => {
    const en = getAdminAiCenterLabels(translateEn);
    const ar = getAdminAiCenterLabels(translateAr);

    assert.equal(en.title, "AI Insights");
    assert.equal(ar.title, "رؤى الذكاء الاصطناعي");
    assert.equal(en.kpi.speech, "Speech Analyses");
    assert.equal(ar.kpi.recommendations, "توصيات الذكاء الاصطناعي");
    assert.equal(en.attention.title, "Patients Needing Attention");
    assert.equal(ar.speech.title, "أحدث تحليلات الكلام");
  });

  it("localizes AI recommendation types and statuses without changing raw values", () => {
    const raw = {
      latestRecommendations: [{
        id: "rec-1",
        patientId: "p-1",
        patientName: "Layla Hassan",
        type: "exercise_suggestion",
        status: "pending",
        statusTone: "warning",
      }],
    };

    const localized = applyAdminAiCenterLocalization(raw, { t: translateAr, locale: "ar" });
    const record = localized.latestRecommendations[0];

    assert.equal(record.type, "exercise_suggestion");
    assert.equal(record.status, "pending");
    assert.equal(record.patientName, "Layla Hassan");
    assert.equal(record.typeLabel, getRecommendationTypeLabel("exercise_suggestion", translateAr));
    assert.equal(record.statusLabel, getRecommendationStatusMeta("pending", translateAr).label);
    assert.notEqual(record.typeLabel, "exercise_suggestion");
  });

  it("localizes admin-only recommendation statuses approved and completed", () => {
    assert.equal(
      formatAdminAiRecommendationStatusLabel("approved", translateEn),
      "Approved",
    );
    assert.equal(
      formatAdminAiRecommendationStatusLabel("completed", translateAr),
      translateAr("admin.ai.recommendations.status.completed"),
    );
  });

  it("preserves patient names and speech analysis detail labels in AI Center localization", () => {
    const raw = {
      speechTotal: 2,
      latestSpeechAnalyses: [{
        id: "sa-1",
        patientId: "p-1",
        patientName: "Omar Ali",
        analyzedAtLabel: "Feb 10, 2026",
        detailLabel: "Feb 10, 2026",
      }],
      patientsNeedingAttention: [{
        id: "p-1",
        fullName: "Omar Ali",
      }],
      recommendationsTotal: 0,
      latestRecommendations: [],
      reportsTotal: 0,
      latestReports: [],
      pendingRecommendations: 1,
    };

    const localized = applyAdminAiCenterLocalization(raw, { t: translateAr, locale: "ar" });

    assert.equal(localized.patientsNeedingAttention[0].fullName, "Omar Ali");
    assert.equal(localized.latestSpeechAnalyses[0].patientName, "Omar Ali");
    assert.ok(localized.latestSpeechAnalyses[0].detailLabel);
    assert.equal(
      localized.latestSpeechAnalyses[0].detailLabel,
      localized.latestSpeechAnalyses[0].analyzedAtLabel,
    );
  });

  it("formats AI Center dates using active locale", () => {
    const value = "2026-02-10T09:00:00.000Z";
    const enLabel = formatAdminAiCenterDateLabel(value, { t: translateEn, locale: "en" });
    const arLabel = formatAdminAiCenterDateLabel(value, { t: translateAr, locale: "ar" });

    assert.equal(enLabel, formatAppDate(new Date(value), "en"));
    assert.equal(arLabel, formatAppDate(new Date(value), "ar"));
    assert.notEqual(enLabel, arLabel);
  });

  it("localizes AI report type labels while preserving raw type", () => {
    const raw = {
      speechTotal: 0,
      latestSpeechAnalyses: [],
      recommendationsTotal: 0,
      latestRecommendations: [],
      reportsTotal: 1,
      latestReports: [{
        id: "r-1",
        patientId: "p-1",
        patientName: "Sara Noor",
        type: "weekly",
        typeLabel: "Weekly",
        generatedAtLabel: "Feb 1, 2026",
        detailLabel: "Weekly • Feb 1, 2026",
      }],
    };

    const localized = applyAdminAiCenterLocalization(raw, { t: translateAr, locale: "ar" });
    const report = localized.latestReports[0];

    assert.equal(report.type, "weekly");
    assert.equal(report.patientName, "Sara Noor");
    assert.notEqual(report.typeLabel, "weekly");
    assert.ok(report.detailLabel.includes(report.typeLabel));
  });

  it("resolves audit logs page labels in EN and AR", () => {
    const en = getAdminAuditLogsLabels(translateEn);
    const ar = getAdminAuditLogsLabels(translateAr);

    assert.equal(en.title, "Audit Logs");
    assert.equal(ar.title, "سجلات التدقيق");
    assert.equal(en.columns.dateTime, "Date & Time");
    assert.equal(ar.filters.allActions, "جميع الإجراءات");
  });

  it("maps representative audit action codes in EN and AR while preserving raw action", () => {
    const action = "case_intake_request_create";
    const enLabel = formatAuditActionLabel(action, translateEn);
    const arLabel = formatAuditActionLabel(action, translateAr);

    assert.equal(enLabel, translateEn(`admin.audit.actions.${action}`));
    assert.equal(arLabel, translateAr(`admin.audit.actions.${action}`));
    assert.notEqual(enLabel, action);
    assert.notEqual(arLabel, action);
  });

  it("maps representative audit entity codes in EN and AR while preserving raw entity", () => {
    const entity = "speech_analysis";
    const enLabel = formatAuditEntityLabel(entity, translateEn);
    const arLabel = formatAuditEntityLabel(entity, translateAr);

    assert.equal(enLabel, translateEn(`admin.audit.entities.${entity}`));
    assert.equal(arLabel, translateAr(`admin.audit.entities.${entity}`));
    assert.notEqual(enLabel, entity);
  });

  it("provides non-empty EN and AR labels for every known audit action code", () => {
    assert.equal(AUDIT_ACTION_CODES.length, Object.keys(AUDIT_ACTION_FALLBACKS).length);

    for (const code of AUDIT_ACTION_CODES) {
      const enLabel = formatAuditActionLabel(code, translateEn);
      const arLabel = formatAuditActionLabel(code, translateAr);

      assert.ok(enLabel.trim(), `Missing EN label for action ${code}`);
      assert.ok(arLabel.trim(), `Missing AR label for action ${code}`);
      assert.notEqual(enLabel, code);
      assert.notEqual(arLabel, code);
    }
  });

  it("provides non-empty EN and AR labels for every known audit entity code", () => {
    assert.equal(AUDIT_ENTITY_CODES.length, Object.keys(AUDIT_ENTITY_FALLBACKS).length);

    for (const code of AUDIT_ENTITY_CODES) {
      const enLabel = formatAuditEntityLabel(code, translateEn);
      const arLabel = formatAuditEntityLabel(code, translateAr);

      assert.ok(enLabel.trim(), `Missing EN label for entity ${code}`);
      assert.ok(arLabel.trim(), `Missing AR label for entity ${code}`);
      assert.notEqual(enLabel, code);
      assert.notEqual(arLabel, code);
    }
  });

  it("keeps audit metadata, user names, and emails unchanged when applying localization", () => {
    const mapped = mapAdminAuditLog({
      id: "log-1",
      action: "user_update",
      user_name: "Admin One",
      user_email: "admin.one@example.com",
      entity_name: "patient",
      entity_id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      created_at: "2026-02-10T15:30:00.000Z",
    });

    const localized = applyAdminAuditLogLocalization(mapped, { t: translateAr, locale: "ar" });

    assert.equal(localized.action, "user_update");
    assert.equal(localized.entityName, "patient");
    assert.equal(localized.userName, "Admin One");
    assert.equal(localized.userEmail, "admin.one@example.com");
    assert.equal(localized.entityId, "f47ac10b-58cc-4372-a567-0e02b2c3d479");
    assert.notEqual(localized.actionLabel, localized.action);
    assert.notEqual(localized.entityLabel, localized.entityName);
  });

  it("formats audit timestamps using active locale", () => {
    const createdAt = new Date("2026-02-10T15:30:00.000Z");
    const enLabel = formatAuditDateTimeLabel(createdAt, { t: translateEn, locale: "en" });
    const arLabel = formatAuditDateTimeLabel(createdAt, { t: translateAr, locale: "ar" });

    assert.equal(enLabel, formatAppDateTime(createdAt, "en"));
    assert.equal(arLabel, formatAppDateTime(createdAt, "ar"));
  });

  it("builds localized audit filter options that preserve raw API values", () => {
    const logs = [
      { action: "complaint_submitted", entityName: "complaint" },
      { action: "session_complete", entityName: "session" },
    ];

    const actionOptions = buildLocalizedAuditActionOptions(logs, { t: translateAr, locale: "ar" });
    const entityOptions = buildLocalizedAuditEntityOptions(logs, { t: translateAr, locale: "ar" });

    assert.deepEqual(
      actionOptions.map((option) => option.value).sort(),
      ["complaint_submitted", "session_complete"],
    );
    assert.deepEqual(
      entityOptions.map((option) => option.value).sort(),
      ["complaint", "session"],
    );
    assert.notEqual(actionOptions[0].label, "complaint_submitted");
    assert.notEqual(entityOptions[0].label, "complaint");
  });

  it("falls back to readable English labels when translation function is unavailable", () => {
    assert.equal(formatAuditActionLabel("user_create"), AUDIT_ACTION_FALLBACKS.user_create);
    assert.equal(formatAuditEntityLabel("patient"), AUDIT_ENTITY_FALLBACKS.patient);
  });
});
