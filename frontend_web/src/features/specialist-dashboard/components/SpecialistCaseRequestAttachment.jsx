import { FileText, Image as ImageIcon, Music, Paperclip, Video } from "lucide-react";
import { resolveUploadedAssetUrl } from "../../../services/apiConfig";

function AttachmentIcon({ kind }) {
  if (kind === "image") return <ImageIcon size={16} aria-hidden="true" />;
  if (kind === "pdf") return <FileText size={16} aria-hidden="true" />;
  if (kind === "audio") return <Music size={16} aria-hidden="true" />;
  if (kind === "video") return <Video size={16} aria-hidden="true" />;
  return <Paperclip size={16} aria-hidden="true" />;
}

export function SpecialistCaseRequestAttachments({ attachments = [], onOpenError }) {
  if (!attachments.length) {
    return (
      <section className="pd-card pd-card-pad pd-specialist-case-section">
        <h2 className="pd-specialist-case-section-title">Attachments</h2>
        <p className="pd-section-sub">No attachments</p>
      </section>
    );
  }

  const handleOpen = (attachment) => {
    const url = resolveUploadedAssetUrl(attachment.fileUrl);
    if (!url) {
      onOpenError?.("Unable to open this attachment.");
      return;
    }
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <section className="pd-card pd-card-pad pd-specialist-case-section">
      <h2 className="pd-specialist-case-section-title">Attachments</h2>
      <ul className="pd-specialist-case-attachments">
        {attachments.map((attachment) => (
          <li key={attachment.id}>
            <button
              type="button"
              className="pd-specialist-case-attachment-btn"
              onClick={() => handleOpen(attachment)}
            >
              <AttachmentIcon kind={attachment.kind} />
              <span className="pd-specialist-case-attachment-copy">
                <strong>{attachment.displayName}</strong>
                <span>{attachment.typeLabel}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
