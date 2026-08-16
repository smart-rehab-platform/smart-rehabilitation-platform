import { useId, useRef } from "react";
import { Paperclip } from "lucide-react";
import { useLocale } from "../../../context/useLocale.js";
import { SelectedSubmissionMedia } from "./SelectedSubmissionMedia";
import { SUBMISSION_MEDIA_ACCEPT } from "../utils/parentDashboardMappers";

export function ExerciseSubmissionForm({
  parentNotes,
  onNotesChange,
  selectedFile,
  onFileSelect,
  onFileRemove,
  validationError,
  submitError,
  isSubmitting,
  canSubmit,
  submitLabel,
  isRetryStatus = false,
  onSubmit,
}) {
  const { t } = useLocale();
  const notesId = useId();
  const fileInputId = useId();
  const fileInputRef = useRef(null);

  const defaultSubmitLabel = isRetryStatus
    ? t("parent.pages.exerciseDetail.submitExerciseAgain")
    : t("parent.pages.exerciseDetail.submitExercise");
  const buttonLabel = isSubmitting
    ? t("parent.pages.exerciseDetail.submitting")
    : (submitLabel || defaultSubmitLabel);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] ?? null;
    onFileSelect(file);
    event.target.value = "";
  };

  const openFilePicker = () => {
    if (isSubmitting) {
      return;
    }

    fileInputRef.current?.click();
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <section
      className="pd-card pd-card-pad pd-exercise-submission pd-section-enter"
      aria-label={t("parent.pages.exerciseDetail.submitAriaLabel")}
    >
      <h2 className="pd-section-title">{t("parent.pages.exerciseDetail.submission")}</h2>

      <form className="pd-exercise-submission-form" onSubmit={handleSubmit} noValidate>
        <div className="pd-form-field">
          <label className="pd-form-label" htmlFor={notesId}>
            {t("parent.pages.exerciseDetail.parentNotes")}
            <span className="pd-form-label-optional">
              {" "}
              {t("parent.pages.exerciseDetail.optional")}
            </span>
          </label>
          <textarea
            id={notesId}
            className="pd-form-textarea"
            rows={4}
            value={parentNotes}
            onChange={(event) => onNotesChange(event.target.value)}
            disabled={isSubmitting}
            placeholder={t("parent.pages.exerciseDetail.notesPlaceholder")}
            dir="auto"
          />
        </div>

        <div className="pd-form-field">
          <span className="pd-form-label" id={`${fileInputId}-label`}>
            {t("parent.pages.exerciseDetail.mediaAttachment")}
            <span className="pd-form-label-optional">
              {" "}
              {t("parent.pages.exerciseDetail.optional")}
            </span>
          </span>
          <p className="pd-form-help">
            {t("parent.pages.exerciseDetail.mediaHelp")}
          </p>

          <input
            ref={fileInputRef}
            id={fileInputId}
            type="file"
            className="pd-form-file-input"
            accept={SUBMISSION_MEDIA_ACCEPT}
            onChange={handleFileChange}
            disabled={isSubmitting}
            aria-labelledby={`${fileInputId}-label`}
          />

          <div className="pd-submission-media-actions">
            <button
              type="button"
              className="pd-btn pd-btn-soft"
              onClick={openFilePicker}
              disabled={isSubmitting}
            >
              <Paperclip size={16} aria-hidden="true" />
              {selectedFile
                ? t("parent.pages.exerciseDetail.replaceFile")
                : t("parent.pages.exerciseDetail.chooseFile")}
            </button>
          </div>

          <SelectedSubmissionMedia
            file={selectedFile}
            onRemove={onFileRemove}
            disabled={isSubmitting}
          />
        </div>

        {validationError ? (
          <p className="pd-inline-error" role="alert">
            {validationError}
          </p>
        ) : null}

        {submitError ? (
          <p className="pd-inline-error" role="alert">
            {submitError}
          </p>
        ) : null}

        <div className="pd-exercise-submission-actions">
          <button
            type="submit"
            className="pd-btn pd-btn-primary"
            disabled={!canSubmit || isSubmitting}
          >
            {buttonLabel}
          </button>
        </div>
      </form>
    </section>
  );
}
