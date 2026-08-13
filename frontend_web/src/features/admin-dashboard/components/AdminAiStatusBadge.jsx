export function AdminAiStatusBadge({ label, tone = "muted" }) {
  if (!label) {
    return null;
  }

  return (
    <span className={`pd-admin-ai-status is-${tone}`} role="status">
      {label}
    </span>
  );
}
