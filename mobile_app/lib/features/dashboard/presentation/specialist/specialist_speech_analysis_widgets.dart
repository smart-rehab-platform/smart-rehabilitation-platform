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
            'Automated Speech Scores',
            style: theme.textTheme.titleSmall?.copyWith(
              fontWeight: FontWeight.w700,
              color: DashboardColors.textPrimary,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.25),
          Text(
            'Legacy heuristic scores. Use alongside transcript, word accuracy, timing metrics, and specialist review.',
            style: theme.textTheme.labelSmall?.copyWith(
              color: DashboardColors.textMuted,
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

class SpeechAnalysisWordAnalysisCard extends StatelessWidget {
  const SpeechAnalysisWordAnalysisCard({
    super.key,
    required this.expectedSpeech,
    required this.wordAnalysis,
    this.detectedTranscript,
  });

  final SpeechExpectedSpeech expectedSpeech;
  final SpeechWordAnalysis wordAnalysis;
  final String? detectedTranscript;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final l10n = AppLocalizations.of(context)!;
    final expectedText = expectedSpeech.expectedText?.trim();
    final detectedText = detectedTranscript?.trim();

    return DashboardSurfaceCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            'Expected vs Spoken',
            style: theme.textTheme.titleSmall?.copyWith(
              fontWeight: FontWeight.w700,
              color: DashboardColors.textPrimary,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.5),
          _WordAnalysisLine(
            label: 'Expected',
            value: expectedText?.isNotEmpty == true ? expectedText! : '—',
          ),
          SizedBox(height: context.dashSpacing * 0.35),
          _WordAnalysisLine(
            label: 'Detected',
            value: detectedText?.isNotEmpty == true ? detectedText! : '—',
          ),
          if (expectedSpeech.targetWord?.trim().isNotEmpty ?? false) ...[
            SizedBox(height: context.dashSpacing * 0.35),
            _WordAnalysisLine(
              label: 'Target word',
              value: expectedSpeech.targetWord!.trim(),
            ),
          ],
          SizedBox(height: context.dashSpacing * 0.5),
          Text(
            'Word accuracy: ${formatSpeechScore(wordAnalysis.wordAccuracyPercentage)}',
            style: theme.textTheme.bodyMedium?.copyWith(
              fontWeight: FontWeight.w700,
              color: DashboardColors.textPrimary,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.35),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              _WordAnalysisChip(
                label: l10n.specialistSpeechAnalysisWordCorrect,
                value: wordAnalysis.correctWords,
              ),
              _WordAnalysisChip(
                label: l10n.specialistSpeechAnalysisAsrMismatches,
                value: wordAnalysis.substitutions,
              ),
              _WordAnalysisChip(
                label: l10n.specialistSpeechAnalysisWordOmissions,
                value: wordAnalysis.omissions,
              ),
              _WordAnalysisChip(
                label: l10n.specialistSpeechAnalysisWordInsertions,
                value: wordAnalysis.insertions,
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _WordAnalysisLine extends StatelessWidget {
  const _WordAnalysisLine({
    required this.label,
    required this.value,
  });

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return RichText(
      text: TextSpan(
        style: theme.textTheme.bodyMedium?.copyWith(
          color: DashboardColors.textPrimary,
          height: 1.4,
        ),
        children: [
          TextSpan(
            text: '$label: ',
            style: const TextStyle(fontWeight: FontWeight.w700),
          ),
          TextSpan(text: value),
        ],
      ),
    );
  }
}

class _WordAnalysisChip extends StatelessWidget {
  const _WordAnalysisChip({
    required this.label,
    required this.value,
  });

  final String label;
  final int? value;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: DashboardColors.brandSoft,
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        '$label: ${value ?? '—'}',
        style: theme.textTheme.labelMedium?.copyWith(
          color: DashboardColors.textSecondary,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}

class SpeechAnalysisTimingCard extends StatelessWidget {
  const SpeechAnalysisTimingCard({
    super.key,
    required this.fluencyMetrics,
    this.asrConfidence,
  });

  final SpeechFluencyMetrics fluencyMetrics;
  final SpeechAsrConfidence? asrConfidence;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return DashboardSurfaceCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            'Speech Timing & Fluency',
            style: theme.textTheme.titleSmall?.copyWith(
              fontWeight: FontWeight.w700,
              color: DashboardColors.textPrimary,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.35),
          Text(
            'Objective timing measurements from audio transcription timestamps.',
            style: theme.textTheme.labelSmall?.copyWith(
              color: DashboardColors.textMuted,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.5),
          _WordAnalysisLine(
            label: 'Speaking Rate',
            value: fluencyMetrics.wordsPerMinute != null
                ? '${fluencyMetrics.wordsPerMinute!.toStringAsFixed(1)} words/min'
                : '—',
          ),
          SizedBox(height: context.dashSpacing * 0.35),
          _WordAnalysisLine(
            label: 'Speech Duration',
            value: fluencyMetrics.speechDurationSeconds != null
                ? '${fluencyMetrics.speechDurationSeconds!.toStringAsFixed(1)} sec'
                : '—',
          ),
          SizedBox(height: context.dashSpacing * 0.35),
          _WordAnalysisLine(
            label: 'Pauses',
            value: fluencyMetrics.pauseCount?.toString() ?? '—',
          ),
          SizedBox(height: context.dashSpacing * 0.35),
          _WordAnalysisLine(
            label: 'Total Pause Time',
            value: fluencyMetrics.totalPauseDurationSeconds != null
                ? '${fluencyMetrics.totalPauseDurationSeconds!.toStringAsFixed(2)} sec'
                : '—',
          ),
          SizedBox(height: context.dashSpacing * 0.35),
          _WordAnalysisLine(
            label: 'Longest Pause',
            value: fluencyMetrics.longestPauseSeconds != null
                ? '${fluencyMetrics.longestPauseSeconds!.toStringAsFixed(2)} sec'
                : '—',
          ),
          SizedBox(height: context.dashSpacing * 0.35),
          _WordAnalysisLine(
            label: 'Pause Ratio',
            value: fluencyMetrics.pauseRatioPercentage != null
                ? '${fluencyMetrics.pauseRatioPercentage!.toStringAsFixed(1)}%'
                : '—',
          ),
          if (asrConfidence?.hasContent ?? false) ...[
            SizedBox(height: context.dashSpacing * 0.5),
            Text(
              'ASR Transcription Confidence',
              style: theme.textTheme.labelMedium?.copyWith(
                fontWeight: FontWeight.w700,
                color: DashboardColors.textSecondary,
              ),
            ),
            SizedBox(height: context.dashSpacing * 0.25),
            _WordAnalysisLine(
              label: 'Average word probability',
              value: asrConfidence!.averageWordProbability!
                  .toStringAsFixed(2),
            ),
          ],
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

class SpeechAnalysisPhonemeCard extends StatelessWidget {
  const SpeechAnalysisPhonemeCard({
    super.key,
    required this.phonemeAnalysis,
  });

  final SpeechPhonemeAnalysis phonemeAnalysis;

  String _formatSeconds(double? value) {
    if (value == null) {
      return '—';
    }
    return '${value.toStringAsFixed(2)}s';
  }

  String _formatDurationMs(double? seconds) {
    if (seconds == null) {
      return '—';
    }
    return '${(seconds * 1000).round()} ms';
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final targetPhone = phonemeAnalysis.targetPhone;
    final displayLabel = targetPhone?.display?.trim();
    final ipaLabel = targetPhone?.ipa?.trim();

    return DashboardSurfaceCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            'Target Sound Alignment',
            style: theme.textTheme.titleSmall?.copyWith(
              fontWeight: FontWeight.w700,
              color: DashboardColors.textPrimary,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.35),
          Text(
            'Target-sound timing is estimated using forced alignment and does not by itself indicate pronunciation correctness.',
            style: theme.textTheme.labelSmall?.copyWith(
              color: DashboardColors.textMuted,
              height: 1.45,
            ),
          ),
          if (displayLabel != null && displayLabel.isNotEmpty) ...[
            SizedBox(height: context.dashSpacing * 0.5),
            _WordAnalysisLine(
              label: 'Target Sound',
              value: ipaLabel != null && ipaLabel.isNotEmpty
                  ? '$displayLabel (/$ipaLabel/)'
                  : displayLabel,
            ),
          ],
          if (phonemeAnalysis.expectedText?.trim().isNotEmpty ?? false) ...[
            SizedBox(height: context.dashSpacing * 0.35),
            _WordAnalysisLine(
              label: 'Expected phrase',
              value: phonemeAnalysis.expectedText!.trim(),
            ),
          ],
          if ((displayLabel == null || displayLabel.isEmpty) &&
              phonemeAnalysis.targetOccurrences.isEmpty) ...[
            SizedBox(height: context.dashSpacing * 0.5),
            Text(
              'No target sound was configured on this exercise, so aligned target occurrences and acoustic measurements are not available.',
              style: theme.textTheme.bodySmall?.copyWith(
                color: DashboardColors.textSecondary,
                height: 1.45,
              ),
            ),
          ],
          if (phonemeAnalysis.targetOccurrences.isNotEmpty) ...[
            SizedBox(height: context.dashSpacing * 0.5),
            Text(
              'Aligned Occurrences',
              style: theme.textTheme.labelLarge?.copyWith(
                fontWeight: FontWeight.w600,
                color: DashboardColors.textPrimary,
              ),
            ),
            SizedBox(height: context.dashSpacing * 0.35),
            ...phonemeAnalysis.targetOccurrences.map(
              (occurrence) => Padding(
                padding: EdgeInsets.only(bottom: context.dashSpacing * 0.35),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Text(
                      occurrence.word?.trim().isNotEmpty ?? false
                          ? occurrence.word!.trim()
                          : '—',
                      style: theme.textTheme.bodyMedium?.copyWith(
                        fontWeight: FontWeight.w600,
                        color: DashboardColors.textPrimary,
                      ),
                    ),
                    SizedBox(height: context.dashSpacing * 0.15),
                    Text(
                      '${_formatSeconds(occurrence.start)} – ${_formatSeconds(occurrence.end)}',
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: DashboardColors.textSecondary,
                      ),
                    ),
                    Text(
                      'Duration ${_formatDurationMs(occurrence.durationSeconds)}',
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: DashboardColors.textMuted,
                      ),
                    ),
                    if (occurrence.acousticMeasurements != null &&
                        occurrence.acousticMeasurements!.hasAnyMeasurement) ...[
                      SizedBox(height: context.dashSpacing * 0.35),
                      Text(
                        'Acoustic Measurements',
                        style: theme.textTheme.labelMedium?.copyWith(
                          fontWeight: FontWeight.w600,
                          color: DashboardColors.textPrimary,
                        ),
                      ),
                      SizedBox(height: context.dashSpacing * 0.15),
                      if (occurrence.acousticMeasurements!.durationMs != null)
                        _WordAnalysisLine(
                          label: 'Duration',
                          value:
                              '${occurrence.acousticMeasurements!.durationMs!.round()} ms',
                        ),
                      if (occurrence.acousticMeasurements!.meanF0Hz != null)
                        _WordAnalysisLine(
                          label: 'Mean Pitch',
                          value:
                              '${occurrence.acousticMeasurements!.meanF0Hz!.toStringAsFixed(1)} Hz',
                        ),
                      if (occurrence.acousticMeasurements!.meanIntensityDb !=
                          null)
                        _WordAnalysisLine(
                          label: 'Mean Intensity',
                          value:
                              '${occurrence.acousticMeasurements!.meanIntensityDb!.toStringAsFixed(1)} dB',
                        ),
                      if (occurrence.acousticMeasurements!.meanF1Hz != null)
                        _WordAnalysisLine(
                          label: 'F1',
                          value:
                              '${occurrence.acousticMeasurements!.meanF1Hz!.toStringAsFixed(1)} Hz',
                        ),
                      if (occurrence.acousticMeasurements!.meanF2Hz != null)
                        _WordAnalysisLine(
                          label: 'F2',
                          value:
                              '${occurrence.acousticMeasurements!.meanF2Hz!.toStringAsFixed(1)} Hz',
                        ),
                    ],
                  ],
                ),
              ),
            ),
          ],
          SizedBox(height: context.dashSpacing * 0.5),
          Text(
            'Acoustic measurements describe the recorded signal and do not determine whether pronunciation is correct.',
            style: theme.textTheme.labelSmall?.copyWith(
              color: DashboardColors.textMuted,
              height: 1.45,
            ),
          ),
        ],
      ),
    );
  }
}

class SpeechAnalysisQualityCard extends StatelessWidget {
  const SpeechAnalysisQualityCard({
    super.key,
    required this.quality,
  });

  final SpeechAnalysisQuality quality;

  Color _statusColor() {
    return switch ((quality.status ?? '').toLowerCase()) {
      'good' => DashboardColors.success,
      'usable_with_caution' => DashboardColors.warning,
      'low_quality' => const Color(0xFFEF4444),
      _ => DashboardColors.textSecondary,
    };
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return DashboardSurfaceCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            'Analysis Quality',
            style: theme.textTheme.titleSmall?.copyWith(
              fontWeight: FontWeight.w700,
              color: DashboardColors.textPrimary,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.35),
          Text(
            'Reliability of this analysis result — not a clinical speech rating.',
            style: theme.textTheme.labelSmall?.copyWith(
              color: DashboardColors.textMuted,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.5),
          _WordAnalysisLine(
            label: 'Status',
            value: quality.statusLabel,
          ),
          if (quality.warnings.isNotEmpty) ...[
            SizedBox(height: context.dashSpacing * 0.5),
            ...quality.warnings.map(
              (warning) => Padding(
                padding: EdgeInsets.only(bottom: context.dashSpacing * 0.35),
                child: Text(
                  warning.message,
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: _statusColor(),
                    height: 1.45,
                  ),
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class SpeechAnalysisProgressInsightsCard extends StatelessWidget {
  const SpeechAnalysisProgressInsightsCard({
    super.key,
    required this.insights,
  });

  final SpeechProgressInsights insights;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final l10n = AppLocalizations.of(context)!;
    final trend = insights.wordAccuracyTrend;

    return DashboardSurfaceCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            'Speech Progress Insights',
            style: theme.textTheme.titleSmall?.copyWith(
              fontWeight: FontWeight.w700,
              color: DashboardColors.textPrimary,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.35),
          Text(
            'Deterministic historical measurements from prior speech analyses. Not a clinical diagnosis.',
            style: theme.textTheme.labelSmall?.copyWith(
              color: DashboardColors.textMuted,
            ),
          ),
          if (trend != null && trend.hasContent) ...[
            SizedBox(height: context.dashSpacing * 0.5),
            _WordAnalysisLine(
              label: 'Overall Trend',
              value: trend.trendLabel,
            ),
            SizedBox(height: context.dashSpacing * 0.35),
            _WordAnalysisLine(
              label: 'Word Accuracy',
              value:
                  '${formatSpeechScore(trend.firstAccuracy)} → ${formatSpeechScore(trend.latestAccuracy)}',
            ),
            if (trend.changePercentagePoints != null) ...[
              SizedBox(height: context.dashSpacing * 0.35),
              _WordAnalysisLine(
                label: 'Change',
                value:
                    '${formatSpeechScoreDelta(trend.changePercentagePoints)} percentage points',
              ),
            ],
          ],
          if (insights.repeatedWordDifficulties.isNotEmpty) ...[
            SizedBox(height: context.dashSpacing * 0.5),
            Text(
              'Repeated Difficulties',
              style: theme.textTheme.labelMedium?.copyWith(
                fontWeight: FontWeight.w700,
                color: DashboardColors.textSecondary,
              ),
            ),
            ...insights.repeatedWordDifficulties.map(
              (item) => Padding(
                padding: EdgeInsets.only(top: context.dashSpacing * 0.35),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Text(
                      item.expectedWord,
                      style: theme.textTheme.bodyMedium?.copyWith(
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    Text(
                      'Correct: ${item.timesCorrect ?? 0} / ${item.timesExpected ?? 0} • Accuracy: ${formatSpeechScore(item.accuracyPercentage)}',
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: DashboardColors.textSecondary,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
          if (insights.repeatedWordSubstitutions.isNotEmpty) ...[
            SizedBox(height: context.dashSpacing * 0.5),
            Text(
              l10n.specialistSpeechAnalysisRepeatedAsrMismatches,
              style: theme.textTheme.labelMedium?.copyWith(
                fontWeight: FontWeight.w700,
                color: DashboardColors.textSecondary,
              ),
            ),
            ...insights.repeatedWordSubstitutions.map(
              (item) => Padding(
                padding: EdgeInsets.only(top: context.dashSpacing * 0.35),
                child: Text(
                  '${item.expectedWord} → ${item.detectedWord} • ${l10n.specialistSpeechAnalysisAsrMismatchDetectedCount(item.count ?? 0)}',
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: DashboardColors.textSecondary,
                  ),
                ),
              ),
            ),
          ],
          if (insights.fluencyTrend?.hasContent ?? false) ...[
            SizedBox(height: context.dashSpacing * 0.5),
            Text(
              'Fluency Trends',
              style: theme.textTheme.labelMedium?.copyWith(
                fontWeight: FontWeight.w700,
                color: DashboardColors.textSecondary,
              ),
            ),
            if (insights.fluencyTrend?.wordsPerMinute != null) ...[
              SizedBox(height: context.dashSpacing * 0.35),
              _WordAnalysisLine(
                label: 'Speaking Rate',
                value:
                    '${insights.fluencyTrend!.wordsPerMinute!.first?.toStringAsFixed(1) ?? '—'} → ${insights.fluencyTrend!.wordsPerMinute!.latest?.toStringAsFixed(1) ?? '—'} words/min',
              ),
            ],
            if (insights.fluencyTrend?.pauseRatioPercentage != null) ...[
              SizedBox(height: context.dashSpacing * 0.35),
              _WordAnalysisLine(
                label: 'Pause Ratio',
                value:
                    '${insights.fluencyTrend!.pauseRatioPercentage!.first?.toStringAsFixed(1) ?? '—'}% → ${insights.fluencyTrend!.pauseRatioPercentage!.latest?.toStringAsFixed(1) ?? '—'}%',
              ),
            ],
          ],
        ],
      ),
    );
  }
}

class SpeechAnalysisAcousticProgressCard extends StatelessWidget {
  const SpeechAnalysisAcousticProgressCard({
    super.key,
    required this.progress,
  });

  final SpeechAcousticProgress progress;

  String _formatMetric(double? value, {String suffix = '', int decimals = 1}) {
    if (value == null) {
      return 'Not available';
    }
    return '${value.toStringAsFixed(decimals)}$suffix';
  }

  String _formatChange(double? value, {String suffix = '', int decimals = 1}) {
    if (value == null) {
      return 'Not available';
    }
    final sign = value > 0 ? '+' : '';
    return '$sign${value.toStringAsFixed(decimals)}$suffix';
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final target = progress.targetPhone;
    final display = target?.display?.trim();
    final ipa = target?.ipa?.trim();
    final duration = progress.durationTrend;
    final f0 = progress.f0Trend;
    final intensity = progress.intensityTrend;

    return DashboardSurfaceCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            'Target Sound Acoustic Progress',
            style: theme.textTheme.titleSmall?.copyWith(
              fontWeight: FontWeight.w700,
              color: DashboardColors.textPrimary,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.35),
          Text(
            'Acoustic trends describe measured signal characteristics across attempts and do not by themselves indicate pronunciation correctness.',
            style: theme.textTheme.labelSmall?.copyWith(
              color: DashboardColors.textMuted,
              height: 1.45,
            ),
          ),
          if (display != null && display.isNotEmpty) ...[
            SizedBox(height: context.dashSpacing * 0.5),
            _WordAnalysisLine(
              label: 'Target Sound',
              value: ipa != null && ipa.isNotEmpty ? '$display (/$ipa/)' : display,
            ),
          ],
          SizedBox(height: context.dashSpacing * 0.35),
          _WordAnalysisLine(
            label: 'Attempts',
            value:
                '${progress.usableAcousticAttempts ?? 0} comparable acoustic analyses',
          ),
          if (duration != null && duration.hasContent) ...[
            SizedBox(height: context.dashSpacing * 0.5),
            _WordAnalysisLine(
              label: 'Duration',
              value:
                  '${_formatMetric(duration.first, suffix: ' ms', decimals: 0)} → ${_formatMetric(duration.latest, suffix: ' ms', decimals: 0)}',
            ),
            _WordAnalysisLine(
              label: 'Change',
              value: _formatChange(duration.change, suffix: ' ms', decimals: 0),
            ),
          ],
          if (f0 != null && f0.hasContent) ...[
            SizedBox(height: context.dashSpacing * 0.35),
            _WordAnalysisLine(
              label: 'Mean Pitch',
              value:
                  '${_formatMetric(f0.first, suffix: ' Hz')} → ${_formatMetric(f0.latest, suffix: ' Hz')}',
            ),
            _WordAnalysisLine(
              label: 'Change',
              value: _formatChange(f0.change, suffix: ' Hz'),
            ),
          ],
          if (intensity != null && intensity.hasContent) ...[
            SizedBox(height: context.dashSpacing * 0.35),
            _WordAnalysisLine(
              label: 'Mean Intensity',
              value:
                  '${_formatMetric(intensity.first, suffix: ' dB')} → ${_formatMetric(intensity.latest, suffix: ' dB')}',
            ),
            _WordAnalysisLine(
              label: 'Change',
              value: _formatChange(intensity.change, suffix: ' dB'),
            ),
          ],
          if (progress.variability?.durationMsStddev != null) ...[
            SizedBox(height: context.dashSpacing * 0.35),
            _WordAnalysisLine(
              label: 'Duration variability',
              value: _formatMetric(
                progress.variability!.durationMsStddev,
                suffix: ' ms stddev',
              ),
            ),
          ],
          if (progress.historyPoints.any(
            (point) => point.qualityStatus == 'usable_with_caution',
          )) ...[
            SizedBox(height: context.dashSpacing * 0.5),
            Text(
              'Some attempts include usable-with-caution acoustic measurements.',
              style: theme.textTheme.labelSmall?.copyWith(
                color: DashboardColors.textMuted,
                height: 1.45,
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class SpeechAnalysisAcousticDurationChart extends StatelessWidget {
  const SpeechAnalysisAcousticDurationChart({
    super.key,
    required this.historyPoints,
  });

  final List<SpeechAcousticHistoryPoint> historyPoints;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final points = historyPoints
        .where((point) => point.durationMs != null)
        .toList();

    if (points.length < 2) {
      return const SizedBox.shrink();
    }

    final maxDuration = points
        .map((item) => item.durationMs ?? 0)
        .fold<double>(0, (prev, value) => value > prev ? value : prev);
    final scale = maxDuration <= 0 ? 100.0 : maxDuration;

    return DashboardSurfaceCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            'Target Sound Duration Over Time',
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
              children: points.map((item) {
                final heightFactor =
                    ((item.durationMs ?? 0) / scale).clamp(0.08, 1.0);
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

class SpeechAnalysisWordAccuracyChart extends StatelessWidget {
  const SpeechAnalysisWordAccuracyChart({
    super.key,
    required this.historyPoints,
  });

  final List<SpeechHistoryPoint> historyPoints;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final points = historyPoints
        .where((point) => point.wordAccuracyPercentage != null)
        .toList();

    if (points.length < 2) {
      return const SizedBox.shrink();
    }

    final maxScore = points
        .map((item) => item.wordAccuracyPercentage ?? 0)
        .fold<double>(0, (prev, value) => value > prev ? value : prev);
    final scale = maxScore <= 0 ? 100.0 : maxScore;

    return DashboardSurfaceCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            'Word Accuracy Over Time',
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
              children: points.map((item) {
                final heightFactor =
                    ((item.wordAccuracyPercentage ?? 0) / scale).clamp(
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
                                  color: DashboardColors.accent,
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
                    specialistSpeechAnalysisHistorySummary(l10n, analysis),
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
