import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/dashboard_colors.dart';
import '../../../../core/routes/app_routes.dart';
import '../../../../l10n/app_localizations.dart';
import '../../models/parent_dashboard_models.dart';
import '../../providers/parent_dashboard_provider.dart';
import '../../providers/parent_features_provider.dart';
import '../../utils/exercise_category_visuals.dart';
import '../../widgets/dashboard_layout.dart';
import '../../widgets/dashboard_surface_card.dart';
import '../../widgets/parent_dashboard_cards.dart';
import '../../widgets/parent_page_scaffold.dart';
import 'parent_extended_localization_utils.dart';
import 'parent_ui_helpers.dart';

class ParentFeedbackScreen extends ConsumerStatefulWidget {
  const ParentFeedbackScreen({super.key});

  @override
  ConsumerState<ParentFeedbackScreen> createState() =>
      _ParentFeedbackScreenState();
}

class _ParentFeedbackScreenState extends ConsumerState<ParentFeedbackScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(parentFeedbackProvider.notifier).initialize();
    });
  }

  void _openFeedbackDetail(ParentSpecialistFeedback feedback) {
    final reviewId = feedback.id;
    if (reviewId == null || reviewId.isEmpty) {
      return;
    }
    context.push(
      AppRoutes.parentFeedbackDetail(
        reviewId,
        patientId: feedback.patientId,
      ),
      extra: feedback,
    );
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final theme = Theme.of(context);
    final dashboard = ref.watch(parentDashboardProvider);
    final state = ref.watch(parentFeedbackProvider);
    final selectedChild = dashboard.selectedChild;

    ref.listen<String?>(
      parentDashboardProvider.select((value) => value.selectedPatientId),
      (previous, next) {
        if (previous != next) {
          ref.read(parentFeedbackProvider.notifier).initialize();
        }
      },
    );

    return ParentPageScaffold(
      title: l10n.parentFeedbackTitle,
      showBackButton: true,
      body: state.isLoading
          ? const Center(child: DashboardLoadingCard())
          : RefreshIndicator(
              color: DashboardColors.brandCyan,
              onRefresh: () =>
                  ref.read(parentFeedbackProvider.notifier).refresh(),
              child: ListView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: context.dashPadding,
                children: [
                  if (state.errorMessage != null) ...[
                    DashboardErrorCard(
                      message: mapParentFeedbackError(
                        l10n,
                        state.errorMessage!,
                      ),
                      onRetry: () => ref
                          .read(parentFeedbackProvider.notifier)
                          .refresh(),
                    ),
                    SizedBox(height: context.dashSpacing),
                  ],
                  if (selectedChild != null && state.errorMessage == null) ...[
                    Text(
                      l10n.parentFeedbackForChild(selectedChild.name),
                      style: theme.textTheme.bodyMedium?.copyWith(
                        color: DashboardColors.textSecondary,
                      ),
                    ),
                    SizedBox(height: context.dashSpacing * 0.75),
                  ],
                  if (state.reviews.isEmpty && state.errorMessage == null)
                    DashboardEmptyCard(message: l10n.parentFeedbackNoneYet)
                  else
                    ...state.reviews.map(
                      (feedback) => Padding(
                        padding: EdgeInsets.only(
                          bottom: context.dashSpacing * 0.6,
                        ),
                        child: ParentFeedbackReviewListCard(
                          feedback: feedback,
                          onTap: () => _openFeedbackDetail(feedback),
                        ),
                      ),
                    ),
                ],
              ),
            ),
    );
  }
}

class ParentFeedbackDetailScreen extends ConsumerStatefulWidget {
  const ParentFeedbackDetailScreen({
    super.key,
    required this.reviewId,
    this.patientId,
    this.initialFeedback,
  });

  final String reviewId;
  final String? patientId;
  final ParentSpecialistFeedback? initialFeedback;

  @override
  ConsumerState<ParentFeedbackDetailScreen> createState() =>
      _ParentFeedbackDetailScreenState();
}

class _ParentFeedbackDetailScreenState
    extends ConsumerState<ParentFeedbackDetailScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final existing = ref
          .read(parentFeedbackProvider.notifier)
          .findReview(widget.reviewId);
      if (existing == null &&
          widget.initialFeedback == null &&
          widget.patientId != null &&
          widget.patientId!.isNotEmpty) {
        ref.read(parentFeedbackProvider.notifier).initialize();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final theme = Theme.of(context);
    final feedbackState = ref.watch(parentFeedbackProvider);
    final feedback =
        widget.initialFeedback ??
        ref.read(parentFeedbackProvider.notifier).findReview(widget.reviewId);
    final starRating = formatParentFeedbackStarRating(feedback?.rating);
    final exerciseCategory = feedback?.category;

    if (feedback == null && feedbackState.isLoading) {
      return ParentPageScaffold(
        title: l10n.parentFeedbackTitle,
        showBackButton: true,
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    if (feedback == null) {
      return ParentPageScaffold(
        title: l10n.parentFeedbackTitle,
        showBackButton: true,
        body: Center(
          child: DashboardEmptyCard(message: l10n.parentFeedbackNoneYet),
        ),
      );
    }

    return ParentPageScaffold(
      title: feedback.exerciseTitle ?? l10n.parentFeedbackTitle,
      showBackButton: true,
      body: SingleChildScrollView(
        padding: context.dashPadding,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            DashboardSurfaceCard(
              child: Row(
                children: [
                  Container(
                    padding: EdgeInsets.all(context.dashSpacing * 0.45),
                    decoration: BoxDecoration(
                      color: exerciseCategoryIconBackground(exerciseCategory),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Icon(
                      exerciseCategoryIcon(exerciseCategory),
                      color: exerciseCategoryIconColor(exerciseCategory),
                      size: context.dashSpacing * 0.55,
                    ),
                  ),
                  SizedBox(width: context.dashSpacing * 0.65),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          l10n.entityExercise,
                          style: theme.textTheme.labelMedium?.copyWith(
                            color: DashboardColors.textSecondary,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        SizedBox(height: context.dashSpacing * 0.12),
                        Text(
                          feedback.exerciseTitle ?? l10n.entityExercise,
                          style: theme.textTheme.titleSmall?.copyWith(
                            fontWeight: FontWeight.w800,
                            color: DashboardColors.textPrimary,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            SizedBox(height: context.dashSpacing * 0.75),
            DashboardSurfaceCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: double.infinity,
                    padding: EdgeInsets.all(context.dashSpacing * 0.65),
                    decoration: BoxDecoration(
                      color: DashboardColors.brandSoft.withValues(alpha: 0.45),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: DashboardColors.border.withValues(alpha: 0.55),
                      ),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _FeedbackDetailMetaRow(
                          icon: Icons.person_outline_rounded,
                          label: l10n.parentFeedbackSpecialistLabel(
                            feedback.specialistName,
                          ),
                        ),
                        if (feedback.childName != null &&
                            feedback.childName!.trim().isNotEmpty) ...[
                          SizedBox(height: context.dashSpacing * 0.35),
                          _FeedbackDetailMetaRow(
                            icon: Icons.child_care_outlined,
                            label: l10n.parentFeedbackForChild(
                              feedback.childName!.trim(),
                            ),
                          ),
                        ],
                        if (feedback.reviewedAt != null) ...[
                          SizedBox(height: context.dashSpacing * 0.35),
                          _FeedbackDetailMetaRow(
                            icon: Icons.calendar_today_outlined,
                            label: l10n.parentFeedbackReviewDate(
                              parentFormatDate(feedback.reviewedAt),
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                  if (starRating != null) ...[
                    SizedBox(height: context.dashSpacing * 0.65),
                    Row(
                      children: [
                        Icon(
                          Icons.star_rounded,
                          size: context.dashSpacing * 0.5,
                          color: DashboardColors.warning,
                        ),
                        SizedBox(width: context.dashSpacing * 0.25),
                        Text(
                          l10n.parentFeedbackRating(starRating),
                          style: theme.textTheme.bodyMedium?.copyWith(
                            fontWeight: FontWeight.w700,
                            color: DashboardColors.textPrimary,
                          ),
                        ),
                      ],
                    ),
                  ],
                  if (feedback.message.trim().isNotEmpty) ...[
                    SizedBox(height: context.dashSpacing * 0.75),
                    Row(
                      children: [
                        Icon(
                          Icons.chat_bubble_outline_rounded,
                          size: context.dashSpacing * 0.48,
                          color: DashboardColors.brandCyan,
                        ),
                        SizedBox(width: context.dashSpacing * 0.35),
                        Text(
                          l10n.parentFeedbackSpecialistComments,
                          style: theme.textTheme.labelLarge?.copyWith(
                            fontWeight: FontWeight.w700,
                            color: DashboardColors.textPrimary,
                          ),
                        ),
                      ],
                    ),
                    SizedBox(height: context.dashSpacing * 0.45),
                    Text(
                      feedback.message,
                      style: theme.textTheme.bodyMedium?.copyWith(
                        color: DashboardColors.textSecondary,
                        height: 1.45,
                      ),
                    ),
                  ],
                  if (feedback.requiresRetry) ...[
                    SizedBox(height: context.dashSpacing * 0.65),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 6,
                      ),
                      decoration: BoxDecoration(
                        color: DashboardColors.warning.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(999),
                      ),
                      child: Text(
                        l10n.parentDashboardRetryRequired,
                        style: theme.textTheme.labelMedium?.copyWith(
                          color: DashboardColors.warning,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _FeedbackDetailMetaRow extends StatelessWidget {
  const _FeedbackDetailMetaRow({
    required this.icon,
    required this.label,
  });

  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(
          icon,
          size: context.dashSpacing * 0.45,
          color: DashboardColors.brandCyan,
        ),
        SizedBox(width: context.dashSpacing * 0.45),
        Expanded(
          child: Text(
            label,
            style: theme.textTheme.bodySmall?.copyWith(
              color: DashboardColors.textSecondary,
              fontWeight: FontWeight.w600,
              height: 1.35,
            ),
          ),
        ),
      ],
    );
  }
}

class ParentFeedbackReviewListCard extends StatelessWidget {
  const ParentFeedbackReviewListCard({
    super.key,
    required this.feedback,
    this.onTap,
  });

  final ParentSpecialistFeedback feedback;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final l10n = AppLocalizations.of(context)!;
    final starRating = formatParentFeedbackStarRating(feedback.rating);

    return DashboardSurfaceCard(
      onTap: onTap,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      feedback.exerciseTitle ?? l10n.entityExercise,
                      style: theme.textTheme.bodyMedium?.copyWith(
                        fontWeight: FontWeight.w700,
                        color: DashboardColors.textPrimary,
                      ),
                    ),
                    SizedBox(height: context.dashSpacing * 0.15),
                    Text(
                      l10n.parentFeedbackSpecialistLabel(feedback.specialistName),
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: DashboardColors.textSecondary,
                      ),
                    ),
                  ],
                ),
              ),
              if (onTap != null)
                Icon(
                  Icons.chevron_right_rounded,
                  color: DashboardColors.textMuted,
                  size: context.dashSpacing * 0.55,
                ),
            ],
          ),
          if (feedback.reviewedAt != null) ...[
            SizedBox(height: context.dashSpacing * 0.35),
            Text(
              parentFormatDate(feedback.reviewedAt),
              style: theme.textTheme.labelSmall?.copyWith(
                color: DashboardColors.textMuted,
              ),
            ),
          ],
          if (starRating != null) ...[
            SizedBox(height: context.dashSpacing * 0.35),
            Text(
              l10n.parentFeedbackRating(starRating),
              style: theme.textTheme.bodySmall?.copyWith(
                color: DashboardColors.textSecondary,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
          if (feedback.message.trim().isNotEmpty) ...[
            SizedBox(height: context.dashSpacing * 0.35),
            Text(
              feedback.message,
              maxLines: 3,
              overflow: TextOverflow.ellipsis,
              style: theme.textTheme.bodyMedium?.copyWith(
                color: DashboardColors.textPrimary,
                height: 1.4,
              ),
            ),
          ],
          if (feedback.requiresRetry) ...[
            SizedBox(height: context.dashSpacing * 0.45),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: DashboardColors.warning.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(999),
              ),
              child: Text(
                l10n.parentDashboardRetryRequired,
                style: theme.textTheme.labelSmall?.copyWith(
                  color: DashboardColors.warning,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}
