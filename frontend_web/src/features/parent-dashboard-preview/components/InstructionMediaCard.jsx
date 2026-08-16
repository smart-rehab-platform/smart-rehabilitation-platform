import { ExternalLink } from "lucide-react";
import { PlatformMaterialIcon } from "../../../components/platform/PlatformMaterialIcon";
import { useLocale } from "../../../context/useLocale.js";

export function InstructionMediaCard({ mediaUrl, mediaKind = "unknown", title = null }) {
  const { t } = useLocale();
  const cardTitle = title || t("parent.instructionMedia.title");

  if (!mediaUrl) {
    return null;
  }

  const kind = mediaKind || "unknown";

  return (
    <section className="pd-card pd-card-pad pd-instruction-media pd-section-enter" aria-label={cardTitle}>
      <h2 className="pd-section-title">{cardTitle}</h2>

      {kind === "image" ? (
        <div className="pd-instruction-media-frame">
          <img
            src={mediaUrl}
            alt=""
            className="pd-instruction-media-image"
            loading="lazy"
            onError={(event) => {
              event.currentTarget.closest(".pd-instruction-media-frame")?.classList.add("is-broken");
            }}
          />
          <p className="pd-instruction-media-fallback">{t("parent.instructionMedia.imageLoadFailed")}</p>
        </div>
      ) : null}

      {kind === "video" ? (
        <div className="pd-instruction-media-frame">
          <video
            className="pd-instruction-media-video"
            controls
            preload="metadata"
            src={mediaUrl}
          >
            {t("parent.instructionMedia.videoUnsupported")}
          </video>
        </div>
      ) : null}

      {kind === "audio" ? (
        <div className="pd-instruction-media-frame pd-instruction-media-audio">
          <audio className="pd-instruction-media-audio-player" controls preload="metadata" src={mediaUrl}>
            {t("parent.instructionMedia.audioUnsupported")}
          </audio>
        </div>
      ) : null}

      {kind === "pdf" || kind === "unknown" ? (
        <div className="pd-instruction-media-file">
          <span className="pd-instruction-media-file-icon" aria-hidden="true">
            <PlatformMaterialIcon icon="report" size={20} />
          </span>
          <div className="pd-instruction-media-file-copy">
            <strong>{kind === "pdf" ? t("parent.instructionMedia.pdfDocument") : t("parent.instructionMedia.mediaFile")}</strong>
            <span>{t("parent.instructionMedia.openHint")}</span>
          </div>
          <a
            className="pd-btn pd-btn-soft pd-btn-sm"
            href={mediaUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t("parent.instructionMedia.open")}
            <ExternalLink size={14} aria-hidden="true" />
          </a>
        </div>
      ) : null}
    </section>
  );
}
