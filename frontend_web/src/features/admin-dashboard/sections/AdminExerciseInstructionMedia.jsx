import { ExternalLink, FileText } from "lucide-react";
import { useLocale } from "../../../context/useLocale.js";
import { resolveUploadedAssetUrl } from "../../../services/apiConfig";
import {
  getExerciseMediaTypeLabel,
} from "../utils/adminExercisesLocalization.js";
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
export function AdminExerciseInstructionMedia({ instructionMediaUrl, title }) {
  const { t } = useLocale();
  const resolvedUrl = resolveUploadedAssetUrl(instructionMediaUrl) ?? instructionMediaUrl?.trim() ?? "";
  const sectionTitle = title ?? t("specialist.exercises.details.instructionMedia");

  if (!resolvedUrl) {
    return null;
  }

  const mediaKind = guessInstructionMediaKind(instructionMediaUrl || resolvedUrl);
  const filename = resolveExerciseMediaFilename(instructionMediaUrl || resolvedUrl);
  const openLabel = mediaKind === "pdf"
    ? t("specialist.exercises.details.openPdf")
    : t("specialist.exercises.details.openExternally");

  return (
    <section className="pd-card pd-card-pad pd-instruction-media pd-admin-exercise-details-section pd-section-enter" aria-label={sectionTitle}>
      <h2 className="pd-section-title">{sectionTitle}</h2>

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
            <p className="pd-instruction-media-fallback">{t("specialist.exercises.details.unableLoadImage")}</p>
          </div>
          <div className="pd-admin-exercise-media-actions">
            <OpenMediaLink href={resolvedUrl} label={openLabel} />
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
              <track kind="captions" />
            </video>
          </div>
          <div className="pd-admin-exercise-media-actions">
            <OpenMediaLink href={resolvedUrl} label={openLabel} />
          </div>
        </>
      ) : null}

      {mediaKind === "audio" ? (
        <div className="pd-instruction-media-frame pd-instruction-media-audio">
          <audio className="pd-instruction-media-audio-player" controls preload="metadata" src={resolvedUrl}>
            <track kind="captions" />
          </audio>
        </div>
      ) : null}

      {mediaKind === "pdf" || mediaKind === "unknown" ? (
        <div className="pd-instruction-media-file">
          <span className="pd-instruction-media-file-icon" aria-hidden="true">
            <FileText size={20} />
          </span>
          <div className="pd-instruction-media-file-copy">
            <strong>{getExerciseMediaTypeLabel(mediaKind === "pdf" ? "pdf" : "file", t)}</strong>
            <span dir="auto">{filename}</span>
          </div>
          <OpenMediaLink href={resolvedUrl} label={openLabel} />
        </div>
      ) : null}
    </section>
  );
}
