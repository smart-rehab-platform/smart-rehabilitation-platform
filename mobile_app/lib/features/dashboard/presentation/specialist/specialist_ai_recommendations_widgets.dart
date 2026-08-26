import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../../../core/constants/dashboard_colors.dart';
import '../../../../l10n/app_localizations.dart';
import '../../models/specialist_ai_recommendations_models.dart';
import '../../widgets/dashboard_layout.dart';
import '../../widgets/dashboard_profile_avatar.dart';
import '../../widgets/dashboard_surface_card.dart';
import '../../widgets/dashboard_visuals.dart';
import 'specialist_ai_recommendation_status_style.dart';

class AiRecommendationsHeaderCard extends StatelessWidget {
  const AiRecommendationsHeaderCard({
    super.key,
    required this.patientName,
    this.profileImageUrl,
  });

  final String patientName;
  final String? profileImageUrl;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return DashboardSurfaceCard(
      child: Column(
        children: [
          DashboardProfileAvatar(
            initials: dashboardInitials(patientName, fallback: 'P'),
            imageUrl: profileImageUrl,
            radius: context.dashSpacing * 0.85,
          ),
          SizedBox(height: context.dashSpacing * 0.65),
          Text(
            patientName,
            style: theme.textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.w700,
              color: DashboardColors.textPrimary,
            ),
            textAlign: TextAlign.center,
          ),
          SizedBox(height: context.dashSpacing * 0.2),
          Text(
            'AI-powered clinical recommendations',
            style: theme.textTheme.bodySmall?.copyWith(
              color: DashboardColors.textSecondary,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}

class AiRecommendationsGenerateCard extends StatelessWidget {
  const AiRecommendationsGenerateCard({
    super.key,
    required this.isGenerating,
    required this.generatingType,
    required this.onGenerateExercise,
    required this.onGeneratePlanAdjustment,
  });

  final bool isGenerating;
  final AiRecommendationType? generatingType;
  final VoidCallback onGenerateExercise;
  final VoidCallback onGeneratePlanAdjustment;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final theme = Theme.of(context);

    return DashboardSurfaceCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            'Generate Recommendation',
            style: theme.textTheme.titleSmall?.copyWith(
              fontWeight: FontWeight.w700,
              color: DashboardColors.textPrimary,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.2),
          Text(
            'Create AI-assisted exercise or plan recommendations from patient context.',
            style: theme.textTheme.bodySmall?.copyWith(
              color: DashboardColors.textSecondary,
              height: 1.35,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.65),
          ElevatedButton.icon(
            onPressed: isGenerating ? null : onGenerateExercise,
            icon: _buttonIcon(
              context,
              isActive:
                  generatingType == AiRecommendationType.exerciseSuggestion,
            ),
            label: Text(
              generatingType == AiRecommendationType.exerciseSuggestion
                  ? l10n.commonProcessing
                  : 'Generate Exercise Suggestion',
            ),
            style: ElevatedButton.styleFrom(
              backgroundColor: DashboardColors.brandCyan,
              foregroundColor: Colors.white,
              padding: EdgeInsets.symmetric(
                vertical: context.dashSpacing * 0.65,
              ),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(14),
              ),
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.5),
          OutlinedButton.icon(
            onPressed: isGenerating ? null : onGeneratePlanAdjustment,
            icon: _buttonIcon(
              context,
              isActive: generatingType == AiRecommendationType.planAdjustment,
              outlined: true,
            ),
            label: Text(
              generatingType == AiRecommendationType.planAdjustment
                  ? l10n.commonProcessing
                  : 'Generate Plan Adjustment',
            ),
            style: OutlinedButton.styleFrom(
              foregroundColor: DashboardColors.brandCyan,
              side: const BorderSide(color: DashboardColors.brandCyan),
              padding: EdgeInsets.symmetric(
                vertical: context.dashSpacing * 0.65,
              ),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(14),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buttonIcon(
    BuildContext context, {
    required bool isActive,
    bool outlined = false,
  }) {
    if (!isActive) {
      return Icon(
        outlined ? Icons.auto_fix_high_outlined : Icons.fitness_center_outlined,
      );
    }

    return SizedBox(
      width: context.dashSpacing * 0.55,
      height: context.dashSpacing * 0.55,
      child: CircularProgressIndicator(
        strokeWidth: 2,
        color: outlined ? DashboardColors.brandCyan : Colors.white,
      ),
    );
  }
}

class AiRecommendationCard extends StatelessWidget {
  const AiRecommendationCard({
    super.key,
    required this.recommendation,
    required this.isUpdating,
    required this.onAccept,
    required this.onReject,
    this.isEditing = false,
    this.isSavingDraft = false,
    this.draftControllers,
    this.onEdit,
    this.onSave,
    this.onCancel,
  });

  final SpecialistAiRecommendationItem recommendation;
  final bool isUpdating;
  final VoidCallback onAccept;
  final VoidCallback onReject;
  final bool isEditing;
  final bool isSavingDraft;
  final Map<String, TextEditingController>? draftControllers;
  final VoidCallback? onEdit;
  final VoidCallback? onSave;
  final VoidCallback? onCancel;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final theme = Theme.of(context);
    final details = recommendation.details;
    final dateLabel = recommendation.generatedAt != null
        ? DateFormat('MMM d, yyyy').format(recommendation.generatedAt!)
        : '—';
    final busy = isUpdating || isSavingDraft;

    return Padding(
      padding: EdgeInsets.only(bottom: context.dashSpacing * 0.6),
      child: DashboardSurfaceCard(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Text(
                    recommendation.type.label,
                    style: theme.textTheme.bodyMedium?.copyWith(
                      fontWeight: FontWeight.w700,
                      color: DashboardColors.textPrimary,
                    ),
                  ),
                ),
                if (isEditing)
                  DashboardPriorityBadge(
                    label: l10n.specialistAiRecommendationEditingBanner,
                  )
                else
                  AiRecommendationStatusBadge(status: recommendation.status),
              ],
            ),
            SizedBox(height: context.dashSpacing * 0.25),
            Text(
              dateLabel,
              style: theme.textTheme.labelSmall?.copyWith(
                color: DashboardColors.textMuted,
              ),
            ),
            if (isEditing && draftControllers != null) ...[
              SizedBox(height: context.dashSpacing * 0.5),
              _EditableField(
                title: 'Summary',
                controller: draftControllers![
                    AiRecommendationDetailsDraftEdit.clinicalReasoningField]!,
                enabled: !isSavingDraft,
                maxLines: 5,
              ),
              SizedBox(height: context.dashSpacing * 0.45),
              _EditableField(
                title: 'Clinical Analysis',
                controller: draftControllers![
                    AiRecommendationDetailsDraftEdit.clinicalAnalysisField]!,
                enabled: !isSavingDraft,
              ),
              SizedBox(height: context.dashSpacing * 0.45),
              _EditableField(
                title: 'Suggested Exercises',
                controller: draftControllers![
                    AiRecommendationDetailsDraftEdit.suggestedExercisesField]!,
                enabled: !isSavingDraft,
                hint: l10n.specialistAiRecommendationEditExerciseHint,
              ),
              SizedBox(height: context.dashSpacing * 0.45),
              _EditableField(
                title: 'Plan Adjustment',
                controller: draftControllers![
                    AiRecommendationDetailsDraftEdit.planAdjustmentsField]!,
                enabled: !isSavingDraft,
                hint: l10n.specialistAiRecommendationEditListHint,
              ),
            ] else ...[
              if (_hasText(details.summary)) ...[
                SizedBox(height: context.dashSpacing * 0.5),
                const _SectionLabel(title: 'Summary'),
                _SectionBody(text: details.summary!),
              ],
              if (_hasText(details.clinicalReasoning) &&
                  details.clinicalReasoning != details.summary) ...[
                SizedBox(height: context.dashSpacing * 0.45),
                const _SectionLabel(title: 'Reason'),
                _SectionBody(text: details.clinicalReasoning!),
              ],
              if (_hasText(details.clinicalAnalysis) &&
                  details.clinicalAnalysis != details.summary &&
                  details.clinicalAnalysis != details.clinicalReasoning) ...[
                SizedBox(height: context.dashSpacing * 0.45),
                const _SectionLabel(title: 'Clinical Analysis'),
                _SectionBody(text: details.clinicalAnalysis!),
              ],
              if (details.suggestedExercises.isNotEmpty) ...[
                SizedBox(height: context.dashSpacing * 0.45),
                const _SectionLabel(title: 'Suggested Exercises'),
                ...details.suggestedExercises.map(
                  (exercise) => Padding(
                    padding: EdgeInsets.only(top: context.dashSpacing * 0.2),
                    child: Text(
                      '• ${exercise.displayLine}',
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: DashboardColors.textSecondary,
                        height: 1.35,
                      ),
                    ),
                  ),
                ),
              ],
              if (details.planAdjustments.isNotEmpty) ...[
                SizedBox(height: context.dashSpacing * 0.45),
                const _SectionLabel(title: 'Plan Adjustment'),
                ...details.planAdjustments.map(
                  (item) => Padding(
                    padding: EdgeInsets.only(top: context.dashSpacing * 0.2),
                    child: Text(
                      '• $item',
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: DashboardColors.textSecondary,
                        height: 1.35,
                      ),
                    ),
                  ),
                ),
              ],
            ],
            if (details.confidence != null) ...[
              SizedBox(height: context.dashSpacing * 0.45),
              Text(
                'Confidence: ${(details.confidence! * 100).toStringAsFixed(0)}%',
                style: theme.textTheme.labelSmall?.copyWith(
                  color: DashboardColors.textMuted,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
            if (_hasText(details.priorityLevel)) ...[
              SizedBox(height: context.dashSpacing * 0.25),
              DashboardPriorityBadge(
                label: _formatPriority(details.priorityLevel!),
              ),
            ],
            if (recommendation.status.isPending) ...[
              SizedBox(height: context.dashSpacing * 0.65),
              if (isEditing)
                Row(
                  children: [
                    Expanded(
                      child: ElevatedButton(
                        onPressed: busy ? null : onSave,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: DashboardColors.brandCyan,
                          foregroundColor: Colors.white,
                          padding: EdgeInsets.symmetric(
                            vertical: context.dashSpacing * 0.5,
                          ),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        child: Text(
                          isSavingDraft
                              ? l10n.specialistAiRecommendationSavingChanges
                              : l10n.specialistAiRecommendationSaveChanges,
                        ),
                      ),
                    ),
                    SizedBox(width: context.dashSpacing * 0.4),
                    Expanded(
                      child: OutlinedButton(
                        onPressed: isSavingDraft ? null : onCancel,
                        style: OutlinedButton.styleFrom(
                          foregroundColor: DashboardColors.textSecondary,
                          side: BorderSide(
                            color: DashboardColors.border,
                          ),
                          padding: EdgeInsets.symmetric(
                            vertical: context.dashSpacing * 0.5,
                          ),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        child: Text(l10n.specialistAiRecommendationCancelEditing),
                      ),
                    ),
                  ],
                )
              else
                Column(
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: OutlinedButton(
                            onPressed: busy ? null : onEdit,
                            style: OutlinedButton.styleFrom(
                              foregroundColor: DashboardColors.brandCyan,
                              side: const BorderSide(
                                color: DashboardColors.brandCyan,
                              ),
                              padding: EdgeInsets.symmetric(
                                vertical: context.dashSpacing * 0.5,
                              ),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                            child: Text(l10n.specialistAiRecommendationEdit),
                          ),
                        ),
                      ],
                    ),
                    SizedBox(height: context.dashSpacing * 0.4),
                    Row(
                      children: [
                        Expanded(
                          child: ElevatedButton(
                            onPressed: busy ? null : onAccept,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: DashboardColors.brandCyan,
                              foregroundColor: Colors.white,
                              padding: EdgeInsets.symmetric(
                                vertical: context.dashSpacing * 0.5,
                              ),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                            child: Text(
                              isUpdating
                                  ? l10n.specialistAiRecommendationAssigning
                                  : l10n.specialistAiRecommendationAssign,
                            ),
                          ),
                        ),
                        SizedBox(width: context.dashSpacing * 0.4),
                        Expanded(
                          child: OutlinedButton(
                            onPressed: busy ? null : onReject,
                            style: OutlinedButton.styleFrom(
                              foregroundColor: DashboardColors.highPriority,
                              side: const BorderSide(
                                color: DashboardColors.highPriority,
                              ),
                              padding: EdgeInsets.symmetric(
                                vertical: context.dashSpacing * 0.5,
                              ),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                            child: Text(l10n.commonReject),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
            ],
          ],
        ),
      ),
    );
  }

  bool _hasText(String? value) => value != null && value.trim().isNotEmpty;

  String _formatPriority(String value) {
    final text = value.trim();
    if (text.isEmpty) {
      return 'Priority';
    }
    return text[0].toUpperCase() + text.substring(1);
  }
}

class AiRecommendationStatusBadge extends StatelessWidget {
  const AiRecommendationStatusBadge({super.key, required this.status});

  final AiRecommendationStatus status;

  @override
  Widget build(BuildContext context) {
    final color = aiRecommendationStatusBadgeColor(status);
    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: context.dashSpacing * 0.45,
        vertical: context.dashSpacing * 0.15,
      ),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        status.label,
        style: Theme.of(context).textTheme.labelSmall?.copyWith(
          color: color,
          fontWeight: FontWeight.w700,
        ),
      ),
    );
  }
}

class _EditableField extends StatelessWidget {
  const _EditableField({
    required this.title,
    required this.controller,
    required this.enabled,
    this.maxLines = 4,
    this.hint,
  });

  final String title;
  final TextEditingController controller;
  final bool enabled;
  final int maxLines;
  final String? hint;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _SectionLabel(title: title),
        if (hint != null) ...[
          SizedBox(height: context.dashSpacing * 0.2),
          Text(
            hint!,
            style: theme.textTheme.bodySmall?.copyWith(
              color: DashboardColors.textMuted,
            ),
          ),
        ],
        SizedBox(height: context.dashSpacing * 0.35),
        TextField(
          controller: controller,
          enabled: enabled,
          maxLines: maxLines,
          decoration: const InputDecoration(
            border: OutlineInputBorder(),
            isDense: true,
          ),
        ),
      ],
    );
  }
}

class _SectionLabel extends StatelessWidget {
  const _SectionLabel({required this.title});

  final String title;

  @override
  Widget build(BuildContext context) {
    return Text(
      title,
      style: Theme.of(context).textTheme.labelLarge?.copyWith(
        fontWeight: FontWeight.w700,
        color: DashboardColors.textPrimary,
      ),
    );
  }
}

class _SectionBody extends StatelessWidget {
  const _SectionBody({required this.text});

  final String text;

  @override
  Widget build(BuildContext context) {
    return Text(
      text,
      style: Theme.of(context).textTheme.bodySmall?.copyWith(
        color: DashboardColors.textSecondary,
        height: 1.4,
      ),
    );
  }
}
