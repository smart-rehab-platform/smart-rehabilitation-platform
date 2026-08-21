import { useLocale } from "../../../context/useLocale";

export function SpecialistExerciseSpeechTargetsDetails({
  expectedText,
  targetWord,
  targetPhoneme,
  compact = false,
}) {
  const { t } = useLocale();

  const rows = [
    expectedText?.trim()
      ? { label: t("specialist.exercises.speechTargets.expectedText"), value: expectedText.trim() }
      : null,
    targetWord?.trim()
      ? { label: t("specialist.exercises.speechTargets.targetWord"), value: targetWord.trim() }
      : null,
    targetPhoneme?.trim()
      ? { label: t("specialist.exercises.speechTargets.targetPhoneme"), value: targetPhoneme.trim() }
      : null,
  ].filter(Boolean);

  if (rows.length === 0) {
    return null;
  }

  return (
    <section className={compact
      ? "pd-specialist-exercise-speech-targets-compact"
      : "pd-card pd-card-pad pd-specialist-exercise-details-section"}>
      <h3 className={compact
        ? "pd-specialist-exercise-speech-targets-compact-title"
        : "pd-specialist-exercise-details-section-title"}>
        {t("specialist.exercises.speechTargets.sectionTitle")}
      </h3>
      <dl className="pd-specialist-exercise-speech-targets-details">
        {rows.map((row) => (
          <div key={row.label} className="pd-specialist-exercise-speech-targets-detail-row">
            <dt className="pd-specialist-exercise-speech-targets-detail-label">{row.label}</dt>
            <dd className="pd-specialist-exercise-speech-targets-detail-value" dir="auto">
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
