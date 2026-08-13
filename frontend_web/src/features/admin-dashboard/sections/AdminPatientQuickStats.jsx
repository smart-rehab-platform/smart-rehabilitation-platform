import {
  ClipboardCheck,
  Dumbbell,
  FileText,
  Flag,
} from "lucide-react";

const STAT_META = [
  { key: "activeGoals", label: "Active Goals", tone: "blue", target: "goals", Icon: Flag },
  { key: "assignedExercises", label: "Assigned Exercises", tone: "teal", target: "exercises", Icon: Dumbbell },
  { key: "pendingReviews", label: "Pending Reviews", tone: "orange", target: "submissions", Icon: ClipboardCheck },
  { key: "reports", label: "Reports", tone: "cyan", target: null, Icon: FileText },
];

function StatCardContent({ meta, value }) {
  const Icon = meta.Icon;

  return (
    <>
      <span className={`pd-admin-patient-stat-icon pd-admin-patient-stat-icon--${meta.tone}`} aria-hidden="true">
        <Icon size={18} strokeWidth={2.1} />
      </span>
      <span className="pd-admin-patient-stat-copy">
        <strong>{value}</strong>
        <span>{meta.label}</span>
      </span>
    </>
  );
}

export function AdminPatientQuickStats({ stats, onStatClick }) {
  return (
    <section className="pd-admin-patient-quick-stats pd-section-enter" aria-label="Quick statistics">
      <h2 className="pd-admin-patient-section-title">Quick Statistics</h2>
      <div className="pd-admin-patient-quick-stats-grid">
        {STAT_META.map((meta) => {
          const value = stats?.[meta.key] ?? 0;
          const isInteractive = Boolean(meta.target && onStatClick);
          const className = `pd-card pd-card-pad pd-admin-patient-stat-card pd-admin-patient-stat-card--${meta.key}${isInteractive ? " is-clickable" : ""}`;

          if (!isInteractive) {
            return (
              <div key={meta.key} className={className}>
                <StatCardContent meta={meta} value={value} />
              </div>
            );
          }

          return (
            <button
              key={meta.key}
              type="button"
              className={className}
              onClick={() => onStatClick(meta.target)}
            >
              <StatCardContent meta={meta} value={value} />
            </button>
          );
        })}
      </div>
    </section>
  );
}

export function AdminPatientQuickStatsSkeleton() {
  return (
    <section className="pd-admin-patient-quick-stats pd-admin-patient-skeleton-card" aria-hidden="true">
      <span className="pd-admin-patient-skeleton-line is-section-title" />
      <div className="pd-admin-patient-quick-stats-grid">
        {[0, 1, 2, 3].map((index) => (
          <div key={index} className="pd-card pd-card-pad pd-admin-patient-stat-card">
            <span className="pd-admin-patient-skeleton-stat-icon" />
            <span className="pd-admin-patient-skeleton-line is-stat-value" />
            <span className="pd-admin-patient-skeleton-line is-stat-label" />
          </div>
        ))}
      </div>
    </section>
  );
}
