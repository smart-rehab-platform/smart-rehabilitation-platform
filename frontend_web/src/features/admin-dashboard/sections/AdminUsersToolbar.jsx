const ROLE_FILTERS = [
  { id: "all", label: "All", value: null },
  { id: "admin", label: "Admin", value: "admin" },
  { id: "specialist", label: "Specialist", value: "specialist" },
  { id: "parent", label: "Parent", value: "parent" },
];

export function AdminUsersToolbar({
  searchQuery,
  roleFilter,
  onSearchChange,
  onRoleFilterChange,
  onAddUser,
}) {
  return (
    <section className="pd-admin-users-toolbar pd-section-enter" aria-label="Users toolbar">
      <div className="pd-admin-users-toolbar-top">
        <div className="pd-admin-users-heading">
          <h1 className="pd-section-title">Users</h1>
          <p className="pd-section-sub">Manage platform user accounts</p>
        </div>
        <button type="button" className="pd-btn pd-btn-primary" onClick={onAddUser}>
          + Add User
        </button>
      </div>

      <div className="pd-admin-users-controls">
        <label className="pd-admin-users-search-wrap">
          <span className="pd-sr-only">Search users</span>
          <input
            type="search"
            className="pd-admin-users-search"
            placeholder="Search by name, email, or role"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </label>

        <div className="pd-admin-users-filters" role="tablist" aria-label="Role filters">
          {ROLE_FILTERS.map((filter) => {
            const selected = roleFilter === filter.value;
            return (
              <button
                key={filter.id}
                type="button"
                role="tab"
                aria-selected={selected}
                className={`pd-admin-users-filter${selected ? " is-selected" : ""}`}
                onClick={() => onRoleFilterChange(filter.value)}
              >
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
