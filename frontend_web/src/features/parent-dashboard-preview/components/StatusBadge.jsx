export function StatusBadge({ label, tone = "blue" }) {
  return (
    <span className={`pd-status-badge pd-status-${tone}`} role="status">
      {label}
    </span>
  );
}
