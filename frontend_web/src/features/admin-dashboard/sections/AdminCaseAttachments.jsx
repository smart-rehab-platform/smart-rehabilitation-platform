import { ExternalLink, FileText, Image as ImageIcon, Paperclip } from "lucide-react";

function AttachmentIcon({ attachment }) {
  if (attachment.isImage) {
    return <ImageIcon size={16} strokeWidth={2.1} aria-hidden="true" />;
  }

  return <FileText size={16} strokeWidth={2.1} aria-hidden="true" />;
}

export function AdminCaseAttachments({ attachments, labels }) {
  return (
    <section className="pd-admin-case-request-page-section pd-section-enter" aria-label={labels.attachments}>
      <h2 className="pd-admin-case-request-page-section-title">{labels.attachments}</h2>

      {attachments.length === 0 ? (
        <div className="pd-admin-case-attachments-empty">
          <Paperclip size={15} className="pd-admin-case-attachments-empty-icon" aria-hidden="true" />
          <p className="pd-admin-case-request-empty-copy">{labels.noAttachmentsForCase}</p>
        </div>
      ) : (
        <ul className="pd-admin-case-attachments-list">
          {attachments.map((attachment) => (
            <li key={attachment.id} className="pd-admin-case-attachment-row">
              <span className="pd-admin-case-attachment-icon" aria-hidden="true">
                <AttachmentIcon attachment={attachment} />
              </span>
              <div className="pd-admin-case-attachment-copy">
                <strong>
                  <bdi dir="auto">{attachment.originalName}</bdi>
                </strong>
                <span>{attachment.fileType || labels.fileTypeDefault}</span>
              </div>
              {attachment.resolvedUrl ? (
                <a
                  href={attachment.resolvedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pd-btn pd-btn-soft pd-btn-compact"
                >
                  {labels.open}
                  <ExternalLink size={14} aria-hidden="true" />
                </a>
              ) : (
                <span className="pd-admin-case-request-empty-copy">{labels.unavailable}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
