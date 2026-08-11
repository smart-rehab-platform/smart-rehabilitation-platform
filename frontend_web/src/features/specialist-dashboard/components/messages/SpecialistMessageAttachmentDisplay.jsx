import { useState } from "react";
import { Download } from "lucide-react";
import { PlatformMaterialIcon } from "../../../../components/platform/PlatformMaterialIcon";
import {
  getAttachmentDisplayName,
  getMessageAttachmentKind,
} from "../../utils/specialistMessageAttachmentUtils";
import { SpecialistMessageImageLightbox } from "./SpecialistMessageImageLightbox";

function MessageImageAttachment({ attachment }) {
  const [broken, setBroken] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const label = getAttachmentDisplayName(attachment.fileUrl, attachment.fileType);

  if (!attachment.fileUrl || broken) {
    return <p className="pd-message-attachment-fallback">Image unavailable</p>;
  }

  return (
    <>
      <button
        type="button"
        className="pd-message-attachment-image-button"
        onClick={() => setLightboxOpen(true)}
        aria-label={`View image: ${label}`}
      >
        <img
          src={attachment.fileUrl}
          alt={label}
          className="pd-message-attachment-image"
          onError={() => setBroken(true)}
        />
      </button>
      {lightboxOpen ? (
        <SpecialistMessageImageLightbox
          src={attachment.fileUrl}
          alt={label}
          onClose={() => setLightboxOpen(false)}
        />
      ) : null}
    </>
  );
}

function MessageVideoAttachment({ attachment }) {
  const label = getAttachmentDisplayName(attachment.fileUrl, attachment.fileType);

  if (!attachment.fileUrl) {
    return <p className="pd-message-attachment-fallback">Video unavailable</p>;
  }

  return (
    <div className="pd-message-attachment-video">
      <video controls preload="metadata" src={attachment.fileUrl}>
        <a href={attachment.fileUrl} target="_blank" rel="noreferrer">
          Download video
        </a>
      </video>
      <a
        href={attachment.fileUrl}
        target="_blank"
        rel="noreferrer"
        className="pd-message-attachment-download"
      >
        <Download size={14} aria-hidden="true" />
        {label}
      </a>
    </div>
  );
}

function MessageAudioAttachment({ attachment }) {
  const label = getAttachmentDisplayName(attachment.fileUrl, attachment.fileType);

  if (!attachment.fileUrl) {
    return <p className="pd-message-attachment-fallback">Audio unavailable</p>;
  }

  return (
    <div className="pd-message-attachment-audio">
      <audio controls preload="metadata" src={attachment.fileUrl} />
      <span className="pd-message-attachment-label">{label}</span>
    </div>
  );
}

function MessageFileAttachment({ attachment }) {
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
      <span>{kind === "pdf" ? "PDF document" : label}</span>
      <Download size={14} aria-hidden="true" />
    </a>
  );
}

export function SpecialistMessageAttachmentDisplay({ attachment }) {
  const kind = getMessageAttachmentKind(attachment.fileType);

  if (kind === "image") {
    return <MessageImageAttachment attachment={attachment} />;
  }

  if (kind === "video") {
    return <MessageVideoAttachment attachment={attachment} />;
  }

  if (kind === "audio") {
    return <MessageAudioAttachment attachment={attachment} />;
  }

  return <MessageFileAttachment attachment={attachment} />;
}
