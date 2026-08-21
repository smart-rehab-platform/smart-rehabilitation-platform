export function SpecialistAiReportSection({
  title,
  content,
  featured = false,
  variant = "default",
}) {
  if (!content) {
    return null;
  }

  return (
    <section
      className={[
        "pd-card",
        "pd-card-pad",
        "pd-specialist-ai-report-section",
        featured ? "pd-specialist-ai-report-section--featured" : "",
        variant === "warning" ? "pd-specialist-ai-report-section--warning" : "",
      ].filter(Boolean).join(" ")}
    >
      <h3 className="pd-specialist-review-section-title">{title}</h3>
      <p className="pd-specialist-report-section-body" dir="auto">{content}</p>
    </section>
  );
}
