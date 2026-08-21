export function SpecialistGoalCircularProgress({
  percent = 0,
  label,
  size = 100,
  isAchieved = false,
}) {
  const safe = Math.max(0, Math.min(100, percent ?? 0));
  const stroke = Math.max(6, Math.round(size * 0.055));
  const radius = (size - stroke) / 2 - 1;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;
  const strokeOffset = circumference - (safe / 100) * circumference;
  const display = Math.round(safe);

  return (
    <div
      className={`pd-specialist-manage-goal-progress-ring${isAchieved ? " is-achieved" : ""}`}
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={display}
      aria-label={`${label} ${display}%`}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="pd-specialist-manage-goal-progress-ring-svg"
        aria-hidden="true"
      >
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          className="pd-specialist-manage-goal-progress-ring-track"
          strokeWidth={stroke}
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          className="pd-specialist-manage-goal-progress-ring-fill"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeOffset}
          transform={`rotate(-90 ${center} ${center})`}
        />
      </svg>
      <div className="pd-specialist-manage-goal-progress-ring-center">
        <strong>{display}%</strong>
        <span>{label}</span>
      </div>
    </div>
  );
}
