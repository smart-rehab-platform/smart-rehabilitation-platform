import { AlertTriangle, FileText, Mic, Sparkles } from "lucide-react";

const SUMMARY_CARD_CONFIG = [
  {
    key: "speech",
    labelKey: "speech",
    valueKey: "speechTotal",
    icon: Mic,
    tone: "blue",
    sectionId: "admin-ai-speech-analyses",
  },
  {
    key: "recommendations",
    labelKey: "recommendations",
    valueKey: "recommendationsTotal",
    icon: Sparkles,
    tone: "teal",
    sectionId: "admin-ai-recommendations",
  },
  {
    key: "reports",
    labelKey: "reports",
    valueKey: "reportsTotal",
    icon: FileText,
    tone: "amber",
    sectionId: "admin-ai-reports",
  },
  {
    key: "attention",
    labelKey: "attention",
    valueKey: "patientsNeedingAttentionCount",
    subtitleKey: "pendingRecommendations",
    icon: AlertTriangle,
    tone: "orange",
    sectionId: "admin-ai-patients-attention",
  },
];

function getSummaryCards(labels) {
  return SUMMARY_CARD_CONFIG.map((card) => ({
    ...card,
    label: labels.kpi[card.labelKey],
  }));
}

function SummaryCardIcon({ icon: Icon, tone }) {
  return (
    <span className={`pd-summary-icon pd-tone-${tone}`} aria-hidden="true">
      <Icon size={15} strokeWidth={2.1} />
    </span>
  );
}

function LoadingCard({ card, labels }) {
  return (
    <article
      key={card.key}
      className="pd-quick-summary-item pd-quick-summary-item-static pd-admin-kpi-card pd-admin-ai-kpi-card"
      aria-label={`${card.label} — ${labels.kpi.loading}`}
    >
      <SummaryCardIcon icon={card.icon} tone={card.tone} />
      <span className="pd-quick-summary-copy">
        <span className="pd-summary-label">{card.label}</span>
        <span className="pd-inline-loading pd-admin-kpi-loading">{labels.kpi.loading}</span>
      </span>
    </article>
  );
}

function resolveCardValue(data, card) {
  if (card.valueKey === "patientsNeedingAttentionCount") {
    return data?.patientsNeedingAttention?.length ?? 0;
  }

  return data?.[card.valueKey] ?? 0;
}

function resolveCardSubtitle(data, card, labels) {
  if (card.subtitleKey === "pendingRecommendations") {
    const count = data?.pendingRecommendations ?? 0;
    return labels.kpi.pendingReviews(count);
  }

  return null;
}

export function AdminAiSummary({
  data,
  labels,
  isLoading = false,
  onScrollToSection,
}) {
  const cards = getSummaryCards(labels);

  if (isLoading) {
    return (
      <section
        className="pd-admin-kpi-row pd-admin-ai-summary"
        aria-label={labels.summaryLoadingAriaLabel}
      >
        {cards.map((card) => (
          <LoadingCard key={card.key} card={card} labels={labels} />
        ))}
      </section>
    );
  }

  return (
    <section className="pd-admin-kpi-row pd-admin-ai-summary" aria-label={labels.summaryAriaLabel}>
      {cards.map((card) => {
        const value = resolveCardValue(data, card);
        const subtitle = resolveCardSubtitle(data, card, labels);

        return (
          <button
            key={card.key}
            type="button"
            className={`pd-quick-summary-item pd-quick-summary-item--${card.key} pd-admin-kpi-card pd-admin-ai-kpi-card`}
            onClick={() => onScrollToSection?.(card.sectionId)}
            aria-label={subtitle ? `${card.label}: ${value}. ${subtitle}` : `${card.label}: ${value}`}
          >
            <SummaryCardIcon icon={card.icon} tone={card.tone} />
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
