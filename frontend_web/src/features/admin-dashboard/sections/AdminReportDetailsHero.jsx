import { AdminReportTypeBadge } from "../components/AdminReportTypeBadge";
import {
  formatAdminReportDate,
  getAdminReportPdfStatusLabel,
} from "../utils/adminReportsMappers";

function getPatientInitials(name) {
  const parts = String(name ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return "P";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

function formatPeriodDate(value) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  try {
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  } catch {
    return null;
  }
}

export function AdminReportDetailsHero({ report }) {
  if (!report) {
    return null;
  }

  const patientName = report.patientName || "Patient";
  const pdfReadyLabel = getAdminReportPdfStatusLabel(Boolean(report.hasPdf));
  const periodStart = formatPeriodDate(report.periodStart);
  const periodEnd = formatPeriodDate(report.periodEnd);
  const showPeriod = Boolean(report.isAiReport && periodStart && periodEnd);

  return (
    <section className="pd-card pd-card-pad pd-admin-report-details-hero pd-section-enter" aria-label="Report summary">
      <div className="pd-admin-report-details-hero-top">
        <span className="pd-admin-report-avatar pd-admin-report-avatar-lg" aria-hidden="true">
          {getPatientInitials(report.patientName)}
        </span>
        <div className="pd-admin-report-details-hero-copy">
          <p className="pd-admin-report-details-patient">{patientName}</p>
          <h1 className="pd-admin-report-details-title">{report.title || "Report"}</h1>
        </div>
      </div>

      <div className="pd-admin-report-card-meta">
        <AdminReportTypeBadge
          label={report.reportTypeLabel}
          isAiReport={Boolean(report.isAiReport)}
        />
        {report.isAiReport ? (
          <span className="pd-admin-report-type-badge is-ai">AI</span>
        ) : null}
        {pdfReadyLabel ? (
          <span className="pd-admin-report-pdf-badge">{pdfReadyLabel}</span>
        ) : null}
        <span className="pd-admin-report-card-date">
          {formatAdminReportDate(report.createdAt)}
        </span>
      </div>

      {showPeriod ? (
        <p className="pd-admin-report-details-period">
          Period: {periodStart} – {periodEnd}
        </p>
      ) : null}
    </section>
  );
}
