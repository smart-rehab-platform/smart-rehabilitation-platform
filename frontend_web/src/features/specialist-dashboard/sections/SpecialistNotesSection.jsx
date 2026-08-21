import { useLocale } from "../../../context/useLocale";

export function SpecialistNotesSection({ notes, onAddNote }) {
  const { t } = useLocale();

  return (
    <section className="pd-specialist-patient-section" id="specialist-patient-notes">
      <div className="pd-specialist-section-head">
        <h2 className="pd-section-title">{t("specialist.patientDetails.latestNotes")}</h2>
        <button type="button" className="pd-btn pd-btn-primary pd-btn-sm" onClick={onAddNote}>
          {t("specialist.patientDetails.addSpecialistNote")}
        </button>
      </div>

      {notes.length === 0 ? (
        <div className="pd-card pd-card-pad">
          <p className="pd-section-sub">{t("specialist.patientDetails.noNotes")}</p>
        </div>
      ) : (
        <div className="pd-specialist-patient-stack">
          {notes.map((note) => (
            <article key={note.id} className="pd-card pd-card-pad">
              <p dir="auto">{note.note}</p>
              <p className="pd-section-sub">
                <span dir="auto">{note.specialistName}</span>
                {note.createdAtLabel ? ` · ${note.createdAtLabel}` : ""}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export function SpecialistPatientActions({
  onReviewExercises,
  onViewReports,
  onCreateTreatmentPlan,
  onEditTreatmentPlan,
  onAiRecommendations,
  onSpeechAnalysis,
  onManageDiagnosis,
  hasActivePlan,
}) {
  const { t } = useLocale();

  return (
    <section className="pd-specialist-patient-actions">
      <button type="button" className="pd-btn pd-btn-primary pd-btn-sm pd-specialist-patient-action-btn" onClick={onReviewExercises}>
        {t("specialist.patientDetails.reviewExercises")}
      </button>
      <button type="button" className="pd-btn pd-btn-primary pd-btn-sm pd-specialist-patient-action-btn" onClick={onViewReports}>
        {t("specialist.patientDetails.viewReports")}
      </button>
      {hasActivePlan ? (
        <button type="button" className="pd-btn pd-btn-primary pd-btn-sm pd-specialist-patient-action-btn" onClick={onEditTreatmentPlan}>
          {t("specialist.patientDetails.editTreatmentPlan")}
        </button>
      ) : (
        <button type="button" className="pd-btn pd-btn-primary pd-btn-sm pd-specialist-patient-action-btn" onClick={onCreateTreatmentPlan}>
          {t("specialist.patientDetails.createTreatmentPlan")}
        </button>
      )}
      <button type="button" className="pd-btn pd-btn-primary pd-btn-sm pd-specialist-patient-action-btn" onClick={onAiRecommendations}>
        {t("specialist.patientDetails.aiRecommendations")}
      </button>
      <button type="button" className="pd-btn pd-btn-primary pd-btn-sm pd-specialist-patient-action-btn" onClick={onSpeechAnalysis}>
        {t("specialist.patientDetails.speechAnalysis")}
      </button>
      <button type="button" className="pd-btn pd-btn-primary pd-btn-sm pd-specialist-patient-action-btn" onClick={onManageDiagnosis}>
        {t("specialist.patientDetails.manageDiagnosis")}
      </button>
    </section>
  );
}
