import { useLocale } from "../../../context/useLocale";
import { StatusBadge } from "../../shared-dashboard/components/StatusBadge";
import { formatConfidencePercent } from "../utils/specialistAiRecommendationMappers";
import { SpecialistAiRecommendationActions } from "./SpecialistAiRecommendationActions";

function hasText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function RecommendationSection({ title, children }) {
  return (
    <div className="pd-specialist-ai-recommendation-section">
      <h4 className="pd-specialist-ai-recommendation-section-title">{title}</h4>
      {children}
    </div>
  );
}

function RecommendationParagraph({ text }) {
  return <p className="pd-specialist-ai-recommendation-text" dir="auto">{text}</p>;
}

export function SpecialistAiRecommendationCard({
  recommendation,
  isUpdating,
  onAccept,
  onReject,
}) {
  const { t } = useLocale();
  const { type, status, generatedAtLabel, details, sectionLabels, priorityLabel } = recommendation;
  const confidencePercent = formatConfidencePercent(details.confidence);
  const labels = sectionLabels || {
    summary: t("specialist.aiRecommendations.sections.summary"),
    reason: t("specialist.aiRecommendations.sections.reason"),
    clinicalAnalysis: t("specialist.aiRecommendations.sections.clinicalAnalysis"),
    suggestedExercises: t("specialist.aiRecommendations.sections.suggestedExercises"),
    planAdjustment: t("specialist.aiRecommendations.sections.planAdjustment"),
    confidence: t("specialist.aiRecommendations.sections.confidence"),
  };

  const showReason = hasText(details.clinicalReasoning)
    && details.clinicalReasoning !== details.summary;
  const showClinicalAnalysis = hasText(details.clinicalAnalysis)
    && details.clinicalAnalysis !== details.summary
    && details.clinicalAnalysis !== details.clinicalReasoning;

  return (
    <article className="pd-card pd-card-pad pd-specialist-ai-recommendation-card">
      <div className="pd-specialist-ai-recommendation-card-header">
        <div className="pd-specialist-ai-recommendation-card-heading">
          <h3 className="pd-specialist-ai-recommendation-type">{type.label}</h3>
          <p className="pd-specialist-ai-recommendation-date">{generatedAtLabel}</p>
        </div>
        <StatusBadge label={status.label} tone={status.tone} />
      </div>

      <div className="pd-specialist-ai-recommendation-content">
        {hasText(details.summary) ? (
          <RecommendationSection title={labels.summary}>
            <RecommendationParagraph text={details.summary} />
          </RecommendationSection>
        ) : null}

        {showReason ? (
          <RecommendationSection title={labels.reason}>
            <RecommendationParagraph text={details.clinicalReasoning} />
          </RecommendationSection>
        ) : null}

        {showClinicalAnalysis ? (
          <RecommendationSection title={labels.clinicalAnalysis}>
            <RecommendationParagraph text={details.clinicalAnalysis} />
          </RecommendationSection>
        ) : null}

        {details.suggestedExercises.length > 0 ? (
          <RecommendationSection title={labels.suggestedExercises}>
            <ul className="pd-specialist-ai-recommendation-list">
              {details.suggestedExercises.map((exercise, index) => (
                <li key={exercise.exerciseId || `${exercise.displayLine}-${index}`} dir="auto">
                  {exercise.displayLine}
                </li>
              ))}
            </ul>
          </RecommendationSection>
        ) : null}

        {details.planAdjustments.length > 0 ? (
          <RecommendationSection title={labels.planAdjustment}>
            <ul className="pd-specialist-ai-recommendation-list">
              {details.planAdjustments.map((item, index) => (
                <li key={`${item}-${index}`} dir="auto">{item}</li>
              ))}
            </ul>
          </RecommendationSection>
        ) : null}

        {confidencePercent != null ? (
          <p className="pd-specialist-ai-confidence">
            {labels.confidence}
            {": "}
            {confidencePercent}
            %
          </p>
        ) : null}

        {hasText(details.priorityLevel) ? (
          <StatusBadge
            label={priorityLabel}
            tone="blue"
          />
        ) : null}
      </div>

      {status.isPending ? (
        <SpecialistAiRecommendationActions
          isUpdating={isUpdating}
          onAccept={onAccept}
          onReject={onReject}
        />
      ) : null}
    </article>
  );
}
