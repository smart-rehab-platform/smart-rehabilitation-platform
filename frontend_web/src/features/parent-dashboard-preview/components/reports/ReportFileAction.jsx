import { FileText } from "lucide-react";
import { openReportFileUrl } from "../../utils/parentReportsUtils";

export function ReportFileAction({
  report,
  onOpenError,
  compact = false,
}) {
  if (!report?.hasFile || !report?.pdfUrl) {
    return (
      <p className="pd-report-file-unavailable" role="status">
        Report file is not available yet.
      </p>
    );
  }

  const label = report.title
    ? `Open report: ${report.title}`
    : "Open report file";

  const handleOpen = () => {
    try {
      openReportFileUrl(report.pdfUrl);
    } catch (error) {
      onOpenError?.(error instanceof Error ? error.message : "Unable to open report file.");
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
        <FileText size={16} aria-hidden="true" />
        Open Report
      </button>
    </div>
  );
}
