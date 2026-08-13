import { SpecialistSessionRequestCard } from "../components/SpecialistSessionRequestCard";
import { SpecialistSessionRequestFilters } from "../components/SpecialistSessionRequestFilters";

export function SpecialistSessionRequestsList({
  requests,
  filterId,
  onFilterChange,
  emptyMessage,
  error,
  onRetry,
}) {
  return (
    <div className="pd-specialist-session-requests-view">
      <SpecialistSessionRequestFilters
        filterId={filterId}
        onFilterChange={onFilterChange}
      />

      {error ? (
        <section className="pd-card pd-card-pad pd-task-hub-state">
          <p className="pd-inline-error">{error}</p>
          <button type="button" className="pd-btn pd-btn-soft" onClick={onRetry}>
            Retry
          </button>
        </section>
      ) : null}

      {emptyMessage && requests.length === 0 ? (
        <section className="pd-card pd-card-pad pd-task-hub-state">
          <p className="pd-section-sub">{emptyMessage}</p>
        </section>
      ) : requests.length > 0 ? (
        <div className="pd-specialist-session-requests-list">
          {requests.map((request) => (
            <SpecialistSessionRequestCard key={request.id} request={request} />
          ))}
        </div>
      ) : emptyMessage ? (
        <section className="pd-card pd-card-pad pd-task-hub-state">
          <p className="pd-section-sub">{emptyMessage}</p>
        </section>
      ) : null}
    </div>
  );
}
