import { formatAppDateTime } from "../../../i18n/formatters.js";
import {
  FINAL_SESSION_STATUSES,
  SESSION_STATUS_VALUES,
  getSessionStatusTone,
  isPastScheduledNotCompleted,
} from "./adminSessionsConstants.js";
import { resolveAdminMapperContext } from "./adminDashboardLocalization.js";
import { getSessionStatusLabel } from "../../parent-dashboard-preview/utils/parentSessionsLocalization.js";
import { formatSessionDurationLabel } from "../../specialist-dashboard/utils/specialistSessionsLocalization.js";

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

export function formatAdminSessionStatusLabel(status, isPastScheduled = false, t = null) {
  const normalized = (status || "").trim().toLowerCase();

  if (normalized === "scheduled" && isPastScheduled) {
    return translateKey(t, "admin.patients.sessionStatus.notCompleted", "Not completed");
  }

  return getSessionStatusLabel(normalized, t);
}

export function buildAdminSessionStatusFilterOptions(t = null) {
  return [
    { value: "", label: translateKey(t, "admin.sessions.filters.allStatuses", "All statuses") },
    ...SESSION_STATUS_VALUES.map((value) => ({
      value,
      label: formatAdminSessionStatusLabel(value, false, t),
    })),
  ];
}

export function formatAdminSessionDateTimeLabel(value, context = {}) {
  const { locale, t } = resolveAdminMapperContext(context);

  if (!value) {
    return translateKey(t, "parent.common.emptyDisplay", "—");
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return translateKey(t, "parent.common.emptyDisplay", "—");
  }

  const formatted = formatAppDateTime(date, locale);
  if (!formatted) {
    return translateKey(t, "parent.common.emptyDisplay", "—");
  }

  return formatted.replace(", ", " • ");
}

export function formatAdminSessionDurationLabel(minutes, context = {}) {
  const { t } = resolveAdminMapperContext(context);

  if (minutes == null || !Number.isFinite(minutes)) {
    return translateKey(t, "parent.common.emptyDisplay", "—");
  }

  return formatSessionDurationLabel(minutes, t);
}

export function getAdminSessionsLabels(t = null) {
  return {
    title: translateKey(t, "admin.sessions.title", "Sessions"),
    subtitle: translateKey(
      t,
      "admin.sessions.subtitle",
      "View and manage scheduled rehabilitation sessions.",
    ),
    toolbarAriaLabel: translateKey(t, "admin.sessions.toolbarAriaLabel", "Sessions toolbar"),
    searchAriaLabel: translateKey(t, "admin.sessions.searchAriaLabel", "Search sessions"),
    searchPlaceholder: translateKey(
      t,
      "admin.sessions.searchPlaceholder",
      "Search by patient or specialist",
    ),
    statusFilterAriaLabel: translateKey(t, "admin.sessions.statusFilterAriaLabel", "Filter by status"),
    tableAriaLabel: translateKey(t, "admin.sessions.tableAriaLabel", "Sessions list"),
    columns: {
      patient: translateKey(t, "admin.sessions.columns.patient", "Patient"),
      specialist: translateKey(t, "admin.sessions.columns.specialist", "Specialist"),
      dateTime: translateKey(t, "admin.sessions.columns.dateTime", "Date & Time"),
      duration: translateKey(t, "admin.sessions.columns.duration", "Duration"),
      location: translateKey(t, "admin.sessions.columns.location", "Location"),
      locationLink: translateKey(t, "admin.sessions.columns.locationLink", "Location / Link"),
      status: translateKey(t, "admin.sessions.columns.status", "Status"),
      actions: translateKey(t, "admin.sessions.columns.actions", "Actions"),
    },
    clearFilters: translateKey(t, "admin.sessions.clearFilters", "Clear filters"),
    loading: translateKey(t, "admin.sessions.loading", "Loading sessions..."),
    empty: translateKey(t, "admin.sessions.empty", "No sessions have been scheduled yet."),
    emptyFiltered: translateKey(
      t,
      "admin.sessions.emptyFiltered",
      "No sessions match your search or filter.",
    ),
    loadFailed: translateKey(t, "admin.sessions.loadFailed", "Failed to load sessions."),
    retry: translateKey(t, "common.retry", "Retry"),
    edit: translateKey(t, "admin.sessions.edit", "Edit"),
    manage: translateKey(t, "admin.sessions.manage", "Manage"),
    view: translateKey(t, "admin.sessions.view", "View"),
    complete: translateKey(t, "admin.sessions.complete", "Complete"),
    cancelSession: translateKey(t, "admin.sessions.cancelSession", "Cancel"),
    markNoShow: translateKey(t, "admin.sessions.markNoShow", "Mark No Show"),
    menu: {
      editSession: translateKey(t, "admin.sessions.menu.editSession", "Edit session"),
      completeSession: translateKey(t, "admin.sessions.menu.completeSession", "Complete session"),
      cancelSession: translateKey(t, "admin.sessions.menu.cancelSession", "Cancel session"),
      markNoShow: translateKey(t, "admin.sessions.menu.markNoShow", "Mark no show"),
    },
    actionAria: {
      edit: (name) => translateKey(
        t,
        "admin.sessions.actionAria.edit",
        "Edit session for {name}",
        { name },
      ),
      complete: (name) => translateKey(
        t,
        "admin.sessions.actionAria.complete",
        "Complete session for {name}",
        { name },
      ),
      cancel: (name) => translateKey(
        t,
        "admin.sessions.actionAria.cancel",
        "Cancel session for {name}",
        { name },
      ),
      noShow: (name) => translateKey(
        t,
        "admin.sessions.actionAria.noShow",
        "Mark session as no show for {name}",
        { name },
      ),
      manage: (name) => translateKey(
        t,
        "admin.sessions.actionAria.manage",
        "Manage session for {name}",
        { name },
      ),
      view: (name) => translateKey(
        t,
        "admin.sessions.actionAria.view",
        "View session for {name}",
        { name },
      ),
      menuTrigger: (name) => translateKey(
        t,
        "admin.sessions.actionAria.menuTrigger",
        "More actions for session with {name}",
        { name },
      ),
      openLink: (url) => translateKey(
        t,
        "admin.sessions.actionAria.openLink",
        "Open meeting link: {url}",
        { url },
      ),
    },
    dialogs: {
      editTitle: translateKey(t, "admin.sessions.dialogs.editTitle", "Edit Session"),
      completeTitle: translateKey(t, "admin.sessions.dialogs.completeTitle", "Complete Session"),
      cancelTitle: translateKey(t, "admin.sessions.dialogs.cancelTitle", "Cancel Session"),
      noShowTitle: translateKey(t, "admin.sessions.dialogs.noShowTitle", "Mark No Show"),
      completeBody: translateKey(
        t,
        "admin.sessions.dialogs.completeBody",
        "Are you sure you want to mark this session as completed?",
      ),
      cancelBody: translateKey(
        t,
        "admin.sessions.dialogs.cancelBody",
        "Are you sure you want to cancel this session?",
      ),
      noShowBody: translateKey(
        t,
        "admin.sessions.dialogs.noShowBody",
        "Are you sure you want to mark this session as a no-show?",
      ),
      patient: translateKey(t, "admin.sessions.dialogs.patient", "Patient"),
      specialist: translateKey(t, "admin.sessions.dialogs.specialist", "Specialist"),
      scheduled: translateKey(t, "admin.sessions.dialogs.scheduled", "Scheduled"),
      date: translateKey(t, "admin.sessions.dialogs.date", "Date"),
      dateHint: translateKey(t, "admin.sessions.dialogs.dateHint", "Date (YYYY-MM-DD)"),
      time: translateKey(t, "admin.sessions.dialogs.time", "Time"),
      timeHint: translateKey(t, "admin.sessions.dialogs.timeHint", "Time (HH:MM)"),
      duration: translateKey(t, "admin.sessions.dialogs.duration", "Duration (minutes)"),
      location: translateKey(t, "admin.sessions.dialogs.location", "Location or meeting link"),
      locationLink: translateKey(t, "admin.sessions.dialogs.locationLink", "Location / Link"),
      status: translateKey(t, "admin.sessions.dialogs.status", "Status"),
      statusFinalNote: translateKey(
        t,
        "admin.sessions.dialogs.statusFinalNote",
        "Status is final and cannot be changed.",
      ),
      cancellationReason: translateKey(
        t,
        "admin.sessions.dialogs.cancellationReason",
        "Cancellation reason",
      ),
      cancellationReasonPlaceholder: translateKey(
        t,
        "admin.sessions.dialogs.cancellationReasonPlaceholder",
        "Enter cancellation reason",
      ),
      keepSession: translateKey(t, "admin.sessions.dialogs.keepSession", "Keep Session"),
      save: translateKey(t, "common.save", "Save"),
      saving: translateKey(t, "admin.sessions.dialogs.saving", "Saving..."),
      confirm: translateKey(t, "admin.sessions.dialogs.confirm", "Confirm"),
      confirming: translateKey(t, "admin.sessions.dialogs.confirming", "Confirming..."),
      processing: translateKey(t, "admin.sessions.dialogs.processing", "Processing..."),
      cancel: translateKey(t, "common.cancel", "Cancel"),
    },
    validation: {
      cancellationReasonRequired: translateKey(
        t,
        "admin.sessions.validation.cancellationReasonRequired",
        "Cancellation reason is required.",
      ),
      dateRequired: translateKey(t, "admin.sessions.validation.dateRequired", "Date is required."),
      timeRequired: translateKey(t, "admin.sessions.validation.timeRequired", "Time is required."),
      invalidDateTime: translateKey(
        t,
        "admin.sessions.validation.invalidDateTime",
        "Invalid date or time.",
      ),
    },
    toast: {
      updateSuccess: translateKey(t, "admin.sessions.toast.updateSuccess", "Session updated successfully."),
      completeSuccess: translateKey(t, "admin.sessions.toast.completeSuccess", "Session marked as completed."),
      cancelSuccess: translateKey(t, "admin.sessions.toast.cancelSuccess", "Session cancelled successfully."),
      noShowSuccess: translateKey(t, "admin.sessions.toast.noShowSuccess", "Session marked as no-show."),
      updateFailed: translateKey(t, "admin.sessions.toast.updateFailed", "Failed to update session."),
      actionFailed: translateKey(t, "admin.sessions.toast.actionFailed", "Unable to update session status."),
    },
    emptyDisplay: translateKey(t, "parent.common.emptyDisplay", "—"),
  };
}

export function applyAdminSessionLocalization(session, context = {}) {
  if (!session) {
    return session;
  }

  const { t } = resolveAdminMapperContext(context);
  const isPastScheduled = session.isPastScheduled
    ?? isPastScheduledNotCompleted({ scheduledAt: session.scheduledAt, status: session.status });

  return {
    ...session,
    statusLabel: formatAdminSessionStatusLabel(session.status, isPastScheduled, t),
    statusTone: getSessionStatusTone(session.status, isPastScheduled),
    scheduledAtLabel: formatAdminSessionDateTimeLabel(session.scheduledAt, context),
    durationLabel: formatAdminSessionDurationLabel(session.durationMinutes, context),
    isFinal: FINAL_SESSION_STATUSES.has(session.status),
    isPastScheduled,
  };
}

export function applyAdminSessionsLocalization(sessions, context = {}) {
  if (!Array.isArray(sessions)) {
    return [];
  }

  return sessions.map((session) => applyAdminSessionLocalization(session, context));
}
