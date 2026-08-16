import { resolveAdminMapperContext } from "./adminDashboardLocalization.js";

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

export function getAdminSupportRequestsLabels(t = null) {
  return {
    title: translateKey(t, "admin.support.title", "Support Requests"),
    subtitle: translateKey(
      t,
      "admin.support.subtitle",
      "Review specialist administration support requests and respond in the request thread.",
    ),
    toolbarAriaLabel: translateKey(t, "admin.support.toolbarAriaLabel", "Support requests filters"),
    statusLabel: translateKey(t, "admin.support.filters.status", "Status"),
    categoryLabel: translateKey(t, "admin.support.filters.category", "Category"),
    specialistLabel: translateKey(t, "admin.support.filters.specialist", "Specialist"),
    filtersLabel: translateKey(t, "admin.support.filters.filters", "Filters"),
    clearFilters: translateKey(t, "admin.support.filters.clearFilters", "Clear filters"),
    refresh: translateKey(t, "admin.support.refresh", "Refresh"),
    refreshing: translateKey(t, "admin.support.refreshing", "Refreshing..."),
    tableAriaLabel: translateKey(t, "admin.support.tableAriaLabel", "Support requests list"),
    columns: {
      specialist: translateKey(t, "supportRequests.specialist", "Specialist"),
      subject: translateKey(t, "admin.support.columns.subject", "Subject"),
      category: translateKey(t, "admin.support.columns.category", "Category"),
      status: translateKey(t, "admin.support.columns.status", "Status"),
      lastActivity: translateKey(t, "supportRequests.lastActivity", "Last activity"),
      created: translateKey(t, "supportRequests.created", "Created"),
      action: translateKey(t, "admin.support.columns.action", "Action"),
    },
    view: translateKey(t, "admin.support.view", "View"),
    loading: translateKey(t, "admin.support.loading", "Loading support requests..."),
    loadingMore: translateKey(t, "admin.support.loadingMore", "Loading more..."),
    empty: translateKey(
      t,
      "admin.support.empty",
      "No support requests have been submitted yet.",
    ),
    emptyFiltered: translateKey(
      t,
      "admin.support.emptyFiltered",
      "No support requests match the selected filters.",
    ),
    loadFailed: translateKey(t, "admin.support.loadFailed", "Failed to load support requests."),
    specialistsLoadFailed: translateKey(
      t,
      "admin.support.specialistsLoadFailed",
      "Failed to load specialists.",
    ),
    loadMore: translateKey(t, "admin.support.loadMore", "Load more"),
    retry: translateKey(t, "common.retry", "Retry"),
    back: translateKey(t, "admin.support.back", "Back to Support Requests"),
    loadingDetails: translateKey(t, "admin.support.loadingDetails", "Loading support request..."),
    notFound: translateKey(t, "admin.support.notFound", "Support request not found."),
    unavailable: translateKey(t, "admin.support.unavailable", "Support request unavailable."),
    requestStatus: translateKey(t, "admin.support.requestStatus", "Request status:"),
    actionsAriaLabel: translateKey(
      t,
      "admin.support.actionsAriaLabel",
      "Support request status actions",
    ),
    markInProgress: translateKey(t, "admin.support.markInProgress", "Mark In Progress"),
    resolveRequest: translateKey(t, "admin.support.resolveRequest", "Resolve Request"),
    statusDialog: {
      markInProgressTitle: translateKey(
        t,
        "admin.support.statusDialog.markInProgressTitle",
        "Mark In Progress",
      ),
      markInProgressBody: translateKey(
        t,
        "admin.support.statusDialog.markInProgressBody",
        "This will mark the support request as actively being handled by administration.",
      ),
      markResolvedTitle: translateKey(
        t,
        "admin.support.statusDialog.markResolvedTitle",
        "Mark Resolved",
      ),
      markResolvedBody: translateKey(
        t,
        "admin.support.statusDialog.markResolvedBody",
        "This will close the support request. No further replies will be allowed.",
      ),
      cancel: translateKey(t, "common.cancel", "Cancel"),
      updating: translateKey(t, "admin.support.statusDialog.updating", "Updating..."),
    },
    toast: {
      replySent: translateKey(t, "admin.support.toast.replySent", "Reply sent successfully."),
      replyFailed: translateKey(t, "admin.support.toast.replyFailed", "Failed to send reply."),
      markInProgressSuccess: translateKey(
        t,
        "admin.support.toast.markInProgressSuccess",
        "Support request marked as in progress.",
      ),
      markResolvedSuccess: translateKey(
        t,
        "admin.support.toast.markResolvedSuccess",
        "Support request marked as resolved.",
      ),
      statusUpdated: translateKey(
        t,
        "admin.support.toast.statusUpdated",
        "Support request status updated.",
      ),
      statusUpdateFailed: translateKey(
        t,
        "admin.support.toast.statusUpdateFailed",
        "Failed to update support request status.",
      ),
      detailsLoadFailed: translateKey(
        t,
        "admin.support.loadFailed",
        "Failed to load support requests.",
      ),
    },
  };
}

export function friendlyAdminSupportErrorLocalized(raw, context = {}) {
  const { t } = resolveAdminMapperContext(context);
  const labels = getAdminSupportRequestsLabels(t);

  if (!raw || typeof raw !== "string" || !raw.trim()) {
    return labels.toast.statusUpdateFailed;
  }

  return raw.trim();
}
