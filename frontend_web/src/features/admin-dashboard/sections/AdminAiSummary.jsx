import { AlertTriangle, FileText, Mic, Sparkles } from "lucide-react";
import { formatSpeechAverageScore } from "../utils/adminAiCenterMappers";

const SUMMARY_CARDS = [
  {
    key: "speech",
    label: "Speech Analyses",
    valueKey: "speechTotal",
    subtitleKey: "speechAverageScore",
    subtitlePrefix: "Avg score ",
    icon: Mic,
    tone: "blue",
    sectionId: "admin-ai-speech-analyses",
  },
  {
    key: "recommendations",
    label: "AI Recommendations",
    valueKey: "recommendationsTotal",
    icon: Sparkles,
    tone: "teal",
    sectionId: "admin-ai-recommendations",
  },
  {
    key: "reports",
    label: "AI Reports",
    valueKey: "reportsTotal",
    icon: FileText,
    tone: "amber",
    sectionId: "admin-ai-reports",
  },
  {
    key: "attention",
    label: "Needs Attention",
    valueKey: "patientsNeedingAttentionCount",
    subtitleKey: "pendingRecommendations",
    subtitleSuffix: " pending reviews",
    icon: AlertTriangle,
    tone: "orange",
    sectionId: "admin-ai-patients-attention",
  },
];

function SummaryCardIcon({ icon: Icon, tone }) {
  return (
    <span className={`pd-summary-icon pd-tone-${tone}`} aria-hidden="true">
      <Icon size={15} strokeWidth={2.1} />
    </span>
  );
}

function LoadingCard({ card }) {
  return (
    <article
      key={card.key}
      className="pd-quick-summary-item pd-quick-summary-item-static pd-admin-kpi-card pd-admin-ai-kpi-card"
      aria-label={`${card.label} loading`}
    >
      <SummaryCardIcon icon={card.icon} tone={card.tone} />
      <span className="pd-quick-summary-copy">
        <span className="pd-summary-label">{card.label}</span>
        <span className="pd-inline-loading pd-admin-kpi-loading">Loading...</span>
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

function resolveCardSubtitle(data, card) {
  if (card.subtitleKey === "speechAverageScore") {
    const average = formatSpeechAverageScore(data?.speechAverageScore ?? 0);
    return `${card.subtitlePrefix}${average}`;
  }

  if (card.subtitleKey === "pendingRecommendations") {
    const count = data?.pendingRecommendations ?? 0;
    return `${count}${card.subtitleSuffix}`;
  }

  return null;
}

export function AdminAiSummary({
  data,
  isLoading = false,
  onScrollToSection,
}) {
  if (isLoading) {
    return (
      <section className="pd-admin-kpi-row pd-admin-ai-summary" aria-label="AI summary loading">
        {SUMMARY_CARDS.map((card) => (
          <LoadingCard key={card.key} card={card} />
        ))}
      </section>
    );
  }

  return (
    <section className="pd-admin-kpi-row pd-admin-ai-summary" aria-label="AI summary">
      {SUMMARY_CARDS.map((card) => {
        const value = resolveCardValue(data, card);
        const subtitle = resolveCardSubtitle(data, card);

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
