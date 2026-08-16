import { useNavigate } from "react-router-dom";
import { useLocale } from "../../../../context/useLocale.js";
import { buildParentReportDetailPath } from "../../../../routes/parentDashboardRoutes";
import { ReportFileAction } from "./ReportFileAction";

export function ReportCard({ report, onOpenError }) {
  const navigate = useNavigate();
  const { t } = useLocale();
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
            <p className="pd-task-hub-card-child">
              {t("parent.reports.forChild", { name: report.childName })}
            </p>
          ) : null}
        </div>
        {report.reportTypeLabel ? (
          <span className="pd-report-type-badge">{report.reportTypeLabel}</span>
        ) : null}
      </div>

      <ul className="pd-task-hub-card-meta">
        {report.generatedDate ? (
          <li>
            <strong>{t("parent.reports.generated")}</strong>
            <span>{report.generatedDate}</span>
          </li>
        ) : null}
        {report.authorName ? (
          <li>
            <strong>{t("parent.common.specialist")}</strong>
            <span>{report.authorName}</span>
          </li>
        ) : null}
      </ul>

      {report.summaryPreview ? (
        <p className="pd-task-hub-card-preview" dir="auto">{report.summaryPreview}</p>
      ) : null}

      <div className="pd-task-hub-card-actions pd-report-hub-card-actions">
        <button
          type="button"
          className="pd-btn pd-btn-soft pd-btn-sm"
          onClick={handleViewDetails}
          aria-label={report.title
            ? t("parent.reports.viewDetailsAria", { title: report.title })
            : t("parent.reports.viewReportDetails")}
        >
          {t("parent.common.viewDetails")}
        </button>
        {report.hasFile ? (
          <ReportFileAction report={report} onOpenError={onOpenError} compact />
        ) : (
          <span className="pd-report-file-note">{t("parent.reports.fileNotAvailable")}</span>
        )}
      </div>
    </article>
  );
}
