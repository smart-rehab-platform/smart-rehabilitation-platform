import { ExternalLink, FileText, Music, Paperclip, Trash2, Undo2, Video } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useLocale } from "../../../context/useLocale";
import { resolveUploadedAssetUrl } from "../../../services/apiConfig";
import {
  EXERCISE_MEDIA_ACCEPT,
  validateExerciseMediaFile,
} from "../utils/specialistExerciseMediaUtils";
import {
  describeLocalizedExerciseMediaSelection,
  describeLocalizedExerciseMediaUrl,
  getExerciseMediaValidationMessage,
} from "../utils/specialistExercisesLocalization";

function resolvePreviewUrl(source) {
  if (!source) {
    return null;
  }
  if (source instanceof File) {
    return URL.createObjectURL(source);
  }
  return resolveUploadedAssetUrl(source) ?? source;
}

function MediaKindIcon({ kind, size = 18 }) {
  switch (kind) {
    case "video":
      return <Video size={size} aria-hidden="true" />;
    case "audio":
      return <Music size={size} aria-hidden="true" />;
    case "pdf":
      return <FileText size={size} aria-hidden="true" />;
    default:
      return <Paperclip size={size} aria-hidden="true" />;
  }
}

export function SpecialistExerciseMediaSection({
  existingMediaUrl,
  pendingMediaFile,
  clearInstructionMedia,
  mediaError,
  isBusy,
  uploadProgress,
  onSelectFile,
  onRemoveMedia,
  onUndoRemoval,
}) {
  const { t } = useLocale();
  const inputId = useId();
  const inputRef = useRef(null);

  const pendingPreview = useMemo(
    () => (pendingMediaFile ? describeLocalizedExerciseMediaSelection(pendingMediaFile, t) : null),
    [pendingMediaFile, t],
  );

  const existingPreview = useMemo(
    () => (existingMediaUrl?.trim() ? describeLocalizedExerciseMediaUrl(existingMediaUrl, t) : null),
    [existingMediaUrl, t],
  );

  const previewSource = pendingMediaFile ?? (existingMediaUrl?.trim() ? existingMediaUrl : null);
  const previewKind = pendingPreview?.kind ?? existingPreview?.kind ?? "unknown";
  const previewUrl = useMemo(() => resolvePreviewUrl(previewSource), [previewSource]);

  useEffect(() => {
    if (!(previewSource instanceof File) || !previewUrl?.startsWith("blob:")) {
      return undefined;
    }
    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [previewSource, previewUrl]);

  const hasAttachedMedia = Boolean(pendingMediaFile || existingMediaUrl?.trim());
  const addLabel = hasAttachedMedia
    ? t("specialist.exercises.media.replaceMedia")
    : t("specialist.exercises.media.addMedia");

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] ?? null;
    event.target.value = "";
    if (!file) {
      return;
    }
    const validationError = validateExerciseMediaFile(file);
    if (validationError) {
      onSelectFile(null, validationError);
      return;
    }
    onSelectFile(file, null);
  };

  const resolvedMediaError = mediaError
    ? (getExerciseMediaValidationMessage(mediaError, t) || mediaError)
    : null;

  return (
    <div className="pd-specialist-exercise-field">
      <h3 className="pd-specialist-exercise-media-heading">{t("specialist.exercises.media.sectionTitle")}</h3>

      <div className="pd-specialist-exercise-media-panel">
        {pendingPreview ? (
          <div className="pd-specialist-exercise-media-state">
            <p className="pd-specialist-exercise-media-label">{t("specialist.exercises.media.selectedMedia")}</p>
            <p className="pd-specialist-exercise-media-filename" dir="auto">{pendingPreview.filename}</p>
            <p className="pd-specialist-exercise-media-meta">
              {pendingPreview.typeLabel}
              {pendingPreview.sizeLabel ? ` • ${pendingPreview.sizeLabel}` : ""}
            </p>
            {previewKind === "image" && previewUrl ? (
              <img
                className="pd-specialist-exercise-media-preview"
                src={previewUrl}
                alt={t("specialist.exercises.details.mediaPreviewAlt", { filename: pendingPreview.filename })}
              />
            ) : null}
          </div>
        ) : existingPreview ? (
          <div className="pd-specialist-exercise-media-state">
            <p className="pd-specialist-exercise-media-label">{t("specialist.exercises.media.currentMediaAttached")}</p>
            <p className="pd-specialist-exercise-media-filename" dir="auto">
              {existingPreview.filename || existingMediaUrl}
            </p>
            <p className="pd-specialist-exercise-media-meta">{existingPreview.typeLabel}</p>
            {previewKind === "image" && previewUrl ? (
              <img
                className="pd-specialist-exercise-media-preview"
                src={previewUrl}
                alt={t("specialist.exercises.details.currentMediaPreviewAlt", {
                  filename: existingPreview.filename || "preview",
                })}
              />
            ) : (
              <div className="pd-specialist-exercise-media-icon-preview">
                <MediaKindIcon kind={previewKind} size={22} />
              </div>
            )}
          </div>
        ) : (
          <p className="pd-specialist-exercise-media-empty">{t("specialist.exercises.media.noMediaSelected")}</p>
        )}

        {clearInstructionMedia && !pendingMediaFile ? (
          <div className="pd-specialist-exercise-media-removal-notice">
            <p>{t("specialist.exercises.media.removalPending")}</p>
            <button
              type="button"
              className="pd-btn pd-btn-soft pd-btn-sm"
              onClick={onUndoRemoval}
              disabled={isBusy}
            >
              <Undo2 size={14} aria-hidden="true" />
              {t("specialist.exercises.media.undo")}
            </button>
          </div>
        ) : null}

        {typeof uploadProgress === "number" && uploadProgress >= 0 ? (
          <div className="pd-specialist-exercise-media-progress" aria-live="polite">
            <div
              className="pd-specialist-exercise-media-progress-bar"
              style={{ width: `${Math.round(uploadProgress * 100)}%` }}
            />
            <span>{t("specialist.exercises.media.uploading")}</span>
          </div>
        ) : null}

        {resolvedMediaError ? (
          <p className="pd-specialist-exercise-error">{resolvedMediaError}</p>
        ) : null}

        <div className="pd-specialist-exercise-media-actions">
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            className="pd-specialist-exercise-media-input"
            accept={EXERCISE_MEDIA_ACCEPT}
            onChange={handleFileChange}
            disabled={isBusy}
          />
          <label htmlFor={inputId} className="pd-btn pd-btn-outline pd-specialist-exercise-media-add">
            <Paperclip size={16} aria-hidden="true" />
            {addLabel}
          </label>
          {hasAttachedMedia ? (
            <button
              type="button"
              className="pd-btn pd-btn-soft pd-specialist-exercise-media-remove"
              onClick={onRemoveMedia}
              disabled={isBusy}
              title={t("specialist.exercises.media.removeTooltip")}
              aria-label={t("specialist.exercises.media.removeTooltip")}
            >
              <Trash2 size={16} aria-hidden="true" />
              {t("specialist.exercises.media.remove")}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function SpecialistExerciseInstructionMedia({ mediaUrl, title }) {
  const { t } = useLocale();
  const [imageError, setImageError] = useState(false);
  const resolvedUrl = resolveUploadedAssetUrl(mediaUrl) ?? mediaUrl?.trim();
  const sectionTitle = title ?? t("specialist.exercises.details.instructionMedia");

  if (!resolvedUrl) {
    return null;
  }

  const description = describeLocalizedExerciseMediaUrl(mediaUrl, t);
  const kind = description.kind;

  return (
    <section className="pd-card pd-card-pad pd-specialist-exercise-details-section">
      <h3 className="pd-specialist-exercise-details-section-title">{sectionTitle}</h3>

      {kind === "image" ? (
        imageError ? (
          <p className="pd-section-sub">{t("specialist.exercises.details.unableLoadImage")}</p>
        ) : (
          <img
            className="pd-specialist-exercise-media"
            src={resolvedUrl}
            alt={description.filename
              ? t("specialist.exercises.details.mediaPreviewAlt", { filename: description.filename })
              : t("specialist.exercises.details.instructionMedia")}
            onError={() => setImageError(true)}
          />
        )
      ) : null}

      {kind === "video" ? (
        <video
          className="pd-specialist-exercise-media"
          controls
          preload="metadata"
          src={resolvedUrl}
        >
          <track kind="captions" />
        </video>
      ) : null}

      {kind === "audio" ? (
        <audio className="pd-specialist-exercise-audio" controls preload="metadata" src={resolvedUrl}>
          <track kind="captions" />
        </audio>
      ) : null}

      {kind === "pdf" ? (
        <p className="pd-specialist-exercise-details-body">{t("specialist.exercises.details.pdfAttached")}</p>
      ) : null}

      {kind === "unknown" ? (
        <p className="pd-specialist-exercise-details-body">{t("specialist.exercises.details.mediaAttached")}</p>
      ) : null}

      {description.filename ? (
        <p className="pd-specialist-exercise-media-meta" dir="auto">{description.filename}</p>
      ) : null}

      <a
        className="pd-btn pd-btn-outline pd-specialist-exercise-media-open"
        href={resolvedUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        <ExternalLink size={16} aria-hidden="true" />
        {kind === "pdf" ? t("specialist.exercises.details.openPdf") : t("specialist.exercises.details.openExternally")}
      </a>
    </section>
  );
}
