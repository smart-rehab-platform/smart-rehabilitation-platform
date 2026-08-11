export function DashboardShell({
  collapsed,
  sidebar,
  header,
  children,
}) {
  return (
    <div className={`pd-shell${collapsed ? " is-collapsed" : ""}`}>
      {sidebar}

      <main className="pd-main">
        {header}
        <div className="pd-content">{children}</div>
      </main>
    </div>
  );
}
