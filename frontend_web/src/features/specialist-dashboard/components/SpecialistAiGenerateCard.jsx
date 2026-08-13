import { Dumbbell, Loader2, Wand2 } from "lucide-react";
import { AI_RECOMMENDATION_TYPE } from "../utils/specialistAiRecommendationMappers";

export function SpecialistAiGenerateCard({
  isGenerating,
  generatingTypeId,
  onGenerateExercise,
  onGeneratePlanAdjustment,
}) {
  const isGeneratingExercise = isGenerating
    && generatingTypeId === AI_RECOMMENDATION_TYPE.exerciseSuggestion;
  const isGeneratingPlan = isGenerating
    && generatingTypeId === AI_RECOMMENDATION_TYPE.planAdjustment;

  return (
    <section className="pd-card pd-card-pad pd-specialist-ai-generate-card">
      <h2 className="pd-specialist-ai-section-title">Generate Recommendation</h2>
      <p className="pd-specialist-ai-section-sub">
        Create AI-assisted exercise or plan recommendations from patient context.
      </p>
      <div className="pd-specialist-ai-generate-actions">
        <button
          type="button"
          className="pd-btn pd-btn-primary pd-specialist-ai-generate-btn"
          onClick={onGenerateExercise}
          disabled={isGenerating}
        >
          {isGeneratingExercise ? (
            <Loader2 size={18} aria-hidden="true" className="pd-inline-spinner" />
          ) : (
            <Dumbbell size={18} aria-hidden="true" />
          )}
          {isGeneratingExercise ? "Generating..." : "Generate Exercise Suggestion"}
        </button>
        <button
          type="button"
          className="pd-btn pd-btn-outline pd-specialist-ai-generate-btn"
          onClick={onGeneratePlanAdjustment}
          disabled={isGenerating}
        >
          {isGeneratingPlan ? (
            <Loader2 size={18} aria-hidden="true" className="pd-inline-spinner" />
          ) : (
            <Wand2 size={18} aria-hidden="true" />
          )}
          {isGeneratingPlan ? "Generating..." : "Generate Plan Adjustment"}
        </button>
      </div>
    </section>
  );
}
