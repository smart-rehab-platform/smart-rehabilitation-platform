import { SpecialistExerciseMediaSection } from "./SpecialistExerciseMediaSection";

/**
 * Shared create/edit exercise form. Mode controls labels and field copy only.
 * @param {"create"|"edit"} mode
 */
export function SpecialistExerciseEditForm({
  mode = "edit",
  title,
  categoryId,
  language,
  description,
  instructions,
  categories,
  fieldErrors,
  isBusy,
  isUploading,
  uploadProgress,
  instructionMediaUrl,
  pendingMediaFile,
  clearInstructionMedia,
  mediaError,
  onTitleChange,
  onCategoryChange,
  onLanguageChange,
  onDescriptionChange,
  onInstructionsChange,
  onSelectMediaFile,
  onRemoveMedia,
  onUndoMediaRemoval,
  onCancel,
  onSave,
}) {
  const isCreate = mode === "create";
  const saveLabel = isUploading
    ? "Uploading media..."
    : isBusy
      ? (isCreate ? "Creating..." : "Saving...")
      : (isCreate ? "Add Exercise" : "Save Changes");

  const handleMediaSelect = (file, validationError) => {
    if (validationError) {
      onSelectMediaFile(null, validationError);
      return;
    }
    onSelectMediaFile(file, null);
  };

  return (
    <form
      className="pd-specialist-exercise-form"
      onSubmit={(event) => {
        event.preventDefault();
        onSave?.();
      }}
    >
      <section className="pd-card pd-card-pad pd-specialist-exercise-form-card">
        <h2 className="pd-specialist-exercise-form-heading">Exercise Information</h2>

        <div className="pd-specialist-exercise-form-row">
          <div className={`pd-specialist-exercise-field${fieldErrors.categoryId ? " has-error" : ""}`}>
            <label className="pd-specialist-exercise-label" htmlFor="exercise-category">
              Category
            </label>
            <select
              id="exercise-category"
              className="pd-specialist-exercise-control pd-specialist-exercise-select"
              value={categoryId}
              onChange={(event) => onCategoryChange(event.target.value)}
              disabled={isBusy}
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {fieldErrors.categoryId ? (
              <p className="pd-specialist-exercise-error">{fieldErrors.categoryId}</p>
            ) : null}
          </div>

          <div className="pd-specialist-exercise-field">
            <label className="pd-specialist-exercise-label" htmlFor="exercise-language">
              Language
            </label>
            <select
              id="exercise-language"
              className="pd-specialist-exercise-control pd-specialist-exercise-select"
              value={language}
              onChange={(event) => onLanguageChange(event.target.value)}
              disabled={isBusy}
            >
              <option value="en">English</option>
              <option value="ar">Arabic</option>
            </select>
          </div>
        </div>

        <div className={`pd-specialist-exercise-field${fieldErrors.title ? " has-error" : ""}`}>
          <label className="pd-specialist-exercise-label" htmlFor="exercise-title">
            Title
          </label>
          <input
            id="exercise-title"
            type="text"
            className="pd-specialist-exercise-control"
            placeholder="Exercise title"
            value={title}
            onChange={(event) => onTitleChange(event.target.value)}
            disabled={isBusy}
          />
          {fieldErrors.title ? (
            <p className="pd-specialist-exercise-error">{fieldErrors.title}</p>
          ) : null}
        </div>

        <div className="pd-specialist-exercise-field">
          <label className="pd-specialist-exercise-label" htmlFor="exercise-description">
            Description (optional)
          </label>
          <textarea
            id="exercise-description"
            className="pd-specialist-exercise-control pd-specialist-exercise-textarea"
            rows={4}
            value={description}
            onChange={(event) => onDescriptionChange(event.target.value)}
            disabled={isBusy}
          />
        </div>

        <div className="pd-specialist-exercise-field">
          <label className="pd-specialist-exercise-label" htmlFor="exercise-instructions">
            Instructions
          </label>
          <textarea
            id="exercise-instructions"
            className="pd-specialist-exercise-control pd-specialist-exercise-textarea"
            rows={6}
            placeholder="Detailed instructions"
            value={instructions}
            onChange={(event) => onInstructionsChange(event.target.value)}
            disabled={isBusy}
          />
        </div>

        <SpecialistExerciseMediaSection
          existingMediaUrl={instructionMediaUrl}
          pendingMediaFile={pendingMediaFile}
          clearInstructionMedia={clearInstructionMedia}
          mediaError={mediaError}
          isBusy={isBusy}
          uploadProgress={uploadProgress}
          onSelectFile={handleMediaSelect}
          onRemoveMedia={onRemoveMedia}
          onUndoRemoval={onUndoMediaRemoval}
        />

        {fieldErrors.form ? (
          <p className="pd-specialist-exercise-error">{fieldErrors.form}</p>
        ) : null}

        <div className="pd-specialist-exercise-form-actions">
          <button
            type="button"
            className="pd-btn pd-btn-soft"
            onClick={onCancel}
            disabled={isBusy}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="pd-btn pd-btn-primary"
            disabled={isBusy}
          >
            {saveLabel}
          </button>
        </div>
      </section>
    </form>
  );
}
