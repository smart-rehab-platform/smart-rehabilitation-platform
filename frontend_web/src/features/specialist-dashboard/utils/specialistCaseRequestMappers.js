export const CASE_REQUEST_STATUS_ALL = "all";
export const CASE_REQUEST_CATEGORY_ALL = "all";

/** Filter dropdown options — Flutter specialist list order/labels. */
export const CASE_REQUEST_STATUS_FILTERS = [
  { id: CASE_REQUEST_STATUS_ALL, label: "All Statuses", apiValue: null },
  { id: "assigned", label: "Assigned", apiValue: "assigned" },
  { id: "under_assessment", label: "Under Assessment", apiValue: "under_assessment" },
  { id: "accepted", label: "Accepted", apiValue: "accepted" },
  { id: "converted_to_patient", label: "Converted to Patient", apiValue: "converted_to_patient" },
  { id: "rejected", label: "Rejected", apiValue: "rejected" },
];

const STATUS_CHIP_LABELS = {
  pending: "Pending Review",
  assigned: "Specialist Assigned",
  under_assessment: "Under Assessment",
  accepted: "Accepted",
  rejected: "Rejected",
  converted_to_patient: "Profile Created",
};

const STATUS_TONES = {
  pending: "warning",
  assigned: "blue",
  under_assessment: "blue",
  accepted: "success",
  rejected: "danger",
  converted_to_patient: "success",
};

function readString(record, keys) {
  if (!record || typeof record !== "object") {
    return "";
  }
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return "";
}

function readNullableString(record, keys) {
  const value = readString(record, keys);
  return value || null;
}

function parseStatus(value) {
  const normalized = typeof value === "string" ? value.trim().toLowerCase() : "";
  if (
    normalized === "pending"
    || normalized === "assigned"
    || normalized === "under_assessment"
    || normalized === "accepted"
    || normalized === "rejected"
    || normalized === "converted_to_patient"
  ) {
    return normalized;
  }
  return "assigned";
}

function parseDate(value) {
  if (!value) {
    return null;
  }
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatCaseRequestDate(value) {
  const date = parseDate(value);
  if (!date) {
    return null;
  }
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatCaseRequestDateTime(value) {
  const date = parseDate(value);
  if (!date) {
    return null;
  }
  const datePart = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const timePart = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  return `${datePart} · ${timePart}`;
}

export function getCaseRequestStatusChipLabel(status) {
  return STATUS_CHIP_LABELS[parseStatus(status)] || "Assigned";
}

export function getCaseRequestStatusTone(status) {
  return STATUS_TONES[parseStatus(status)] || "blue";
}

export function formatCaseRequestGender(gender) {
  const normalized = typeof gender === "string" ? gender.trim().toLowerCase() : "";
  if (normalized === "male") return "Male";
  if (normalized === "female") return "Female";
  if (normalized === "other") return "Other";
  return gender?.trim() || "—";
}

export function formatPreferredContactPeriod(value) {
  const normalized = typeof value === "string" ? value.trim().toLowerCase() : "";
  switch (normalized) {
    case "morning":
      return "Morning";
    case "afternoon":
      return "Afternoon";
    case "evening":
      return "Evening";
    case "flexible":
      return "Flexible";
    default:
      return value?.trim() || "—";
  }
}

export function calculateAgeYears(dateOfBirth, now = new Date()) {
  const dob = parseDate(dateOfBirth);
  if (!dob) {
    return null;
  }
  let age = now.getFullYear() - dob.getFullYear();
  const monthDiff = now.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) {
    age -= 1;
  }
  return age >= 0 ? age : null;
}

export function formatAgeLabel(dateOfBirth) {
  const age = calculateAgeYears(dateOfBirth);
  if (age === null) {
    return "Unavailable";
  }
  return age === 1 ? "1 year" : `${age} years`;
}

function mapParentSummary(row, { includeContact = false } = {}) {
  if (!row || typeof row !== "object") {
    return null;
  }
  const parent = {
    id: readNullableString(row, ["id", "_id"]),
    fullName: readString(row, ["full_name", "fullName"]) || "Parent",
    profileImageUrl: readNullableString(row, ["profile_image_url", "profileImageUrl"]),
  };
  if (includeContact) {
    parent.email = readNullableString(row, ["email"]);
    parent.phone = readNullableString(row, ["phone"]);
  }
  return parent;
}

function mapCategory(row) {
  if (!row || typeof row !== "object") {
    return null;
  }
  return {
    id: readNullableString(row, ["id", "_id"]),
    name: readString(row, ["name", "title"]) || "Category",
    description: readNullableString(row, ["description"]),
    isActive: row.is_active !== false && row.isActive !== false,
  };
}

function guessAttachmentKind(fileType, fileUrl, originalName) {
  const haystack = `${fileType || ""} ${fileUrl || ""} ${originalName || ""}`.toLowerCase();
  if (haystack.includes("pdf") || haystack.endsWith(".pdf")) return "pdf";
  if (haystack.includes("image") || /\.(jpg|jpeg|png|webp|gif)/.test(haystack)) return "image";
  if (haystack.includes("audio") || /\.(mp3|m4a|wav|aac)/.test(haystack)) return "audio";
  if (haystack.includes("video") || /\.(mp4|mov)/.test(haystack)) return "video";
  return "file";
}

export function mapCaseRequestAttachment(row) {
  if (!row || typeof row !== "object") {
    return null;
  }
  const id = readString(row, ["id", "_id"]);
  const fileUrl = readNullableString(row, ["file_url", "fileUrl"]);
  if (!id && !fileUrl) {
    return null;
  }
  const originalName = readNullableString(row, ["original_name", "originalName"]);
  const fileType = readNullableString(row, ["file_type", "fileType"]);
  const kind = guessAttachmentKind(fileType, fileUrl, originalName);
  const typeLabel = kind === "pdf"
    ? "PDF"
    : kind === "image"
      ? "Image"
      : kind === "audio"
        ? "Audio"
        : kind === "video"
          ? "Video"
          : (fileType || "File");

  return {
    id: id || fileUrl,
    fileUrl,
    fileType,
    originalName,
    displayName: originalName || "Attachment",
    kind,
    typeLabel,
    createdAt: parseDate(row.created_at ?? row.createdAt),
  };
}

export function mapSpecialistCaseRequestListItem(row) {
  if (!row || typeof row !== "object") {
    return null;
  }
  const id = readString(row, ["id", "_id"]);
  if (!id) {
    return null;
  }

  const status = parseStatus(row.status);
  const assignedAt = parseDate(row.assigned_at ?? row.assignedAt);
  const submittedAt = parseDate(row.submitted_at ?? row.submittedAt);
  const attachmentCount = Number(row.attachment_count ?? row.attachmentCount ?? 0) || 0;
  const conversationId = readNullableString(row, ["conversation_id", "conversationId"]);
  const dateLabel = assignedAt
    ? `Assigned ${formatCaseRequestDate(assignedAt)}`
    : submittedAt
      ? `Submitted ${formatCaseRequestDate(submittedAt)}`
      : "Date unavailable";

  return {
    id,
    childName: readString(row, ["child_name", "childName"]) || "Unnamed child",
    status,
    statusLabel: getCaseRequestStatusChipLabel(status),
    statusTone: getCaseRequestStatusTone(status),
    category: mapCategory(row.category),
    categoryName: mapCategory(row.category)?.name || "",
    parent: mapParentSummary(row.parent),
    parentName: mapParentSummary(row.parent)?.fullName || "",
    assignedAt,
    submittedAt,
    acceptedAt: parseDate(row.accepted_at ?? row.acceptedAt),
    convertedAt: parseDate(row.converted_at ?? row.convertedAt),
    dateLabel,
    attachmentCount,
    attachmentCountLabel: attachmentCount === 1 ? "1 attachment" : `${attachmentCount} attachments`,
    conversationId,
    conversationAvailable: Boolean(conversationId),
    patientId: readNullableString(row, ["patient_id", "patientId"]),
    dateOfBirth: parseDate(row.date_of_birth ?? row.dateOfBirth),
    gender: readNullableString(row, ["gender"]),
    childImageUrl: readNullableString(row, ["child_image_url", "childImageUrl"]),
  };
}

export function mapSpecialistCaseRequestList(rows) {
  if (!Array.isArray(rows)) {
    return [];
  }
  return rows.map(mapSpecialistCaseRequestListItem).filter(Boolean);
}

export function mapCaseCategoryItem(row) {
  const category = mapCategory(row);
  if (!category?.id) {
    return null;
  }
  return category;
}

export function mapCaseCategoryList(rows) {
  if (!Array.isArray(rows)) {
    return [];
  }
  return rows
    .map(mapCaseCategoryItem)
    .filter((item) => item && item.isActive !== false)
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Flutter timeline: Assigned → Under Assessment → Accepted → Converted
 * (labels/subtitles match specialist_case_request_details_screen.dart)
 */
export function buildCaseRequestTimelineSteps(detail) {
  const status = detail?.status || "assigned";
  const assignedLabel = formatCaseRequestDateTime(detail?.assignedAt);
  const acceptedLabel = formatCaseRequestDateTime(detail?.acceptedAt);
  const convertedLabel = formatCaseRequestDateTime(detail?.convertedAt);

  const base = [
    { id: "assigned", title: "Assigned" },
    { id: "under_assessment", title: "Under Assessment" },
    { id: "accepted", title: "Accepted" },
    { id: "converted", title: "Converted" },
  ];

  const withStates = (states, subtitles = {}) => base.map((step, index) => ({
    ...step,
    state: states[index] || "upcoming",
    subtitle: subtitles[step.id] || null,
  }));

  if (status === "rejected") {
    return withStates(
      ["completed", "upcoming", "upcoming", "upcoming"],
      { assigned: assignedLabel },
    );
  }
  if (status === "under_assessment") {
    return withStates(
      ["completed", "current", "upcoming", "upcoming"],
      { assigned: assignedLabel, under_assessment: "In progress" },
    );
  }
  if (status === "accepted") {
    return withStates(
      ["completed", "completed", "current", "upcoming"],
      { assigned: assignedLabel, accepted: acceptedLabel },
    );
  }
  if (status === "converted_to_patient") {
    return withStates(
      ["completed", "completed", "completed", "completed"],
      {
        assigned: assignedLabel,
        accepted: acceptedLabel,
        converted: convertedLabel,
      },
    );
  }
  return withStates(
    ["current", "upcoming", "upcoming", "upcoming"],
    { assigned: assignedLabel },
  );
}

export function mapSpecialistCaseRequestDetail(row) {
  if (!row || typeof row !== "object") {
    return null;
  }
  const id = readString(row, ["id", "_id"]);
  if (!id) {
    return null;
  }

  const status = parseStatus(row.status);
  const assignedAt = parseDate(row.assigned_at ?? row.assignedAt);
  const submittedAt = parseDate(row.submitted_at ?? row.submittedAt);
  const dateOfBirth = parseDate(row.date_of_birth ?? row.dateOfBirth);
  const attachments = Array.isArray(row.attachments)
    ? row.attachments.map(mapCaseRequestAttachment).filter(Boolean)
    : [];
  const parent = mapParentSummary(row.parent, { includeContact: true });
  const category = mapCategory(row.category);
  const hasPreviousDiagnosis = Boolean(
    row.has_previous_diagnosis ?? row.hasPreviousDiagnosis,
  );
  const isCurrentlyReceivingTreatment = Boolean(
    row.is_currently_receiving_treatment ?? row.isCurrentlyReceivingTreatment,
  );

  const headerDate = assignedAt
    ? `Assigned ${formatCaseRequestDate(assignedAt)}`
    : submittedAt
      ? `Submitted ${formatCaseRequestDate(submittedAt)}`
      : "Unavailable";

  const detail = {
    id,
    childName: readString(row, ["child_name", "childName"]) || "Unnamed child",
    status,
    statusLabel: getCaseRequestStatusChipLabel(status),
    statusTone: getCaseRequestStatusTone(status),
    category,
    categoryName: category?.name || "",
    parent,
    parentName: parent?.fullName || "",
    parentId: readNullableString(row, ["parent_id", "parentId"]) || parent?.id || null,
    assignedSpecialistId: readNullableString(row, ["assigned_specialist_id", "assignedSpecialistId"]),
    assignedAt,
    submittedAt,
    acceptedAt: parseDate(row.accepted_at ?? row.acceptedAt),
    convertedAt: parseDate(row.converted_at ?? row.convertedAt),
    headerDateLabel: headerDate,
    dateOfBirth,
    dateOfBirthLabel: formatCaseRequestDate(dateOfBirth) || "Not provided",
    ageLabel: formatAgeLabel(dateOfBirth),
    gender: readNullableString(row, ["gender"]),
    genderLabel: (() => {
      const normalized = typeof row.gender === "string" ? row.gender.trim().toLowerCase() : "";
      if (normalized === "male") return "Male";
      if (normalized === "female") return "Female";
      if (normalized === "other") return "Other";
      if (typeof row.gender === "string" && row.gender.trim()) return row.gender.trim();
      return "Not provided";
    })(),
    childImageUrl: readNullableString(row, ["child_image_url", "childImageUrl"]),
    caseDescription: readNullableString(row, ["case_description", "caseDescription"]),
    observedDifficulties: readNullableString(row, ["observed_difficulties", "observedDifficulties"]),
    preferredContactPeriod: readNullableString(row, ["preferred_contact_period", "preferredContactPeriod"]),
    preferredContactPeriodLabel: (() => {
      const raw = row.preferred_contact_period ?? row.preferredContactPeriod;
      if (!raw || (typeof raw === "string" && !raw.trim())) {
        return "Not provided";
      }
      return formatPreferredContactPeriod(raw);
    })(),
    hasPreviousDiagnosis,
    previousDiagnosisDetails: readNullableString(row, [
      "previous_diagnosis_details",
      "previousDiagnosisDetails",
    ]),
    isCurrentlyReceivingTreatment,
    currentTreatmentDetails: readNullableString(row, [
      "current_treatment_details",
      "currentTreatmentDetails",
    ]),
    assessmentNotes: readNullableString(row, ["assessment_notes", "assessmentNotes"]) || "",
    rejectionReason: readNullableString(row, ["rejection_reason", "rejectionReason"]),
    attachments,
    attachmentCount: attachments.length
      || Number(row.attachment_count ?? row.attachmentCount ?? 0)
      || 0,
    conversationId: readNullableString(row, ["conversation_id", "conversationId"]),
    patientId: readNullableString(row, ["patient_id", "patientId"]),
    canStartAssessment: status === "assigned",
    canEditAssessmentNotes: status === "under_assessment",
    canAcceptOrReject: status === "under_assessment",
    isConverted: status === "converted_to_patient",
    isRejected: status === "rejected",
    showReadOnlyNotes: status !== "assigned"
      && status !== "under_assessment"
      && Boolean(readNullableString(row, ["assessment_notes", "assessmentNotes"])),
  };

  detail.timelineSteps = buildCaseRequestTimelineSteps(detail);
  return detail;
}

export function getCaseRequestListEmptyMessage({ hasItems, hasFilters }) {
  if (!hasItems && hasFilters) {
    return "No case requests match the selected filters.";
  }
  if (!hasItems) {
    return "No assigned case requests yet. Assigned cases will appear here after an admin selects you for a request.";
  }
  return null;
}

export function yesNoLabel(value) {
  return value ? "Yes" : "No";
}
