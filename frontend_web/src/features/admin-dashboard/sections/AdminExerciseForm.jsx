import { AdminExerciseMediaPicker } from "../components/AdminExerciseMediaPicker";
import { EXERCISE_TEXT_MAX, EXERCISE_TITLE_MAX } from "../utils/adminExerciseMediaUtils";

const LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "ar", label: "Arabic" },
];

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
  const submitLabel = isEdit
    ? (isUploading ? "Uploading media..." : isSubmitting ? "Saving..." : "Save Changes")
    : (isUploading ? "Uploading media..." : isSubmitting ? "Creating..." : "Create Exercise");

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
            Category
          </label>
          {isLoadingCategories ? (
            <span className="pd-admin-exercises-skeleton-line is-field" aria-hidden="true" />
          ) : categoriesError ? (
            <div className="pd-admin-exercise-form-inline-error">
              <p className="pd-admin-exercise-form-error">{categoriesError}</p>
              <button type="button" className="pd-btn pd-btn-soft pd-btn-sm" onClick={onRetryCategories}>
                Retry
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
                <option value="">No categories available</option>
              ) : (
                categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))
              )}
            </select>
          )}
          <FieldError message={fieldErrors.categoryId} />
        </div>

        <div className="pd-admin-exercise-form-field">
          <label className="pd-admin-exercise-form-label" htmlFor="admin-exercise-language">
            Language
          </label>
          <select
            id="admin-exercise-language"
            className="pd-admin-exercise-form-control"
            value={language}
            disabled={isBusy}
            onChange={(event) => onLanguageChange(event.target.value)}
            required
          >
            {LANGUAGE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="pd-admin-exercise-form-field">
        <label className="pd-admin-exercise-form-label" htmlFor="admin-exercise-title">
          Title
        </label>
        <input
          id="admin-exercise-title"
          type="text"
          className="pd-admin-exercise-form-control"
          value={title}
          disabled={isBusy}
          maxLength={EXERCISE_TITLE_MAX + 1}
          onChange={(event) => onTitleChange(event.target.value)}
          required
        />
        <FieldError message={fieldErrors.title} />
      </div>

      <div className="pd-admin-exercise-form-field">
        <label className="pd-admin-exercise-form-label" htmlFor="admin-exercise-description">
          Description (optional)
        </label>
        <textarea
          id="admin-exercise-description"
          className="pd-admin-exercise-form-control pd-admin-exercise-form-textarea"
          value={description}
          disabled={isBusy}
          rows={4}
          maxLength={EXERCISE_TEXT_MAX + 1}
          onChange={(event) => onDescriptionChange(event.target.value)}
        />
        <FieldError message={fieldErrors.description} />
      </div>

      <div className="pd-admin-exercise-form-field">
        <label className="pd-admin-exercise-form-label" htmlFor="admin-exercise-instructions">
          Detailed instructions
        </label>
        <textarea
          id="admin-exercise-instructions"
          className="pd-admin-exercise-form-control pd-admin-exercise-form-textarea is-tall"
          value={instructions}
          disabled={isBusy}
          rows={8}
          maxLength={EXERCISE_TEXT_MAX + 1}
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
          Cancel
        </button>
        <button type="submit" className="pd-btn pd-btn-primary" disabled={!canSubmit}>
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
