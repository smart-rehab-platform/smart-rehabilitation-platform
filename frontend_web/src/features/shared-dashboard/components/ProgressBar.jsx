export function ProgressBar({
  label,
  percent,
  tone = "cyan",
  hideMeta = false,
  animated = false,
}) {
  const safe = Math.max(0, Math.min(100, percent ?? 0));

  return (
    <div className={`pd-progress-item${hideMeta ? " is-track-only" : ""}`}>
      {!hideMeta ? (
        <div className="pd-progress-meta">
          <span className="pd-progress-label">{label}</span>
          <span className="pd-progress-value">{safe}%</span>
        </div>
      ) : null}
      <div
        className="pd-progress-track"
        role="progressbar"
        aria-valuenow={safe}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${label} ${safe} percent`}
      >
        <div
          className={`pd-progress-fill pd-progress-fill-${tone}${animated ? " is-animated" : ""}`}
          style={{ width: `${safe}%` }}
        />
      </div>
    </div>
  );
}
