export function AdminPatientsToolbar({
  searchQuery,
  conditionFilter,
  conditionOptions,
  onSearchChange,
  onConditionFilterChange,
}) {
  return (
    <section className="pd-admin-patients-toolbar pd-section-enter" aria-label="Patients toolbar">
      <div className="pd-admin-patients-heading">
        <h1 className="pd-section-title">Patients</h1>
        <p className="pd-section-sub">View and manage all registered patients.</p>
      </div>

      <div className="pd-admin-patients-controls">
        <label className="pd-admin-patients-search-wrap">
          <span className="pd-sr-only">Search patients</span>
          <input
            type="search"
            className="pd-admin-patients-search"
            placeholder="Search patients or condition"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </label>

        <label className="pd-admin-patients-filter-wrap">
          <span className="pd-sr-only">Filter by condition</span>
          <select
            className="pd-admin-patients-filter"
            value={conditionFilter}
            onChange={(event) => onConditionFilterChange(event.target.value)}
          >
            <option value="">All conditions</option>
            {conditionOptions.map((condition) => (
              <option key={condition} value={condition}>
                {condition}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
}
