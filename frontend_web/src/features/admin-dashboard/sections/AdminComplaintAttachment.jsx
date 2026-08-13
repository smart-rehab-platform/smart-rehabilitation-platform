import { ExternalLink, FileText, Image as ImageIcon } from "lucide-react";
import { isComplaintAttachmentPdf } from "../utils/adminComplaintsMappers";

export function AdminComplaintAttachment({ attachmentUrl, attachmentResolvedUrl }) {
  const resolvedUrl = attachmentResolvedUrl || null;

  if (!resolvedUrl) {
    return null;
  }

  const isPdf = isComplaintAttachmentPdf(attachmentUrl || resolvedUrl);

  return (
    <section className="pd-card pd-card-pad pd-admin-complaint-section pd-section-enter" aria-label="Attachment">
      <h2 className="pd-admin-complaint-section-title">Attachment</h2>

      <div className="pd-admin-complaint-attachment-row">
        <span className="pd-admin-complaint-attachment-icon" aria-hidden="true">
          {isPdf ? <FileText size={18} strokeWidth={2.1} /> : <ImageIcon size={18} strokeWidth={2.1} />}
        </span>
        <div className="pd-admin-complaint-attachment-copy">
          <strong>{isPdf ? "PDF attachment" : "Image attachment"}</strong>
          <span>Open to view the submitted file</span>
        </div>
        <a
          href={resolvedUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="pd-btn pd-btn-soft pd-btn-compact"
        >
          Open attachment
          <ExternalLink size={14} aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
