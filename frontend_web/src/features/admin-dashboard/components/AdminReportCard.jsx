import { ChevronRight, FileCheck2 } from "lucide-react";
import { getAdminReportPdfStatusLabel } from "../utils/adminReportsMappers";
import { AdminReportTypeBadge } from "./AdminReportTypeBadge";

function getPatientInitials(name) {
  const parts = String(name ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return "?";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

function formatListDate(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  try {
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  } catch {
    return "—";
  }
}

export function AdminReportCard({ report, onOpen }) {
  if (!report) {
    return null;
  }

  const patientName = report.patientName || "—";
  const summary = typeof report.summary === "string" ? report.summary.trim() : "";
  const pdfReadyLabel = getAdminReportPdfStatusLabel(Boolean(report.hasPdf));
  const createdLabel = formatListDate(report.createdAt);

  return (
    <article className="pd-card pd-card-pad pd-admin-report-card pd-section-enter">
      <div className="pd-admin-report-card-top">
        <span className="pd-admin-report-avatar" aria-hidden="true">
          {getPatientInitials(report.patientName)}
        </span>

        <div className="pd-admin-report-card-heading">
          <h2 className="pd-admin-report-card-title">{report.title || "Report"}</h2>
          <p className="pd-admin-report-card-patient">{patientName}</p>
        </div>
      </div>

      <div className="pd-admin-report-card-meta">
        <AdminReportTypeBadge
          label={report.reportTypeLabel}
          isAiReport={Boolean(report.isAiReport)}
        />
        {pdfReadyLabel ? (
          <span className="pd-admin-report-pdf-badge">
            <FileCheck2 size={13} aria-hidden="true" />
            {pdfReadyLabel}
          </span>
        ) : null}
        <span className="pd-admin-report-card-date">{createdLabel}</span>
      </div>

      {summary ? (
        <p className="pd-admin-report-card-summary">{summary}</p>
      ) : (
        <p className="pd-admin-report-card-summary is-empty">—</p>
      )}

      <button
        type="button"
        className="pd-btn pd-btn-soft pd-admin-report-card-action"
        onClick={() => onOpen?.(report)}
      >
        View details
        <ChevronRight size={16} aria-hidden="true" />
      </button>
    </article>
  );
}

export function AdminReportCardSkeleton() {
  return (
    <div className="pd-card pd-card-pad pd-admin-report-card is-skeleton" aria-hidden="true">
      <div className="pd-admin-report-card-top">
        <span className="pd-admin-report-skeleton-avatar" />
        <div className="pd-admin-report-skeleton-copy">
          <span className="pd-admin-report-skeleton-line is-title" />
          <span className="pd-admin-report-skeleton-line is-sub" />
        </div>
      </div>
      <span className="pd-admin-report-skeleton-line is-meta" />
      <span className="pd-admin-report-skeleton-line is-summary" />
      <span className="pd-admin-report-skeleton-line is-summary-short" />
    </div>
  );
}
