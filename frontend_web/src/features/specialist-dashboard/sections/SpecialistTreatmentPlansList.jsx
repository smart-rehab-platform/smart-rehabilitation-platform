import { Plus } from "lucide-react";
import { SpecialistTreatmentPlanCard } from "../components/SpecialistTreatmentPlanCard";
import { SpecialistTreatmentPlanFilters } from "../components/SpecialistTreatmentPlanFilters";
import { SpecialistTreatmentPlanSearch } from "../components/SpecialistTreatmentPlanSearch";

export function SpecialistTreatmentPlansList({
  plans,
  visiblePlans,
  isLoading,
  error,
  searchQuery,
  onSearchChange,
  filterId,
  onFilterChange,
  onRetry,
  onPlanClick,
  onAddPlan,
}) {
  if (isLoading) {
    return (
      <section className="pd-card pd-card-pad pd-task-hub-state">
        <p className="pd-inline-loading">Loading treatment plans...</p>
      </section>
    );
  }

  if (error && plans.length === 0) {
    return (
      <section className="pd-card pd-card-pad pd-task-hub-state">
        <p className="pd-inline-error">{error}</p>
        <button type="button" className="pd-btn pd-btn-soft" onClick={onRetry}>
          Retry
        </button>
      </section>
    );
  }

  return (
    <div className="pd-specialist-treatment-plans-panel">
      <SpecialistTreatmentPlanSearch value={searchQuery} onChange={onSearchChange} />
      <SpecialistTreatmentPlanFilters selectedFilterId={filterId} onChange={onFilterChange} />

      {error ? (
        <div className="pd-specialist-treatment-plan-inline-error">
          <p className="pd-inline-error">{error}</p>
          <button type="button" className="pd-btn pd-btn-soft pd-btn-sm" onClick={onRetry}>
            Retry
          </button>
        </div>
      ) : null}

      {plans.length === 0 ? (
        <section className="pd-card pd-card-pad pd-task-hub-state">
          <p className="pd-section-sub">No treatment plans found.</p>
          <button type="button" className="pd-btn pd-btn-outline pd-specialist-treatment-plan-add-btn" onClick={onAddPlan}>
            <Plus size={16} aria-hidden="true" />
            Add Treatment Plan
          </button>
        </section>
      ) : visiblePlans.length === 0 ? (
        <section className="pd-card pd-card-pad pd-task-hub-state">
          <p className="pd-section-sub">No plans match your search or filter.</p>
        </section>
      ) : (
        <ul className="pd-specialist-treatment-plans-list">
          {visiblePlans.map((plan) => (
            <li key={plan.id}>
              <SpecialistTreatmentPlanCard plan={plan} onClick={onPlanClick} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
