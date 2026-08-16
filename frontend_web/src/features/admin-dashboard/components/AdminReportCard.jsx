import { ChevronRight, FileCheck2 } from "lucide-react";
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

export function AdminReportCard({ report, labels, onOpen }) {
  if (!report || !labels) {
    return null;
  }

  const emptyDisplay = labels.emptyDisplay;
  const patientName = report.patientName || emptyDisplay;
  const summary = typeof report.summary === "string" ? report.summary.trim() : "";
  const typeLabel = report.typeBadgeLabel || report.categoryLabel;
  const pdfReadyLabel = report.pdfReadyLabel;
  const dateLabel = report.dateLabel || emptyDisplay;

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
        {typeLabel ? (
          <AdminReportTypeBadge
            label={typeLabel}
            isAiReport={Boolean(report.isAiReport)}
          />
        ) : null}
        {pdfReadyLabel ? (
          <span className="pd-admin-report-pdf-badge">
            <FileCheck2 size={13} aria-hidden="true" />
            {pdfReadyLabel}
          </span>
        ) : null}
        <span className="pd-admin-report-card-date">{dateLabel}</span>
      </div>

      {summary ? (
        <p className="pd-admin-report-card-summary" dir="auto">{summary}</p>
      ) : (
        <p className="pd-admin-report-card-summary is-empty">{emptyDisplay}</p>
      )}

      <button
        type="button"
        className="pd-btn pd-btn-soft pd-admin-report-card-action"
        onClick={() => onOpen?.(report)}
      >
        {labels.viewDetails}
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
