import { useMemo } from "react";
import { useLocale } from "../../../context/useLocale.js";
import { getAdminRelationshipOptions } from "../utils/adminPatientAssignmentsLocalization.js";

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
  labels,
}) {
  const { t, locale } = useLocale();
  const relationshipOptions = useMemo(
    () => getAdminRelationshipOptions({ t, locale }),
    [t, locale],
  );
  const hasParents = parents.length > 0;

  return (
    <div className="pd-admin-assignments-manage-column" aria-label={labels.linkParent}>
      <h3 className="pd-admin-assignments-column-title">{labels.linkParent}</h3>

      <div className="pd-admin-form pd-admin-assignments-column-form">
        <label className="pd-admin-field">
          <span className="pd-admin-field-label">{labels.parentLabel}</span>
          <select
            className="pd-admin-select"
            value={selectedParentId ?? ""}
            onChange={(event) => onSelectParent(event.target.value || null)}
            disabled={!hasParents || isSubmitting}
          >
            {!hasParents ? (
              <option value="">{labels.noParents}</option>
            ) : (
              <>
                <option value="">{labels.selectParent}</option>
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
          <span className="pd-admin-field-label">{labels.relationship}</span>
          <select
            className="pd-admin-select"
            value={selectedRelationship}
            onChange={(event) => onSelectRelationship(event.target.value)}
            disabled={!hasParents || isSubmitting}
          >
            {relationshipOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
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
          <span>{labels.primaryContact}</span>
        </label>

        {error ? <p className="pd-inline-error">{error}</p> : null}

        <button
          type="button"
          className="pd-btn pd-btn-primary pd-admin-assignments-submit"
          onClick={onSubmit}
          disabled={!canSubmit}
        >
          {isSubmitting ? labels.linking : labels.linkParentAction}
        </button>
      </div>
    </div>
  );
}
