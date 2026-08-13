import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/constants/dashboard_colors.dart';
import '../../../../l10n/app_localizations.dart';
import '../../providers/specialist_speech_analysis_provider.dart';
import '../../widgets/dashboard_layout.dart';
import '../../widgets/parent_dashboard_cards.dart';
import '../../widgets/specialist_page_scaffold.dart';
import 'specialist_speech_analysis_localization_utils.dart';
import 'specialist_speech_analysis_widgets.dart';

class SpecialistSpeechAnalysisScreen extends ConsumerStatefulWidget {
  const SpecialistSpeechAnalysisScreen({
    super.key,
    required this.patientId,
    this.submissionId,
  });

  final String patientId;
  final String? submissionId;

  @override
  ConsumerState<SpecialistSpeechAnalysisScreen> createState() =>
      _SpecialistSpeechAnalysisScreenState();
}

class _SpecialistSpeechAnalysisScreenState
    extends ConsumerState<SpecialistSpeechAnalysisScreen> {
  late final SpecialistSpeechAnalysisArgs _args;

  @override
  void initState() {
    super.initState();
    _args = (patientId: widget.patientId, submissionId: widget.submissionId);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(specialistSpeechAnalysisProvider(_args).notifier).initialize();
    });
  }

  SpecialistSpeechAnalysisArgs get _providerArgs => _args;

  Future<void> _analyze() async {
    final l10n = AppLocalizations.of(context)!;
    final notifier = ref.read(
      specialistSpeechAnalysisProvider(_providerArgs).notifier,
    );
    await notifier.analyzeSubmission();
    if (!mounted) return;

    final state = ref.read(specialistSpeechAnalysisProvider(_providerArgs));
    if (state.successMessage != null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            mapSpecialistSpeechAnalysisSuccessMessage(
              l10n,
              state.successMessage!,
            ),
          ),
        ),
      );
      notifier.clearMessages();
    }
  }

  Future<void> _retry() async {
    final state = ref.read(specialistSpeechAnalysisProvider(_providerArgs));
    if (state.isAnalyzing || state.isLoading || state.isRefreshing) {
      return;
    }

    final hasSubmission =
        (state.submissionId ?? widget.submissionId)?.isNotEmpty ?? false;
    if (hasSubmission && state.error != null) {
      await _analyze();
      return;
    }

    await ref
        .read(specialistSpeechAnalysisProvider(_providerArgs).notifier)
        .initialize();
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final state = ref.watch(specialistSpeechAnalysisProvider(_providerArgs));
    final notifier = ref.read(
      specialistSpeechAnalysisProvider(_providerArgs).notifier,
    );
    final theme = Theme.of(context);
    final selected = state.selectedAnalysis;
    final patientName = state.patientName ?? l10n.entityPatient;
    final hasSubmissionContext =
        (state.submissionId ?? widget.submissionId)?.isNotEmpty ?? false;
    final busy = state.isAnalyzing || state.isLoading || state.isRefreshing;

    Widget body;
    if (state.isLoading && state.analyses.isEmpty) {
      body = const Center(child: DashboardLoadingCard());
    } else if (state.error != null &&
        state.analyses.isEmpty &&
        selected == null) {
      body = Padding(
        padding: context.dashPadding,
        child: DashboardErrorCard(
          message: mapSpecialistSpeechAnalysisError(l10n, state.error!),
          onRetry: busy ? () {} : _retry,
        ),
      );
    } else {
      body = RefreshIndicator(
        onRefresh: notifier.refresh,
        color: DashboardColors.brandCyan,
        child: ListView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: context.dashPadding,
          children: [
            SpeechAnalysisHeaderCard(
              patientName: patientName,
              submissionId: state.submissionId ?? widget.submissionId,
              analyzedAt:
                  selected?.analyzedAt ?? state.latestAnalysis?.analyzedAt,
            ),
            if (hasSubmissionContext) ...[
              SizedBox(height: context.dashSpacing * 0.75),
              SpeechAnalysisAnalyzeCard(
                isAnalyzing: state.isAnalyzing,
                onAnalyze: _analyze,
              ),
            ],
            if (state.error != null) ...[
              SizedBox(height: context.dashSpacing * 0.75),
              DashboardErrorCard(
                message: mapSpecialistSpeechAnalysisError(l10n, state.error!),
                onRetry: busy ? () {} : _retry,
              ),
            ],
            if (selected == null && state.analyses.isEmpty) ...[
              SizedBox(height: context.dashSpacing * 0.75),
              DashboardEmptyCard(
                message: l10n.specialistSpeechAnalysisEmptyResults,
              ),
            ],
            if (selected != null) ...[
              SizedBox(height: context.dashSpacing * 0.75),
              Text(
                l10n.specialistSpeechAnalysisLatestSummary,
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w700,
                  color: DashboardColors.textPrimary,
                ),
              ),
              SizedBox(height: context.dashSpacing * 0.5),
              SpeechAnalysisScoreGrid(
                pronunciationScore: selected.pronunciationScore,
                fluencyScore: selected.fluencyScore,
                overallScore: selected.overallScore,
              ),
              SizedBox(height: context.dashSpacing * 0.75),
              SpeechAnalysisTranscriptCard(
                transcript: selected.transcript,
                language: selected.language,
                durationSeconds: selected.durationSeconds,
              ),
              if (state.comparison != null &&
                  state.comparison!.hasComparison) ...[
                SizedBox(height: context.dashSpacing * 0.75),
                SpeechAnalysisComparisonCard(comparison: state.comparison!),
              ],
              if (selected.aiFeedback.hasContent) ...[
                SizedBox(height: context.dashSpacing * 0.75),
                SpeechAnalysisFeedbackCard(feedback: selected.aiFeedback),
              ],
            ],
            if (state.progressItems.length >= 2) ...[
              SizedBox(height: context.dashSpacing * 0.75),
              SpeechAnalysisProgressCard(progressItems: state.progressItems),
            ],
            SizedBox(height: context.dashSpacing * 0.75),
            Text(
              l10n.specialistSpeechAnalysisHistory,
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w700,
                color: DashboardColors.textPrimary,
              ),
            ),
            SizedBox(height: context.dashSpacing * 0.5),
            if (state.analyses.isEmpty)
              DashboardEmptyCard(
                message: l10n.specialistSpeechAnalysisEmptyHistory,
              )
            else
              ...state.analyses.map(
                (analysis) => SpeechAnalysisHistoryTile(
                  analysis: analysis,
                  isSelected: analysis.id == selected?.id,
                  onTap: () => notifier.selectAnalysis(analysis.id),
                ),
              ),
            SizedBox(height: context.dashSpacing),
          ],
        ),
      );
    }

    return SpecialistPageScaffold(
      title: l10n.clinicalSpeechAnalysis,
      showBackButton: true,
      body: state.isRefreshing
          ? Stack(
              children: [
                body,
                const Positioned(
                  top: 8,
                  left: 0,
                  right: 0,
                  child: LinearProgressIndicator(
                    minHeight: 2,
                    color: DashboardColors.brandCyan,
                    backgroundColor: Colors.transparent,
                  ),
                ),
              ],
            )
          : body,
    );
  }
}
