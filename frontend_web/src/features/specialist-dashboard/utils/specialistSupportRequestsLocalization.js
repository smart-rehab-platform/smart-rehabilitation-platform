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

export function getSpecialistSupportPageLabels(t = null) {
  return {
    title: translateKey(t, "specialist.support.title", "Support"),
    subtitle: translateKey(
      t,
      "specialist.support.subtitle",
      "Contact the administration for operational and platform support issues.",
    ),
    newRequest: translateKey(t, "specialist.support.newRequest", "New Request"),
    statusLabel: translateKey(t, "specialist.support.filters.status", "Status"),
    categoryLabel: translateKey(t, "specialist.support.filters.category", "Category"),
    clearFilters: translateKey(t, "specialist.support.filters.clear", "Clear filters"),
    loading: translateKey(t, "specialist.support.loading", "Loading support requests..."),
    empty: translateKey(
      t,
      "specialist.support.empty.none",
      "You have not submitted any support requests yet.",
    ),
    emptyFiltered: translateKey(
      t,
      "specialist.support.empty.filtered",
      "No support requests match the selected filters.",
    ),
    viewRequest: translateKey(t, "specialist.support.viewRequest", "View request"),
    lastActivity: (date) => translateKey(
      t,
      "specialist.support.lastActivity",
      "Last activity {date}",
      { date },
    ),
    created: (date) => translateKey(
      t,
      "specialist.support.created",
      "Created {date}",
      { date },
    ),
  };
}

export function getSpecialistSupportFormLabels(t = null) {
  return {
    backToList: translateKey(t, "specialist.support.backToList", "Back to support requests"),
    newTitle: translateKey(t, "specialist.support.form.title", "New Support Request"),
    intro: translateKey(
      t,
      "specialist.support.form.intro",
      "Submit a structured support request to the administration team.",
    ),
    category: translateKey(t, "specialist.support.form.category", "Category"),
    selectCategory: translateKey(t, "specialist.support.form.selectCategory", "Select a category"),
    subject: translateKey(t, "specialist.support.form.subject", "Subject"),
    description: translateKey(t, "specialist.support.form.description", "Description"),
    submit: translateKey(t, "specialist.support.form.submit", "Submit Request"),
    submitting: translateKey(t, "specialist.support.form.submitting", "Submitting..."),
    submitSuccess: translateKey(
      t,
      "specialist.support.form.submitSuccess",
      "Support request submitted successfully.",
    ),
  };
}

export function getSpecialistSupportDetailLabels(t = null) {
  return {
    backToList: translateKey(t, "specialist.support.backToList", "Back to support requests"),
    loading: translateKey(t, "specialist.support.detail.loading", "Loading support request..."),
    unavailable: translateKey(t, "specialist.support.detail.unavailable", "Support request unavailable."),
    replySuccess: translateKey(t, "specialist.support.detail.replySuccess", "Reply sent successfully."),
  };
}

export function getSpecialistSupportValidationMessages(t = null) {
  return {
    messageRequired: translateKey(
      t,
      "specialist.support.validation.messageRequired",
      "Message content or attachment is required.",
    ),
    loadFailed: translateKey(t, "specialist.support.errors.loadFailed", "Failed to load support requests."),
    submitFailed: translateKey(t, "specialist.support.errors.submitFailed", "Failed to submit support request."),
    notFound: translateKey(t, "specialist.support.errors.notFound", "Support request not found."),
    attachmentUrlMissing: translateKey(
      t,
      "specialist.support.errors.attachmentUrlMissing",
      "Attachment upload did not return a file URL.",
    ),
  };
}
