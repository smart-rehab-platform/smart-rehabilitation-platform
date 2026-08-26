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

function EditableTextSection({
  title,
  fieldId,
  value,
  onChange,
  disabled,
  rows = 4,
  hint = null,
}) {
  return (
    <RecommendationSection title={title}>
      {hint ? <p className="pd-section-sub">{hint}</p> : null}
      <textarea
        className="pd-form-textarea pd-specialist-ai-recommendation-edit-field"
        value={value}
        onChange={(event) => onChange(fieldId, event.target.value)}
        disabled={disabled}
        rows={rows}
        dir="auto"
        aria-label={title}
      />
    </RecommendationSection>
  );
}

export function SpecialistAiRecommendationCard({
  recommendation,
  isUpdating,
  isEditing = false,
  draftForm = null,
  isSavingDraft = false,
  onDraftFieldChange,
  onEdit,
  onSave,
  onCancel,
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
  const listHint = t("specialist.aiRecommendations.edit.listItemsHint");
  const exerciseHint = t("specialist.aiRecommendations.edit.exerciseItemsHint");

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
        {isEditing ? (
          <StatusBadge
            label={t("specialist.aiRecommendations.edit.editingBanner")}
            tone="blue"
          />
        ) : (
          <StatusBadge label={status.label} tone={status.tone} />
        )}
      </div>

      <div className="pd-specialist-ai-recommendation-content">
        {isEditing && draftForm ? (
          <>
            <EditableTextSection
              title={labels.summary}
              fieldId="clinical_reasoning"
              value={draftForm.clinical_reasoning}
              onChange={onDraftFieldChange}
              disabled={isSavingDraft}
              rows={5}
            />
            <EditableTextSection
              title={labels.clinicalAnalysis}
              fieldId="clinical_analysis"
              value={draftForm.clinical_analysis}
              onChange={onDraftFieldChange}
              disabled={isSavingDraft}
            />
            <EditableTextSection
              title={labels.suggestedExercises}
              fieldId="suggested_exercises"
              value={draftForm.suggested_exercises}
              onChange={onDraftFieldChange}
              disabled={isSavingDraft}
              hint={exerciseHint}
            />
            <EditableTextSection
              title={labels.planAdjustment}
              fieldId="treatment_plan_adjustments"
              value={draftForm.treatment_plan_adjustments}
              onChange={onDraftFieldChange}
              disabled={isSavingDraft}
              hint={listHint}
            />
          </>
        ) : (
          <>
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
          </>
        )}

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
          isEditing={isEditing}
          isSavingDraft={isSavingDraft}
          canEdit={!isEditing}
          onEdit={onEdit}
          onSave={onSave}
          onCancel={onCancel}
          onAccept={onAccept}
          onReject={onReject}
        />
      ) : null}
    </article>
  );
}
