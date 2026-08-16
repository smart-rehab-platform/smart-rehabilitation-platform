import { Search } from "lucide-react";
import { useLocale } from "../../../context/useLocale";
import { SpecialistSessionCard } from "../components/SpecialistSessionCard";
import { SpecialistSessionFilters } from "../components/SpecialistSessionFilters";

export function SpecialistSessionsList({
  sessions,
  searchQuery,
  onSearchChange,
  filterId,
  onFilterChange,
  emptyMessage,
}) {
  const { t } = useLocale();

  return (
    <div className="pd-specialist-sessions-list-view">
      <label className="pd-specialist-treatment-plan-search pd-specialist-session-search">
        <Search size={18} aria-hidden="true" />
        <input
          type="search"
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={t("specialist.sessions.searchPlaceholder")}
          aria-label={t("specialist.sessions.searchAriaLabel")}
        />
      </label>

      <SpecialistSessionFilters
        filterId={filterId}
        onFilterChange={onFilterChange}
      />

      {emptyMessage ? (
        <section className="pd-card pd-card-pad pd-task-hub-state">
          <p className="pd-section-sub">{emptyMessage}</p>
        </section>
      ) : (
        <div className="pd-specialist-sessions-list">
          {sessions.map((session) => (
            <SpecialistSessionCard key={session.id} session={session} />
          ))}
        </div>
      )}
    </div>
  );
}
