export function AdminReportTypeBadge({ label, isAiReport = false }) {
  const text = typeof label === "string" && label.trim() ? label.trim() : "Report";

  return (
    <span
      className={`pd-admin-report-type-badge${isAiReport ? " is-ai" : ""}`}
    >
      {text}
    </span>
  );
}
