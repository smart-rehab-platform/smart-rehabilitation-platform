import { Users } from "lucide-react";
import familyRestroomIcon from "../../../assets/icons/family_restroom.svg";
import medicalServicesIcon from "../../../assets/icons/medical_services.svg";
import monitoringIcon from "../../../assets/icons/monitoring.svg";
import { PlatformMaterialIcon } from "../../../components/platform/PlatformMaterialIcon";

const KPI_CARDS = [
  {
    key: "totalUsers",
    label: "Users",
    subtitleKey: "usersSubtitle",
    icon: Users,
    tone: "blue",
    navKey: "users",
  },
  {
    key: "totalPatients",
    label: "Patients",
    icon: familyRestroomIcon,
    tone: "teal",
    navKey: "patients",
  },
  {
    key: "totalSpecialists",
    label: "Specialists",
    icon: medicalServicesIcon,
    tone: "green",
    navKey: "users",
  },
  {
    key: "newSignupsThisWeek",
    label: "New Signups",
    subtitleKey: "signupsSubtitle",
    icon: monitoringIcon,
    tone: "orange",
    navKey: "users",
  },
];

function renderCardIcon(icon) {
  if (typeof icon === "string") {
    return <PlatformMaterialIcon icon={icon} size={15} />;
  }

  const Icon = icon;
  return <Icon size={15} strokeWidth={2} aria-hidden="true" />;
}

function LoadingCard({ card }) {
  return (
    <article
      key={card.key}
      className="pd-quick-summary-item pd-quick-summary-item-static pd-admin-kpi-card"
      aria-label={`${card.label} loading`}
    >
      <span className={`pd-summary-icon pd-tone-${card.tone}`} aria-hidden="true">
        {renderCardIcon(card.icon)}
      </span>
      <span className="pd-quick-summary-copy">
        <span className="pd-summary-label">{card.label}</span>
        <span className="pd-inline-loading pd-admin-kpi-loading">Loading...</span>
      </span>
    </article>
  );
}

function resolveSubtitle(card, overview) {
  if (card.subtitleKey === "usersSubtitle") {
    const count = overview?.newSignupsThisWeek ?? 0;
    return `+${count} this week`;
  }

  if (card.subtitleKey === "signupsSubtitle") {
    return "This week";
  }

  return null;
}

export function AdminSummaryStrip({
  overview,
  isLoading = false,
  onNavigate,
}) {
  if (isLoading) {
    return (
      <section className="pd-admin-kpi-row" aria-label="Overview summary loading">
        {KPI_CARDS.map((card) => (
          <LoadingCard key={card.key} card={card} />
        ))}
      </section>
    );
  }

  return (
    <section className="pd-admin-kpi-row" aria-label="Overview summary">
      {KPI_CARDS.map((card) => {
        const value = overview?.[card.key] ?? 0;
        const subtitle = resolveSubtitle(card, overview);

        return (
          <button
            key={card.key}
            type="button"
            className={`pd-quick-summary-item pd-quick-summary-item--${card.key} pd-admin-kpi-card`}
            onClick={() => onNavigate?.(card.navKey)}
            aria-label={`${card.label}: ${value}`}
          >
            <span className={`pd-summary-icon pd-tone-${card.tone}`} aria-hidden="true">
              {renderCardIcon(card.icon)}
            </span>
            <span className="pd-quick-summary-copy">
              <span className="pd-summary-label">{card.label}</span>
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
