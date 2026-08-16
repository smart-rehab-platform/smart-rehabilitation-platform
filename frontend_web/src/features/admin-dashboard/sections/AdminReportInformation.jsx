import { FileCheck2 } from "lucide-react";
import { formatReportDateLabel } from "../../specialist-dashboard/utils/specialistReportsLocalization.js";
import { useLocale } from "../../../context/useLocale.js";

function InfoRow({ label, children }) {
  return (
    <div className="pd-admin-report-info-row">
      <span className="pd-admin-report-info-label">{label}</span>
      <span className="pd-admin-report-info-value">{children}</span>
    </div>
  );
}

export function AdminReportInformation({ report, labels }) {
  const { t, locale } = useLocale();

  if (!report || !labels) {
    return null;
  }

  const emptyDisplay = labels.emptyDisplay;
  const specialistValue = report.isAiReport
    ? emptyDisplay
    : (report.specialistName || emptyDisplay);
  const typeLabel = report.typeBadgeLabel || report.categoryLabel || emptyDisplay;
  const dateLabel = report.dateLabel
    ?? formatReportDateLabel(report.createdAt ?? report.date, locale, t)
    ?? emptyDisplay;
  const pdfReadyLabel = report.pdfReadyLabel;

  return (
    <section
      className="pd-card pd-card-pad pd-admin-report-section pd-section-enter"
      aria-label={labels.reportInformation}
    >
      <h2 className="pd-admin-report-section-title">{labels.reportInformation}</h2>

      <div className="pd-admin-report-info-list">
        <InfoRow label={labels.patient}>{report.patientName || emptyDisplay}</InfoRow>
        <InfoRow label={labels.specialist}>{specialistValue}</InfoRow>
        <InfoRow label={labels.reportType}>{typeLabel}</InfoRow>
        <InfoRow label={labels.createdDate}>{dateLabel}</InfoRow>
        {pdfReadyLabel ? (
          <InfoRow label={labels.status}>
            <span className="pd-admin-report-pdf-badge">
              <FileCheck2 size={13} aria-hidden="true" />
              {pdfReadyLabel}
            </span>
          </InfoRow>
        ) : null}
      </div>
    </section>
  );
}
