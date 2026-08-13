import { SpecialistAiRecommendationCard } from "../components/SpecialistAiRecommendationCard";

export function SpecialistAiRecommendationsList({
  recommendations,
  updatingRecommendationId,
  onAccept,
  onReject,
}) {
  if (!recommendations.length) {
    return (
      <section className="pd-card pd-card-pad pd-task-hub-state pd-specialist-ai-empty">
        <p className="pd-section-sub">Generate your first AI recommendation</p>
      </section>
    );
  }

  return (
    <div className="pd-specialist-ai-recommendations-list">
      {recommendations.map((recommendation) => (
        <SpecialistAiRecommendationCard
          key={recommendation.id}
          recommendation={recommendation}
          isUpdating={updatingRecommendationId === recommendation.id}
          onAccept={() => onAccept(recommendation.id)}
          onReject={() => onReject(recommendation.id)}
        />
      ))}
    </div>
  );
}
