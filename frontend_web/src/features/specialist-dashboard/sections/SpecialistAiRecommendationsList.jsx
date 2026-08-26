import { useLocale } from "../../../context/useLocale";
import { SpecialistAiRecommendationCard } from "../components/SpecialistAiRecommendationCard";

export function SpecialistAiRecommendationsList({
  recommendations,
  updatingRecommendationId,
  editingRecommendationId,
  draftForm,
  isSavingDraft,
  onDraftFieldChange,
  onEdit,
  onSave,
  onCancel,
  onAccept,
  onReject,
}) {
  const { t } = useLocale();

  if (!recommendations.length) {
    return (
      <section className="pd-card pd-card-pad pd-task-hub-state pd-specialist-ai-empty">
        <p className="pd-section-sub">{t("specialist.aiRecommendations.empty")}</p>
      </section>
    );
  }

  return (
    <div className="pd-specialist-ai-recommendations-list">
      {recommendations.map((recommendation) => {
        const isEditing = editingRecommendationId === recommendation.id;
        const anotherEditing = Boolean(editingRecommendationId) && !isEditing;
        return (
          <SpecialistAiRecommendationCard
            key={recommendation.id}
            recommendation={recommendation}
            isUpdating={updatingRecommendationId === recommendation.id || anotherEditing}
            isEditing={isEditing}
            draftForm={isEditing ? draftForm : null}
            isSavingDraft={isEditing && isSavingDraft}
            onDraftFieldChange={onDraftFieldChange}
            onEdit={() => onEdit(recommendation)}
            onSave={() => onSave(recommendation.id)}
            onCancel={onCancel}
            onAccept={() => onAccept(recommendation.id)}
            onReject={() => onReject(recommendation.id)}
          />
        );
      })}
    </div>
  );
}
