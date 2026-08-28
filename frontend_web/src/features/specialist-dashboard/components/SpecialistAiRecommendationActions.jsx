import { useLocale } from "../../../context/useLocale";

export function SpecialistAiRecommendationActions({
  isUpdating,
  isEditing = false,
  isSavingDraft = false,
  canEdit = false,
  onEdit,
  onSave,
  onCancel,
  onAccept,
  onReject,
}) {
  const { t } = useLocale();
  const busy = isUpdating || isSavingDraft;

  if (isEditing) {
    return (
      <div className="pd-specialist-ai-recommendation-actions">
        <button
          type="button"
          className="pd-btn pd-btn-primary"
          onClick={onSave}
          disabled={busy}
        >
          {isSavingDraft
            ? t("specialist.aiRecommendations.edit.saving")
            : t("specialist.aiRecommendations.edit.saveChanges")}
        </button>
        <button
          type="button"
          className="pd-btn pd-btn-outline"
          onClick={onCancel}
          disabled={isSavingDraft}
        >
          {t("specialist.aiRecommendations.edit.cancelEditing")}
        </button>
      </div>
    );
  }

  return (
    <div className="pd-specialist-ai-recommendation-actions">
      {canEdit ? (
        <button
          type="button"
          className="pd-btn pd-btn-outline"
          onClick={onEdit}
          disabled={busy}
        >
          {t("specialist.aiRecommendations.edit.editRecommendation")}
        </button>
      ) : null}
      <button
        type="button"
        className="pd-btn pd-btn-primary"
        onClick={onAccept}
        disabled={busy}
      >
        {isUpdating ? t("specialist.aiRecommendations.actions.assigning") : t("specialist.aiRecommendations.actions.assign")}
      </button>
      <button
        type="button"
        className="pd-btn pd-btn-outline pd-specialist-ai-reject-btn"
        onClick={onReject}
        disabled={busy}
      >
        {t("specialist.aiRecommendations.actions.reject")}
      </button>
    </div>
  );
}
