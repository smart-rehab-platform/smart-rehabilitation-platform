import calendarMonthIcon from "../../../assets/icons/calendar-month.svg";
import clipboardCheckMultipleIcon from "../../../assets/icons/clipboard-check-multiple.svg";
import familyRestroomIcon from "../../../assets/icons/family_restroom.svg";
import medicalServicesIcon from "../../../assets/icons/medical_services.svg";
import { PlatformMaterialIcon } from "../../../components/platform/PlatformMaterialIcon";
import { useLocale } from "../../../context/useLocale.js";
import { getSpecialistDashboardKpiLabel } from "../utils/specialistDashboardLocalization";

const KPI_CARDS = [
  {
    key: "activeCases",
    icon: familyRestroomIcon,
    tone: "blue",
    navKey: "patients",
  },
  {
    key: "pendingReviews",
    icon: clipboardCheckMultipleIcon,
    tone: "purple",
    navKey: "reviews",
  },
  {
    key: "todaysSessions",
    icon: calendarMonthIcon,
    tone: "green",
    navKey: "sessions",
  },
  {
    key: "treatmentPlans",
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

function LoadingCard({ card, label, loadingLabel, loadingAriaLabel }) {
  return (
    <article
      key={card.key}
      className="pd-quick-summary-item pd-quick-summary-item-static"
      aria-label={loadingAriaLabel}
    >
      <span className={`pd-summary-icon pd-tone-${card.tone}`} aria-hidden="true">
        {renderCardIcon(card.icon)}
      </span>
      <span className="pd-quick-summary-copy">
        <span className="pd-summary-label">{label}</span>
        <span className="pd-inline-loading pd-specialist-kpi-loading">{loadingLabel}</span>
      </span>
    </article>
  );
}

export function SpecialistSummaryStrip({
  overview,
  isLoading = false,
  onCardAction,
}) {
  const { t } = useLocale();

  if (isLoading) {
    return (
      <section className="pd-specialist-kpi-row" aria-label={t("specialist.dashboard.overviewLoadingAriaLabel")}>
        {KPI_CARDS.map((card) => {
          const label = getSpecialistDashboardKpiLabel(card.key, t);
          return (
            <LoadingCard
              key={card.key}
              card={card}
              label={label}
              loadingLabel={t("specialist.dashboard.kpi.loading")}
              loadingAriaLabel={t("specialist.dashboard.kpi.loadingAriaLabel", { label })}
            />
          );
        })}
      </section>
    );
  }

  return (
    <section className="pd-specialist-kpi-row" aria-label={t("specialist.dashboard.overviewAriaLabel")}>
      {KPI_CARDS.map((card) => {
        const label = getSpecialistDashboardKpiLabel(card.key, t);
        const value = overview?.[card.key] ?? 0;

        return (
          <button
            key={card.key}
            type="button"
            className={`pd-quick-summary-item pd-quick-summary-item--${card.key}`}
            onClick={() => onCardAction?.(card.key)}
            aria-label={t("specialist.dashboard.kpi.valueAriaLabel", { label, value })}
          >
            <span className={`pd-summary-icon pd-tone-${card.tone}`} aria-hidden="true">
              {renderCardIcon(card.icon)}
            </span>
            <span className="pd-quick-summary-copy">
              <span className="pd-summary-label">{label}</span>
              <strong className="pd-summary-value">{value}</strong>
            </span>
          </button>
        );
      })}
    </section>
  );
}
