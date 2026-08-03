import { ExternalLink } from "lucide-react";
import { PlatformMaterialIcon } from "../../../components/platform/PlatformMaterialIcon";

export function InstructionMediaCard({ mediaUrl, mediaKind = "unknown", title = "Instructional Media" }) {
  if (!mediaUrl) {
    return null;
  }

  const kind = mediaKind || "unknown";

  return (
    <section className="pd-card pd-card-pad pd-instruction-media pd-section-enter" aria-label={title}>
      <h2 className="pd-section-title">{title}</h2>

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
          <p className="pd-instruction-media-fallback">Unable to load image preview.</p>
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
            Your browser does not support video playback.
          </video>
        </div>
      ) : null}

      {kind === "audio" ? (
        <div className="pd-instruction-media-frame pd-instruction-media-audio">
          <audio className="pd-instruction-media-audio-player" controls preload="metadata" src={mediaUrl}>
            Your browser does not support audio playback.
          </audio>
        </div>
      ) : null}

      {kind === "pdf" || kind === "unknown" ? (
        <div className="pd-instruction-media-file">
          <span className="pd-instruction-media-file-icon" aria-hidden="true">
            <PlatformMaterialIcon icon="report" size={20} />
          </span>
          <div className="pd-instruction-media-file-copy">
            <strong>{kind === "pdf" ? "PDF document" : "Media file"}</strong>
            <span>Open the specialist-provided file in a new tab.</span>
          </div>
          <a
            className="pd-btn pd-btn-soft pd-btn-sm"
            href={mediaUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open
            <ExternalLink size={14} aria-hidden="true" />
          </a>
        </div>
      ) : null}
    </section>
  );
}
