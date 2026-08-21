import { useLocale } from "../../../context/useLocale";

export function SpecialistExerciseSpeechTargetsSection({
  expectedText,
  targetWord,
  targetPhoneme,
  fieldErrors,
  isBusy,
  onExpectedTextChange,
  onTargetWordChange,
  onTargetPhonemeChange,
}) {
  const { t } = useLocale();

  return (
    <section className="pd-specialist-exercise-speech-targets">
      <h3 className="pd-specialist-exercise-speech-targets-heading">
        {t("specialist.exercises.speechTargets.sectionTitle")}
      </h3>

      <div className={`pd-specialist-exercise-field${fieldErrors.expectedText ? " has-error" : ""}`}>
        <label className="pd-specialist-exercise-label" htmlFor="exercise-expected-text">
          {t("specialist.exercises.speechTargets.expectedText")}
        </label>
        <textarea
          id="exercise-expected-text"
          className="pd-specialist-exercise-control pd-specialist-exercise-textarea"
          rows={4}
          value={expectedText}
          onChange={(event) => onExpectedTextChange(event.target.value)}
          disabled={isBusy}
          dir="auto"
        />
        <p className="pd-specialist-exercise-helper">
          {t("specialist.exercises.speechTargets.expectedTextHelper")}
        </p>
        {fieldErrors.expectedText ? (
          <p className="pd-specialist-exercise-error">{fieldErrors.expectedText}</p>
        ) : null}
      </div>

      <div className="pd-specialist-exercise-form-row">
        <div className="pd-specialist-exercise-field">
          <label className="pd-specialist-exercise-label" htmlFor="exercise-target-word">
            {t("specialist.exercises.speechTargets.targetWord")}
          </label>
          <input
            id="exercise-target-word"
            type="text"
            className="pd-specialist-exercise-control"
            value={targetWord}
            onChange={(event) => onTargetWordChange(event.target.value)}
            disabled={isBusy}
            dir="auto"
          />
          <p className="pd-specialist-exercise-helper">
            {t("specialist.exercises.speechTargets.targetWordHelper")}
          </p>
        </div>

        <div className="pd-specialist-exercise-field">
          <label className="pd-specialist-exercise-label" htmlFor="exercise-target-phoneme">
            {t("specialist.exercises.speechTargets.targetPhoneme")}
          </label>
          <input
            id="exercise-target-phoneme"
            type="text"
            className="pd-specialist-exercise-control"
            value={targetPhoneme}
            onChange={(event) => onTargetPhonemeChange(event.target.value)}
            disabled={isBusy}
            dir="auto"
          />
          <p className="pd-specialist-exercise-helper">
            {t("specialist.exercises.speechTargets.targetPhonemeHelper")}
          </p>
        </div>
      </div>
    </section>
  );
}
