export const AUDIT_ACTION_FALLBACKS = Object.freeze({
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
});

export const AUDIT_ENTITY_FALLBACKS = Object.freeze({
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
});

const CATEGORY_TONES = Object.freeze({
  create: "success",
  update: "info",
  complete: "warning",
  delete: "danger",
  assign: "info",
  login: "neutral",
  cancel: "warning",
  activity: "neutral",
});

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

export function isAuditEntityReferenceId(value) {
  const id = readString(value);
  return Boolean(id && UUID_PATTERN.test(id));
}
