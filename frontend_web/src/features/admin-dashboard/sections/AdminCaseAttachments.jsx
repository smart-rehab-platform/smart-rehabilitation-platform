import { ExternalLink, FileText, Image as ImageIcon } from "lucide-react";

function AttachmentIcon({ attachment }) {
  if (attachment.isImage) {
    return <ImageIcon size={18} strokeWidth={2.1} aria-hidden="true" />;
  }

  return <FileText size={18} strokeWidth={2.1} aria-hidden="true" />;
}

export function AdminCaseAttachments({ attachments }) {
  return (
    <section className="pd-card pd-card-pad pd-admin-case-request-section pd-section-enter" aria-label="Attachments">
      <h2 className="pd-admin-case-request-section-title">Attachments</h2>

      {attachments.length === 0 ? (
        <p className="pd-admin-case-request-empty-copy">No attachments</p>
      ) : (
        <ul className="pd-admin-case-attachments-list">
          {attachments.map((attachment) => (
            <li key={attachment.id} className="pd-admin-case-attachment-row">
              <span className="pd-admin-case-attachment-icon" aria-hidden="true">
                <AttachmentIcon attachment={attachment} />
              </span>
              <div className="pd-admin-case-attachment-copy">
                <strong>{attachment.originalName}</strong>
                <span>{attachment.fileType || "File"}</span>
              </div>
              {attachment.resolvedUrl ? (
                <a
                  href={attachment.resolvedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pd-btn pd-btn-soft pd-btn-compact"
                >
                  Open
                  <ExternalLink size={14} aria-hidden="true" />
                </a>
              ) : (
                <span className="pd-admin-case-request-empty-copy">Unavailable</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
