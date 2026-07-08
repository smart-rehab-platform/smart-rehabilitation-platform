import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/constants/dashboard_colors.dart';
import '../../providers/specialist_speech_analysis_provider.dart';
import '../../widgets/dashboard_layout.dart';
import '../../widgets/parent_dashboard_cards.dart';
import '../../widgets/specialist_page_scaffold.dart';
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
    await ref.read(specialistSpeechAnalysisProvider(_providerArgs).notifier).analyzeSubmission();
    if (!mounted) return;

    final state = ref.read(specialistSpeechAnalysisProvider(_providerArgs));
    if (state.successMessage != null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(state.successMessage!)),
      );
      ref.read(specialistSpeechAnalysisProvider(_providerArgs).notifier).clearMessages();
    } else if (state.error != null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(state.error!)),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(specialistSpeechAnalysisProvider(_providerArgs));
    final notifier =
        ref.read(specialistSpeechAnalysisProvider(_providerArgs).notifier);
    final theme = Theme.of(context);
    final selected = state.selectedAnalysis;
    final patientName = state.patientName ?? 'Patient';
    final hasSubmissionContext =
        (state.submissionId ?? widget.submissionId)?.isNotEmpty ?? false;

    Widget body;
    if (state.isLoading && state.analyses.isEmpty) {
      body = const Center(child: DashboardLoadingCard());
    } else if (state.error != null && state.analyses.isEmpty && selected == null) {
      body = Padding(
        padding: context.dashPadding,
        child: DashboardErrorCard(
          message: state.error!,
          onRetry: notifier.initialize,
        ),
      );
    } else {
      body = RefreshIndicator(
        onRefresh: notifier.refresh,
        color: DashboardColors.primary,
        child: ListView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: context.dashPadding,
          children: [
            SpeechAnalysisHeaderCard(
              patientName: patientName,
              submissionId: state.submissionId ?? widget.submissionId,
              analyzedAt: selected?.analyzedAt ?? state.latestAnalysis?.analyzedAt,
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
                message: state.error!,
                onRetry: notifier.refresh,
              ),
            ],
            if (selected == null && state.analyses.isEmpty) ...[
              SizedBox(height: context.dashSpacing * 0.75),
              const DashboardEmptyCard(
                message:
                    'No speech analysis results yet. Run analysis on an audio submission to get started.',
              ),
            ],
            if (selected != null) ...[
              SizedBox(height: context.dashSpacing * 0.75),
              Text(
                'Latest Analysis Summary',
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
              if (state.comparison != null && state.comparison!.hasComparison) ...[
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
              'Analysis History',
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w700,
                color: DashboardColors.textPrimary,
              ),
            ),
            SizedBox(height: context.dashSpacing * 0.5),
            if (state.analyses.isEmpty)
              const DashboardEmptyCard(
                message: 'No previous speech analyses recorded.',
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
      title: 'Speech Analysis',
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
                    color: DashboardColors.primary,
                    backgroundColor: Colors.transparent,
                  ),
                ),
              ],
            )
          : body,
    );
  }
}
