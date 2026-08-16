import { useMemo } from "react";
import { useLocale } from "../../../context/useLocale.js";
import { AdminExerciseMediaPicker } from "../components/AdminExerciseMediaPicker";
import {
  getAdminExercisesLabels,
  getExerciseCategoryLabel,
  getExerciseLanguageLabel,
} from "../utils/adminExercisesLocalization.js";
import { EXERCISE_TEXT_MAX, EXERCISE_TITLE_MAX } from "../utils/adminExerciseMediaUtils";

function FieldError({ message }) {
  if (!message) {
    return null;
  }

  return <p className="pd-admin-exercise-form-error" role="alert">{message}</p>;
}

export function AdminExerciseForm({
  isEdit,
  categories,
  isLoadingCategories,
  categoriesError,
  onRetryCategories,
  categoryId,
  onCategoryChange,
  language,
  onLanguageChange,
  title,
  onTitleChange,
  description,
  onDescriptionChange,
  instructions,
  onInstructionsChange,
  fieldErrors,
  formError,
  isBusy,
  canSubmit,
  isUploading,
  isSubmitting,
  showExistingMedia,
  currentMediaUrl,
  newMediaFile,
  newMediaPreviewUrl,
  mediaError,
  onSelectMediaFile,
  onRemoveNewMedia,
  onRemoveExistingMedia,
  onCancel,
  onSubmit,
}) {
  const { t } = useLocale();
  const labels = useMemo(() => getAdminExercisesLabels(t), [t]);

  const submitLabel = isEdit
    ? (isUploading ? labels.form.uploadingMedia : isSubmitting ? labels.form.saving : labels.form.saveChanges)
    : (isUploading ? labels.form.uploadingMedia : isSubmitting ? labels.form.creating : labels.form.create);

  return (
    <form
      className="pd-admin-exercise-form"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
      noValidate
    >
      <div className="pd-admin-exercise-form-grid">
        <div className="pd-admin-exercise-form-field">
          <label className="pd-admin-exercise-form-label" htmlFor="admin-exercise-category">
            {labels.form.category}
          </label>
          {isLoadingCategories ? (
            <span className="pd-admin-exercises-skeleton-line is-field" aria-hidden="true" />
          ) : categoriesError ? (
            <div className="pd-admin-exercise-form-inline-error">
              <p className="pd-admin-exercise-form-error">{categoriesError}</p>
              <button type="button" className="pd-btn pd-btn-soft pd-btn-sm" onClick={onRetryCategories}>
                {labels.retry}
              </button>
            </div>
          ) : (
            <select
              id="admin-exercise-category"
              className="pd-admin-exercise-form-control"
              value={categoryId}
              disabled={isBusy || categories.length === 0}
              onChange={(event) => onCategoryChange(event.target.value)}
              required
            >
              {categories.length === 0 ? (
                <option value="">{labels.form.noCategories}</option>
              ) : (
                categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.displayName ?? getExerciseCategoryLabel(category.name, t)}
                  </option>
                ))
              )}
            </select>
          )}
          <FieldError message={fieldErrors.categoryId} />
        </div>

        <div className="pd-admin-exercise-form-field">
          <label className="pd-admin-exercise-form-label" htmlFor="admin-exercise-language">
            {labels.form.language}
          </label>
          <select
            id="admin-exercise-language"
            className="pd-admin-exercise-form-control"
            value={language}
            disabled={isBusy}
            onChange={(event) => onLanguageChange(event.target.value)}
            required
          >
            <option value="en">{getExerciseLanguageLabel("en", t)}</option>
            <option value="ar">{getExerciseLanguageLabel("ar", t)}</option>
          </select>
        </div>
      </div>

      <div className="pd-admin-exercise-form-field">
        <label className="pd-admin-exercise-form-label" htmlFor="admin-exercise-title">
          {labels.form.title}
        </label>
        <input
          id="admin-exercise-title"
          type="text"
          className="pd-admin-exercise-form-control"
          value={title}
          disabled={isBusy}
          maxLength={EXERCISE_TITLE_MAX + 1}
          placeholder={labels.form.titlePlaceholder}
          onChange={(event) => onTitleChange(event.target.value)}
          required
        />
        <FieldError message={fieldErrors.title} />
      </div>

      <div className="pd-admin-exercise-form-field">
        <label className="pd-admin-exercise-form-label" htmlFor="admin-exercise-description">
          {labels.form.descriptionOptional}
        </label>
        <textarea
          id="admin-exercise-description"
          className="pd-admin-exercise-form-control pd-admin-exercise-form-textarea"
          value={description}
          disabled={isBusy}
          rows={4}
          maxLength={EXERCISE_TEXT_MAX + 1}
          placeholder={labels.form.descriptionPlaceholder}
          onChange={(event) => onDescriptionChange(event.target.value)}
        />
        <FieldError message={fieldErrors.description} />
      </div>

      <div className="pd-admin-exercise-form-field">
        <label className="pd-admin-exercise-form-label" htmlFor="admin-exercise-instructions">
          {labels.form.instructionsDetailed}
        </label>
        <textarea
          id="admin-exercise-instructions"
          className="pd-admin-exercise-form-control pd-admin-exercise-form-textarea is-tall"
          value={instructions}
          disabled={isBusy}
          rows={8}
          maxLength={EXERCISE_TEXT_MAX + 1}
          placeholder={labels.form.instructionsPlaceholder}
          onChange={(event) => onInstructionsChange(event.target.value)}
        />
        <FieldError message={fieldErrors.instructions} />
      </div>

      <AdminExerciseMediaPicker
        isEdit={isEdit}
        isBusy={isBusy}
        showExistingMedia={showExistingMedia}
        currentMediaUrl={currentMediaUrl}
        newMediaFile={newMediaFile}
        newMediaPreviewUrl={newMediaPreviewUrl}
        mediaError={mediaError}
        onSelectFile={onSelectMediaFile}
        onRemoveNewMedia={onRemoveNewMedia}
        onRemoveExistingMedia={onRemoveExistingMedia}
      />

      {formError ? (
        <div className="pd-admin-exercises-error" role="alert">
          <p className="pd-inline-error">{formError}</p>
        </div>
      ) : null}

      <div className="pd-admin-exercise-form-actions">
        <button type="button" className="pd-btn pd-btn-soft" onClick={onCancel} disabled={isSubmitting || isUploading}>
          {labels.form.cancel}
        </button>
        <button type="submit" className="pd-btn pd-btn-primary" disabled={!canSubmit}>
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
