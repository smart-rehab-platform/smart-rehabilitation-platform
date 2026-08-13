import { ExternalLink, FileText } from "lucide-react";
import { resolveUploadedAssetUrl } from "../../../services/apiConfig";
import {
  guessInstructionMediaKind,
  resolveExerciseMediaFilename,
} from "../utils/adminExerciseMediaUtils";

function OpenMediaLink({ href, label }) {
  if (!href) {
    return null;
  }

  return (
    <a
      className="pd-btn pd-btn-soft pd-btn-sm"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      {label}
      <ExternalLink size={14} aria-hidden="true" />
    </a>
  );
}

/**
 * Admin instruction media renderer.
 * Mirrors Parent InstructionMediaCard behavior using shared dashboard media styles.
 */
export function AdminExerciseInstructionMedia({ instructionMediaUrl, title = "Instruction Media" }) {
  const resolvedUrl = resolveUploadedAssetUrl(instructionMediaUrl) ?? instructionMediaUrl?.trim() ?? "";

  if (!resolvedUrl) {
    return null;
  }

  const mediaKind = guessInstructionMediaKind(instructionMediaUrl || resolvedUrl);
  const filename = resolveExerciseMediaFilename(instructionMediaUrl || resolvedUrl);

  return (
    <section className="pd-card pd-card-pad pd-instruction-media pd-admin-exercise-details-section pd-section-enter" aria-label={title}>
      <h2 className="pd-section-title">{title}</h2>

      {mediaKind === "image" ? (
        <>
          <div className="pd-instruction-media-frame">
            <a href={resolvedUrl} target="_blank" rel="noopener noreferrer" className="pd-admin-exercise-media-image-link">
              <img
                src={resolvedUrl}
                alt=""
                className="pd-instruction-media-image"
                loading="lazy"
                onError={(event) => {
                  event.currentTarget.closest(".pd-instruction-media-frame")?.classList.add("is-broken");
                }}
              />
            </a>
            <p className="pd-instruction-media-fallback">Unable to load image preview.</p>
          </div>
          <div className="pd-admin-exercise-media-actions">
            <OpenMediaLink href={resolvedUrl} label="Open image" />
          </div>
        </>
      ) : null}

      {mediaKind === "video" ? (
        <>
          <div className="pd-instruction-media-frame">
            <video
              className="pd-instruction-media-video"
              controls
              preload="metadata"
              src={resolvedUrl}
            >
              Your browser does not support video playback.
            </video>
          </div>
          <div className="pd-admin-exercise-media-actions">
            <OpenMediaLink href={resolvedUrl} label="Open video" />
          </div>
        </>
      ) : null}

      {mediaKind === "audio" ? (
        <div className="pd-instruction-media-frame pd-instruction-media-audio">
          <audio className="pd-instruction-media-audio-player" controls preload="metadata" src={resolvedUrl}>
            Your browser does not support audio playback.
          </audio>
        </div>
      ) : null}

      {mediaKind === "pdf" || mediaKind === "unknown" ? (
        <div className="pd-instruction-media-file">
          <span className="pd-instruction-media-file-icon" aria-hidden="true">
            <FileText size={20} />
          </span>
          <div className="pd-instruction-media-file-copy">
            <strong>{mediaKind === "pdf" ? "PDF document" : "Media file"}</strong>
            <span>{filename}</span>
          </div>
          <OpenMediaLink
            href={resolvedUrl}
            label={mediaKind === "pdf" ? "Open PDF" : "Open media"}
          />
        </div>
      ) : null}
    </section>
  );
}
