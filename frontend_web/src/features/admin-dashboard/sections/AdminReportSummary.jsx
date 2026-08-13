export function AdminReportSummary({ summary, isAiReport = false }) {
  const text = typeof summary === "string" ? summary.trim() : "";

  return (
    <section className="pd-card pd-card-pad pd-admin-report-section pd-section-enter" aria-label="Summary">
      <h2 className="pd-admin-report-section-title">
        {isAiReport ? "AI Summary" : "Summary"}
      </h2>
      {text ? (
        <p className="pd-admin-report-summary-body">{text}</p>
      ) : (
        <p className="pd-admin-report-empty-copy">No summary available.</p>
      )}
    </section>
  );
}
