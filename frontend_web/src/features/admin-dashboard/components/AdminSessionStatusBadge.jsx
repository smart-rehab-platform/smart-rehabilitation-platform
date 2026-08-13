export function AdminSessionStatusBadge({ label, tone = "muted" }) {
  if (!label) {
    return null;
  }

  return (
    <span className={`pd-admin-sessions-status is-${tone}`} role="status">
      {label}
    </span>
  );
}
