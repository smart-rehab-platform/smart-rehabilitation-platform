import {
  formatAdminReportDate,
  getAdminReportPdfStatusLabel,
} from "../utils/adminReportsMappers";

function InfoRow({ label, children }) {
  return (
    <div className="pd-admin-report-info-row">
      <span className="pd-admin-report-info-label">{label}</span>
      <span className="pd-admin-report-info-value">{children}</span>
    </div>
  );
}

export function AdminReportInformation({ report }) {
  if (!report) {
    return null;
  }

  const specialistValue = report.isAiReport
    ? "—"
    : (report.specialistName || "—");
  const pdfReadyLabel = getAdminReportPdfStatusLabel(Boolean(report.hasPdf));

  return (
    <section className="pd-card pd-card-pad pd-admin-report-section pd-section-enter" aria-label="Report information">
      <h2 className="pd-admin-report-section-title">Report Information</h2>

      <div className="pd-admin-report-info-list">
        <InfoRow label="Patient">{report.patientName || "—"}</InfoRow>
        <InfoRow label="Specialist">{specialistValue}</InfoRow>
        <InfoRow label="Report Type">{report.reportTypeLabel || "—"}</InfoRow>
        <InfoRow label="Created Date">
          {formatAdminReportDate(report.createdAt)}
        </InfoRow>
        {pdfReadyLabel ? (
          <InfoRow label="Status">
            <span className="pd-admin-report-pdf-badge">{pdfReadyLabel}</span>
          </InfoRow>
        ) : null}
      </div>
    </section>
  );
}
