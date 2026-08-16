export function AdminAuditActionBadge({
  label,
  category = "activity",
  tone = "neutral",
  action = "",
}) {
  if (!label) {
    return null;
  }

  return (
    <span
      className={`pd-admin-audit-action-badge is-${tone}`}
      role="status"
      data-action-category={category}
      data-action-code={action}
    >
      {label}
    </span>
  );
}
