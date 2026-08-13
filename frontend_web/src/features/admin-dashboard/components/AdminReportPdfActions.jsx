import { useRef, useState } from "react";
import { Copy, ExternalLink, FilePlus2 } from "lucide-react";
import { exportAdminReportPdf } from "../../../services/adminReportsService";
import { mapAdminReportExportResult } from "../utils/adminReportsMappers";

export function AdminReportPdfActions({
  report,
  onReportUpdated,
  onRefresh,
  showToast,
}) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState(null);
  const [copyError, setCopyError] = useState(null);
  const exportLockRef = useRef(false);

  if (!report) {
    return null;
  }

  const resolvedUrl = report.pdfResolvedUrl || null;
  const canView = Boolean(report.hasPdf && resolvedUrl);

  const handleCopyPdfLink = async () => {
    setCopyError(null);

    if (!canView) {
      setCopyError("PDF link is unavailable.");
      return;
    }

    try {
      await navigator.clipboard.writeText(resolvedUrl);
      showToast?.("PDF link copied.");
    } catch {
      setCopyError("Unable to copy PDF link.");
      showToast?.("Unable to copy PDF link.");
    }
  };

  const handleGeneratePdf = async () => {
    if (exportLockRef.current || isExporting) {
      return;
    }

    exportLockRef.current = true;
    setIsExporting(true);
    setExportError(null);

    try {
      const exportData = await exportAdminReportPdf(report.id, Boolean(report.isAiReport));
      const mapped = mapAdminReportExportResult(exportData, Boolean(report.isAiReport));

      if (mapped) {
        onReportUpdated?.(mapped);
      } else {
        await onRefresh?.();
      }

      showToast?.("PDF generated successfully.");
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : "Failed to export report PDF.";
      setExportError(message);
    } finally {
      exportLockRef.current = false;
      setIsExporting(false);
    }
  };

  return (
    <section className="pd-card pd-card-pad pd-admin-report-section pd-section-enter" aria-label="PDF actions">
      <h2 className="pd-admin-report-section-title">PDF Actions</h2>

      {canView ? (
        <div className="pd-admin-report-pdf-actions">
          <a
            className="pd-btn pd-btn-primary"
            href={resolvedUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View PDF report"
          >
            <ExternalLink size={16} aria-hidden="true" />
            View PDF
          </a>
          <button
            type="button"
            className="pd-btn pd-btn-soft"
            onClick={handleCopyPdfLink}
          >
            <Copy size={16} aria-hidden="true" />
            Copy PDF Link
          </button>
        </div>
      ) : (
        <div className="pd-admin-report-pdf-actions">
          {report.hasPdf && !resolvedUrl ? (
            <p className="pd-admin-report-empty-copy" role="alert">
              PDF attachment is unavailable.
            </p>
          ) : null}
          <button
            type="button"
            className="pd-btn pd-btn-primary"
            onClick={handleGeneratePdf}
            disabled={isExporting}
            aria-busy={isExporting}
          >
            <FilePlus2 size={16} aria-hidden="true" />
            {isExporting ? "Generating PDF..." : "Generate PDF"}
          </button>
        </div>
      )}

      {copyError ? <p className="pd-inline-error" role="alert">{copyError}</p> : null}
      {exportError ? <p className="pd-inline-error" role="alert">{exportError}</p> : null}
    </section>
  );
}
