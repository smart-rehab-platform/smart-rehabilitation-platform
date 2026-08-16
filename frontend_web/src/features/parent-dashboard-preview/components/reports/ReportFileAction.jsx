import { useLocale } from "../../../../context/useLocale.js";
import { PlatformMaterialIcon } from "../../../../components/platform/PlatformMaterialIcon";
import { openReportFileUrl } from "../../utils/parentReportsUtils";

export function ReportFileAction({
  report,
  onOpenError,
  compact = false,
}) {
  const { t } = useLocale();

  if (!report?.hasFile || !report?.pdfUrl) {
    return (
      <p className="pd-report-file-unavailable" role="status">
        {t("parent.reports.fileUnavailableYet")}
      </p>
    );
  }

  const label = report.title
    ? t("parent.reports.openReportLabel", { title: report.title })
    : t("parent.reports.openReportFile");

  const handleOpen = () => {
    try {
      openReportFileUrl(report.pdfUrl);
    } catch (error) {
      onOpenError?.(error instanceof Error ? error.message : t("parent.reports.errors.fileUnavailable"));
    }
  };

  return (
    <div className={compact ? "pd-report-file-actions is-compact" : "pd-report-file-actions"}>
      <button
        type="button"
        className="pd-btn pd-btn-primary pd-btn-sm"
        onClick={handleOpen}
        aria-label={label}
      >
        <PlatformMaterialIcon icon="report" size={16} />
        {t("parent.reports.openReport")}
      </button>
    </div>
  );
}
