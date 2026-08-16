import { formatAppDateTime } from "../../../i18n/formatters.js";
import {
  COMPLAINT_STATUS_VALUES,
  getComplaintStatusActions,
  getComplaintStatusTone,
} from "./adminComplaintsMappers.js";
import { resolveAdminMapperContext } from "./adminDashboardLocalization.js";
import {
  buildParentComplaintCategoryOptions,
  getParentComplaintCategoryLabel,
  getParentComplaintStatusLabel,
} from "../../parent-dashboard-preview/utils/parentComplaintsLocalization.js";

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

export function getAdminComplaintsLabels(t = null) {
  return {
    title: translateKey(t, "admin.complaints.title", "Complaints Management"),
    subtitle: translateKey(
      t,
      "admin.complaints.subtitle",
      "Review specialist complaints submitted by parents and manage review actions.",
    ),
    toolbarAriaLabel: translateKey(t, "admin.complaints.toolbarAriaLabel", "Complaints toolbar"),
    updating: translateKey(t, "admin.complaints.updating", "Updating complaints"),
    statusLabel: translateKey(t, "admin.complaints.filters.status", "Status"),
    categoryLabel: translateKey(t, "admin.complaints.filters.category", "Category"),
    specialistLabel: translateKey(t, "admin.complaints.filters.specialist", "Specialist"),
    fromLabel: translateKey(t, "admin.complaints.filters.from", "From"),
    toLabel: translateKey(t, "admin.complaints.filters.to", "To"),
    allStatuses: translateKey(t, "admin.complaints.filters.allStatuses", "All statuses"),
    allCategories: translateKey(t, "admin.complaints.filters.allCategories", "All categories"),
    allSpecialists: translateKey(t, "admin.complaints.filters.allSpecialists", "All specialists"),
    clearFilters: translateKey(t, "admin.complaints.filters.clearFilters", "Clear filters"),
    specialistFilterUnavailable: (error) => translateKey(
      t,
      "admin.complaints.filters.specialistUnavailable",
      "Specialist filter unavailable: {error}",
      { error },
    ),
    dateRangeInvalid: translateKey(
      t,
      "admin.complaints.filters.dateRangeInvalid",
      "From date cannot be after To date.",
    ),
    tableAriaLabel: translateKey(t, "admin.complaints.tableAriaLabel", "Complaints list"),
    columns: {
      parent: translateKey(t, "admin.complaints.columns.parent", "Parent"),
      patient: translateKey(t, "admin.complaints.columns.patient", "Patient"),
      specialist: translateKey(t, "admin.complaints.columns.specialist", "Specialist"),
      category: translateKey(t, "admin.complaints.columns.category", "Category"),
      status: translateKey(t, "admin.complaints.columns.status", "Status"),
      submitted: translateKey(t, "admin.complaints.columns.submitted", "Submitted"),
      view: translateKey(t, "admin.complaints.columns.view", "View"),
    },
    view: translateKey(t, "admin.complaints.view", "View"),
    viewDetails: translateKey(t, "admin.complaints.viewDetails", "View details"),
    loading: translateKey(t, "admin.complaints.loading", "Loading complaints..."),
    loadingMore: translateKey(t, "admin.complaints.loadingMore", "Loading more..."),
    empty: translateKey(t, "admin.complaints.empty", "No complaints have been submitted yet."),
    emptyFiltered: translateKey(
      t,
      "admin.complaints.emptyFiltered",
      "No complaints match the selected filters.",
    ),
    loadFailed: translateKey(t, "admin.complaints.loadFailed", "Failed to load complaints."),
    retry: translateKey(t, "common.retry", "Retry"),
    loadMore: translateKey(t, "admin.complaints.loadMore", "Load more"),
    back: translateKey(t, "admin.complaints.back", "Back to Complaints"),
    loadingDetails: translateKey(t, "admin.complaints.loadingDetails", "Loading complaint details..."),
    detailsLoadingAriaLabel: translateKey(
      t,
      "admin.complaints.detailsLoadingAriaLabel",
      "Complaint details loading",
    ),
    notFound: translateKey(t, "admin.complaints.notFound", "Complaint not found."),
    summaryAriaLabel: translateKey(t, "admin.complaints.summaryAriaLabel", "Complaint summary"),
    submittedAt: (date) => translateKey(
      t,
      "admin.complaints.submittedAt",
      "Submitted {date}",
      { date },
    ),
    complaintInformation: translateKey(t, "admin.complaints.complaintInformation", "Complaint Information"),
    complaintInformationAriaLabel: translateKey(
      t,
      "admin.complaints.complaintInformationAriaLabel",
      "Complaint information",
    ),
    reviewer: translateKey(t, "admin.complaints.reviewer", "Reviewer"),
    reviewDate: translateKey(t, "admin.complaints.reviewDate", "Review date"),
    descriptionTitle: translateKey(t, "admin.complaints.descriptionTitle", "Complaint Description"),
    descriptionAriaLabel: translateKey(
      t,
      "admin.complaints.descriptionAriaLabel",
      "Complaint description",
    ),
    attachmentTitle: translateKey(t, "admin.complaints.attachmentTitle", "Attachment"),
    attachmentAriaLabel: translateKey(t, "admin.complaints.attachmentAriaLabel", "Attachment"),
    attachmentPdf: translateKey(t, "admin.complaints.attachmentPdf", "PDF attachment"),
    attachmentImage: translateKey(t, "admin.complaints.attachmentImage", "Image attachment"),
    attachmentHint: translateKey(
      t,
      "admin.complaints.attachmentHint",
      "Open to view the submitted file",
    ),
    openAttachment: translateKey(t, "admin.complaints.openAttachment", "Open attachment"),
    viewAttachment: translateKey(t, "parent.complaints.attachment.view", "View attachment"),
    parties: translateKey(t, "admin.complaints.parties", "Parties"),
    parentInformation: translateKey(t, "admin.complaints.parentInformation", "Parent Information"),
    childInformation: translateKey(t, "admin.complaints.childInformation", "Child Information"),
    specialistInformation: translateKey(
      t,
      "admin.complaints.specialistInformation",
      "Specialist Information",
    ),
    adminNotesAriaLabel: translateKey(t, "admin.complaints.adminNotesAriaLabel", "Admin notes"),
    reviewActionsAriaLabel: translateKey(t, "admin.complaints.reviewActionsAriaLabel", "Complaint actions"),
    submittedBy: translateKey(t, "admin.complaints.submittedBy", "Submitted By"),
    reportedSpecialist: translateKey(t, "admin.complaints.reportedSpecialist", "Reported Specialist"),
    patientLabel: translateKey(t, "parent.complaints.child", "Child"),
    adminNotes: translateKey(t, "admin.complaints.adminNotes", "Admin Notes"),
    parentResponse: translateKey(t, "parent.complaints.adminResponse", "Administration response"),
    resolution: translateKey(t, "admin.complaints.resolution", "Resolution"),
    reviewActions: translateKey(t, "admin.complaints.reviewActions", "Review Actions"),
    reviewActionsHint: translateKey(
      t,
      "admin.complaints.reviewActionsHint",
      "Update this complaint status according to your review outcome.",
    ),
    actions: {
      startReview: translateKey(t, "admin.complaints.actions.startReview", "Start Review"),
      resolve: translateKey(t, "admin.complaints.actions.resolve", "Resolve Complaint"),
      reject: translateKey(t, "admin.complaints.actions.reject", "Reject Complaint"),
    },
    dialogs: {
      startReviewTitle: translateKey(t, "admin.complaints.dialogs.startReviewTitle", "Start Review"),
      startReviewBody: translateKey(
        t,
        "admin.complaints.dialogs.startReviewBody",
        "Mark this complaint as under review?",
      ),
      resolveTitle: translateKey(t, "admin.complaints.dialogs.resolveTitle", "Resolve Complaint"),
      rejectTitle: translateKey(t, "admin.complaints.dialogs.rejectTitle", "Reject Complaint"),
      adminNotesLabel: translateKey(t, "admin.complaints.dialogs.adminNotesLabel", "Admin notes"),
      adminNotesPlaceholder: translateKey(
        t,
        "admin.complaints.dialogs.adminNotesPlaceholder",
        "Enter admin notes for this decision",
      ),
      parentResponseLabel: translateKey(
        t,
        "admin.complaints.dialogs.parentResponseLabel",
        "Parent response (optional)",
      ),
      parentResponsePlaceholder: translateKey(
        t,
        "admin.complaints.dialogs.parentResponsePlaceholder",
        "Optional message visible to the parent",
      ),
      confirm: translateKey(t, "admin.complaints.dialogs.confirm", "Confirm"),
      cancel: translateKey(t, "common.cancel", "Cancel"),
      submitting: translateKey(t, "admin.complaints.dialogs.submitting", "Submitting..."),
      starting: translateKey(t, "admin.complaints.dialogs.starting", "Starting..."),
      resolving: translateKey(t, "admin.complaints.dialogs.resolving", "Resolving..."),
      rejecting: translateKey(t, "admin.complaints.dialogs.rejecting", "Rejecting..."),
      categoryLabel: translateKey(t, "admin.complaints.dialogs.categoryLabel", "Category"),
      childLabel: translateKey(t, "admin.complaints.dialogs.childLabel", "Child"),
    },
    validation: {
      adminNotesRequired: translateKey(
        t,
        "admin.complaints.validation.adminNotesRequired",
        "Admin notes are required.",
      ),
      adminNotesMinLength: (min) => translateKey(
        t,
        "admin.complaints.validation.adminNotesMinLength",
        "Admin notes must be at least {min} characters.",
        { min },
      ),
      adminNotesMaxLength: (max) => translateKey(
        t,
        "admin.complaints.validation.adminNotesMaxLength",
        "Admin notes must be at most {max} characters.",
        { max },
      ),
    },
    toast: {
      startReviewSuccess: translateKey(
        t,
        "admin.complaints.toast.startReviewSuccess",
        "Complaint marked as under review.",
      ),
      resolveSuccess: translateKey(
        t,
        "admin.complaints.toast.resolveSuccess",
        "Complaint resolved successfully.",
      ),
      rejectSuccess: translateKey(
        t,
        "admin.complaints.toast.rejectSuccess",
        "Complaint rejected successfully.",
      ),
      actionFailed: translateKey(
        t,
        "admin.complaints.toast.actionFailed",
        "Unable to update complaint status.",
      ),
      invalidTransition: translateKey(
        t,
        "admin.complaints.toast.invalidTransition",
        "This status change is no longer allowed.",
      ),
      specialistsLoadFailed: translateKey(
        t,
        "admin.complaints.toast.specialistsLoadFailed",
        "Failed to load specialists.",
      ),
    },
    emptyDisplay: translateKey(t, "parent.common.emptyDisplay", "—"),
  };
}

export function buildAdminComplaintStatusFilterOptions(t = null) {
  return COMPLAINT_STATUS_VALUES.map((value) => ({
    value,
    label: getParentComplaintStatusLabel(value, t),
  }));
}

export function buildAdminComplaintCategoryFilterOptions(t = null) {
  return buildParentComplaintCategoryOptions(t);
}

export function formatAdminComplaintDateLabel(value, context = {}) {
  const { locale, t } = resolveAdminMapperContext(context);
  const formatted = formatAppDateTime(value, locale);
  return formatted ?? translateKey(t, "parent.common.emptyDisplay", "—");
}

export function validateComplaintAdminNotesLocalized(notes, context = {}) {
  const { t } = resolveAdminMapperContext(context);
  const labels = getAdminComplaintsLabels(t);
  const trimmed = typeof notes === "string" ? notes.trim() : "";

  if (!trimmed) {
    return { valid: false, value: "", error: labels.validation.adminNotesRequired };
  }

  if (trimmed.length < 3) {
    return { valid: false, value: trimmed, error: labels.validation.adminNotesMinLength(3) };
  }

  if (trimmed.length > 2000) {
    return { valid: false, value: trimmed, error: labels.validation.adminNotesMaxLength(2000) };
  }

  return { valid: true, value: trimmed, error: null };
}

export function applyAdminComplaintLocalization(complaint, context = {}) {
  if (!complaint) {
    return complaint;
  }

  const { t } = resolveAdminMapperContext(context);

  return {
    ...complaint,
    categoryLabel: getParentComplaintCategoryLabel(complaint.category, t),
    statusLabel: getParentComplaintStatusLabel(complaint.status, t),
    statusTone: getComplaintStatusTone(complaint.status),
    createdAtLabel: formatAdminComplaintDateLabel(complaint.createdAt, context),
    updatedAtLabel: formatAdminComplaintDateLabel(complaint.updatedAt, context),
    reviewedAtLabel: formatAdminComplaintDateLabel(complaint.reviewedAt, context),
    resolvedAtLabel: formatAdminComplaintDateLabel(complaint.resolvedAt, context),
    ...getComplaintStatusActions(complaint.status),
  };
}

export function applyAdminComplaintsLocalization(complaints, context = {}) {
  if (!Array.isArray(complaints)) {
    return [];
  }

  return complaints.map((complaint) => applyAdminComplaintLocalization(complaint, context));
}

export function applyAdminComplaintDetailsLocalization(details, context = {}) {
  return applyAdminComplaintLocalization(details, context);
}

export function friendlyComplaintErrorLocalized(raw, context = {}) {
  const { t } = resolveAdminMapperContext(context);
  const labels = getAdminComplaintsLabels(t);

  if (!raw || typeof raw !== "string") {
    return labels.toast.actionFailed;
  }

  const lower = raw.toLowerCase();
  if (lower.includes("invalid_status_transition")) {
    return labels.toast.invalidTransition;
  }

  return raw.trim();
}
