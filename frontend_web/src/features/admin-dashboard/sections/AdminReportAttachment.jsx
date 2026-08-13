import { FileText } from "lucide-react";

function resolvePdfLabel(resolvedUrl) {
  if (!resolvedUrl) {
    return "PDF report";
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

  return "PDF report";
}

export function AdminReportAttachment({ report }) {
  if (!report?.hasPdf) {
    return null;
  }

  const resolvedUrl = report.pdfResolvedUrl || null;
  const label = resolvePdfLabel(resolvedUrl);

  return (
    <section className="pd-card pd-card-pad pd-admin-report-section pd-section-enter" aria-label="Attachments">
      <h2 className="pd-admin-report-section-title">Attachments</h2>

      <div className="pd-admin-report-attachment-row">
        <span className="pd-admin-report-attachment-icon" aria-hidden="true">
          <FileText size={18} strokeWidth={2.1} />
        </span>
        <div className="pd-admin-report-attachment-copy">
          <strong>PDF report</strong>
          <span>{label}</span>
        </div>
      </div>

      {!resolvedUrl ? (
        <p className="pd-admin-report-empty-copy" role="alert">
          PDF attachment is unavailable.
        </p>
      ) : null}
    </section>
  );
}
