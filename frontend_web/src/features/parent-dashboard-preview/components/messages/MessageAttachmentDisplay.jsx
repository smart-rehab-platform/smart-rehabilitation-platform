import { useState } from "react";
import { Download } from "lucide-react";
import { PlatformMaterialIcon } from "../../../../components/platform/PlatformMaterialIcon";
import { useLocale } from "../../../../context/useLocale.js";
import {
  getAttachmentDisplayName,
  getMessageAttachmentKind,
} from "../../utils/parentMessageAttachmentUtils";
import { MessageImageLightbox } from "./MessageImageLightbox";

function MessageImageAttachment({ attachment, t }) {
  const [broken, setBroken] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const label = getAttachmentDisplayName(attachment.fileUrl, attachment.fileType);

  if (!attachment.fileUrl || broken) {
    return <p className="pd-message-attachment-fallback">{t("parent.messages.attachments.imageUnavailable")}</p>;
  }

  return (
    <>
      <button
        type="button"
        className="pd-message-attachment-image-button"
        onClick={() => setLightboxOpen(true)}
        aria-label={t("parent.messages.attachments.viewImage", { label })}
      >
        <img
          src={attachment.fileUrl}
          alt={label}
          className="pd-message-attachment-image"
          onError={() => setBroken(true)}
        />
      </button>
      {lightboxOpen ? (
        <MessageImageLightbox
          src={attachment.fileUrl}
          alt={label}
          onClose={() => setLightboxOpen(false)}
        />
      ) : null}
    </>
  );
}

function MessageVideoAttachment({ attachment, t }) {
  const label = getAttachmentDisplayName(attachment.fileUrl, attachment.fileType);

  if (!attachment.fileUrl) {
    return <p className="pd-message-attachment-fallback">{t("parent.messages.attachments.videoUnavailable")}</p>;
  }

  return (
    <div className="pd-message-attachment-video">
      <video controls preload="metadata" src={attachment.fileUrl}>
        <a href={attachment.fileUrl} target="_blank" rel="noreferrer">
          {t("parent.messages.attachments.downloadVideo")}
        </a>
      </video>
      <a
        href={attachment.fileUrl}
        target="_blank"
        rel="noreferrer"
        className="pd-message-attachment-download"
      >
        <Download size={14} aria-hidden="true" />
        <span dir="auto">{label}</span>
      </a>
    </div>
  );
}

function MessageAudioAttachment({ attachment, t }) {
  const label = getAttachmentDisplayName(attachment.fileUrl, attachment.fileType);

  if (!attachment.fileUrl) {
    return <p className="pd-message-attachment-fallback">{t("parent.messages.attachments.audioUnavailable")}</p>;
  }

  return (
    <div className="pd-message-attachment-audio">
      <audio controls preload="metadata" src={attachment.fileUrl} />
      <span className="pd-message-attachment-label" dir="auto">{label}</span>
    </div>
  );
}

function MessageFileAttachment({ attachment, t }) {
  const label = getAttachmentDisplayName(attachment.fileUrl, attachment.fileType);
  const kind = getMessageAttachmentKind(attachment.fileType);

  return (
    <a
      href={attachment.fileUrl || undefined}
      target="_blank"
      rel="noreferrer"
      className="pd-message-attachment-file"
    >
      <PlatformMaterialIcon icon="report" size={16} />
      <span dir="auto">{kind === "pdf" ? t("parent.messages.pdfDocument") : label}</span>
      <Download size={14} aria-hidden="true" />
    </a>
  );
}

export function MessageAttachmentDisplay({ attachment }) {
  const { t } = useLocale();
  const kind = getMessageAttachmentKind(attachment.fileType);

  if (kind === "image") {
    return <MessageImageAttachment attachment={attachment} t={t} />;
  }

  if (kind === "video") {
    return <MessageVideoAttachment attachment={attachment} t={t} />;
  }

  if (kind === "audio") {
    return <MessageAudioAttachment attachment={attachment} t={t} />;
  }

  return <MessageFileAttachment attachment={attachment} t={t} />;
}
