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
  labels,
}) {
  const hasSpecialists = specialists.length > 0;

  return (
    <div className="pd-admin-assignments-manage-column" aria-label={labels.assignSpecialist}>
      <h3 className="pd-admin-assignments-column-title">{labels.assignSpecialist}</h3>

      <div className="pd-admin-form pd-admin-assignments-column-form">
        <label className="pd-admin-field">
          <span className="pd-admin-field-label">{labels.specialistLabel}</span>
          <select
            className="pd-admin-select"
            value={selectedSpecialistId ?? ""}
            onChange={(event) => onSelectSpecialist(event.target.value || null)}
            disabled={!hasSpecialists || isSubmitting}
          >
            {!hasSpecialists ? (
              <option value="">{labels.noSpecialists}</option>
            ) : (
              <>
                <option value="">{labels.selectSpecialist}</option>
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
          <span>{labels.primarySpecialist}</span>
        </label>

        {error ? <p className="pd-inline-error">{error}</p> : null}

        <button
          type="button"
          className="pd-btn pd-btn-primary pd-admin-assignments-submit"
          onClick={onSubmit}
          disabled={!canSubmit}
        >
          {isSubmitting ? labels.assigning : labels.assignSpecialistAction}
        </button>
      </div>
    </div>
  );
}
