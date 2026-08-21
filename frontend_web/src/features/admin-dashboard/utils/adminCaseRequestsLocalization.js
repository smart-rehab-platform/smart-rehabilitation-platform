import {
  CASE_INTAKE_STATUS_VALUES,
  getCaseIntakeStatusTone,
} from "./adminCaseRequestsMappers.js";
import { resolveAdminMapperContext } from "./adminDashboardLocalization.js";
import {
  formatCaseRequestAttachmentCountLabel,
  formatCaseRequestDisplayDate,
  formatCaseRequestDisplayDateTime,
  formatCaseRequestAgeLabel,
  formatCaseRequestGenderLabel,
  formatPreferredContactPeriodLabel,
  getCaseRequestCategoryLabel,
  getCaseRequestStatusLabel,
  yesNoLabel,
} from "../../specialist-dashboard/utils/specialistCaseRequestsLocalization.js";

function translateKey(t, key, fallback, params) {
  if (typeof t === "function") {
    const translated = t(key, params);
    if (translated && translated !== key) {
      return translated;
    }
  }

  if (params && typeof fallback === "string") {
    return Object.entries(params).reduce(
      (result, [name, value]) => result.replace(`{${name}}`, String(value)),
      fallback,
    );
  }

  return fallback;
}

export function getAdminCaseRequestsLabels(t = null) {
  return {
    title: translateKey(t, "admin.caseRequests.title", "Case Requests"),
    subtitle: translateKey(
      t,
      "admin.caseRequests.subtitle",
      "Review preliminary child case requests and track their current status.",
    ),
    toolbarAriaLabel: translateKey(t, "admin.caseRequests.toolbarAriaLabel", "Case requests toolbar"),
    searchAriaLabel: translateKey(
      t,
      "specialist.caseRequests.filters.searchLabel",
      "Search by child name",
    ),
    searchPlaceholder: translateKey(
      t,
      "specialist.caseRequests.filters.searchPlaceholder",
      "Search by child name",
    ),
    statusFilterAriaLabel: translateKey(
      t,
      "admin.caseRequests.statusFilterAriaLabel",
      "Filter by status",
    ),
    categoryFilterAriaLabel: translateKey(
      t,
      "specialist.caseRequests.filters.categoryLabel",
      "Category",
    ),
    allStatuses: translateKey(t, "specialist.caseRequests.filters.allStatuses", "All Statuses"),
    allCategories: translateKey(t, "specialist.caseRequests.filters.allCategories", "All Categories"),
    tableAriaLabel: translateKey(t, "admin.caseRequests.tableAriaLabel", "Case requests list"),
    columns: {
      child: translateKey(t, "admin.caseRequests.columns.child", "Child"),
      parent: translateKey(t, "admin.caseRequests.columns.parent", "Parent"),
      category: translateKey(t, "admin.caseRequests.columns.category", "Category"),
      status: translateKey(t, "admin.caseRequests.columns.status", "Status"),
      submitted: translateKey(t, "admin.caseRequests.columns.submitted", "Submitted"),
      attachments: translateKey(t, "admin.caseRequests.columns.attachments", "Attachments"),
      view: translateKey(t, "admin.caseRequests.columns.view", "View"),
    },
    view: translateKey(t, "admin.caseRequests.view", "View"),
    loading: translateKey(t, "admin.caseRequests.loading", "Loading case requests..."),
    loadingMore: translateKey(t, "specialist.caseRequests.loadingMore", "Loading more..."),
    loadMore: translateKey(t, "admin.caseRequests.loadMore", "Load more"),
    submittedBy: (name) => translateKey(
      t,
      "admin.caseRequests.submittedBy",
      "Submitted by {name}",
      { name },
    ),
    submittedOn: (date) => translateKey(
      t,
      "specialist.caseRequests.submittedOn",
      "Submitted {date}",
      { date },
    ),
    requestId: (id) => translateKey(
      t,
      "admin.caseRequests.requestId",
      "ID: {id}",
      { id },
    ),
    profileCreated: translateKey(t, "specialist.caseRequests.profileCreated", "Patient profile created successfully."),
    patientProfileId: (id) => translateKey(
      t,
      "admin.caseRequests.patientProfileId",
      "Patient profile ID: {id}",
      { id },
    ),
    copyAria: translateKey(t, "specialist.caseRequests.copy", "Copy"),
    copyEmailAria: translateKey(t, "admin.caseRequests.copyEmailAria", "Copy email"),
    copyPhoneAria: translateKey(t, "admin.caseRequests.copyPhoneAria", "Copy phone"),
    open: translateKey(t, "parent.attachments.open", "Open"),
    unavailable: translateKey(t, "specialist.caseRequests.age.unavailable", "Unavailable"),
    fileTypeDefault: translateKey(t, "specialist.caseRequests.attachmentType.file", "File"),
    licenseLabel: (number) => translateKey(
      t,
      "admin.caseRequests.licenseLabel",
      "License: {number}",
      { number },
    ),
    empty: translateKey(
      t,
      "admin.caseRequests.empty",
      "No case requests have been submitted yet.",
    ),
    emptyFiltered: translateKey(
      t,
      "admin.caseRequests.emptyFiltered",
      "No case requests match your search or filters.",
    ),
    loadFailed: translateKey(t, "admin.caseRequests.loadFailed", "Failed to load case requests."),
    retry: translateKey(t, "common.retry", "Retry"),
    back: translateKey(t, "specialist.caseRequests.back", "Back to Case Requests"),
    loadingDetails: translateKey(t, "specialist.caseRequests.loadingDetails", "Loading case request..."),
    notFound: translateKey(t, "specialist.caseRequests.notFound", "Case request not found."),
    assignSpecialist: translateKey(t, "admin.caseRequests.assignSpecialist", "Assign Specialist"),
    statusTimeline: translateKey(t, "specialist.caseRequests.statusTimeline", "Status Timeline"),
    caseOverviewSection: translateKey(
      t,
      "admin.caseRequests.caseOverviewSection",
      "Case Information",
    ),
    careTeam: translateKey(t, "admin.caseRequests.careTeam", "Care Team"),
    childInformation: translateKey(t, "specialist.caseRequests.childInformation", "Child Information"),
    caseInformation: translateKey(t, "specialist.caseRequests.caseInformation", "Case Information"),
    previousDiagnosisTreatment: translateKey(
      t,
      "specialist.caseRequests.previousDiagnosisTreatment",
      "Previous Diagnosis & Treatment",
    ),
    parentInformation: translateKey(t, "specialist.caseRequests.parentInformation", "Parent Information"),
    attachments: translateKey(t, "specialist.caseRequests.attachments", "Attachments"),
    noAttachments: translateKey(t, "specialist.caseRequests.noAttachments", "No attachments"),
    noAttachmentsForCase: translateKey(
      t,
      "admin.caseRequests.noAttachmentsForCase",
      "No attachments for this case.",
    ),
    assignedSpecialist: translateKey(t, "admin.caseRequests.assignedSpecialist", "Assigned Specialist"),
    noSpecialistAssigned: translateKey(
      t,
      "admin.caseRequests.noSpecialistAssigned",
      "No specialist assigned yet.",
    ),
    rejectionReason: translateKey(t, "specialist.caseRequests.rejectionReason", "Rejection Reason"),
    assessmentNotes: translateKey(
      t,
      "specialist.caseRequests.preliminaryAssessmentNotes",
      "Preliminary Assessment Notes",
    ),
    copyEmail: translateKey(t, "specialist.caseRequests.copyEmail", "Email copied"),
    copyPhone: translateKey(t, "specialist.caseRequests.copyPhone", "Phone number copied"),
    copyFailed: translateKey(t, "specialist.caseRequests.copyFailed", "Unable to copy."),
    fields: {
      dateOfBirth: translateKey(t, "specialist.caseRequests.fields.dateOfBirth", "Date of birth"),
      age: translateKey(t, "specialist.caseRequests.fields.age", "Age"),
      gender: translateKey(t, "specialist.caseRequests.fields.gender", "Gender"),
      caseDescription: translateKey(t, "specialist.caseRequests.fields.caseDescription", "Case description"),
      observedDifficulties: translateKey(
        t,
        "specialist.caseRequests.fields.observedDifficulties",
        "Observed difficulties",
      ),
      preferredContactPeriod: translateKey(
        t,
        "specialist.caseRequests.fields.preferredContactPeriod",
        "Preferred contact period",
      ),
      previousDiagnosis: translateKey(
        t,
        "specialist.caseRequests.fields.previousDiagnosis",
        "Previous diagnosis",
      ),
      diagnosisDetails: translateKey(
        t,
        "specialist.caseRequests.fields.diagnosisDetails",
        "Diagnosis details",
      ),
      currentlyReceivingTreatment: translateKey(
        t,
        "specialist.caseRequests.fields.currentlyReceivingTreatment",
        "Currently receiving treatment",
      ),
      treatmentDetails: translateKey(
        t,
        "specialist.caseRequests.fields.treatmentDetails",
        "Treatment details",
      ),
      email: translateKey(t, "specialist.caseRequests.fields.email", "Email"),
      phone: translateKey(t, "specialist.caseRequests.fields.phone", "Phone"),
      specialization: translateKey(t, "admin.caseRequests.fields.specialization", "Specialization"),
      licenseNumber: translateKey(t, "admin.caseRequests.fields.licenseNumber", "License number"),
    },
    specialistsPage: {
      title: translateKey(t, "admin.caseRequests.specialistsPage.title", "Assign Specialist"),
      subtitle: translateKey(
        t,
        "admin.caseRequests.specialistsPage.subtitle",
        "Select a specialist to assign to this case.",
      ),
      back: translateKey(t, "admin.caseRequests.specialistsPage.back", "Back to case request"),
      loading: translateKey(t, "admin.caseRequests.specialistsPage.loading", "Loading specialists..."),
      empty: translateKey(
        t,
        "admin.caseRequests.specialistsPage.empty",
        "No matching specialists are available.",
      ),
      continue: translateKey(t, "admin.caseRequests.specialistsPage.continue", "Continue"),
      activePatients: (count) => translateKey(
        t,
        "admin.caseRequests.specialistsPage.activePatients",
        "{count} Active Patients",
        { count },
      ),
      currentRequests: (count) => translateKey(
        t,
        "admin.caseRequests.specialistsPage.currentRequests",
        "{count} Current Requests",
        { count },
      ),
      yearsExperience: (count) => translateKey(
        t,
        "admin.caseRequests.specialistsPage.yearsExperience",
        "{count} Years",
        { count },
      ),
      oneYearExperience: translateKey(t, "admin.caseRequests.specialistsPage.oneYearExperience", "1 Year"),
    },
    dialogs: {
      assignTitle: translateKey(t, "admin.caseRequests.dialogs.assignTitle", "Assign Specialist"),
      assignBody: (name) => translateKey(
        t,
        "admin.caseRequests.dialogs.assignBody",
        "Assign {name} to this case request?",
        { name },
      ),
      assignBodyGeneric: translateKey(
        t,
        "admin.caseRequests.dialogs.assignBodyGeneric",
        "Assign this specialist to the case request?",
      ),
      assignConfirm: translateKey(t, "admin.caseRequests.dialogs.assignConfirm", "Assign Specialist"),
      assigning: translateKey(t, "admin.caseRequests.dialogs.assigning", "Assigning..."),
      cancel: translateKey(t, "common.cancel", "Cancel"),
    },
    toast: {
      assignSuccess: translateKey(
        t,
        "admin.caseRequests.toast.assignSuccess",
        "Specialist assigned successfully.",
      ),
      assignFailed: translateKey(
        t,
        "admin.caseRequests.toast.assignFailed",
        "Failed to assign specialist.",
      ),
      stalePending: translateKey(
        t,
        "admin.caseRequests.toast.stalePending",
        "This case request is no longer pending and cannot be assigned.",
      ),
      specialistCategoryMismatch: translateKey(
        t,
        "admin.caseRequests.toast.specialistCategoryMismatch",
        "The selected specialist is not assigned to this case category.",
      ),
      loadSpecialistsFailed: translateKey(
        t,
        "admin.caseRequests.toast.loadSpecialistsFailed",
        "Failed to load matching specialists.",
      ),
      detailsLoadFailed: translateKey(
        t,
        "admin.caseRequests.loadFailed",
        "Failed to load case requests.",
      ),
    },
    emptyDisplay: translateKey(t, "parent.common.emptyDisplay", "—"),
    notProvided: translateKey(t, "specialist.caseRequests.notProvided", "Not provided"),
  };
}

export function buildAdminCaseStatusFilterOptions(t = null) {
  return CASE_INTAKE_STATUS_VALUES.map((value) => ({
    value,
    label: getCaseRequestStatusLabel(value, t),
  }));
}

export function formatAdminCaseDateLabel(value, context = {}) {
  const { locale } = resolveAdminMapperContext(context);
  return formatCaseRequestDisplayDate(value, locale)
    ?? translateKey(context.t, "parent.common.emptyDisplay", "—");
}

export function formatAdminCaseDateTimeLabel(value, context = {}) {
  const { locale, t } = resolveAdminMapperContext(context);
  return formatCaseRequestDisplayDateTime(value, locale)
    ?? translateKey(t, "parent.common.emptyDisplay", "—");
}

export function buildAdminCaseRequestTimelineSteps({
  status,
  submittedAtRaw,
  assignedAtRaw,
  acceptedAtRaw,
  convertedAtRaw,
}, context = {}) {
  const { t, locale } = resolveAdminMapperContext(context);
  const submittedSubtitle = formatCaseRequestDisplayDateTime(submittedAtRaw, locale);
  const assignedSubtitle = formatCaseRequestDisplayDateTime(assignedAtRaw, locale);
  const acceptedSubtitle = formatCaseRequestDisplayDateTime(acceptedAtRaw, locale);
  const convertedSubtitle = formatCaseRequestDisplayDateTime(convertedAtRaw, locale);
  const inProgressSubtitle = translateKey(
    t,
    "specialist.caseRequests.timeline.inProgress",
    "In progress",
  );

  const steps = [
    {
      key: "submitted",
      label: translateKey(t, "admin.caseRequests.timeline.submitted", "Submitted"),
    },
    {
      key: "assigned",
      label: translateKey(t, "specialist.caseRequests.timeline.assigned", "Assigned"),
    },
    {
      key: "underAssessment",
      label: translateKey(t, "specialist.caseRequests.timeline.underAssessment", "Under Assessment"),
    },
    {
      key: "accepted",
      label: translateKey(t, "specialist.caseRequests.timeline.accepted", "Accepted"),
    },
    {
      key: "converted",
      label: translateKey(t, "specialist.caseRequests.timeline.converted", "Converted"),
    },
  ];

  if (status === "rejected") {
    const assignedCompleted = Boolean(assignedAtRaw);
    return [
      { ...steps[0], state: "completed", subtitle: submittedSubtitle },
      { ...steps[1], state: assignedCompleted ? "completed" : "incomplete", subtitle: assignedCompleted ? assignedSubtitle : null },
      { ...steps[2], state: "incomplete", subtitle: null },
      { ...steps[3], state: "incomplete", subtitle: null },
      { ...steps[4], state: "incomplete", subtitle: null },
    ];
  }

  switch (status) {
    case "assigned":
      return [
        { ...steps[0], state: "completed", subtitle: submittedSubtitle },
        { ...steps[1], state: "current", subtitle: assignedSubtitle },
        { ...steps[2], state: "incomplete", subtitle: null },
        { ...steps[3], state: "incomplete", subtitle: null },
        { ...steps[4], state: "incomplete", subtitle: null },
      ];
    case "under_assessment":
      return [
        { ...steps[0], state: "completed", subtitle: submittedSubtitle },
        { ...steps[1], state: "completed", subtitle: assignedSubtitle },
        { ...steps[2], state: "current", subtitle: inProgressSubtitle },
        { ...steps[3], state: "incomplete", subtitle: null },
        { ...steps[4], state: "incomplete", subtitle: null },
      ];
    case "accepted":
      return [
        { ...steps[0], state: "completed", subtitle: submittedSubtitle },
        { ...steps[1], state: "completed", subtitle: assignedSubtitle },
        { ...steps[2], state: "completed", subtitle: null },
        { ...steps[3], state: "current", subtitle: acceptedSubtitle },
        { ...steps[4], state: "incomplete", subtitle: null },
      ];
    case "converted_to_patient":
      return [
        { ...steps[0], state: "completed", subtitle: submittedSubtitle },
        { ...steps[1], state: "completed", subtitle: assignedSubtitle },
        { ...steps[2], state: "completed", subtitle: null },
        { ...steps[3], state: "completed", subtitle: acceptedSubtitle },
        { ...steps[4], state: "completed", subtitle: convertedSubtitle },
      ];
    case "pending":
    default:
      return [
        { ...steps[0], state: "current", subtitle: submittedSubtitle },
        { ...steps[1], state: "incomplete", subtitle: null },
        { ...steps[2], state: "incomplete", subtitle: null },
        { ...steps[3], state: "incomplete", subtitle: null },
        { ...steps[4], state: "incomplete", subtitle: null },
      ];
  }
}

export function applyAdminCaseInboxItemLocalization(item, context = {}) {
  if (!item) {
    return item;
  }

  const { t } = resolveAdminMapperContext(context);

  return {
    ...item,
    statusLabel: getCaseRequestStatusLabel(item.status, t),
    statusTone: getCaseIntakeStatusTone(item.status),
    categoryName: getCaseRequestCategoryLabel(item.categoryName, t),
    submittedLabel: formatAdminCaseDateLabel(item.submittedAtRaw, context),
    attachmentCountLabel: formatCaseRequestAttachmentCountLabel(item.attachmentCount, t),
  };
}

export function applyAdminCaseInboxItemsLocalization(items, context = {}) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.map((item) => applyAdminCaseInboxItemLocalization(item, context));
}

export function applyAdminMatchingSpecialistLocalization(specialist, context = {}) {
  if (!specialist) {
    return specialist;
  }

  const { t } = resolveAdminMapperContext(context);
  const labels = getAdminCaseRequestsLabels(t);
  const years = specialist.yearsOfExperience;

  return {
    ...specialist,
    yearsLabel: years == null
      ? labels.emptyDisplay
      : years === 1
        ? labels.specialistsPage.oneYearExperience
        : labels.specialistsPage.yearsExperience(years),
    activeCasesLabel: labels.specialistsPage.activePatients(specialist.activeCasesCount ?? 0),
    currentRequestsLabel: labels.specialistsPage.currentRequests(specialist.currentRequestsCount ?? 0),
  };
}

export function applyAdminMatchingSpecialistsLocalization(specialists, context = {}) {
  if (!Array.isArray(specialists)) {
    return [];
  }

  return specialists.map((specialist) => applyAdminMatchingSpecialistLocalization(specialist, context));
}

export function applyAdminCaseRequestDetailLocalization(detail, context = {}) {
  if (!detail) {
    return detail;
  }

  const { t } = resolveAdminMapperContext(context);
  const labels = getAdminCaseRequestsLabels(t);
  const notProvided = labels.notProvided;

  const localizedAttachments = (detail.attachments ?? []).map((attachment) => ({
    ...attachment,
    createdAtLabel: formatAdminCaseDateTimeLabel(attachment.createdAtRaw ?? attachment.createdAt, context)
      ?? attachment.createdAtLabel,
  }));

  return {
    ...detail,
    statusLabel: getCaseRequestStatusLabel(detail.status, t),
    statusTone: getCaseIntakeStatusTone(detail.status),
    categoryName: getCaseRequestCategoryLabel(detail.categoryName, t),
    submittedLabel: formatAdminCaseDateLabel(detail.submittedAtRaw, context) || notProvided,
    assignedAtLabel: formatAdminCaseDateTimeLabel(detail.assignedAtRaw, context),
    acceptedAtLabel: formatAdminCaseDateTimeLabel(detail.acceptedAtRaw, context),
    convertedAtLabel: formatAdminCaseDateTimeLabel(detail.convertedAtRaw, context),
    dateOfBirthLabel: formatAdminCaseDateLabel(detail.dateOfBirthRaw, context) || notProvided,
    ageLabel: formatCaseRequestAgeLabel(detail.dateOfBirthRaw, t),
    genderLabel: formatCaseRequestGenderLabel(detail.genderRaw ?? detail.gender, t),
    preferredContactPeriodLabel: formatPreferredContactPeriodLabel(
      detail.preferredContactPeriodRaw,
      t,
    ),
    hasPreviousDiagnosisLabel: yesNoLabel(detail.hasPreviousDiagnosis, t),
    isCurrentlyReceivingTreatmentLabel: yesNoLabel(detail.isCurrentlyReceivingTreatment, t),
    attachmentCountLabel: formatCaseRequestAttachmentCountLabel(detail.attachmentCount, t),
    attachments: localizedAttachments,
    timelineSteps: buildAdminCaseRequestTimelineSteps(detail, context),
    labels,
  };
}

export function friendlyCaseAssignmentErrorLocalized(raw, context = {}) {
  const { t } = resolveAdminMapperContext(context);
  const labels = getAdminCaseRequestsLabels(t);

  if (!raw || typeof raw !== "string") {
    return labels.toast.assignFailed;
  }

  const lower = raw.trim().toLowerCase();
  if (lower === "only pending case requests can be assigned") {
    return labels.toast.stalePending;
  }
  if (lower === "only pending case requests can be updated") {
    return labels.toast.stalePending;
  }
  if (lower === "specialist is not assigned to this case category") {
    return labels.toast.specialistCategoryMismatch;
  }

  return labels.toast.assignFailed;
}
