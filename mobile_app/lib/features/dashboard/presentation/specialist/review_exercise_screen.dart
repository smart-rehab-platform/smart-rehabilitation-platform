import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/dashboard_colors.dart';
import '../../../../core/routes/app_routes.dart';
import '../../../../l10n/app_localizations.dart';
import '../../providers/specialist_exercise_review_provider.dart';
import '../../widgets/dashboard_layout.dart';
import '../../widgets/parent_dashboard_cards.dart';
import '../../widgets/specialist_page_scaffold.dart';
import 'review_exercise_widgets.dart';
import 'specialist_exercise_review_localization_utils.dart';

class SpecialistReviewExerciseScreen extends ConsumerStatefulWidget {
  const SpecialistReviewExerciseScreen({super.key, required this.submissionId});

  final String submissionId;

  @override
  ConsumerState<SpecialistReviewExerciseScreen> createState() =>
      _SpecialistReviewExerciseScreenState();
}

class _SpecialistReviewExerciseScreenState
    extends ConsumerState<SpecialistReviewExerciseScreen> {
  late final TextEditingController _feedbackController;

  @override
  void initState() {
    super.initState();
    _feedbackController = TextEditingController();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref
          .read(specialistExerciseReviewProvider(widget.submissionId).notifier)
          .initialize();
    });
  }

  @override
  void dispose() {
    _feedbackController.dispose();
    super.dispose();
  }

  Future<void> _submitReview() async {
    final l10n = AppLocalizations.of(context)!;
    final notifier = ref.read(
      specialistExerciseReviewProvider(widget.submissionId).notifier,
    );
    final success = await notifier.submitReview();
    if (!mounted) return;

    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(l10n.specialistReviewSubmittedSuccess)),
      );
      context.pop();
      return;
    }

    final error = ref
        .read(specialistExerciseReviewProvider(widget.submissionId))
        .errorMessage;
    if (error != null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(mapSpecialistExerciseReviewError(l10n, error))),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final state = ref.watch(
      specialistExerciseReviewProvider(widget.submissionId),
    );
    final bundle = state.bundle;
    final theme = Theme.of(context);
    final hasAudioMedia =
        bundle?.media.any(
          (media) => media.mediaType.toLowerCase() == 'audio',
        ) ??
        false;
    final canOpenSpeechAnalysis =
        bundle != null &&
        bundle.submission.patientId.isNotEmpty &&
        hasAudioMedia;

    ref.listen(specialistExerciseReviewProvider(widget.submissionId), (
      previous,
      next,
    ) {
      if (previous?.isLoading == true &&
          !next.isLoading &&
          next.bundle != null &&
          _feedbackController.text.isEmpty &&
          next.feedback.isNotEmpty) {
        _feedbackController.text = next.feedback;
      }
    });

    Widget body;
    if (state.isLoading) {
      body = const Center(child: DashboardLoadingCard());
    } else if (state.errorMessage != null && bundle == null) {
      body = Padding(
        padding: context.dashPadding,
        child: DashboardErrorCard(
          message: mapSpecialistExerciseReviewError(l10n, state.errorMessage!),
          onRetry: () => ref
              .read(
                specialistExerciseReviewProvider(widget.submissionId).notifier,
              )
              .initialize(),
        ),
      );
    } else if (bundle == null) {
      body = Padding(
        padding: context.dashPadding,
        child: DashboardEmptyCard(
          message: l10n.specialistReviewSubmissionNotFound,
        ),
      );
    } else {
      body = SingleChildScrollView(
        padding: context.dashPadding,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            ReviewExerciseHeader(submission: bundle.submission),
            SizedBox(height: context.dashSpacing),
            Text(
              l10n.specialistReviewUploadedMedia,
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w700,
                color: DashboardColors.textPrimary,
              ),
            ),
            SizedBox(height: context.dashSpacing * 0.5),
            if (bundle.media.isEmpty)
              DashboardEmptyCard(message: l10n.specialistReviewNoMedia)
            else
              ...bundle.media.map(
                (media) => Padding(
                  padding: EdgeInsets.only(bottom: context.dashSpacing * 0.6),
                  child: SubmissionMediaCard(media: media),
                ),
              ),
            SizedBox(height: context.dashSpacing * 0.5),
            Text(
              l10n.specialistReviewSection,
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w700,
                color: DashboardColors.textPrimary,
              ),
            ),
            SizedBox(height: context.dashSpacing * 0.5),
            Text(
              l10n.specialistReviewRating,
              style: theme.textTheme.bodySmall?.copyWith(
                color: DashboardColors.textSecondary,
                fontWeight: FontWeight.w600,
              ),
            ),
            ReviewStarRating(
              rating: state.starRating,
              onChanged: ref
                  .read(
                    specialistExerciseReviewProvider(
                      widget.submissionId,
                    ).notifier,
                  )
                  .setStarRating,
            ),
            SizedBox(height: context.dashSpacing * 0.35),
            Text(
              l10n.specialistReviewFeedback,
              style: theme.textTheme.bodySmall?.copyWith(
                color: DashboardColors.textSecondary,
                fontWeight: FontWeight.w600,
              ),
            ),
            SizedBox(height: context.dashSpacing * 0.25),
            TextField(
              controller: _feedbackController,
              maxLines: 4,
              onChanged: ref
                  .read(
                    specialistExerciseReviewProvider(
                      widget.submissionId,
                    ).notifier,
                  )
                  .setFeedback,
              decoration: InputDecoration(
                hintText: l10n.specialistReviewFeedbackHint,
                filled: true,
                fillColor: DashboardColors.surface,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14),
                  borderSide: const BorderSide(color: DashboardColors.border),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14),
                  borderSide: const BorderSide(color: DashboardColors.border),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14),
                  borderSide: const BorderSide(
                    color: DashboardColors.brandCyan,
                  ),
                ),
              ),
            ),
            SizedBox(height: context.dashSpacing * 0.65),
            Text(
              l10n.adminFieldStatus,
              style: theme.textTheme.bodySmall?.copyWith(
                color: DashboardColors.textSecondary,
                fontWeight: FontWeight.w600,
              ),
            ),
            SizedBox(height: context.dashSpacing * 0.35),
            ReviewDecisionSelector(
              decision: state.decision,
              onChanged: ref
                  .read(
                    specialistExerciseReviewProvider(
                      widget.submissionId,
                    ).notifier,
                  )
                  .setDecision,
            ),
            if (state.errorMessage != null) ...[
              SizedBox(height: context.dashSpacing * 0.65),
              DashboardErrorCard(
                message: mapSpecialistExerciseReviewError(
                  l10n,
                  state.errorMessage!,
                ),
                onRetry: _submitReview,
              ),
            ],
            if (canOpenSpeechAnalysis) ...[
              SizedBox(height: context.dashSpacing * 0.65),
              OutlinedButton.icon(
                onPressed: () => context.push(
                  AppRoutes.specialistPatientSpeechAnalysis(
                    bundle.submission.patientId,
                    submissionId: widget.submissionId,
                  ),
                ),
                icon: const Icon(Icons.record_voice_over_outlined),
                label: Text(l10n.specialistReviewViewSpeechAnalysis),
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
            SizedBox(height: context.dashSpacing),
            ElevatedButton(
              onPressed: state.isSubmitting ? null : _submitReview,
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
              child: Text(
                state.isSubmitting
                    ? l10n.specialistReviewSubmitting
                    : bundle.existingReview != null
                    ? l10n.specialistReviewUpdateReview
                    : l10n.specialistReviewSubmitReview,
              ),
            ),
            SizedBox(height: context.dashSpacing),
          ],
        ),
      );
    }

    return SpecialistPageScaffold(
      title: l10n.specialistReviewExerciseTitle,
      showBackButton: true,
      body: body,
    );
  }
}
