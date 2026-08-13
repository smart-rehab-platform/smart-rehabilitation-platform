const CATEGORY_LABELS = {
  create: "Create",
  update: "Update",
  complete: "Complete",
  delete: "Delete",
  assign: "Assign",
  login: "Login",
  cancel: "Cancel",
  activity: "Activity",
};

function resolveBadgeLabel(category, action) {
  if (category === "login") {
    const key = typeof action === "string" ? action.trim().toLowerCase() : "";
    if (key.includes("logout")) {
      return "Logout";
    }
    return "Login";
  }

  return CATEGORY_LABELS[category] ?? "Activity";
}

export function AdminAuditActionBadge({
  category = "activity",
  tone = "neutral",
  action = "",
}) {
  const label = resolveBadgeLabel(category, action);

  return (
    <span className={`pd-admin-audit-action-badge is-${tone}`} role="status">
      {label}
    </span>
  );
}
