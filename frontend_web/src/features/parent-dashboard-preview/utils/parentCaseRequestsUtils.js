import { readString } from "./parentDashboardMappers";
import { formatChildDate } from "./parentChildrenUtils";
import {
  formatCaseRequestGenderLabel,
  resolveCaseRequestChildImageUrl,
} from "./parentCaseRequestImageUtils";

const STATUS_LABELS = {
  pending: "Pending Review",
  assigned: "Specialist Assigned",
  under_assessment: "Under Assessment",
  accepted: "Accepted",
  rejected: "Rejected",
  converted_to_patient: "Profile Created",
};

const STATUS_SUBTITLES = {
  pending: "Waiting for admin review.",
  assigned: "Specialist assigned; review starting.",
  under_assessment: "Specialist is assessing the case.",
  accepted: "Case accepted; profile may be created soon.",
  rejected: "Request not accepted. See reason below.",
  converted_to_patient: "Child profile is active.",
};

export function mapCaseCategory(row) {
  const id = readString(row, ["id", "_id"]);
  const name = readString(row, ["name", "title"]) || "Category";
  const isActive = row?.is_active ?? row?.isActive ?? true;

  return { id, name, isActive: Boolean(isActive) };
}

export function mapCaseRequest(row) {
  const status = readString(row, ["status"]) || "pending";
  const category = row?.category && typeof row.category === "object"
    ? mapCaseCategory(row.category)
    : null;

  return {
    id: readString(row, ["id", "_id"]),
    childName: readString(row, ["child_name", "childName"]) || "Child",
    status,
    statusLabel: STATUS_LABELS[status] || status,
    statusSubtitle: STATUS_SUBTITLES[status] || "",
    caseDescription: readString(row, ["case_description", "caseDescription"]),
    observedDifficulties: readString(row, ["observed_difficulties", "observedDifficulties"]),
    dateOfBirth: readString(row, ["date_of_birth", "dateOfBirth"]),
    gender: readString(row, ["gender"]),
    genderLabel: formatCaseRequestGenderLabel(readString(row, ["gender"])),
    childImageUrl: resolveCaseRequestChildImageUrl(
      readString(row, ["child_image_url", "childImageUrl"]),
    ),
    categoryId: readString(row, ["category_id", "categoryId"]),
    categoryName: category?.name || readString(row, ["category_name", "categoryName"]),
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
    submittedLabel: formatChildDate(readString(row, [
      "submitted_at",
      "submittedAt",
      "created_at",
      "createdAt",
    ])),
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

export function mapCaseRequests(rows) {
  if (!Array.isArray(rows)) {
    return [];
  }

  return rows
    .map(mapCaseRequest)
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

export const CASE_REQUESTS_EMPTY_MESSAGE =
  "You have not submitted any case requests yet.";

export const CASE_REQUESTS_FILTERED_EMPTY_MESSAGE =
  "No case requests match your search or filters.";

export const CASE_REQUEST_STATUS_FILTER_OPTIONS = [
  { id: "all", label: "All statuses" },
  { id: "pending", label: "Pending Review" },
  { id: "assigned", label: "Specialist Assigned" },
  { id: "under_assessment", label: "Under Assessment" },
  { id: "accepted", label: "Accepted" },
  { id: "rejected", label: "Rejected" },
  { id: "converted_to_patient", label: "Profile Created" },
];

export const CASE_REQUEST_SORT_OPTIONS = [
  { id: "newest", label: "Newest first" },
  { id: "oldest", label: "Oldest first" },
  { id: "alphabetical", label: "Alphabetical" },
];

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

export const PREFERRED_CONTACT_PERIODS = [
  { value: "morning", label: "Morning" },
  { value: "afternoon", label: "Afternoon" },
  { value: "evening", label: "Evening" },
  { value: "flexible", label: "Flexible" },
];

export const CASE_REQUEST_GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
];
