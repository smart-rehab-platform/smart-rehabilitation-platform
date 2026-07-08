import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/constants/dashboard_colors.dart';
import '../../models/specialist_ai_recommendations_models.dart';
import '../../providers/specialist_ai_recommendations_provider.dart';
import '../../widgets/dashboard_layout.dart';
import '../../widgets/parent_dashboard_cards.dart';
import '../../widgets/specialist_page_scaffold.dart';
import 'specialist_ai_recommendations_widgets.dart';

class SpecialistAiRecommendationsScreen extends ConsumerStatefulWidget {
  const SpecialistAiRecommendationsScreen({
    super.key,
    required this.patientId,
  });

  final String patientId;

  @override
  ConsumerState<SpecialistAiRecommendationsScreen> createState() =>
      _SpecialistAiRecommendationsScreenState();
}

class _SpecialistAiRecommendationsScreenState
    extends ConsumerState<SpecialistAiRecommendationsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref
          .read(specialistAiRecommendationsProvider(widget.patientId).notifier)
          .initialize();
    });
  }

  Future<void> _generate(AiRecommendationType type) async {
    final success = await ref
        .read(specialistAiRecommendationsProvider(widget.patientId).notifier)
        .generate(type);
    if (!mounted) return;

    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('AI recommendation generated')),
      );
    } else {
      _showErrorSnackBar();
    }
  }

  Future<void> _accept(String recommendationId) async {
    final success = await ref
        .read(specialistAiRecommendationsProvider(widget.patientId).notifier)
        .accept(recommendationId);
    if (!mounted) return;

    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Recommendation accepted')),
      );
    } else {
      _showErrorSnackBar();
    }
  }

  Future<void> _reject(String recommendationId) async {
    final success = await ref
        .read(specialistAiRecommendationsProvider(widget.patientId).notifier)
        .reject(recommendationId);
    if (!mounted) return;

    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Recommendation rejected')),
      );
    } else {
      _showErrorSnackBar();
    }
  }

  void _showErrorSnackBar() {
    final message =
        ref.read(specialistAiRecommendationsProvider(widget.patientId)).errorMessage;
    if (message != null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(message)),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(specialistAiRecommendationsProvider(widget.patientId));
    final notifier =
        ref.read(specialistAiRecommendationsProvider(widget.patientId).notifier);
    final bundle = state.bundle;
    final theme = Theme.of(context);

    Widget body;
    if (state.isLoading && bundle == null) {
      body = const Center(child: DashboardLoadingCard());
    } else if (state.errorMessage != null && bundle == null) {
      body = Padding(
        padding: context.dashPadding,
        child: DashboardErrorCard(
          message: state.errorMessage!,
          onRetry: notifier.refresh,
        ),
      );
    } else if (bundle == null) {
      body = Padding(
        padding: context.dashPadding,
        child: const DashboardEmptyCard(message: 'Patient not found.'),
      );
    } else {
      body = RefreshIndicator(
        onRefresh: notifier.refresh,
        color: DashboardColors.primary,
        child: ListView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: context.dashPadding,
          children: [
            AiRecommendationsHeaderCard(patientName: bundle.patientName),
            SizedBox(height: context.dashSpacing * 0.75),
            AiRecommendationsGenerateCard(
              isGenerating: state.isGenerating,
              generatingType: state.generatingType,
              onGenerateExercise: () =>
                  _generate(AiRecommendationType.exerciseSuggestion),
              onGeneratePlanAdjustment: () =>
                  _generate(AiRecommendationType.planAdjustment),
            ),
            if (state.errorMessage != null) ...[
              SizedBox(height: context.dashSpacing * 0.75),
              DashboardErrorCard(
                message: state.errorMessage!,
                onRetry: notifier.refresh,
              ),
            ],
            SizedBox(height: context.dashSpacing * 0.75),
            Text(
              'Recommendations',
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w700,
                color: DashboardColors.textPrimary,
              ),
            ),
            SizedBox(height: context.dashSpacing * 0.5),
            if (bundle.recommendations.isEmpty)
              const DashboardEmptyCard(
                message: 'Generate your first AI recommendation',
              )
            else
              ...bundle.recommendations.map(
                (recommendation) => AiRecommendationCard(
                  recommendation: recommendation,
                  isUpdating:
                      state.updatingRecommendationId == recommendation.id,
                  onAccept: () => _accept(recommendation.id),
                  onReject: () => _reject(recommendation.id),
                ),
              ),
            SizedBox(height: context.dashSpacing),
          ],
        ),
      );
    }

    return SpecialistPageScaffold(
      title: 'AI Recommendations',
      showBackButton: true,
      body: body,
    );
  }
}
