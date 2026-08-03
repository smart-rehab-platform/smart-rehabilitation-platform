import { normalizeReportSummary } from "../../utils/parentReportsUtils";

export function ReportSummarySections({ summaryRaw }) {
  const normalized = normalizeReportSummary(summaryRaw);

  if (normalized.plainText) {
    return (
      <section className="pd-report-summary-section pd-section-enter" aria-label="Report summary">
        <h3 className="pd-report-section-title">Summary</h3>
        <p className="pd-report-summary-text">{normalized.plainText}</p>
      </section>
    );
  }

  if (normalized.sections.length === 0 && normalized.listSections.length === 0) {
    return null;
  }

  return (
    <div className="pd-report-summary-stack">
      {normalized.sections.map((section) => (
        <section
          key={section.label}
          className="pd-report-summary-section pd-section-enter"
          aria-label={section.label}
        >
          <h3 className="pd-report-section-title">{section.label}</h3>
          <p className="pd-report-summary-text">{section.value}</p>
        </section>
      ))}

      {normalized.listSections.map((section) => (
        <section
          key={section.label}
          className="pd-report-summary-section pd-section-enter"
          aria-label={section.label}
        >
          <h3 className="pd-report-section-title">{section.label}</h3>
          <ul className="pd-report-summary-list">
            {section.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
