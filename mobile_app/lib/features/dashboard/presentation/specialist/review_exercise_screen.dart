import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/dashboard_colors.dart';
import '../../../../core/routes/app_routes.dart';
import '../../providers/specialist_exercise_review_provider.dart';
import '../../widgets/dashboard_layout.dart';
import '../../widgets/parent_dashboard_cards.dart';
import '../../widgets/specialist_page_scaffold.dart';
import 'review_exercise_widgets.dart';

class SpecialistReviewExerciseScreen extends ConsumerStatefulWidget {
  const SpecialistReviewExerciseScreen({
    super.key,
    required this.submissionId,
  });

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
    final notifier =
        ref.read(specialistExerciseReviewProvider(widget.submissionId).notifier);
    final success = await notifier.submitReview();
    if (!mounted) return;

    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Review submitted successfully')),
      );
      context.pop();
      return;
    }

    final error =
        ref.read(specialistExerciseReviewProvider(widget.submissionId)).errorMessage;
    if (error != null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error)),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(specialistExerciseReviewProvider(widget.submissionId));
    final bundle = state.bundle;
    final theme = Theme.of(context);
    final hasAudioMedia = bundle?.media.any(
          (media) => media.mediaType.toLowerCase() == 'audio',
        ) ??
        false;
    final canOpenSpeechAnalysis = bundle != null &&
        bundle.submission.patientId.isNotEmpty &&
        (hasAudioMedia || bundle.submission.id.isNotEmpty);

    ref.listen(specialistExerciseReviewProvider(widget.submissionId), (previous, next) {
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
          message: state.errorMessage!,
          onRetry: () => ref
              .read(specialistExerciseReviewProvider(widget.submissionId).notifier)
              .initialize(),
        ),
      );
    } else if (bundle == null) {
      body = Padding(
        padding: context.dashPadding,
        child: const DashboardEmptyCard(message: 'Submission not found.'),
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
              'Uploaded Media',
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w700,
                color: DashboardColors.textPrimary,
              ),
            ),
            SizedBox(height: context.dashSpacing * 0.5),
            if (bundle.media.isEmpty)
              const DashboardEmptyCard(message: 'No media uploaded for this submission.')
            else
              ...bundle.media.map(
                (media) => Padding(
                  padding: EdgeInsets.only(bottom: context.dashSpacing * 0.6),
                  child: SubmissionMediaCard(media: media),
                ),
              ),
            SizedBox(height: context.dashSpacing * 0.5),
            Text(
              'Review',
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w700,
                color: DashboardColors.textPrimary,
              ),
            ),
            SizedBox(height: context.dashSpacing * 0.5),
            Text(
              'Rating',
              style: theme.textTheme.bodySmall?.copyWith(
                color: DashboardColors.textSecondary,
                fontWeight: FontWeight.w600,
              ),
            ),
            ReviewStarRating(
              rating: state.starRating,
              onChanged: ref
                  .read(specialistExerciseReviewProvider(widget.submissionId).notifier)
                  .setStarRating,
            ),
            SizedBox(height: context.dashSpacing * 0.35),
            Text(
              'Feedback',
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
                  .read(specialistExerciseReviewProvider(widget.submissionId).notifier)
                  .setFeedback,
              decoration: InputDecoration(
                hintText: 'Write feedback for the parent and patient...',
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
                  borderSide: const BorderSide(color: DashboardColors.primary),
                ),
              ),
            ),
            SizedBox(height: context.dashSpacing * 0.65),
            Text(
              'Status',
              style: theme.textTheme.bodySmall?.copyWith(
                color: DashboardColors.textSecondary,
                fontWeight: FontWeight.w600,
              ),
            ),
            SizedBox(height: context.dashSpacing * 0.35),
            ReviewDecisionSelector(
              decision: state.decision,
              onChanged: ref
                  .read(specialistExerciseReviewProvider(widget.submissionId).notifier)
                  .setDecision,
            ),
            if (state.errorMessage != null) ...[
              SizedBox(height: context.dashSpacing * 0.65),
              DashboardErrorCard(
                message: state.errorMessage!,
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
                label: const Text('View Speech Analysis'),
                style: OutlinedButton.styleFrom(
                  foregroundColor: DashboardColors.primary,
                  side: const BorderSide(color: DashboardColors.primary),
                  padding:
                      EdgeInsets.symmetric(vertical: context.dashSpacing * 0.65),
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
                backgroundColor: DashboardColors.primary,
                foregroundColor: Colors.white,
                padding: EdgeInsets.symmetric(vertical: context.dashSpacing * 0.65),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14),
                ),
              ),
              child: Text(
                state.isSubmitting
                    ? 'Submitting...'
                    : bundle.existingReview != null
                        ? 'Update Review'
                        : 'Submit Review',
              ),
            ),
            SizedBox(height: context.dashSpacing),
          ],
        ),
      );
    }

    return SpecialistPageScaffold(
      title: 'Review Exercise',
      showBackButton: true,
      body: body,
    );
  }
}
