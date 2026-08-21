export function SpecialistAiReportListSection({
  title,
  items,
  variant = "default",
}) {
  if (!Array.isArray(items) || items.length === 0) {
    return null;
  }

  const ListTag = variant === "numbered" ? "ol" : "ul";

  return (
    <section
      className={[
        "pd-card",
        "pd-card-pad",
        "pd-specialist-ai-report-section",
        "pd-specialist-ai-report-list-section",
        variant === "warning" ? "pd-specialist-ai-report-section--warning" : "",
      ].filter(Boolean).join(" ")}
    >
      <h3 className="pd-specialist-review-section-title">{title}</h3>
      <ListTag className="pd-specialist-ai-report-list">
        {items.map((item, index) => (
          <li key={`${title}-${index}`} dir="auto">{item}</li>
        ))}
      </ListTag>
    </section>
  );
}
