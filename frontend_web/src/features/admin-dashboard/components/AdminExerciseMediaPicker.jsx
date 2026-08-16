import { useId, useMemo, useRef } from "react";
import {
  FileText,
  Film,
  ImageIcon,
  Music2,
  Trash2,
  Upload,
} from "lucide-react";
import { useLocale } from "../../../context/useLocale.js";
import { resolveUploadedAssetUrl } from "../../../services/apiConfig";
import {
  EXERCISE_MEDIA_ACCEPT,
  formatExerciseMediaFileSize,
  getExerciseMediaFileKind,
  guessInstructionMediaKind,
  resolveExerciseMediaFilename,
} from "../utils/adminExerciseMediaUtils";
import { getAdminExercisesLabels } from "../utils/adminExercisesLocalization.js";

function MediaTypeIcon({ kind, size = 18 }) {
  if (kind === "image") {
    return <ImageIcon size={size} aria-hidden="true" />;
  }

  if (kind === "video") {
    return <Film size={size} aria-hidden="true" />;
  }

  if (kind === "audio") {
    return <Music2 size={size} aria-hidden="true" />;
  }

  return <FileText size={size} aria-hidden="true" />;
}

function ExistingMediaPreview({ mediaUrl }) {
  const resolvedUrl = resolveUploadedAssetUrl(mediaUrl) ?? mediaUrl?.trim() ?? "";
  const kind = guessInstructionMediaKind(mediaUrl || resolvedUrl);
  const filename = resolveExerciseMediaFilename(mediaUrl || resolvedUrl);

  if (!resolvedUrl) {
    return null;
  }

  return (
    <div className="pd-admin-exercise-media-current-preview">
      {kind === "image" ? (
        <img src={resolvedUrl} alt="" className="pd-admin-exercise-media-current-image" loading="lazy" />
      ) : null}

      {kind === "video" ? (
        <video className="pd-admin-exercise-media-current-video" controls preload="metadata" src={resolvedUrl}>
          <track kind="captions" />
        </video>
      ) : null}

      {kind === "audio" ? (
        <audio className="pd-admin-exercise-media-current-audio" controls preload="metadata" src={resolvedUrl}>
          <track kind="captions" />
        </audio>
      ) : null}

      {(kind === "pdf" || kind === "unknown") ? (
        <div className="pd-admin-exercise-media-current-file">
          <MediaTypeIcon kind={kind} />
          <span dir="auto">{filename}</span>
        </div>
      ) : null}
    </div>
  );
}

export function AdminExerciseMediaPicker({
  isEdit,
  isBusy = false,
  showExistingMedia = false,
  currentMediaUrl,
  newMediaFile,
  newMediaPreviewUrl,
  mediaError,
  onSelectFile,
  onRemoveNewMedia,
  onRemoveExistingMedia,
}) {
  const { t } = useLocale();
  const labels = useMemo(() => getAdminExercisesLabels(t), [t]);
  const inputId = useId();
  const inputRef = useRef(null);

  const hasNewFile = Boolean(newMediaFile);
  const addLabel = isEdit && (showExistingMedia || hasNewFile)
    ? t("specialist.exercises.media.replaceMedia")
    : t("specialist.exercises.media.addMedia");
  const newFileKind = newMediaFile ? getExerciseMediaFileKind(newMediaFile) : "unknown";

  const handleInputChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      onSelectFile(file);
    }
    event.target.value = "";
  };

  const openFilePicker = () => {
    if (!isBusy) {
      inputRef.current?.click();
    }
  };

  return (
    <section className="pd-admin-exercise-form-media" aria-label={labels.form.mediaSection}>
      <div className="pd-admin-exercise-form-media-header">
        <label className="pd-admin-exercise-form-label" htmlFor={inputId}>
          {t("specialist.exercises.media.sectionTitle")}
        </label>
        <p className="pd-admin-exercise-form-help">
          {labels.form.mediaHelp}
        </p>
      </div>

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        className="pd-sr-only"
        accept={EXERCISE_MEDIA_ACCEPT}
        disabled={isBusy}
        onChange={handleInputChange}
      />

      {showExistingMedia ? (
        <div className="pd-admin-exercise-media-current">
          <div className="pd-admin-exercise-media-current-copy">
            <strong>{t("specialist.exercises.media.currentMediaAttached")}</strong>
            <span dir="auto">{resolveExerciseMediaFilename(currentMediaUrl)}</span>
          </div>
          <ExistingMediaPreview mediaUrl={currentMediaUrl} />
          <div className="pd-admin-exercise-media-current-actions">
            <button type="button" className="pd-btn pd-btn-soft pd-btn-sm" onClick={openFilePicker} disabled={isBusy}>
              {t("specialist.exercises.media.replaceMedia")}
            </button>
            <button
              type="button"
              className="pd-btn pd-btn-soft pd-btn-sm pd-admin-exercise-media-remove"
              onClick={onRemoveExistingMedia}
              disabled={isBusy}
            >
              <Trash2 size={14} aria-hidden="true" />
              {t("specialist.exercises.media.remove")}
            </button>
          </div>
        </div>
      ) : null}

      {hasNewFile ? (
        <div className="pd-admin-exercise-media-selected">
          <div className="pd-admin-exercise-media-selected-main">
            <span className="pd-admin-exercise-media-selected-icon" aria-hidden="true">
              <MediaTypeIcon kind={newFileKind} />
            </span>
            <div className="pd-admin-exercise-media-selected-copy">
              <strong dir="auto">{newMediaFile.name}</strong>
              <span>{formatExerciseMediaFileSize(newMediaFile.size)}</span>
            </div>
          </div>

          {newMediaPreviewUrl ? (
            <img
              src={newMediaPreviewUrl}
              alt=""
              className="pd-admin-exercise-media-selected-preview"
            />
          ) : null}

          <div className="pd-admin-exercise-media-selected-actions">
            <button type="button" className="pd-btn pd-btn-soft pd-btn-sm" onClick={openFilePicker} disabled={isBusy}>
              {t("specialist.exercises.media.replaceMedia")}
            </button>
            <button
              type="button"
              className="pd-btn pd-btn-soft pd-btn-sm pd-admin-exercise-media-remove"
              onClick={onRemoveNewMedia}
              disabled={isBusy}
            >
              <Trash2 size={14} aria-hidden="true" />
              {t("specialist.exercises.media.remove")}
            </button>
          </div>
        </div>
      ) : null}

      {!showExistingMedia && !hasNewFile ? (
        <div className="pd-admin-exercise-media-dropzone">
          <Upload size={20} aria-hidden="true" />
          <p>{t("specialist.exercises.media.noMediaSelected")}</p>
          <button type="button" className="pd-btn pd-btn-soft pd-btn-sm" onClick={openFilePicker} disabled={isBusy}>
            {addLabel}
          </button>
        </div>
      ) : null}

      {mediaError ? (
        <p className="pd-admin-exercise-form-error" role="alert">{mediaError}</p>
      ) : null}
    </section>
  );
}
