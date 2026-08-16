export function AdminReportSummary({ summary, isAiReport = false, labels }) {
  if (!labels) {
    return null;
  }

  const text = typeof summary === "string" ? summary.trim() : "";
  const sectionTitle = isAiReport ? labels.aiSummary : labels.summary;

  return (
    <section
      className="pd-card pd-card-pad pd-admin-report-section pd-section-enter"
      aria-label={sectionTitle}
    >
      <h2 className="pd-admin-report-section-title">{sectionTitle}</h2>
      {text ? (
        <p className="pd-admin-report-summary-body" dir="auto">{text}</p>
      ) : (
        <p className="pd-admin-report-empty-copy">{labels.noSummary}</p>
      )}
    </section>
  );
}
