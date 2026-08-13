import { ExternalLink, FileText, Music, Paperclip, Trash2, Undo2, Video } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { resolveUploadedAssetUrl } from "../../../services/apiConfig";
import {
  EXERCISE_MEDIA_ACCEPT,
  EXERCISE_MEDIA_EMPTY_MESSAGE,
  EXERCISE_MEDIA_REMOVAL_PENDING_MESSAGE,
  describeExerciseMediaSelection,
  describeExerciseMediaUrl,
  validateExerciseMediaFile,
} from "../utils/specialistExerciseMediaUtils";

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
  const inputId = useId();
  const inputRef = useRef(null);

  const pendingPreview = useMemo(
    () => (pendingMediaFile ? describeExerciseMediaSelection(pendingMediaFile) : null),
    [pendingMediaFile],
  );

  const existingPreview = useMemo(
    () => (existingMediaUrl?.trim() ? describeExerciseMediaUrl(existingMediaUrl) : null),
    [existingMediaUrl],
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
  const addLabel = hasAttachedMedia ? "Replace media" : "Add media";

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

  return (
    <div className="pd-specialist-exercise-field">
      <h3 className="pd-specialist-exercise-media-heading">Instructional media (optional)</h3>

      <div className="pd-specialist-exercise-media-panel">
        {pendingPreview ? (
          <div className="pd-specialist-exercise-media-state">
            <p className="pd-specialist-exercise-media-label">Selected media</p>
            <p className="pd-specialist-exercise-media-filename">{pendingPreview.filename}</p>
            <p className="pd-specialist-exercise-media-meta">
              {pendingPreview.typeLabel}
              {pendingPreview.sizeLabel ? ` • ${pendingPreview.sizeLabel}` : ""}
            </p>
            {previewKind === "image" && previewUrl ? (
              <img
                className="pd-specialist-exercise-media-preview"
                src={previewUrl}
                alt={`Preview of ${pendingPreview.filename}`}
              />
            ) : null}
          </div>
        ) : existingPreview ? (
          <div className="pd-specialist-exercise-media-state">
            <p className="pd-specialist-exercise-media-label">Current media attached</p>
            <p className="pd-specialist-exercise-media-filename">
              {existingPreview.filename || existingMediaUrl}
            </p>
            <p className="pd-specialist-exercise-media-meta">{existingPreview.typeLabel}</p>
            {previewKind === "image" && previewUrl ? (
              <img
                className="pd-specialist-exercise-media-preview"
                src={previewUrl}
                alt={`Current media ${existingPreview.filename || "preview"}`}
              />
            ) : (
              <div className="pd-specialist-exercise-media-icon-preview">
                <MediaKindIcon kind={previewKind} size={22} />
              </div>
            )}
          </div>
        ) : (
          <p className="pd-specialist-exercise-media-empty">{EXERCISE_MEDIA_EMPTY_MESSAGE}</p>
        )}

        {clearInstructionMedia && !pendingMediaFile ? (
          <div className="pd-specialist-exercise-media-removal-notice">
            <p>{EXERCISE_MEDIA_REMOVAL_PENDING_MESSAGE}</p>
            <button
              type="button"
              className="pd-btn pd-btn-soft pd-btn-sm"
              onClick={onUndoRemoval}
              disabled={isBusy}
            >
              <Undo2 size={14} aria-hidden="true" />
              Undo
            </button>
          </div>
        ) : null}

        {typeof uploadProgress === "number" && uploadProgress >= 0 ? (
          <div className="pd-specialist-exercise-media-progress" aria-live="polite">
            <div
              className="pd-specialist-exercise-media-progress-bar"
              style={{ width: `${Math.round(uploadProgress * 100)}%` }}
            />
            <span>Uploading media…</span>
          </div>
        ) : null}

        {mediaError ? (
          <p className="pd-specialist-exercise-error">{mediaError}</p>
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
            >
              <Trash2 size={16} aria-hidden="true" />
              Remove
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function SpecialistExerciseInstructionMedia({ mediaUrl, title = "Instruction Media" }) {
  const [imageError, setImageError] = useState(false);
  const resolvedUrl = resolveUploadedAssetUrl(mediaUrl) ?? mediaUrl?.trim();
  if (!resolvedUrl) {
    return null;
  }

  const description = describeExerciseMediaUrl(mediaUrl);
  const kind = description.kind;

  return (
    <section className="pd-card pd-card-pad pd-specialist-exercise-details-section">
      <h3 className="pd-specialist-exercise-details-section-title">{title}</h3>

      {kind === "image" ? (
        imageError ? (
          <p className="pd-section-sub">Unable to load image preview.</p>
        ) : (
          <img
            className="pd-specialist-exercise-media"
            src={resolvedUrl}
            alt={description.filename ? `Instruction media: ${description.filename}` : "Exercise instruction media"}
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
        <p className="pd-specialist-exercise-details-body">
          PDF instruction attached. Open externally to view.
        </p>
      ) : null}

      {kind === "unknown" ? (
        <p className="pd-specialist-exercise-details-body">
          Media attached. Open externally to view.
        </p>
      ) : null}

      {description.filename ? (
        <p className="pd-specialist-exercise-media-meta">{description.filename}</p>
      ) : null}

      <a
        className="pd-btn pd-btn-outline pd-specialist-exercise-media-open"
        href={resolvedUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        <ExternalLink size={16} aria-hidden="true" />
        {kind === "pdf" ? "Open PDF" : "Open externally"}
      </a>
    </section>
  );
}
