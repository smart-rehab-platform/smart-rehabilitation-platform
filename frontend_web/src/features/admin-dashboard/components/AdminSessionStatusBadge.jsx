export function AdminSessionStatusBadge({ label, tone = "muted", variant = "pill" }) {
  if (!label) {
    return null;
  }

  if (variant === "dot") {
    return (
      <span className={`pd-admin-sessions-status-dot is-${tone}`} role="status">
        <span className="pd-admin-sessions-status-dot-marker" aria-hidden="true" />
        <span className="pd-admin-sessions-status-dot-label">{label}</span>
      </span>
    );
  }

  return (
    <span className={`pd-admin-sessions-status is-${tone}`} role="status">
      {label}
    </span>
  );
}
