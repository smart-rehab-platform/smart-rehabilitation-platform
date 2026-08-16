import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createTranslator } from "../../../i18n/index.js";
import { getAdminSupportRequestsLabels } from "./adminSupportRequestsLocalization.js";
import {
  getCaseRequestCategoryLabel,
  getCaseRequestStatusLabel,
} from "../../specialist-dashboard/utils/specialistCaseRequestsLocalization.js";
import {
  getParentComplaintCategoryLabel,
  getParentComplaintStatusLabel,
} from "../../parent-dashboard-preview/utils/parentComplaintsLocalization.js";
import {
  getSupportRequestCategoryLabel,
  getSupportRequestStatusLabel,
} from "../../shared-dashboard/utils/supportRequestLocalization.js";

describe("adminPhaseA3Localization", () => {
  const translateEn = createTranslator("en");
  const translateAr = createTranslator("ar");

  it("resolves case requests page labels in EN and AR", () => {
    assert.equal(translateEn("admin.caseRequests.title"), "Case Requests");
    assert.equal(translateAr("admin.caseRequests.title"), "طلبات الحالات");
    assert.equal(translateEn("admin.caseRequests.columns.child"), "Child");
    assert.equal(translateAr("admin.caseRequests.columns.parent"), "ولي الأمر");
    assert.equal(
      translateEn("admin.caseRequests.toast.assignSuccess"),
      "Specialist assigned successfully.",
    );
  });

  it("localizes case request status labels via shared specialist keys without changing raw values", () => {
    const status = "under_assessment";
    const categoryName = "Custom Clinic Category";
    const statusLabel = getCaseRequestStatusLabel(status, translateEn);
    const categoryLabel = getCaseRequestCategoryLabel(categoryName, translateEn);

    assert.equal(status, "under_assessment");
    assert.equal(categoryName, "Custom Clinic Category");
    assert.notEqual(statusLabel, status);
    assert.equal(
      getCaseRequestStatusLabel(status, translateAr),
      translateAr("specialist.caseRequests.status.under_assessment"),
    );
    assert.equal(categoryLabel, categoryName);
  });

  it("uses converted_to_patient Arabic label from shared specialist.caseRequests.status", () => {
    assert.equal(
      getCaseRequestStatusLabel("converted_to_patient", translateEn),
      "Profile Created",
    );
    assert.equal(
      getCaseRequestStatusLabel("converted_to_patient", translateAr),
      "تم إنشاء الملف",
    );
  });

  it("resolves complaints page labels in EN and AR", () => {
    assert.equal(translateEn("admin.complaints.title"), "Complaints Management");
    assert.equal(translateAr("admin.complaints.title"), "إدارة الشكاوى");
    assert.equal(translateEn("admin.complaints.actions.startReview"), "Start Review");
    assert.equal(translateAr("admin.complaints.actions.reject"), "رفض الشكوى");
    assert.equal(translateEn("admin.complaints.loadMore"), "Load more");
  });

  it("localizes complaint status labels while preserving raw API values", () => {
    const status = "under_review";
    const category = "poor_follow_up";
    const statusLabel = getParentComplaintStatusLabel(status, translateEn);
    const categoryLabel = getParentComplaintCategoryLabel(category, translateEn);

    assert.equal(status, "under_review");
    assert.equal(category, "poor_follow_up");
    assert.notEqual(statusLabel, status);
    assert.notEqual(categoryLabel, category);
    assert.equal(
      getParentComplaintStatusLabel(status, translateAr),
      translateAr("parent.complaints.status.under_review"),
    );
  });

  it("resolves support requests page labels in EN and AR", () => {
    const en = getAdminSupportRequestsLabels(translateEn);
    const ar = getAdminSupportRequestsLabels(translateAr);

    assert.equal(en.title, "Support Requests");
    assert.equal(ar.title, "طلبات الدعم");
    assert.equal(en.markInProgress, "Mark In Progress");
    assert.equal(ar.statusDialog.markResolvedTitle, "وضع محلول؟");
    assert.equal(en.columns.subject, "Subject");
    assert.equal(ar.toast.replySent, "تم إرسال الرد بنجاح.");
  });

  it("localizes support request values via shared supportRequests.* without changing raw values", () => {
    const status = "in_progress";
    const category = "technical_issue";
    const statusLabel = getSupportRequestStatusLabel(status, translateEn);
    const categoryLabel = getSupportRequestCategoryLabel(category, translateEn);

    assert.equal(status, "in_progress");
    assert.equal(category, "technical_issue");
    assert.equal(statusLabel, translateEn("supportRequests.status.inProgress"));
    assert.equal(
      getSupportRequestStatusLabel(status, translateAr),
      translateAr("supportRequests.status.inProgress"),
    );
    assert.notEqual(categoryLabel, category);
  });

  it("reuses shared supportRequests column labels in admin support labels", () => {
    const en = getAdminSupportRequestsLabels(translateEn);
    const ar = getAdminSupportRequestsLabels(translateAr);

    assert.equal(en.columns.specialist, translateEn("supportRequests.specialist"));
    assert.equal(en.columns.lastActivity, translateEn("supportRequests.lastActivity"));
    assert.equal(ar.columns.created, translateAr("supportRequests.created"));
  });

  it("falls back to English labels when translation keys are missing", () => {
    const missing = (key) => key;

    assert.equal(getAdminSupportRequestsLabels(missing).resolveRequest, "Resolve Request");
    assert.equal(translateEn("admin.caseRequests.title"), "Case Requests");
    assert.equal(translateEn("admin.complaints.loadMore"), "Load more");
  });
});
