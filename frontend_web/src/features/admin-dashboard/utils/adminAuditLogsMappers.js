import {
  getAuditActionTone,
  isAuditEntityReferenceId,
  resolveAuditActionCategory,
  toAuditReadableTitle,
} from "./adminAuditLogsConstants.js";
import {
  formatAuditActionLabel,
  formatAuditEntityLabel,
} from "./adminAuditLogsLocalization.js";

const HTML_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

function readString(value) {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed || null;
  }

  if (value == null) {
    return null;
  }

  const text = String(value).trim();
  return text || null;
}

function readDate(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }

  if (value == null || value === "") {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export {
  formatAuditActionLabel,
  formatAuditEntityLabel,
  getAuditActionTone,
  isAuditEntityReferenceId,
  resolveAuditActionCategory,
  toAuditReadableTitle,
};

function parseHtmlDateParts(value) {
  const raw = readString(value);
  if (!raw) {
    return null;
  }

  const match = HTML_DATE_PATTERN.exec(raw);
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  if (!year || month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }

  return { year, month, day };
}

/**
 * Builds `date_from` / `date_to` query values from HTML `YYYY-MM-DD` inputs.
 * Uses the user's local calendar day, then serializes to ISO-8601.
 * `fromDate` is the start of that local day; `toDate` is the end (23:59:59.999),
 * so the selected To date is included instead of stopping at midnight.
 */
export function buildAuditDateRangeParams(fromDate, toDate) {
  const params = {};
  const fromParts = parseHtmlDateParts(fromDate);
  const toParts = parseHtmlDateParts(toDate);

  if (fromParts) {
    const start = new Date(fromParts.year, fromParts.month - 1, fromParts.day, 0, 0, 0, 0);
    params.date_from = start.toISOString();
  }

  if (toParts) {
    const end = new Date(toParts.year, toParts.month - 1, toParts.day, 23, 59, 59, 999);
    params.date_to = end.toISOString();
  }

  return params;
}

export function isAuditDateRangeInvalid(fromDate, toDate) {
  const from = readString(fromDate);
  const to = readString(toDate);

  if (!from || !to) {
    return false;
  }

  if (!HTML_DATE_PATTERN.test(from) || !HTML_DATE_PATTERN.test(to)) {
    return false;
  }

  return from > to;
}

export function mapAdminAuditLog(row) {
  if (!row || typeof row !== "object") {
    return null;
  }

  const id = readString(row.id);
  if (!id) {
    return null;
  }

  const action = readString(row.action) ?? "action";
  const userName = readString(row.user_name ?? row.userName ?? row.full_name);
  const entityName = readString(row.entity_name ?? row.entityName);
  const actionCategory = resolveAuditActionCategory(action);

  return {
    id,
    userId: readString(row.user_id ?? row.userId),
    action,
    userName,
    userEmail: readString(row.user_email ?? row.userEmail ?? row.email),
    entityName,
    entityId: readString(row.entity_id ?? row.entityId),
    createdAt: readDate(row.created_at ?? row.createdAt),
    actionCategory,
    actionTone: getAuditActionTone(actionCategory),
  };
}

function compareOptionLabels(left, right) {
  return left.label.localeCompare(right.label, undefined, { sensitivity: "base" });
}

export function buildAuditUserOptions(users = []) {
  if (!Array.isArray(users)) {
    return [];
  }

  const options = [];
  const seen = new Set();

  for (const user of users) {
    if (!user || typeof user !== "object") {
      continue;
    }

    const value = readString(user.id ?? user.userId);
    if (!value || seen.has(value)) {
      continue;
    }

    const name = readString(user.fullName ?? user.full_name ?? user.name ?? user.userName);
    const email = readString(user.email ?? user.userEmail);
    let label = "User";

    if (name && email) {
      label = `${name} (${email})`;
    } else if (name) {
      label = name;
    } else if (email) {
      label = email;
    }

    seen.add(value);
    options.push({ value, label });
  }

  return options.sort(compareOptionLabels);
}

export function buildAuditActionOptions(logs = []) {
  if (!Array.isArray(logs)) {
    return [];
  }

  const seen = new Map();

  for (const log of logs) {
    const value = readString(log?.action);
    if (!value || seen.has(value)) {
      continue;
    }

    seen.set(value, {
      value,
      label: formatAuditActionLabel(value),
    });
  }

  return [...seen.values()].sort(compareOptionLabels);
}

export function buildAuditEntityOptions(logs = []) {
  if (!Array.isArray(logs)) {
    return [];
  }

  const seen = new Map();

  for (const log of logs) {
    const value = readString(log?.entityName ?? log?.entity_name);
    if (!value || seen.has(value)) {
      continue;
    }

    seen.set(value, {
      value,
      label: formatAuditEntityLabel(value),
    });
  }

  return [...seen.values()].sort(compareOptionLabels);
}
