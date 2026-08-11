export function SpecialistNotesSection({ notes, onAddNote }) {
  return (
    <section className="pd-specialist-patient-section" id="specialist-patient-notes">
      <div className="pd-specialist-section-head">
        <h2 className="pd-section-title">Latest Specialist Notes</h2>
        <button type="button" className="pd-btn pd-btn-primary pd-btn-sm" onClick={onAddNote}>
          Add Specialist Note
        </button>
      </div>

      {notes.length === 0 ? (
        <div className="pd-card pd-card-pad">
          <p className="pd-section-sub">No specialist notes yet.</p>
        </div>
      ) : (
        <div className="pd-specialist-patient-stack">
          {notes.map((note) => (
            <article key={note.id} className="pd-card pd-card-pad">
              <p>{note.note}</p>
              <p className="pd-section-sub">
                {note.specialistName}
                {note.createdAtLabel ? ` · ${note.createdAtLabel}` : ""}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export function SpecialistPatientFooterActions({
  onReviewExercises,
  onViewReports,
  onCreateTreatmentPlan,
  onEditTreatmentPlan,
  onAiRecommendations,
  onSpeechAnalysis,
  hasActivePlan,
}) {
  return (
    <section className="pd-specialist-patient-footer-actions">
      <button type="button" className="pd-btn pd-btn-soft" onClick={onReviewExercises}>
        Review Exercises
      </button>
      <button type="button" className="pd-btn pd-btn-soft" onClick={onViewReports}>
        View Reports
      </button>
      {hasActivePlan ? (
        <button type="button" className="pd-btn pd-btn-soft" onClick={onEditTreatmentPlan}>
          Edit Treatment Plan
        </button>
      ) : (
        <button type="button" className="pd-btn pd-btn-soft" onClick={onCreateTreatmentPlan}>
          Create Treatment Plan
        </button>
      )}
      <button type="button" className="pd-btn pd-btn-soft" onClick={onAiRecommendations}>
        AI Recommendations
      </button>
      <button type="button" className="pd-btn pd-btn-soft" onClick={onSpeechAnalysis}>
        Speech Analysis
      </button>
    </section>
  );
}
