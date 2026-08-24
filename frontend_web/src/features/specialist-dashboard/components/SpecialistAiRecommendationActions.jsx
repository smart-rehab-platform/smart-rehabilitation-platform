import { useLocale } from "../../../context/useLocale";

export function SpecialistAiRecommendationActions({
  isUpdating,
  onAccept,
  onReject,
}) {
  const { t } = useLocale();

  return (
    <div className="pd-specialist-ai-recommendation-actions">
      <button
        type="button"
        className="pd-btn pd-btn-primary"
        onClick={onAccept}
        disabled={isUpdating}
      >
        {isUpdating ? t("specialist.aiRecommendations.actions.assigning") : t("specialist.aiRecommendations.actions.assign")}
      </button>
      <button
        type="button"
        className="pd-btn pd-btn-outline pd-specialist-ai-reject-btn"
        onClick={onReject}
        disabled={isUpdating}
      >
        {t("specialist.aiRecommendations.actions.reject")}
      </button>
    </div>
  );
}
