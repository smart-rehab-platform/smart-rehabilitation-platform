import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/constants/dashboard_colors.dart';
import '../../../../l10n/app_localizations.dart';
import '../../models/parent_feedback_models.dart';
import '../../providers/parent_feedback_provider.dart';
import '../../widgets/dashboard_layout.dart';
import '../../widgets/dashboard_surface_card.dart';
import 'parent_extended_localization_utils.dart';
import 'parent_ui_helpers.dart';

class ParentTreatmentPlanSection extends StatelessWidget {
  const ParentTreatmentPlanSection({super.key, required this.plan});

  final ParentTreatmentPlan plan;

  Color _statusColor(String? status) {
    switch (status?.toLowerCase()) {
      case 'completed':
        return DashboardColors.success;
      case 'archived':
        return DashboardColors.textMuted;
      case 'active':
      default:
        return DashboardColors.brandCyan;
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final theme = Theme.of(context);
    final statusLabel = localizedTreatmentPlanStatus(l10n, plan.status);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(l10n.entityTreatmentPlan, style: theme.textTheme.titleSmall),
        SizedBox(height: context.dashSpacing * 0.5),
        DashboardSurfaceCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                plan.title,
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w700,
                ),
              ),
              SizedBox(height: context.dashSpacing * 0.35),
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 10,
                  vertical: 4,
                ),
                decoration: BoxDecoration(
                  color: _statusColor(plan.status).withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(999),
                ),
                child: Text(
                  statusLabel,
                  style: theme.textTheme.labelSmall?.copyWith(
                    color: _statusColor(plan.status),
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
              if (plan.specialistName != null &&
                  plan.specialistName!.isNotEmpty) ...[
                SizedBox(height: context.dashSpacing * 0.45),
                Text(
                  l10n.parentFeedbackSpecialistLabel(plan.specialistName!),
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: DashboardColors.textSecondary,
                  ),
                ),
              ],
              if (plan.startDate != null || plan.endDate != null) ...[
                SizedBox(height: context.dashSpacing * 0.25),
                Text(
                  [
                    if (plan.startDate != null)
                      l10n.parentFeedbackPlanStart(
                        parentFormatDate(plan.startDate),
                      ),
                    if (plan.endDate != null)
                      l10n.parentFeedbackPlanEnd(
                        parentFormatDate(plan.endDate),
                      ),
                  ].join(' • '),
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: DashboardColors.textSecondary,
                  ),
                ),
              ],
            ],
          ),
        ),
      ],
    );
  }
}

class ParentSpecialistFeedbackSection extends ConsumerStatefulWidget {
  const ParentSpecialistFeedbackSection({super.key, required this.childId});

  final String childId;

  @override
  ConsumerState<ParentSpecialistFeedbackSection> createState() =>
      _ParentSpecialistFeedbackSectionState();
}

class _ParentSpecialistFeedbackSectionState
    extends ConsumerState<ParentSpecialistFeedbackSection>
    with SingleTickerProviderStateMixin {
  final _commentController = TextEditingController();
  late final AnimationController _appearController;

  @override
  void initState() {
    super.initState();
    _appearController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 450),
    )..forward();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref
          .read(parentSpecialistRatingProvider(widget.childId).notifier)
          .initialize();
    });
  }

  @override
  void dispose() {
    _commentController.dispose();
    _appearController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final error = await ref
        .read(parentSpecialistRatingProvider(widget.childId).notifier)
        .submit(comment: _commentController.text);

    if (!mounted) {
      return;
    }

    if (error != null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error), duration: const Duration(seconds: 5)),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(parentSpecialistRatingProvider(widget.childId));

    if (state.isLoading) {
      return const SizedBox.shrink();
    }

    final latestPlan = state.latestPlan;
    final completedPlan = state.completedPlan;
    if (latestPlan == null && completedPlan == null) {
      return const SizedBox.shrink();
    }

    return FadeTransition(
      opacity: CurvedAnimation(
        parent: _appearController,
        curve: Curves.easeOutCubic,
      ),
      child: SlideTransition(
        position: Tween<Offset>(begin: const Offset(0, 0.04), end: Offset.zero)
            .animate(
              CurvedAnimation(
                parent: _appearController,
                curve: Curves.easeOutCubic,
              ),
            ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            if (latestPlan != null)
              ParentTreatmentPlanSection(plan: latestPlan),
            if (state.shouldShowFeedbackForm || state.shouldShowThankYou) ...[
              SizedBox(height: context.dashSpacing),
              AnimatedSwitcher(
                duration: const Duration(milliseconds: 350),
                switchInCurve: Curves.easeOutCubic,
                switchOutCurve: Curves.easeInCubic,
                child: state.shouldShowThankYou
                    ? _ThankYouCard(
                        key: const ValueKey('thank-you'),
                        rating: state.selectedRating,
                        specialistName: state.completedPlan?.specialistName,
                      )
                    : _FeedbackFormCard(
                        key: const ValueKey('feedback-form'),
                        rating: state.selectedRating,
                        isSubmitting: state.isSubmitting,
                        commentController: _commentController,
                        onRatingChanged: (rating) => ref
                            .read(
                              parentSpecialistRatingProvider(
                                widget.childId,
                              ).notifier,
                            )
                            .setRating(rating),
                        onSubmit: _submit,
                      ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _FeedbackFormCard extends StatelessWidget {
  const _FeedbackFormCard({
    super.key,
    required this.rating,
    required this.isSubmitting,
    required this.commentController,
    required this.onRatingChanged,
    required this.onSubmit,
  });

  final int rating;
  final bool isSubmitting;
  final TextEditingController commentController;
  final ValueChanged<int> onRatingChanged;
  final VoidCallback onSubmit;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final theme = Theme.of(context);

    return DashboardSurfaceCard(
      tint: DashboardColors.brandCyan,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('🎉', style: theme.textTheme.headlineSmall),
              SizedBox(width: context.dashSpacing * 0.45),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      l10n.parentFeedbackTreatmentCompleted,
                      style: theme.textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    SizedBox(height: context.dashSpacing * 0.25),
                    Text(
                      l10n.parentFeedbackPlanCompletedMessage,
                      style: theme.textTheme.bodyMedium?.copyWith(
                        color: DashboardColors.textSecondary,
                        height: 1.45,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          SizedBox(height: context.dashSpacing * 0.35),
          Text(
            l10n.parentFeedbackExperiencePrompt,
            style: theme.textTheme.bodyMedium?.copyWith(
              color: DashboardColors.textPrimary,
              height: 1.45,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.75),
          _StarRatingRow(rating: rating, onRatingChanged: onRatingChanged),
          SizedBox(height: context.dashSpacing * 0.75),
          Text(
            l10n.parentFeedbackCommentOptional,
            style: theme.textTheme.labelLarge?.copyWith(
              fontWeight: FontWeight.w600,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.35),
          TextField(
            controller: commentController,
            enabled: !isSubmitting,
            maxLines: 4,
            maxLength: 500,
            decoration: InputDecoration(
              hintText: l10n.parentFeedbackCommentHint,
              filled: true,
              fillColor: DashboardColors.background,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(14),
                borderSide: BorderSide(color: DashboardColors.border),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(14),
                borderSide: BorderSide(color: DashboardColors.border),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(14),
                borderSide: const BorderSide(color: DashboardColors.brandCyan),
              ),
              counterStyle: theme.textTheme.labelSmall?.copyWith(
                color: DashboardColors.textMuted,
              ),
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.65),
          AnimatedSwitcher(
            duration: const Duration(milliseconds: 200),
            child: isSubmitting
                ? SizedBox(
                    key: const ValueKey('loading'),
                    height: context.dashSpacing * 2.4,
                    child: Center(
                      child: SizedBox(
                        width: 22,
                        height: 22,
                        child: CircularProgressIndicator(
                          strokeWidth: 2.5,
                          color: DashboardColors.brandCyan,
                        ),
                      ),
                    ),
                  )
                : ElevatedButton(
                    key: const ValueKey('submit'),
                    onPressed: rating > 0 ? onSubmit : null,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: DashboardColors.brandCyan,
                      foregroundColor: Colors.white,
                      disabledBackgroundColor: DashboardColors.brandCyan
                          .withValues(alpha: 0.35),
                      disabledForegroundColor: Colors.white70,
                      padding: EdgeInsets.symmetric(
                        vertical: context.dashSpacing * 0.7,
                      ),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14),
                      ),
                      elevation: rating > 0 ? 2 : 0,
                    ),
                    child: Text(l10n.parentFeedbackSubmit),
                  ),
          ),
        ],
      ),
    );
  }
}

class _ThankYouCard extends StatelessWidget {
  const _ThankYouCard({super.key, required this.rating, this.specialistName});

  final int rating;
  final String? specialistName;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final theme = Theme.of(context);
    final specialistLabel =
        (specialistName != null && specialistName!.trim().isNotEmpty)
        ? specialistName!.trim()
        : l10n.parentFeedbackYourSpecialist;
    final showRating = rating >= 1 && rating <= 5;

    return DashboardSurfaceCard(
      tint: DashboardColors.brandCyan,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Container(
            width: context.dashSpacing * 2.4,
            height: context.dashSpacing * 2.4,
            decoration: BoxDecoration(
              color: DashboardColors.brandSoft,
              shape: BoxShape.circle,
            ),
            child: Icon(
              Icons.check_circle_rounded,
              color: DashboardColors.brandCyan,
              size: context.dashSpacing * 1.15,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.75),
          Text(
            l10n.parentFeedbackThankYou,
            textAlign: TextAlign.center,
            style: theme.textTheme.titleLarge?.copyWith(
              fontWeight: FontWeight.w800,
              color: DashboardColors.textPrimary,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.4),
          Text(
            l10n.parentFeedbackThankYouMessage,
            textAlign: TextAlign.center,
            style: theme.textTheme.bodyLarge?.copyWith(
              color: DashboardColors.textSecondary,
              height: 1.45,
            ),
          ),
          if (showRating) ...[
            SizedBox(height: context.dashSpacing * 0.9),
            _ReadOnlyStarRow(rating: rating),
            SizedBox(height: context.dashSpacing * 0.65),
            Text(
              l10n.parentFeedbackYouRated,
              textAlign: TextAlign.center,
              style: theme.textTheme.labelLarge?.copyWith(
                color: DashboardColors.textSecondary,
                fontWeight: FontWeight.w600,
                letterSpacing: 0.2,
              ),
            ),
            SizedBox(height: context.dashSpacing * 0.25),
            Text(
              specialistLabel,
              textAlign: TextAlign.center,
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w800,
                color: DashboardColors.brandCyan,
              ),
            ),
            SizedBox(height: context.dashSpacing * 0.2),
            Text(
              l10n.parentFeedbackRatingOutOfFive(rating),
              textAlign: TextAlign.center,
              style: theme.textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.w800,
                color: DashboardColors.textPrimary,
              ),
            ),
          ],
          SizedBox(height: context.dashSpacing * 0.85),
          Text(
            l10n.parentFeedbackImproveServices,
            textAlign: TextAlign.center,
            style: theme.textTheme.bodyMedium?.copyWith(
              color: DashboardColors.textSecondary,
              height: 1.55,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.85),
          Container(
            width: double.infinity,
            padding: EdgeInsets.symmetric(
              horizontal: context.dashSpacing * 0.65,
              vertical: context.dashSpacing * 0.55,
            ),
            decoration: BoxDecoration(
              color: DashboardColors.success.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: DashboardColors.success.withValues(alpha: 0.22),
              ),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.verified_rounded,
                  color: DashboardColors.success,
                  size: context.dashSpacing * 0.62,
                ),
                SizedBox(width: context.dashSpacing * 0.35),
                Flexible(
                  child: Text(
                    l10n.parentFeedbackRecordedSuccess,
                    textAlign: TextAlign.center,
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: DashboardColors.success,
                      fontWeight: FontWeight.w700,
                      height: 1.4,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _ReadOnlyStarRow extends StatelessWidget {
  const _ReadOnlyStarRow({required this.rating});

  final int rating;

  static const _goldStar = Color(0xFFFBBF24);

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: List.generate(5, (index) {
        final starValue = index + 1;
        final isFilled = starValue <= rating;

        return Padding(
          padding: EdgeInsets.symmetric(horizontal: context.dashSpacing * 0.12),
          child: Icon(
            isFilled ? Icons.star_rounded : Icons.star_outline_rounded,
            color: isFilled ? _goldStar : DashboardColors.border,
            size: context.dashSpacing * 1.15,
          ),
        );
      }),
    );
  }
}

class _StarRatingRow extends StatelessWidget {
  const _StarRatingRow({required this.rating, required this.onRatingChanged});

  final int rating;
  final ValueChanged<int> onRatingChanged;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: List.generate(5, (index) {
        final starValue = index + 1;
        final isFilled = starValue <= rating;

        return Padding(
          padding: EdgeInsets.symmetric(horizontal: context.dashSpacing * 0.15),
          child: _AnimatedStar(
            isFilled: isFilled,
            onTap: () => onRatingChanged(starValue),
          ),
        );
      }),
    );
  }
}

class _AnimatedStar extends StatefulWidget {
  const _AnimatedStar({required this.isFilled, required this.onTap});

  final bool isFilled;
  final VoidCallback onTap;

  @override
  State<_AnimatedStar> createState() => _AnimatedStarState();
}

class _AnimatedStarState extends State<_AnimatedStar>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final Animation<double> _scale;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 180),
    );
    _scale = Tween<double>(
      begin: 1,
      end: 1.18,
    ).animate(CurvedAnimation(parent: _controller, curve: Curves.easeOutBack));
  }

  @override
  void didUpdateWidget(covariant _AnimatedStar oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.isFilled && !oldWidget.isFilled) {
      _controller.forward(from: 0).then((_) => _controller.reverse());
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return ScaleTransition(
      scale: _scale,
      child: IconButton(
        onPressed: widget.onTap,
        icon: AnimatedSwitcher(
          duration: const Duration(milliseconds: 180),
          child: Icon(
            widget.isFilled ? Icons.star_rounded : Icons.star_outline_rounded,
            key: ValueKey(widget.isFilled),
            color: widget.isFilled
                ? const Color(0xFFFBBF24)
                : DashboardColors.textMuted,
            size: context.dashSpacing * 1.05,
          ),
        ),
      ),
    );
  }
}
