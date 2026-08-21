import { readString } from "./parentDashboardMappers";
import {
  buildCaseRequestGenderOptions,
  buildCaseRequestSortOptions,
  buildCaseRequestStatusFilterOptions,
  buildPreferredContactPeriodOptions,
  CASE_REQUEST_GENDER_OPTIONS,
  CASE_REQUESTS_EMPTY_MESSAGE,
  CASE_REQUESTS_FILTERED_EMPTY_MESSAGE,
  CASE_REQUEST_SORT_OPTIONS,
  CASE_REQUEST_STATUS_FILTER_OPTIONS,
  formatCaseRequestSubmittedDate,
  getCaseRequestCategoryLabel,
  getCaseRequestStatusLabel,
  getCaseRequestStatusSubtitle,
  getCaseRequestsEmptyMessage,
  getCaseRequestsFilteredEmptyMessage,
  getDefaultChildLabel,
  PREFERRED_CONTACT_PERIODS,
} from "./parentCaseRequestsLocalization";
import {
  formatCaseRequestGenderLabel,
  resolveCaseRequestChildImageUrl,
} from "./parentCaseRequestImageUtils";
import { formatChildDate } from "./parentChildrenUtils";
import { resolveMapperContext } from "./parentLocalizationCore";

export {
  buildCaseRequestGenderOptions,
  buildCaseRequestSortOptions,
  buildCaseRequestStatusFilterOptions,
  buildPreferredContactPeriodOptions,
  CASE_REQUEST_GENDER_OPTIONS,
  CASE_REQUESTS_EMPTY_MESSAGE,
  CASE_REQUESTS_FILTERED_EMPTY_MESSAGE,
  CASE_REQUEST_SORT_OPTIONS,
  CASE_REQUEST_STATUS_FILTER_OPTIONS,
  getCaseRequestsEmptyMessage,
  getCaseRequestsFilteredEmptyMessage,
  PREFERRED_CONTACT_PERIODS,
};

export function mapCaseCategory(row, options = {}) {
  const { t } = resolveMapperContext(options);
  const id = readString(row, ["id", "_id"]);
  const rawName = readString(row, ["name", "title"]);
  const name = getCaseRequestCategoryLabel(rawName, t);
  const isActive = row?.is_active ?? row?.isActive ?? true;

  return { id, name, isActive: Boolean(isActive) };
}

export function mapCaseRequest(row, options = {}) {
  const { t, locale } = resolveMapperContext(options);
  const status = readString(row, ["status"]) || "pending";
  const category = row?.category && typeof row.category === "object"
    ? mapCaseCategory(row.category, options)
    : null;

  return {
    id: readString(row, ["id", "_id"]),
    childName: readString(row, ["child_name", "childName"]) || getDefaultChildLabel(t),
    status,
    statusLabel: getCaseRequestStatusLabel(status, t),
    statusSubtitle: getCaseRequestStatusSubtitle(status, t),
    caseDescription: readString(row, ["case_description", "caseDescription"]),
    observedDifficulties: readString(row, ["observed_difficulties", "observedDifficulties"]),
    dateOfBirth: readString(row, ["date_of_birth", "dateOfBirth"]),
    gender: readString(row, ["gender"]),
    genderLabel: formatCaseRequestGenderLabel(readString(row, ["gender"]), t),
    childImageUrl: resolveCaseRequestChildImageUrl(
      readString(row, ["child_image_url", "childImageUrl"])
        || readString(row, [
          "patient_profile_image_url",
          "patientProfileImageUrl",
        ]),
    ),
    patientId: readString(row, ["patient_id", "patientId"]),
    categoryId: readString(row, ["category_id", "categoryId"]),
    categoryName: category
      ? category.name
      : getCaseRequestCategoryLabel(readString(row, ["category_name", "categoryName"]), t),
    hasPreviousDiagnosis: Boolean(row?.has_previous_diagnosis ?? row?.hasPreviousDiagnosis),
    previousDiagnosisDetails: readString(row, [
      "previous_diagnosis_details",
      "previousDiagnosisDetails",
    ]),
    isCurrentlyReceivingTreatment: Boolean(
      row?.is_currently_receiving_treatment ?? row?.isCurrentlyReceivingTreatment,
    ),
    currentTreatmentDetails: readString(row, [
      "current_treatment_details",
      "currentTreatmentDetails",
    ]),
    preferredContactPeriod: readString(row, [
      "preferred_contact_period",
      "preferredContactPeriod",
    ]),
    rejectionReason: readString(row, ["rejection_reason", "rejectionReason"]),
    submittedAt: readString(row, ["submitted_at", "submittedAt", "created_at", "createdAt"]),
    submittedLabel: formatCaseRequestSubmittedDate(readString(row, [
      "submitted_at",
      "submittedAt",
      "created_at",
      "createdAt",
    ]), locale, t) ?? formatChildDate(readString(row, [
      "submitted_at",
      "submittedAt",
      "created_at",
      "createdAt",
    ]), locale, t),
    attachmentCount: Number(row?.attachment_count ?? row?.attachmentCount ?? 0) || 0,
    canEdit: status === "pending",
    conversationId: readString(row, ["conversation_id", "conversationId"]),
    assignedSpecialistName: readString(row, [
      "assigned_specialist_name",
      "assignedSpecialistName",
    ]) || (row?.assigned_specialist && typeof row.assigned_specialist === "object"
      ? readString(row.assigned_specialist, ["full_name", "fullName", "name"])
      : null),
  };
}

export function mapCaseRequests(rows, options = {}) {
  if (!Array.isArray(rows)) {
    return [];
  }

  return rows
    .map((row) => mapCaseRequest(row, options))
    .filter((request) => request.id)
    .sort((left, right) => {
      const leftTime = left.submittedAt ? Date.parse(left.submittedAt) : 0;
      const rightTime = right.submittedAt ? Date.parse(right.submittedAt) : 0;
      return rightTime - leftTime;
    });
}

export function buildCaseRequestPayload(form, { childImageUrl } = {}) {
  const payload = {
    child_name: form.childName?.trim(),
    date_of_birth: form.dateOfBirth,
    gender: form.gender?.trim(),
    category_id: form.categoryId,
    case_description: form.caseDescription?.trim(),
    has_previous_diagnosis: Boolean(form.hasPreviousDiagnosis),
    is_currently_receiving_treatment: Boolean(form.isCurrentlyReceivingTreatment),
    preferred_contact_period: form.preferredContactPeriod,
  };

  if (childImageUrl !== undefined) {
    payload.child_image_url = childImageUrl;
  }

  if (form.observedDifficulties?.trim()) {
    payload.observed_difficulties = form.observedDifficulties.trim();
  }

  if (form.hasPreviousDiagnosis && form.previousDiagnosisDetails?.trim()) {
    payload.previous_diagnosis_details = form.previousDiagnosisDetails.trim();
  }

  if (form.isCurrentlyReceivingTreatment && form.currentTreatmentDetails?.trim()) {
    payload.current_treatment_details = form.currentTreatmentDetails.trim();
  }

  return payload;
}

/**
 * @param {ReturnType<typeof mapCaseRequest>[]} requests
 * @param {{ search?: string, status?: string }} filters
 */
export function filterCaseRequests(requests, { search = "", status = "all" } = {}) {
  const query = search.trim().toLowerCase();

  return requests.filter((request) => {
    if (status !== "all" && request.status !== status) {
      return false;
    }

    if (!query) {
      return true;
    }

    const haystack = [
      request.childName,
      request.categoryName,
      request.statusLabel,
      request.statusSubtitle,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(query);
  });
}

/**
 * @param {ReturnType<typeof mapCaseRequest>[]} requests
 * @param {string} sortKey
 */
export function sortCaseRequests(requests, sortKey = "newest") {
  const sorted = [...requests];

  if (sortKey === "oldest") {
    return sorted.sort((left, right) => {
      const leftTime = left.submittedAt ? Date.parse(left.submittedAt) : 0;
      const rightTime = right.submittedAt ? Date.parse(right.submittedAt) : 0;
      return leftTime - rightTime;
    });
  }

  if (sortKey === "alphabetical") {
    return sorted.sort((left, right) =>
      (left.childName || "").localeCompare(right.childName || "", undefined, {
        sensitivity: "base",
      }),
    );
  }

  return sorted.sort((left, right) => {
    const leftTime = left.submittedAt ? Date.parse(left.submittedAt) : 0;
    const rightTime = right.submittedAt ? Date.parse(right.submittedAt) : 0;
    return rightTime - leftTime;
  });
}
