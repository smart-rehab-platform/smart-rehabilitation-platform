import { useLocale } from "../../../context/useLocale";
import clipboardCheckMultipleIcon from "../../../assets/icons/clipboard-check-multiple.svg";
import descriptionIcon from "../../../assets/icons/description.svg";
import dumbbellIcon from "../../../assets/icons/dumbbell.svg";
import flagIcon from "../../../assets/icons/flag.svg";

const STAT_CARD_META = {
  activeGoals: {
    labelKey: "specialist.patientDetails.stats.activeGoals",
    icon: flagIcon,
    tone: "blue",
    target: "goals",
  },
  assignedExercises: {
    labelKey: "specialist.patientDetails.stats.assignedExercises",
    icon: dumbbellIcon,
    tone: "teal",
    target: "exercises",
  },
  pendingReviews: {
    labelKey: "specialist.patientDetails.stats.pendingReviews",
    icon: clipboardCheckMultipleIcon,
    tone: "orange",
    target: "submissions",
  },
  reports: {
    labelKey: "specialist.patientDetails.stats.reports",
    icon: descriptionIcon,
    tone: "navy",
    target: "reports",
  },
};

const STAT_KEYS = [
  "activeGoals",
  "assignedExercises",
  "pendingReviews",
  "reports",
];

export function SpecialistPatientQuickStats({ stats, onStatClick }) {
  const { t } = useLocale();

  return (
    <section className="pd-specialist-patient-section">
      <h2 className="pd-section-title">{t("specialist.patientDetails.quickStatistics")}</h2>
      <div className="pd-specialist-patient-quick-stats">
        {STAT_KEYS.map((key) => {
          const meta = STAT_CARD_META[key];

          return (
            <button
              key={key}
              type="button"
              className={`pd-card pd-card-pad pd-specialist-patient-stat-card pd-specialist-patient-stat-card--${key}`}
              onClick={() => onStatClick?.(meta.target)}
            >
              <span
                className={`pd-summary-icon pd-specialist-patient-stat-icon pd-tone-${meta.tone}`}
                aria-hidden="true"
              >
                <img
                  src={meta.icon}
                  alt=""
                  aria-hidden="true"
                  className="pd-platform-icon pd-specialist-patient-stat-icon-image"
                />
              </span>
              <strong>{stats[key]}</strong>
              <span>{t(meta.labelKey)}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
