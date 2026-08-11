import calendarMonthIcon from "../../../assets/icons/calendar-month.svg";
import clipboardCheckMultipleIcon from "../../../assets/icons/clipboard-check-multiple.svg";
import familyRestroomIcon from "../../../assets/icons/family_restroom.svg";
import medicalServicesIcon from "../../../assets/icons/medical_services.svg";
import { PlatformMaterialIcon } from "../../../components/platform/PlatformMaterialIcon";

const KPI_CARDS = [
  {
    key: "activeCases",
    label: "Active Cases",
    icon: familyRestroomIcon,
    tone: "blue",
    navKey: "patients",
  },
  {
    key: "pendingReviews",
    label: "Pending Reviews",
    icon: clipboardCheckMultipleIcon,
    tone: "purple",
    navKey: "reviews",
  },
  {
    key: "todaysSessions",
    label: "Today's Sessions",
    icon: calendarMonthIcon,
    tone: "green",
    navKey: "sessions",
  },
  {
    key: "treatmentPlans",
    label: "Treatment Plans",
    icon: medicalServicesIcon,
    tone: "orange",
    navKey: "treatmentPlans",
  },
];

function renderCardIcon(icon) {
  if (typeof icon === "string") {
    return <PlatformMaterialIcon icon={icon} size={15} />;
  }

  return (
    <img
      src={icon}
      alt=""
      aria-hidden="true"
      className="pd-platform-icon"
      style={{ width: 15, height: 15 }}
    />
  );
}

function LoadingCard({ card }) {
  return (
    <article
      key={card.key}
      className="pd-quick-summary-item pd-quick-summary-item-static"
      aria-label={`${card.label} loading`}
    >
      <span className={`pd-summary-icon pd-tone-${card.tone}`} aria-hidden="true">
        {renderCardIcon(card.icon)}
      </span>
      <span className="pd-quick-summary-copy">
        <span className="pd-summary-label">{card.label}</span>
        <span className="pd-inline-loading pd-specialist-kpi-loading">Loading...</span>
      </span>
    </article>
  );
}

export function SpecialistSummaryStrip({
  overview,
  isLoading = false,
  onCardAction,
}) {
  if (isLoading) {
    return (
      <section className="pd-specialist-kpi-row" aria-label="Overview summary loading">
        {KPI_CARDS.map((card) => (
          <LoadingCard key={card.key} card={card} />
        ))}
      </section>
    );
  }

  return (
    <section className="pd-specialist-kpi-row" aria-label="Overview summary">
      {KPI_CARDS.map((card) => {
        const value = overview?.[card.key] ?? 0;

        return (
          <button
            key={card.key}
            type="button"
            className={`pd-quick-summary-item pd-quick-summary-item--${card.key}`}
            onClick={() => onCardAction?.(card.navKey)}
            aria-label={`${card.label}: ${value}`}
          >
            <span className={`pd-summary-icon pd-tone-${card.tone}`} aria-hidden="true">
              {renderCardIcon(card.icon)}
            </span>
            <span className="pd-quick-summary-copy">
              <span className="pd-summary-label">{card.label}</span>
              <strong className="pd-summary-value">{value}</strong>
            </span>
          </button>
        );
      })}
    </section>
  );
}
