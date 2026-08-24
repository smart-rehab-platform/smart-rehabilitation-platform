import '../../../../l10n/app_localizations.dart';
import '../../models/specialist_ai_report_structured_summary.dart';

String specialistAiReportSectionTitle(AppLocalizations l10n, String fieldId) {
  return switch (fieldId) {
    'executive_summary' => l10n.specialistAiReportSectionExecutiveSummary,
    'patient_progress_summary' => l10n.specialistAiReportSectionPatientProgress,
    'speech_analysis_summary' => l10n.specialistAiReportSectionSpeechAnalysis,
    'exercise_adherence_summary' =>
      l10n.specialistAiReportSectionExerciseAdherence,
    'goal_progress_summary' => l10n.specialistAiReportSectionGoalProgress,
    'clinical_insights' => l10n.specialistAiReportSectionClinicalInsights,
    'risks_or_regressions' => l10n.specialistAiReportSectionRisks,
    'recommendations' => l10n.specialistAiReportSectionRecommendations,
    'next_steps' => l10n.specialistAiReportSectionNextSteps,
    _ => fieldId,
  };
}

List<String> specialistAiReportEditableFieldIds() => [
      ...SpecialistAiReportStructuredSummary.narrativeFieldIds,
      ...SpecialistAiReportStructuredSummary.listFieldIds,
    ];

bool specialistAiReportIsListField(String fieldId) =>
    SpecialistAiReportStructuredSummary.listFieldIds.contains(fieldId);
