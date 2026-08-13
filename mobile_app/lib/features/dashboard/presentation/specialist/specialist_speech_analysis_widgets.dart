import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../../../core/constants/dashboard_colors.dart';
import '../../../../l10n/app_localizations.dart';
import '../../models/specialist_speech_analysis_models.dart';
import '../../widgets/dashboard_layout.dart';
import '../../widgets/dashboard_profile_avatar.dart';
import '../../widgets/dashboard_surface_card.dart';
import 'specialist_speech_analysis_localization_utils.dart';

class SpeechAnalysisHeaderCard extends StatelessWidget {
  const SpeechAnalysisHeaderCard({
    super.key,
    required this.patientName,
    this.submissionId,
    this.analyzedAt,
  });

  final String patientName;
  final String? submissionId;
  final DateTime? analyzedAt;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final theme = Theme.of(context);

    return DashboardSurfaceCard(
      child: Column(
        children: [
          DashboardProfileAvatar(
            initials: dashboardInitials(patientName, fallback: 'P'),
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
            l10n.specialistSpeechAnalysisResultsSubtitle,
            style: theme.textTheme.bodySmall?.copyWith(
              color: DashboardColors.textSecondary,
            ),
            textAlign: TextAlign.center,
          ),
          if (analyzedAt != null) ...[
            SizedBox(height: context.dashSpacing * 0.35),
            Text(
              l10n.specialistSpeechAnalysisLatestLine(
                DateFormat('MMM d, yyyy • h:mm a').format(analyzedAt!),
              ),
              style: theme.textTheme.labelSmall?.copyWith(
                color: DashboardColors.textMuted,
              ),
              textAlign: TextAlign.center,
            ),
          ],
          if (submissionId != null && submissionId!.isNotEmpty) ...[
            SizedBox(height: context.dashSpacing * 0.25),
            Text(
              l10n.specialistSpeechAnalysisSubmissionLine(
                submissionId!.length > 8
                    ? submissionId!.substring(0, 8)
                    : submissionId!,
              ),
              style: theme.textTheme.labelSmall?.copyWith(
                color: DashboardColors.textMuted,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ],
      ),
    );
  }
}

class SpeechAnalysisScoreGrid extends StatelessWidget {
  const SpeechAnalysisScoreGrid({
    super.key,
    required this.pronunciationScore,
    required this.fluencyScore,
    required this.overallScore,
  });

  final double? pronunciationScore;
  final double? fluencyScore;
  final double? overallScore;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final theme = Theme.of(context);

    return DashboardSurfaceCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            l10n.specialistSpeechAnalysisScores,
            style: theme.textTheme.titleSmall?.copyWith(
              fontWeight: FontWeight.w700,
              color: DashboardColors.textPrimary,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.65),
          Row(
            children: [
              Expanded(
                child: _ScoreTile(
                  label: l10n.parentDashboardPronunciation,
                  value: formatSpeechScore(pronunciationScore),
                  color: const Color(0xFF3B82F6),
                  background: DashboardColors.blueSoft,
                ),
              ),
              SizedBox(width: context.dashSpacing * 0.5),
              Expanded(
                child: _ScoreTile(
                  label: l10n.parentDashboardFluency,
                  value: formatSpeechScore(fluencyScore),
                  color: DashboardColors.accent,
                  background: DashboardColors.tealSoft,
                ),
              ),
              SizedBox(width: context.dashSpacing * 0.5),
              Expanded(
                child: _ScoreTile(
                  label: l10n.parentDashboardOverall,
                  value: formatSpeechScore(overallScore),
                  color: DashboardColors.brandCyan,
                  background: DashboardColors.brandSoft,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _ScoreTile extends StatelessWidget {
  const _ScoreTile({
    required this.label,
    required this.value,
    required this.color,
    required this.background,
  });

  final String label;
  final String value;
  final Color color;
  final Color background;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      padding: EdgeInsets.all(context.dashSpacing * 0.55),
      decoration: BoxDecoration(
        color: background,
        borderRadius: BorderRadius.circular(14),
      ),
      child: Column(
        children: [
          Text(
            value,
            style: theme.textTheme.titleLarge?.copyWith(
              fontWeight: FontWeight.w800,
              color: color,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.15),
          Text(
            label,
            textAlign: TextAlign.center,
            style: theme.textTheme.labelSmall?.copyWith(
              color: DashboardColors.textSecondary,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}

class SpeechAnalysisTranscriptCard extends StatelessWidget {
  const SpeechAnalysisTranscriptCard({
    super.key,
    required this.transcript,
    this.language,
    this.durationSeconds,
  });

  final String? transcript;
  final String? language;
  final double? durationSeconds;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final theme = Theme.of(context);
    final text = transcript?.trim();
    final metaParts = <String>[];
    if (language != null && language!.trim().isNotEmpty) {
      metaParts.add(
        l10n.specialistSpeechAnalysisLanguageLine(
          localizedSpeechAnalysisLanguage(l10n, language!.trim()),
        ),
      );
    }
    if (durationSeconds != null) {
      metaParts.add(
        l10n.specialistSpeechAnalysisDurationLine(
          durationSeconds!.toStringAsFixed(1),
        ),
      );
    }

    return DashboardSurfaceCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            l10n.specialistSpeechAnalysisTranscript,
            style: theme.textTheme.titleSmall?.copyWith(
              fontWeight: FontWeight.w700,
              color: DashboardColors.textPrimary,
            ),
          ),
          if (metaParts.isNotEmpty) ...[
            SizedBox(height: context.dashSpacing * 0.25),
            Text(
              metaParts.join(' • '),
              style: theme.textTheme.labelSmall?.copyWith(
                color: DashboardColors.textMuted,
              ),
            ),
          ],
          SizedBox(height: context.dashSpacing * 0.5),
          Text(
            text != null && text.isNotEmpty
                ? text
                : l10n.specialistSpeechAnalysisNoTranscript,
            style: theme.textTheme.bodyMedium?.copyWith(
              color: text != null && text.isNotEmpty
                  ? DashboardColors.textPrimary
                  : DashboardColors.textSecondary,
              height: 1.45,
            ),
          ),
        ],
      ),
    );
  }
}

class SpeechAnalysisComparisonCard extends StatelessWidget {
  const SpeechAnalysisComparisonCard({super.key, required this.comparison});

  final SpeechAnalysisComparison comparison;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final theme = Theme.of(context);

    return DashboardSurfaceCard(
      tint: DashboardColors.accent,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  l10n.specialistSpeechAnalysisComparisonTitle,
                  style: theme.textTheme.titleSmall?.copyWith(
                    fontWeight: FontWeight.w700,
                    color: DashboardColors.textPrimary,
                  ),
                ),
              ),
              SpeechTrendBadge(trend: comparison.trend),
            ],
          ),
          if (comparison.previousAnalyzedAt != null) ...[
            SizedBox(height: context.dashSpacing * 0.25),
            Text(
              l10n.specialistSpeechAnalysisPreviousLine(
                DateFormat(
                  'MMM d, yyyy',
                ).format(comparison.previousAnalyzedAt!),
              ),
              style: theme.textTheme.labelSmall?.copyWith(
                color: DashboardColors.textMuted,
              ),
            ),
          ],
          SizedBox(height: context.dashSpacing * 0.65),
          _ComparisonRow(
            label: l10n.parentDashboardPronunciation,
            delta: comparison.pronunciationChange,
          ),
          SizedBox(height: context.dashSpacing * 0.35),
          _ComparisonRow(
            label: l10n.parentDashboardFluency,
            delta: comparison.fluencyChange,
          ),
          SizedBox(height: context.dashSpacing * 0.35),
          _ComparisonRow(
            label: l10n.parentDashboardOverall,
            delta: comparison.overallScoreChange,
            emphasized: true,
          ),
        ],
      ),
    );
  }
}

class _ComparisonRow extends StatelessWidget {
  const _ComparisonRow({
    required this.label,
    required this.delta,
    this.emphasized = false,
  });

  final String label;
  final double? delta;
  final bool emphasized;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final deltaText = formatSpeechScoreDelta(delta);
    final color = switch (delta) {
      null => DashboardColors.textMuted,
      < 0 => DashboardColors.highPriority,
      > 0 => DashboardColors.success,
      _ => DashboardColors.textSecondary,
    };

    return Row(
      children: [
        Expanded(
          child: Text(
            label,
            style: theme.textTheme.bodyMedium?.copyWith(
              fontWeight: emphasized ? FontWeight.w700 : FontWeight.w500,
              color: DashboardColors.textSecondary,
            ),
          ),
        ),
        Text(
          deltaText,
          style: theme.textTheme.bodyMedium?.copyWith(
            fontWeight: FontWeight.w700,
            color: color,
          ),
        ),
      ],
    );
  }
}

class SpeechTrendBadge extends StatelessWidget {
  const SpeechTrendBadge({super.key, this.trend});

  final String? trend;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final normalized = (trend ?? '').toLowerCase();
    final color = switch (normalized) {
      'improvement' => DashboardColors.success,
      'regression' => DashboardColors.highPriority,
      'baseline' => DashboardColors.brandCyan,
      _ => DashboardColors.textMuted,
    };

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        localizedSpeechAnalysisTrend(l10n, trend),
        style: Theme.of(context).textTheme.labelSmall?.copyWith(
          color: color,
          fontWeight: FontWeight.w700,
        ),
      ),
    );
  }
}

class SpeechAnalysisFeedbackCard extends StatelessWidget {
  const SpeechAnalysisFeedbackCard({super.key, required this.feedback});

  final SpeechAnalysisAiFeedback feedback;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final theme = Theme.of(context);

    return DashboardSurfaceCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            l10n.specialistSpeechAnalysisAiFeedbackTitle,
            style: theme.textTheme.titleSmall?.copyWith(
              fontWeight: FontWeight.w700,
              color: DashboardColors.textPrimary,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.65),
          if (feedback.improvementSummary != null &&
              feedback.improvementSummary!.trim().isNotEmpty)
            _FeedbackSection(
              title: l10n.specialistSpeechAnalysisImprovementSummary,
              body: feedback.improvementSummary!,
            ),
          if (feedback.clinicalNote != null &&
              feedback.clinicalNote!.trim().isNotEmpty)
            _FeedbackSection(
              title: l10n.specialistSpeechAnalysisClinicalNote,
              body: feedback.clinicalNote!,
            ),
          if (feedback.recommendedAction != null &&
              feedback.recommendedAction!.trim().isNotEmpty)
            _FeedbackSection(
              title: l10n.specialistSpeechAnalysisRecommendedAction,
              body: feedback.recommendedAction!,
            ),
          if (feedback.recommendations.isNotEmpty)
            _FeedbackSection(
              title: l10n.specialistSpeechAnalysisRecommendations,
              body: feedback.recommendations
                  .map((item) => '• $item')
                  .join('\n'),
            ),
          if (feedback.treatmentAnalysis != null &&
              feedback.treatmentAnalysis!.trim().isNotEmpty)
            _FeedbackSection(
              title: l10n.specialistSpeechAnalysisTreatmentAnalysis,
              body: feedback.treatmentAnalysis!,
            ),
          if (feedback.decisionSupportReason != null &&
              feedback.decisionSupportReason!.trim().isNotEmpty)
            _FeedbackSection(
              title: l10n.specialistSpeechAnalysisDecisionSupport,
              body: [
                if (feedback.suggestedAction != null &&
                    feedback.suggestedAction!.trim().isNotEmpty)
                  l10n.specialistSpeechAnalysisSuggestedLine(
                    feedback.suggestedAction!.trim(),
                  ),
                feedback.decisionSupportReason!,
              ].join('\n'),
            ),
        ],
      ),
    );
  }
}

class _FeedbackSection extends StatelessWidget {
  const _FeedbackSection({required this.title, required this.body});

  final String title;
  final String body;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Padding(
      padding: EdgeInsets.only(bottom: context.dashSpacing * 0.65),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            title,
            style: theme.textTheme.labelLarge?.copyWith(
              fontWeight: FontWeight.w700,
              color: DashboardColors.brandCyan,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.2),
          Text(
            body,
            style: theme.textTheme.bodySmall?.copyWith(
              color: DashboardColors.textSecondary,
              height: 1.45,
            ),
          ),
        ],
      ),
    );
  }
}

class SpeechAnalysisProgressCard extends StatelessWidget {
  const SpeechAnalysisProgressCard({super.key, required this.progressItems});

  final List<SpecialistSpeechProgressPoint> progressItems;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final theme = Theme.of(context);
    if (progressItems.length < 2) {
      return const SizedBox.shrink();
    }

    final maxScore = progressItems
        .map((item) => item.overallScore ?? 0)
        .fold<double>(0, (prev, value) => value > prev ? value : prev);
    final scale = maxScore <= 0 ? 1.0 : maxScore;

    return DashboardSurfaceCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            l10n.specialistSpeechAnalysisOverallScoreTrend,
            style: theme.textTheme.titleSmall?.copyWith(
              fontWeight: FontWeight.w700,
              color: DashboardColors.textPrimary,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.65),
          SizedBox(
            height: context.dashSpacing * 4.5,
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: progressItems.map((item) {
                final heightFactor = ((item.overallScore ?? 0) / scale).clamp(
                  0.08,
                  1.0,
                );
                final label = item.analyzedAt != null
                    ? DateFormat('M/d').format(item.analyzedAt!)
                    : '—';

                return Expanded(
                  child: Padding(
                    padding: EdgeInsets.symmetric(
                      horizontal: context.dashSpacing * 0.12,
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        Expanded(
                          child: Align(
                            alignment: Alignment.bottomCenter,
                            child: FractionallySizedBox(
                              heightFactor: heightFactor,
                              widthFactor: 1,
                              child: Container(
                                decoration: BoxDecoration(
                                  color: DashboardColors.brandCyan,
                                  borderRadius: BorderRadius.circular(8),
                                ),
                              ),
                            ),
                          ),
                        ),
                        SizedBox(height: context.dashSpacing * 0.35),
                        Text(
                          label,
                          style: theme.textTheme.labelSmall?.copyWith(
                            color: DashboardColors.textMuted,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              }).toList(),
            ),
          ),
        ],
      ),
    );
  }
}

class SpeechAnalysisHistoryTile extends StatelessWidget {
  const SpeechAnalysisHistoryTile({
    super.key,
    required this.analysis,
    required this.isSelected,
    required this.onTap,
  });

  final SpecialistSpeechAnalysisItem analysis;
  final bool isSelected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final theme = Theme.of(context);
    final dateLabel = analysis.analyzedAt != null
        ? DateFormat('MMM d, yyyy • h:mm a').format(analysis.analyzedAt!)
        : l10n.specialistSpeechAnalysisUnknownDate;

    return Padding(
      padding: EdgeInsets.only(bottom: context.dashSpacing * 0.6),
      child: DashboardSurfaceCard(
        onTap: onTap,
        child: Row(
          children: [
            Container(
              padding: EdgeInsets.all(context.dashSpacing * 0.45),
              decoration: BoxDecoration(
                color: isSelected
                    ? DashboardColors.brandCyan.withValues(alpha: 0.15)
                    : DashboardColors.brandSoft,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(
                Icons.graphic_eq_rounded,
                color: isSelected
                    ? DashboardColors.brandCyan
                    : DashboardColors.textMuted,
                size: context.dashSpacing * 0.55,
              ),
            ),
            SizedBox(width: context.dashSpacing * 0.65),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    dateLabel,
                    style: theme.textTheme.bodyMedium?.copyWith(
                      fontWeight: FontWeight.w700,
                      color: DashboardColors.textPrimary,
                    ),
                  ),
                  SizedBox(height: context.dashSpacing * 0.15),
                  Text(
                    l10n.specialistSpeechAnalysisHistorySummary(
                      formatSpeechScore(analysis.overallScore),
                      formatSpeechScore(analysis.pronunciationScore),
                    ),
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: DashboardColors.textSecondary,
                    ),
                  ),
                ],
              ),
            ),
            if (isSelected)
              Icon(
                Icons.check_circle_rounded,
                color: DashboardColors.brandCyan,
                size: context.dashSpacing * 0.55,
              )
            else
              Icon(
                Icons.chevron_right_rounded,
                color: DashboardColors.textMuted,
              ),
          ],
        ),
      ),
    );
  }
}

class SpeechAnalysisAnalyzeCard extends StatelessWidget {
  const SpeechAnalysisAnalyzeCard({
    super.key,
    required this.isAnalyzing,
    required this.onAnalyze,
  });

  final bool isAnalyzing;
  final VoidCallback onAnalyze;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final theme = Theme.of(context);

    return DashboardSurfaceCard(
      tint: DashboardColors.brandCyan,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            l10n.specialistSpeechAnalysisRunTitle,
            style: theme.textTheme.titleSmall?.copyWith(
              fontWeight: FontWeight.w700,
              color: DashboardColors.textPrimary,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.25),
          Text(
            l10n.specialistSpeechAnalysisRunSubtitle,
            style: theme.textTheme.bodySmall?.copyWith(
              color: DashboardColors.textSecondary,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.65),
          ElevatedButton.icon(
            onPressed: isAnalyzing ? null : onAnalyze,
            icon: isAnalyzing
                ? SizedBox(
                    width: 18,
                    height: 18,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: Colors.white.withValues(alpha: 0.9),
                    ),
                  )
                : const Icon(Icons.record_voice_over_outlined),
            label: Text(
              isAnalyzing
                  ? l10n.specialistSpeechAnalysisAnalyzing
                  : l10n.specialistSpeechAnalysisAnalyzeSubmission,
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
        ],
      ),
    );
  }
}
