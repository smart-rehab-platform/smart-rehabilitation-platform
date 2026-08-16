import { formatAppDateTime } from "../../../i18n/formatters.js";
import { resolveAdminMapperContext } from "./adminDashboardLocalization.js";
import {
  AUDIT_ACTION_FALLBACKS,
  AUDIT_ENTITY_FALLBACKS,
  getAuditActionTone,
  isAuditEntityReferenceId,
  resolveAuditActionCategory,
  toAuditReadableTitle,
} from "./adminAuditLogsConstants.js";

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

export const AUDIT_ACTION_CODES = Object.freeze(Object.keys(AUDIT_ACTION_FALLBACKS));
export const AUDIT_ENTITY_CODES = Object.freeze(Object.keys(AUDIT_ENTITY_FALLBACKS));

export {
  getAuditActionTone,
  isAuditEntityReferenceId,
  resolveAuditActionCategory,
  toAuditReadableTitle,
};

export function formatAuditActionLabel(rawAction, t = null) {
  const key = typeof rawAction === "string" ? rawAction.trim().toLowerCase() : "";
  if (!key) {
    return translateKey(t, "admin.audit.actions.activity", "Activity");
  }

  const translationKey = `admin.audit.actions.${key}`;
  if (typeof t === "function") {
    const translated = t(translationKey);
    if (translated && translated !== translationKey) {
      return translated;
    }
  }

  if (AUDIT_ACTION_FALLBACKS[key]) {
    return translateKey(t, translationKey, AUDIT_ACTION_FALLBACKS[key]);
  }

  return translateKey(t, "admin.audit.unknownAction", "Unknown action");
}

export function formatAuditEntityLabel(rawEntity, t = null) {
  const key = typeof rawEntity === "string" ? rawEntity.trim().toLowerCase() : "";
  if (!key) {
    return translateKey(t, "admin.audit.entities.system", "System");
  }

  const translationKey = `admin.audit.entities.${key}`;
  if (typeof t === "function") {
    const translated = t(translationKey);
    if (translated && translated !== translationKey) {
      return translated;
    }
  }

  if (AUDIT_ENTITY_FALLBACKS[key]) {
    return translateKey(t, translationKey, AUDIT_ENTITY_FALLBACKS[key]);
  }

  return translateKey(t, "admin.audit.unknownEntity", "Unknown entity");
}

export function formatAuditBadgeCategoryLabel(category, action = "", t = null) {
  const normalizedCategory = (category || "activity").trim().toLowerCase();

  if (normalizedCategory === "login") {
    const actionKey = typeof action === "string" ? action.trim().toLowerCase() : "";
    if (actionKey.includes("logout")) {
      return translateKey(t, "admin.audit.badges.logout", "Logout");
    }
    return translateKey(t, "admin.audit.badges.login", "Login");
  }

  const badgeKey = `admin.audit.badges.${normalizedCategory}`;
  const fallbacks = {
    create: "Create",
    update: "Update",
    complete: "Complete",
    delete: "Delete",
    assign: "Assign",
    login: "Login",
    cancel: "Cancel",
    activity: "Activity",
  };

  return translateKey(t, badgeKey, fallbacks[normalizedCategory] ?? "Activity");
}

export function formatAuditDateTimeLabel(value, context = {}) {
  const { locale, t } = resolveAdminMapperContext(context);

  if (!value) {
    return translateKey(t, "parent.common.emptyDisplay", "—");
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return translateKey(t, "parent.common.emptyDisplay", "—");
  }

  return formatAppDateTime(date, locale)
    ?? translateKey(t, "parent.common.emptyDisplay", "—");
}

export function getAdminAuditLogsLabels(t = null) {
  return {
    title: translateKey(t, "admin.audit.title", "Audit Logs"),
    subtitle: translateKey(
      t,
      "admin.audit.subtitle",
      "Monitor administrative and system activity.",
    ),
    toolbarAriaLabel: translateKey(t, "admin.audit.toolbarAriaLabel", "Audit logs toolbar"),
    tableAriaLabel: translateKey(t, "admin.audit.tableAriaLabel", "Audit logs list"),
    tableLoadingAriaLabel: translateKey(t, "admin.audit.tableLoadingAriaLabel", "Audit logs loading"),
    retry: translateKey(t, "common.retry", "Retry"),
    clearFilters: translateKey(t, "admin.audit.clearFilters", "Clear filters"),
    updating: translateKey(t, "admin.audit.updating", "Updating…"),
    loadFailed: translateKey(t, "admin.audit.loadFailed", "Failed to load audit logs."),
    usersLoadFailed: translateKey(t, "admin.audit.usersLoadFailed", "Failed to load users."),
    filters: {
      user: translateKey(t, "admin.audit.filters.user", "User"),
      action: translateKey(t, "admin.audit.filters.action", "Action"),
      entity: translateKey(t, "admin.audit.filters.entity", "Entity"),
      fromDate: translateKey(t, "admin.audit.filters.fromDate", "From date"),
      toDate: translateKey(t, "admin.audit.filters.toDate", "To date"),
      allUsers: translateKey(t, "admin.audit.filters.allUsers", "All users"),
      allActions: translateKey(t, "admin.audit.filters.allActions", "All actions"),
      allEntities: translateKey(t, "admin.audit.filters.allEntities", "All entities"),
      usersUnavailable: translateKey(
        t,
        "admin.audit.filters.usersUnavailable",
        "User filter options could not be loaded.",
      ),
      dateRangeInvalid: translateKey(
        t,
        "admin.audit.filters.dateRangeInvalid",
        "From date cannot be after To date.",
      ),
    },
    columns: {
      action: translateKey(t, "admin.audit.columns.action", "Action"),
      user: translateKey(t, "admin.audit.columns.user", "User"),
      entity: translateKey(t, "admin.audit.columns.entity", "Entity"),
      dateTime: translateKey(t, "admin.audit.columns.dateTime", "Date & Time"),
      details: translateKey(t, "admin.audit.columns.details", "Details"),
    },
    details: {
      button: translateKey(t, "admin.audit.details.button", "Details"),
      referenceId: translateKey(t, "admin.audit.details.referenceId", "Reference ID"),
    },
    systemUser: translateKey(t, "admin.audit.systemUser", "System"),
    systemUserInitials: translateKey(t, "admin.audit.systemUserInitials", "SY"),
    empty: translateKey(t, "admin.audit.empty", "No audit logs found."),
    emptyFiltered: translateKey(t, "admin.audit.emptyFiltered", "No audit logs match your filters."),
    userFallback: translateKey(t, "admin.audit.filters.userFallback", "User"),
    emptyDisplay: translateKey(t, "parent.common.emptyDisplay", "—"),
  };
}

export function applyAdminAuditLogLocalization(log, context = {}) {
  if (!log) {
    return log;
  }

  const { t } = resolveAdminMapperContext(context);
  const labels = getAdminAuditLogsLabels(t);

  return {
    ...log,
    actionLabel: formatAuditActionLabel(log.action, t),
    entityLabel: formatAuditEntityLabel(log.entityName, t),
    createdAtLabel: formatAuditDateTimeLabel(log.createdAt, context),
    displayUserName: log.userName || labels.systemUser,
    badgeLabel: formatAuditBadgeCategoryLabel(log.actionCategory, log.action, t),
  };
}

export function applyAdminAuditLogsLocalization(logs, context = {}) {
  if (!Array.isArray(logs)) {
    return [];
  }

  return logs.map((log) => applyAdminAuditLogLocalization(log, context));
}

export function buildLocalizedAuditActionOptions(logs = [], context = {}) {
  const { t } = resolveAdminMapperContext(context);
  const seen = new Map();

  if (!Array.isArray(logs)) {
    return [];
  }

  for (const log of logs) {
    const value = typeof log?.action === "string" ? log.action.trim() : "";
    if (!value || seen.has(value)) {
      continue;
    }

    seen.set(value, {
      value,
      label: formatAuditActionLabel(value, t),
    });
  }

  return [...seen.values()].sort((left, right) => left.label.localeCompare(
    right.label,
    undefined,
    { sensitivity: "base" },
  ));
}

export function buildLocalizedAuditEntityOptions(logs = [], context = {}) {
  const { t } = resolveAdminMapperContext(context);
  const seen = new Map();

  if (!Array.isArray(logs)) {
    return [];
  }

  for (const log of logs) {
    const value = typeof log?.entityName === "string" ? log.entityName.trim() : "";
    if (!value || seen.has(value)) {
      continue;
    }

    seen.set(value, {
      value,
      label: formatAuditEntityLabel(value, t),
    });
  }

  return [...seen.values()].sort((left, right) => left.label.localeCompare(
    right.label,
    undefined,
    { sensitivity: "base" },
  ));
}
