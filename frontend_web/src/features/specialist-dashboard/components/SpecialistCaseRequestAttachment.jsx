import { FileText, Image as ImageIcon, Music, Paperclip, Video } from "lucide-react";
import { useLocale } from "../../../context/useLocale";
import { resolveUploadedAssetUrl } from "../../../services/apiConfig";

function AttachmentIcon({ kind }) {
  if (kind === "image") return <ImageIcon size={16} aria-hidden="true" />;
  if (kind === "pdf") return <FileText size={16} aria-hidden="true" />;
  if (kind === "audio") return <Music size={16} aria-hidden="true" />;
  if (kind === "video") return <Video size={16} aria-hidden="true" />;
  return <Paperclip size={16} aria-hidden="true" />;
}

export function SpecialistCaseRequestAttachments({ attachments = [], onOpenError }) {
  const { t } = useLocale();

  if (!attachments.length) {
    return (
      <section className="pd-card pd-card-pad pd-specialist-case-section">
        <h2 className="pd-specialist-case-section-title">{t("specialist.caseRequests.attachments")}</h2>
        <p className="pd-section-sub">{t("specialist.caseRequests.noAttachments")}</p>
      </section>
    );
  }

  const handleOpen = (attachment) => {
    const url = resolveUploadedAssetUrl(attachment.fileUrl);
    if (!url) {
      onOpenError?.(t("specialist.caseRequests.toast.attachmentOpenFailed"));
      return;
    }
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <section className="pd-card pd-card-pad pd-specialist-case-section">
      <h2 className="pd-specialist-case-section-title">{t("specialist.caseRequests.attachments")}</h2>
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
                <strong dir="auto">{attachment.displayName}</strong>
                <span>{attachment.typeLabel}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
