import { FileText } from "lucide-react";

function resolvePdfLabel(resolvedUrl, fallbackLabel) {
  if (!resolvedUrl) {
    return fallbackLabel;
  }

  try {
    const pathname = new URL(resolvedUrl, window.location.origin).pathname;
    const filename = pathname.split("/").filter(Boolean).pop();
    if (filename) {
      return decodeURIComponent(filename);
    }
  } catch {
    // Fall through to default label.
  }

  return fallbackLabel;
}

export function AdminReportAttachment({ report, labels }) {
  if (!report?.hasPdf || !labels) {
    return null;
  }

  const pdfReportLabel = labels.pdfReport;
  const resolvedUrl = report.pdfResolvedUrl || null;
  const filename = resolvePdfLabel(resolvedUrl, pdfReportLabel);

  return (
    <section
      className="pd-card pd-card-pad pd-admin-report-section pd-section-enter"
      aria-label={labels.attachments}
    >
      <h2 className="pd-admin-report-section-title">{labels.attachments}</h2>

      <div className="pd-admin-report-attachment-row">
        <span className="pd-admin-report-attachment-icon" aria-hidden="true">
          <FileText size={18} strokeWidth={2.1} />
        </span>
        <div className="pd-admin-report-attachment-copy">
          <strong>{pdfReportLabel}</strong>
          <span dir="auto">{filename}</span>
        </div>
      </div>

      {!resolvedUrl ? (
        <p className="pd-admin-report-empty-copy" role="alert">
          {labels.pdfUnavailable}
        </p>
      ) : null}
    </section>
  );
}
