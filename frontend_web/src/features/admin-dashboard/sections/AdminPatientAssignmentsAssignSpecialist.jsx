export function AdminPatientAssignmentsAssignSpecialist({
  specialists,
  selectedSpecialistId,
  isPrimarySpecialist,
  isSubmitting,
  canSubmit,
  error,
  onSelectSpecialist,
  onPrimaryChange,
  onSubmit,
}) {
  const hasSpecialists = specialists.length > 0;

  return (
    <section className="pd-card pd-card-pad pd-admin-assignments-form-card" aria-label="Assign specialist">
      <h2 className="pd-admin-assignments-card-title">Assign Specialist</h2>

      <div className="pd-admin-form">
        <label className="pd-admin-field">
          <span className="pd-admin-field-label">Specialist</span>
          <select
            className="pd-admin-select"
            value={selectedSpecialistId ?? ""}
            onChange={(event) => onSelectSpecialist(event.target.value || null)}
            disabled={!hasSpecialists || isSubmitting}
          >
            {!hasSpecialists ? (
              <option value="">No specialists available</option>
            ) : (
              <>
                <option value="">Select a specialist</option>
                {specialists.map((specialist) => (
                  <option key={specialist.userId} value={specialist.userId}>
                    {specialist.name}
                    {specialist.email ? ` (${specialist.email})` : ""}
                  </option>
                ))}
              </>
            )}
          </select>
        </label>

        <label className="pd-admin-assignments-checkbox">
          <input
            type="checkbox"
            checked={isPrimarySpecialist}
            onChange={(event) => onPrimaryChange(event.target.checked)}
            disabled={!hasSpecialists || isSubmitting}
          />
          <span>Primary specialist</span>
        </label>

        {error ? <p className="pd-inline-error">{error}</p> : null}

        <button
          type="button"
          className="pd-btn pd-btn-primary pd-admin-assignments-submit"
          onClick={onSubmit}
          disabled={!canSubmit}
        >
          {isSubmitting ? "Assigning..." : "Assign Specialist to Patient"}
        </button>
      </div>
    </section>
  );
}
