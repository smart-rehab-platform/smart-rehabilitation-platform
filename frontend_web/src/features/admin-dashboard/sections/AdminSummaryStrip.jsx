import { useMemo } from "react";
import { Users } from "lucide-react";
import familyRestroomIcon from "../../../assets/icons/family_restroom.svg";
import medicalServicesIcon from "../../../assets/icons/medical_services.svg";
import monitoringIcon from "../../../assets/icons/monitoring.svg";
import { PlatformMaterialIcon } from "../../../components/platform/PlatformMaterialIcon";
import { useLocale } from "../../../context/useLocale.js";
import { getAdminSummaryLabels } from "../utils/adminDashboardLocalization.js";
import { getAdminSummaryKpiAction } from "../utils/adminDashboardNavigation.js";

const KPI_CARDS = [
  {
    key: "totalUsers",
    labelKey: "users",
    subtitleKey: "usersSubtitle",
    icon: Users,
    tone: "blue",
  },
  {
    key: "totalPatients",
    labelKey: "patients",
    icon: familyRestroomIcon,
    tone: "teal",
  },
  {
    key: "totalSpecialists",
    labelKey: "specialists",
    icon: medicalServicesIcon,
    tone: "green",
  },
  {
    key: "newSignupsThisWeek",
    labelKey: "newSignups",
    subtitleKey: "signupsSubtitle",
    icon: monitoringIcon,
    tone: "orange",
  },
];

function renderCardIcon(icon) {
  if (typeof icon === "string") {
    return <PlatformMaterialIcon icon={icon} size={15} />;
  }

  const Icon = icon;
  return <Icon size={15} strokeWidth={2} aria-hidden="true" />;
}

function LoadingCard({ card, labels }) {
  const label = labels[card.labelKey];

  return (
    <article
      key={card.key}
      className="pd-quick-summary-item pd-quick-summary-item-static pd-admin-kpi-card"
      aria-label={labels.loadingCardAria(label)}
    >
      <span className={`pd-summary-icon pd-tone-${card.tone}`} aria-hidden="true">
        {renderCardIcon(card.icon)}
      </span>
      <span className="pd-quick-summary-copy">
        <span className="pd-summary-label">{label}</span>
        <span className="pd-inline-loading pd-admin-kpi-loading">{labels.loading}...</span>
      </span>
    </article>
  );
}

function resolveSubtitle(card, overview, labels) {
  if (card.subtitleKey === "usersSubtitle") {
    const count = overview?.newSignupsThisWeek ?? 0;
    return labels.newSignupsThisWeek(count);
  }

  if (card.subtitleKey === "signupsSubtitle") {
    return labels.thisWeek;
  }

  return null;
}

export function AdminSummaryStrip({
  overview,
  isLoading = false,
  onNavigate,
  onScrollToTarget,
}) {
  const { t } = useLocale();
  const labels = useMemo(() => getAdminSummaryLabels(t), [t]);

  if (isLoading) {
    return (
      <section className="pd-admin-kpi-row" aria-label={labels.overviewLoadingAriaLabel}>
        {KPI_CARDS.map((card) => (
          <LoadingCard key={card.key} card={card} labels={labels} />
        ))}
      </section>
    );
  }

  return (
    <section className="pd-admin-kpi-row" aria-label={labels.overviewAriaLabel}>
      {KPI_CARDS.map((card) => {
        const value = overview?.[card.key] ?? 0;
        const label = labels[card.labelKey];
        const subtitle = resolveSubtitle(card, overview, labels);
        const action = getAdminSummaryKpiAction(card.key);
        const scrollTargetId = action?.kind === "scroll" ? action.targetId : null;

        return (
          <button
            key={card.key}
            type="button"
            className={`pd-quick-summary-item pd-quick-summary-item--${card.key} pd-admin-kpi-card`}
            onClick={() => {
              if (action?.kind === "scroll") {
                onScrollToTarget?.(action.targetId);
                return;
              }

              if (action?.kind === "route") {
                onNavigate?.(action.routeKey, action.navOptions);
              }
            }}
            aria-label={labels.valueAria(label, value)}
            aria-controls={scrollTargetId ?? undefined}
          >
            <span className={`pd-summary-icon pd-tone-${card.tone}`} aria-hidden="true">
              {renderCardIcon(card.icon)}
            </span>
            <span className="pd-quick-summary-copy">
              <span className="pd-summary-label">{label}</span>
              <strong className="pd-summary-value">{value}</strong>
              {subtitle ? (
                <span className="pd-admin-kpi-subtitle">{subtitle}</span>
              ) : null}
            </span>
          </button>
        );
      })}
    </section>
  );
}
