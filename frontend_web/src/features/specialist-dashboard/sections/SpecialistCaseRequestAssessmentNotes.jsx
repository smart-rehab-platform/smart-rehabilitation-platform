export function SpecialistCaseRequestAssessmentNotes({
  detail,
  notesDraft,
  onNotesChange,
  onSave,
  isSaving = false,
  canSave = false,
  disabled = false,
}) {
  if (!detail) {
    return null;
  }

  if (detail.canEditAssessmentNotes) {
    return (
      <section className="pd-card pd-card-pad pd-specialist-case-section">
        <h2 className="pd-specialist-case-section-title">Preliminary Assessment Notes</h2>
        <label className="pd-form-label" htmlFor="sp-case-assessment-notes">
          Assessment notes
        </label>
        <textarea
          id="sp-case-assessment-notes"
          className="pd-input pd-specialist-case-notes-input"
          rows={6}
          maxLength={10000}
          value={notesDraft}
          disabled={disabled}
          onChange={(event) => onNotesChange?.(event.target.value)}
          placeholder="Enter preliminary assessment notes"
        />
        <div className="pd-specialist-case-notes-actions">
          <button
            type="button"
            className="pd-btn pd-btn-primary"
            disabled={!canSave || isSaving || disabled}
            onClick={onSave}
          >
            {isSaving ? "Saving..." : "Save Notes"}
          </button>
        </div>
      </section>
    );
  }

  if (detail.showReadOnlyNotes) {
    return (
      <section className="pd-card pd-card-pad pd-specialist-case-section">
        <h2 className="pd-specialist-case-section-title">Preliminary Assessment Notes</h2>
        <p className="pd-specialist-case-field-value">{detail.assessmentNotes}</p>
      </section>
    );
  }

  return null;
}
