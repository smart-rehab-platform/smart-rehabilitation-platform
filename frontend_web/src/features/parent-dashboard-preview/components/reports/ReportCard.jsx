import { useNavigate } from "react-router-dom";
import { buildParentReportDetailPath } from "../../../../routes/parentDashboardRoutes";
import { ReportFileAction } from "./ReportFileAction";

export function ReportCard({ report, onOpenError }) {
  const navigate = useNavigate();
  const detailPath = buildParentReportDetailPath(report.id);

  const handleViewDetails = () => {
    if (detailPath) {
      navigate(detailPath);
    }
  };

  return (
    <article className="pd-card pd-card-pad pd-task-hub-card pd-report-hub-card pd-section-enter">
      <div className="pd-task-hub-card-head">
        <div className="pd-task-hub-card-copy">
          {report.title ? (
            <h3 className="pd-task-hub-card-title">{report.title}</h3>
          ) : null}
          {report.childName ? (
            <p className="pd-task-hub-card-child">For {report.childName}</p>
          ) : null}
        </div>
        {report.reportTypeLabel ? (
          <span className="pd-report-type-badge">{report.reportTypeLabel}</span>
        ) : null}
      </div>

      <ul className="pd-task-hub-card-meta">
        {report.generatedDate ? (
          <li>
            <strong>Generated</strong>
            <span>{report.generatedDate}</span>
          </li>
        ) : null}
        {report.authorName ? (
          <li>
            <strong>Specialist</strong>
            <span>{report.authorName}</span>
          </li>
        ) : null}
      </ul>

      {report.summaryPreview ? (
        <p className="pd-task-hub-card-preview">{report.summaryPreview}</p>
      ) : null}

      <div className="pd-task-hub-card-actions pd-report-hub-card-actions">
        <button
          type="button"
          className="pd-btn pd-btn-soft pd-btn-sm"
          onClick={handleViewDetails}
          aria-label={report.title ? `View details for ${report.title}` : "View report details"}
        >
          View Details
        </button>
        {report.hasFile ? (
          <ReportFileAction report={report} onOpenError={onOpenError} compact />
        ) : (
          <span className="pd-report-file-note">File not available yet</span>
        )}
      </div>
    </article>
  );
}
