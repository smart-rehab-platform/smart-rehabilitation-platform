const ACTION_LABELS = {
  login: "Login",
  logout: "Logout",
  user_create: "User Created",
  user_activate: "User Activated",
  user_deactivate: "User Deactivated",
  user_update: "User Updated",
  user_delete: "User Deleted",
  patient_create: "Patient Created",
  patient_update: "Patient Updated",
  patient_delete: "Patient Deleted",
  session_create: "Session Created",
  session_update: "Session Updated",
  session_delete: "Session Deleted",
  session_complete: "Session Completed",
  session_cancel: "Session Cancelled",
  session_no_show: "Session Marked No Show",
  treatment_plan_create: "Treatment Plan Created",
  treatment_plan_created: "Treatment Plan Created",
  goal_add: "Goal Added",
  goal_added: "Goal Added",
  goal_create: "Goal Added",
  exercise_assign: "Exercise Assigned",
  exercise_assigned: "Exercise Assigned",
  parent_link: "Parent Linked",
  parent_linked: "Parent Linked",
  specialist_assign: "Specialist Assigned",
  specialist_assigned: "Specialist Assigned",
  case_category_create: "Case Category Created",
  case_category_update: "Case Category Updated",
  specialist_case_categories_update: "Specialist Categories Updated",
  case_intake_request_create: "Case Request Created",
  case_intake_request_update: "Case Request Updated",
  case_intake_request_assign: "Case Request Assigned",
  case_intake_request_accept: "Case Request Accepted",
  case_intake_request_reject: "Case Request Rejected",
  case_intake_request_convert: "Case Converted to Patient",
  case_intake_attachment_add: "Attachment Added",
  case_intake_attachment_delete: "Attachment Deleted",
  case_intake_assessment_start: "Assessment Started",
  case_intake_assessment_notes_update: "Assessment Notes Updated",
  complaint_submitted: "Complaint Submitted",
  complaint_review_started: "Complaint Review Started",
  complaint_resolved: "Complaint Resolved",
  complaint_rejected: "Complaint Rejected",
  specialist_warning_issued: "Specialist Warning Issued",
  create: "Create",
  created: "Create",
  update: "Update",
  updated: "Update",
  delete: "Delete",
  deleted: "Delete",
  activate: "Activate",
  deactivate: "Deactivate",
  assign: "Assign",
  unassign: "Unassign",
  approve: "Approve",
  reject: "Reject",
  accept: "Accept",
  complete: "Complete",
  cancel: "Cancel",
  archive: "Archive",
  upload: "Upload",
  generate: "Generate",
  review: "Review",
  mark_read: "Mark Read",
  read_all: "Read All",
};

const ENTITY_LABELS = {
  user: "User",
  users: "User",
  patient: "Patient",
  patients: "Patient",
  session: "Session",
  sessions: "Session",
  case_category: "Case Category",
  case_intake_request: "Case Request",
  case_request: "Case Request",
  complaint: "Complaint",
  specialist_warning: "Specialist Warning",
  goal: "Goal",
  goals: "Goal",
  exercise: "Exercise",
  exercises: "Exercise",
  treatment_plan: "Treatment Plan",
  report: "Report",
  reports: "Report",
  parent: "Parent",
  specialist: "Specialist",
  notification: "Notification",
  notifications: "Notification",
  assigned_exercise: "Assigned Exercise",
  submission: "Submission",
  review: "Review",
  speech_analysis: "Speech Analysis",
  ai_recommendation: "AI Recommendation",
  ai_report: "AI Report",
};

const CATEGORY_TONES = {
  create: "success",
  update: "info",
  complete: "warning",
  delete: "danger",
  assign: "info",
  login: "neutral",
  cancel: "warning",
  activity: "neutral",
};

const HTML_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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

export function toAuditReadableTitle(value) {
  const raw = readString(value);
  if (!raw) {
    return "";
  }

  return raw
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

export function formatAuditActionLabel(rawAction) {
  const key = readString(rawAction)?.toLowerCase();
  if (!key) {
    return "Activity";
  }

  return ACTION_LABELS[key] ?? toAuditReadableTitle(key);
}

export function resolveAuditActionCategory(rawAction) {
  const key = readString(rawAction)?.toLowerCase() ?? "";

  if (key === "login" || key === "logout" || key.endsWith("_login")) {
    return "login";
  }

  if (key.includes("cancel") || key.includes("reject") || key.includes("no_show")) {
    return "cancel";
  }

  if (key.includes("complete") || key.includes("accept") || key.includes("convert")) {
    return "complete";
  }

  if (key.includes("delete") || key.includes("remove") || key.includes("unlink")) {
    return "delete";
  }

  if (key.includes("assign") || key.includes("link") || key.includes("attach")) {
    return "assign";
  }

  if (key.includes("create") || key.includes("add") || key.endsWith("_start")) {
    return "create";
  }

  if (key.includes("update") || key.includes("edit") || key.includes("change")) {
    return "update";
  }

  return "activity";
}

export function getAuditActionTone(category) {
  return CATEGORY_TONES[category] ?? "neutral";
}

export function formatAuditEntityLabel(rawEntity) {
  const key = readString(rawEntity)?.toLowerCase();
  if (!key) {
    return "System";
  }

  return ENTITY_LABELS[key] ?? toAuditReadableTitle(key);
}

export function isAuditEntityReferenceId(value) {
  const id = readString(value);
  return Boolean(id && UUID_PATTERN.test(id));
}

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
    actionLabel: formatAuditActionLabel(action),
    actionCategory,
    actionTone: getAuditActionTone(actionCategory),
    entityLabel: formatAuditEntityLabel(entityName),
    displayUserName: userName || "System",
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
      label: log.actionLabel || formatAuditActionLabel(value),
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
      label: log.entityLabel || formatAuditEntityLabel(value),
    });
  }

  return [...seen.values()].sort(compareOptionLabels);
}
