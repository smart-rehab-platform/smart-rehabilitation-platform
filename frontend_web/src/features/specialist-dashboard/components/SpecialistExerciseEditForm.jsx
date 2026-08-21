import { useMemo } from "react";
import { useLocale } from "../../../context/useLocale";
import { applyExerciseCategoryListLocalization } from "../utils/specialistExercisesLocalization";
import { isSpeechArticulationCategory, resolveExerciseCategoryName } from "../utils/specialistExerciseMappers";
import { SpecialistExerciseMediaSection } from "./SpecialistExerciseMediaSection";
import { SpecialistExerciseSpeechTargetsSection } from "./SpecialistExerciseSpeechTargetsSection";

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
  expectedText = "",
  targetWord = "",
  targetPhoneme = "",
  categories,
  localizedCategories,
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
  onExpectedTextChange,
  onTargetWordChange,
  onTargetPhonemeChange,
  onSelectMediaFile,
  onRemoveMedia,
  onUndoMediaRemoval,
  onCancel,
  onSave,
}) {
  const { t } = useLocale();
  const isCreate = mode === "create";
  const saveLabel = isUploading
    ? t("specialist.exercises.media.uploading")
    : isBusy
      ? (isCreate ? t("specialist.exercises.creating") : t("specialist.exercises.saving"))
      : (isCreate ? t("specialist.exercises.addExercise") : t("specialist.exercises.saveChanges"));

  const categoryOptions = useMemo(
    () => localizedCategories ?? applyExerciseCategoryListLocalization(categories, { t }),
    [localizedCategories, categories, t],
  );

  const showSpeechTargets = useMemo(() => {
    const categoryName = resolveExerciseCategoryName(categoryId, categories);
    return isSpeechArticulationCategory(categoryName);
  }, [categoryId, categories]);

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
        <h2 className="pd-specialist-exercise-form-heading">{t("specialist.exercises.formHeading")}</h2>

        <div className="pd-specialist-exercise-form-row">
          <div className={`pd-specialist-exercise-field${fieldErrors.categoryId ? " has-error" : ""}`}>
            <label className="pd-specialist-exercise-label" htmlFor="exercise-category">
              {t("specialist.exercises.fields.category")}
            </label>
            <select
              id="exercise-category"
              className="pd-specialist-exercise-control pd-specialist-exercise-select"
              value={categoryId}
              onChange={(event) => onCategoryChange(event.target.value)}
              disabled={isBusy}
            >
              <option value="">{t("specialist.exercises.fields.selectCategory")}</option>
              {categoryOptions.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.displayName ?? category.name}
                </option>
              ))}
            </select>
            {fieldErrors.categoryId ? (
              <p className="pd-specialist-exercise-error">{fieldErrors.categoryId}</p>
            ) : null}
          </div>

          <div className="pd-specialist-exercise-field">
            <label className="pd-specialist-exercise-label" htmlFor="exercise-language">
              {t("specialist.exercises.fields.language")}
            </label>
            <select
              id="exercise-language"
              className="pd-specialist-exercise-control pd-specialist-exercise-select"
              value={language}
              onChange={(event) => onLanguageChange(event.target.value)}
              disabled={isBusy}
            >
              <option value="en">{t("common.english")}</option>
              <option value="ar">{t("common.arabic")}</option>
            </select>
          </div>
        </div>

        <div className={`pd-specialist-exercise-field${fieldErrors.title ? " has-error" : ""}`}>
          <label className="pd-specialist-exercise-label" htmlFor="exercise-title">
            {t("specialist.exercises.fields.title")}
          </label>
          <input
            id="exercise-title"
            type="text"
            className="pd-specialist-exercise-control"
            placeholder={t("specialist.exercises.fields.titlePlaceholder")}
            value={title}
            onChange={(event) => onTitleChange(event.target.value)}
            disabled={isBusy}
            dir="auto"
          />
          {fieldErrors.title ? (
            <p className="pd-specialist-exercise-error">{fieldErrors.title}</p>
          ) : null}
        </div>

        <div className="pd-specialist-exercise-field">
          <label className="pd-specialist-exercise-label" htmlFor="exercise-description">
            {t("specialist.exercises.fields.descriptionOptional")}
          </label>
          <textarea
            id="exercise-description"
            className="pd-specialist-exercise-control pd-specialist-exercise-textarea"
            rows={4}
            value={description}
            onChange={(event) => onDescriptionChange(event.target.value)}
            disabled={isBusy}
            dir="auto"
          />
        </div>

        <div className="pd-specialist-exercise-field">
          <label className="pd-specialist-exercise-label" htmlFor="exercise-instructions">
            {t("specialist.exercises.fields.instructions")}
          </label>
          <textarea
            id="exercise-instructions"
            className="pd-specialist-exercise-control pd-specialist-exercise-textarea"
            rows={6}
            placeholder={t("specialist.exercises.fields.instructionsPlaceholder")}
            value={instructions}
            onChange={(event) => onInstructionsChange(event.target.value)}
            disabled={isBusy}
            dir="auto"
          />
        </div>

        {showSpeechTargets ? (
          <SpecialistExerciseSpeechTargetsSection
            expectedText={expectedText}
            targetWord={targetWord}
            targetPhoneme={targetPhoneme}
            fieldErrors={fieldErrors}
            isBusy={isBusy}
            onExpectedTextChange={onExpectedTextChange}
            onTargetWordChange={onTargetWordChange}
            onTargetPhonemeChange={onTargetPhonemeChange}
          />
        ) : null}

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
            {t("common.cancel")}
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
