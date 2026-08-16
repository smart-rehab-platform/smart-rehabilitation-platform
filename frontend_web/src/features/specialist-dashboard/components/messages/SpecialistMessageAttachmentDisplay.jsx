import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { useLocale } from "../../../../context/useLocale.js";
import { PlatformMaterialIcon } from "../../../../components/platform/PlatformMaterialIcon";
import {
  getAttachmentDisplayName,
  getMessageAttachmentKind,
} from "../../utils/specialistMessageAttachmentUtils";
import { getSpecialistMessageAttachmentLabels } from "../../utils/specialistMessagesLocalization.js";
import { SpecialistMessageImageLightbox } from "./SpecialistMessageImageLightbox";

function MessageImageAttachment({ attachment, labels }) {
  const [broken, setBroken] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const label = getAttachmentDisplayName(attachment.fileUrl, attachment.fileType);

  if (!attachment.fileUrl || broken) {
    return <p className="pd-message-attachment-fallback">{labels.imageUnavailable}</p>;
  }

  return (
    <>
      <button
        type="button"
        className="pd-message-attachment-image-button"
        onClick={() => setLightboxOpen(true)}
        aria-label={labels.viewImage(label)}
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

function MessageVideoAttachment({ attachment, labels }) {
  const label = getAttachmentDisplayName(attachment.fileUrl, attachment.fileType);

  if (!attachment.fileUrl) {
    return <p className="pd-message-attachment-fallback">{labels.videoUnavailable}</p>;
  }

  return (
    <div className="pd-message-attachment-video">
      <video controls preload="metadata" src={attachment.fileUrl}>
        <a href={attachment.fileUrl} target="_blank" rel="noreferrer">
          {labels.downloadVideo}
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

function MessageAudioAttachment({ attachment, labels }) {
  const label = getAttachmentDisplayName(attachment.fileUrl, attachment.fileType);

  if (!attachment.fileUrl) {
    return <p className="pd-message-attachment-fallback">{labels.audioUnavailable}</p>;
  }

  return (
    <div className="pd-message-attachment-audio">
      <audio controls preload="metadata" src={attachment.fileUrl} />
      <span className="pd-message-attachment-label" dir="auto">{label}</span>
    </div>
  );
}

function MessageFileAttachment({ attachment, labels }) {
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
      <span dir="auto">{kind === "pdf" ? labels.pdfDocument : label}</span>
      <Download size={14} aria-hidden="true" />
    </a>
  );
}

export function SpecialistMessageAttachmentDisplay({ attachment }) {
  const { t } = useLocale();
  const labels = useMemo(() => getSpecialistMessageAttachmentLabels(t), [t]);
  const kind = getMessageAttachmentKind(attachment.fileType);

  if (kind === "image") {
    return <MessageImageAttachment attachment={attachment} labels={labels} />;
  }

  if (kind === "video") {
    return <MessageVideoAttachment attachment={attachment} labels={labels} />;
  }

  if (kind === "audio") {
    return <MessageAudioAttachment attachment={attachment} labels={labels} />;
  }

  return <MessageFileAttachment attachment={attachment} labels={labels} />;
}
