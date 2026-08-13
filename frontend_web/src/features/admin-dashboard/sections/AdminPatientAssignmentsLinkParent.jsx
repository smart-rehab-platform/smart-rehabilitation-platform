import { PARENT_RELATIONSHIP_OPTIONS, formatRelationshipLabel } from "../utils/adminPatientAssignmentsMappers";

export function AdminPatientAssignmentsLinkParent({
  parents,
  selectedParentId,
  selectedRelationship,
  isPrimaryContact,
  isSubmitting,
  canSubmit,
  error,
  onSelectParent,
  onSelectRelationship,
  onPrimaryChange,
  onSubmit,
}) {
  const hasParents = parents.length > 0;

  return (
    <section className="pd-card pd-card-pad pd-admin-assignments-form-card" aria-label="Link parent">
      <h2 className="pd-admin-assignments-card-title">Link Parent</h2>

      <div className="pd-admin-form">
        <label className="pd-admin-field">
          <span className="pd-admin-field-label">Parent</span>
          <select
            className="pd-admin-select"
            value={selectedParentId ?? ""}
            onChange={(event) => onSelectParent(event.target.value || null)}
            disabled={!hasParents || isSubmitting}
          >
            {!hasParents ? (
              <option value="">No parents available</option>
            ) : (
              <>
                <option value="">Select a parent</option>
                {parents.map((parent) => (
                  <option key={parent.userId} value={parent.userId}>
                    {parent.name}
                    {parent.email ? ` (${parent.email})` : ""}
                  </option>
                ))}
              </>
            )}
          </select>
        </label>

        <label className="pd-admin-field">
          <span className="pd-admin-field-label">Relationship</span>
          <select
            className="pd-admin-select"
            value={selectedRelationship}
            onChange={(event) => onSelectRelationship(event.target.value)}
            disabled={!hasParents || isSubmitting}
          >
            {PARENT_RELATIONSHIP_OPTIONS.map((relationship) => (
              <option key={relationship} value={relationship}>
                {formatRelationshipLabel(relationship)}
              </option>
            ))}
          </select>
        </label>

        <label className="pd-admin-assignments-checkbox">
          <input
            type="checkbox"
            checked={isPrimaryContact}
            onChange={(event) => onPrimaryChange(event.target.checked)}
            disabled={!hasParents || isSubmitting}
          />
          <span>Primary contact</span>
        </label>

        {error ? <p className="pd-inline-error">{error}</p> : null}

        <button
          type="button"
          className="pd-btn pd-btn-primary pd-admin-assignments-submit"
          onClick={onSubmit}
          disabled={!canSubmit}
        >
          {isSubmitting ? "Linking..." : "Link Parent to Patient"}
        </button>
      </div>
    </section>
  );
}
