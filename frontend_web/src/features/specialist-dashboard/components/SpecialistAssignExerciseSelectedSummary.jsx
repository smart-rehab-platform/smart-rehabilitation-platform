import { useLocale } from "../../../context/useLocale";
import { SpecialistExerciseCategoryBadge } from "./SpecialistExerciseCategoryBadge";
import { SpecialistExerciseSpeechTargetsDetails } from "./SpecialistExerciseSpeechTargetsDetails";
import { isSpeechArticulationCategory } from "../utils/specialistExerciseMappers";

export function SpecialistAssignExerciseSelectedSummary({ exercise }) {
  const { t } = useLocale();

  if (!exercise) {
    return null;
  }

  const categoryLabel = exercise.categoryLabel ?? exercise.category;
  const description = exercise.description?.trim();
  const instructions = exercise.instructions?.trim();
  const preview = instructions || description || "";
  const showSpeechTargets = isSpeechArticulationCategory(exercise.category);

  return (
    <section className="pd-card pd-card-pad pd-specialist-assign-exercise-selected">
      <p className="pd-specialist-assign-exercise-selected-label">
        {t("specialist.assignExercise.selectedExercise")}
      </p>
      <h2 className="pd-specialist-assign-exercise-selected-title" dir="auto">
        {exercise.title}
      </h2>
      {categoryLabel ? (
        <SpecialistExerciseCategoryBadge category={exercise.category} label={categoryLabel} />
      ) : null}
      {preview ? (
        <p className="pd-specialist-assign-exercise-selected-preview" dir="auto">{preview}</p>
      ) : null}
      {exercise.languageLabel ? (
        <p className="pd-specialist-assign-exercise-selected-meta">
          {t("specialist.assignExercise.languageLine", { language: exercise.languageLabel })}
        </p>
      ) : null}
      {showSpeechTargets ? (
        <div className="pd-specialist-assign-exercise-speech-targets-wrap">
          <SpecialistExerciseSpeechTargetsDetails
            expectedText={exercise.expectedText}
            targetWord={exercise.targetWord}
            targetPhoneme={exercise.targetPhoneme}
            compact
          />
        </div>
      ) : null}
    </section>
  );
}
