export function WeeklyBarChart({ days = [], compact = false }) {
  return (
    <div className={`pd-weekly-chart${compact ? " is-compact" : ""}`}>
      <div className="pd-weekly-bars" role="img" aria-label="Weekly exercise completion chart">
        {days.map((day) => {
          const height = day.kind === "upcoming" ? 10 : Math.max(10, day.percent);
          return (
            <div key={day.id} className="pd-weekly-col">
              {day.kind !== "upcoming" ? (
                <span className="pd-weekly-pct">{day.percent}%</span>
              ) : (
                <span className="pd-weekly-pct is-muted">—</span>
              )}
              <div className="pd-weekly-bar-wrap">
                <div
                  className={`pd-weekly-bar pd-weekly-bar-${day.kind}`}
                  style={{ height: `${height}%` }}
                  title={`${day.label}: ${day.kind === "upcoming" ? "Upcoming" : `${day.percent}%`}`}
                />
              </div>
              <span className={`pd-weekly-label${day.kind === "today" ? " is-today" : ""}`}>
                {day.label}
              </span>
              {day.kind === "today" ? (
                <span className="pd-weekly-today-dot" aria-hidden="true" />
              ) : null}
            </div>
          );
        })}
      </div>
      {!compact ? (
        <div className="pd-weekly-legend">
          <span>
            <i className="pd-dot past" aria-hidden="true" /> Past days
          </span>
          <span>
            <i className="pd-dot today" aria-hidden="true" /> Today
          </span>
          <span>
            <i className="pd-dot upcoming" aria-hidden="true" /> Upcoming
          </span>
        </div>
      ) : null}
    </div>
  );
}
