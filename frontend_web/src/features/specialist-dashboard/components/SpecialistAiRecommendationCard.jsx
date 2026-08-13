import { StatusBadge } from "../../shared-dashboard/components/StatusBadge";
import {
  formatConfidencePercent,
  formatPriorityLabel,
} from "../utils/specialistAiRecommendationMappers";
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
  return <p className="pd-specialist-ai-recommendation-text">{text}</p>;
}

export function SpecialistAiRecommendationCard({
  recommendation,
  isUpdating,
  onAccept,
  onReject,
}) {
  const { type, status, generatedAtLabel, details } = recommendation;
  const confidencePercent = formatConfidencePercent(details.confidence);

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
          <RecommendationSection title="Summary">
            <RecommendationParagraph text={details.summary} />
          </RecommendationSection>
        ) : null}

        {showReason ? (
          <RecommendationSection title="Reason">
            <RecommendationParagraph text={details.clinicalReasoning} />
          </RecommendationSection>
        ) : null}

        {showClinicalAnalysis ? (
          <RecommendationSection title="Clinical Analysis">
            <RecommendationParagraph text={details.clinicalAnalysis} />
          </RecommendationSection>
        ) : null}

        {details.suggestedExercises.length > 0 ? (
          <RecommendationSection title="Suggested Exercises">
            <ul className="pd-specialist-ai-recommendation-list">
              {details.suggestedExercises.map((exercise, index) => (
                <li key={exercise.exerciseId || `${exercise.displayLine}-${index}`}>
                  {exercise.displayLine}
                </li>
              ))}
            </ul>
          </RecommendationSection>
        ) : null}

        {details.planAdjustments.length > 0 ? (
          <RecommendationSection title="Plan Adjustment">
            <ul className="pd-specialist-ai-recommendation-list">
              {details.planAdjustments.map((item, index) => (
                <li key={`${item}-${index}`}>{item}</li>
              ))}
            </ul>
          </RecommendationSection>
        ) : null}

        {confidencePercent != null ? (
          <p className="pd-specialist-ai-confidence">
            Confidence:
            {" "}
            {confidencePercent}
            %
          </p>
        ) : null}

        {hasText(details.priorityLevel) ? (
          <StatusBadge
            label={formatPriorityLabel(details.priorityLevel)}
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
