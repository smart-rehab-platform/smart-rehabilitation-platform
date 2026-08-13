import { SpecialistReportCard } from "../components/SpecialistReportCard";
import { SpecialistReportFilters } from "../components/SpecialistReportFilters";
import { SpecialistReportSearch } from "../components/SpecialistReportSearch";

export function SpecialistReportsList({
  reports,
  visibleReports,
  isLoading,
  error,
  searchQuery,
  onSearchChange,
  filterId,
  onFilterChange,
  isPatientScoped,
  onRetry,
  onReportClick,
}) {
  if (isLoading) {
    return (
      <section className="pd-card pd-card-pad pd-task-hub-state">
        <p className="pd-inline-loading">Loading reports...</p>
      </section>
    );
  }

  if (error && reports.length === 0) {
    return (
      <section className="pd-card pd-card-pad pd-task-hub-state">
        <p className="pd-inline-error">{error}</p>
        <button type="button" className="pd-btn pd-btn-soft" onClick={onRetry}>
          Retry
        </button>
      </section>
    );
  }

  const emptyMessage = isPatientScoped
    ? "No reports available for this patient yet."
    : "No reports available yet.";
  const filteredEmptyMessage = "No reports match your current search or filter.";

  return (
    <div className="pd-specialist-reports-panel">
      <SpecialistReportSearch value={searchQuery} onChange={onSearchChange} />
      <SpecialistReportFilters selectedFilterId={filterId} onChange={onFilterChange} />

      {error ? (
        <div className="pd-specialist-report-inline-error">
          <p className="pd-inline-error">{error}</p>
          <button type="button" className="pd-btn pd-btn-soft pd-btn-sm" onClick={onRetry}>
            Retry
          </button>
        </div>
      ) : null}

      {reports.length === 0 ? (
        <section className="pd-card pd-card-pad pd-task-hub-state">
          <p className="pd-section-sub">{emptyMessage}</p>
        </section>
      ) : visibleReports.length === 0 ? (
        <section className="pd-card pd-card-pad pd-task-hub-state">
          <p className="pd-section-sub">{filteredEmptyMessage}</p>
        </section>
      ) : (
        <ul className="pd-specialist-reports-list">
          {visibleReports.map((report) => (
            <li key={`${report.sourceType}-${report.id}`}>
              <SpecialistReportCard report={report} onClick={onReportClick} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
