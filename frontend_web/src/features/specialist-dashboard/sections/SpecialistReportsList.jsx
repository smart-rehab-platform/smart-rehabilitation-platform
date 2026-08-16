import { useLocale } from "../../../context/useLocale";
import { SpecialistReportCard } from "../components/SpecialistReportCard";
import { SpecialistReportFilters } from "../components/SpecialistReportFilters";
import { SpecialistReportSearch } from "../components/SpecialistReportSearch";
import { getReportsEmptyMessage } from "../utils/specialistReportsLocalization";

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
  const { t } = useLocale();

  if (isLoading) {
    return (
      <section className="pd-card pd-card-pad pd-task-hub-state">
        <p className="pd-inline-loading">{t("specialist.reports.loading")}</p>
      </section>
    );
  }

  if (error && reports.length === 0) {
    return (
      <section className="pd-card pd-card-pad pd-task-hub-state">
        <p className="pd-inline-error">{error}</p>
        <button type="button" className="pd-btn pd-btn-soft" onClick={onRetry}>
          {t("common.retry")}
        </button>
      </section>
    );
  }

  const emptyMessage = getReportsEmptyMessage({ isPatientScoped, hasFilter: false }, t);
  const filteredEmptyMessage = getReportsEmptyMessage({ isPatientScoped, hasFilter: true }, t);

  return (
    <div className="pd-specialist-reports-panel">
      <SpecialistReportSearch value={searchQuery} onChange={onSearchChange} />
      <SpecialistReportFilters selectedFilterId={filterId} onChange={onFilterChange} />

      {error ? (
        <div className="pd-specialist-report-inline-error">
          <p className="pd-inline-error">{error}</p>
          <button type="button" className="pd-btn pd-btn-soft pd-btn-sm" onClick={onRetry}>
            {t("common.retry")}
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
