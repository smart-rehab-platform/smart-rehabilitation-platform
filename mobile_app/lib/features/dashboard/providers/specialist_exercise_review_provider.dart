import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/services/api_client.dart';
import '../../auth/providers/auth_provider.dart';
import '../data/specialist_exercise_review_repository.dart';
import '../models/specialist_exercise_review_models.dart';
import 'specialist_dashboard_provider.dart';
import 'specialist_features_provider.dart';
import 'specialist_patient_details_provider.dart';

final specialistExerciseReviewRepositoryProvider =
    Provider<SpecialistExerciseReviewRepository>((ref) {
  return SpecialistExerciseReviewRepository(ref.watch(dioProvider));
});

class SpecialistExerciseReviewState {
  const SpecialistExerciseReviewState({
    this.isLoading = false,
    this.isSubmitting = false,
    this.errorMessage,
    this.bundle,
    this.starRating = 3,
    this.feedback = '',
    this.decision = ReviewDecision.approved,
  });

  final bool isLoading;
  final bool isSubmitting;
  final String? errorMessage;
  final ExerciseReviewBundle? bundle;
  final int starRating;
  final String feedback;
  final ReviewDecision decision;

  SpecialistExerciseReviewState copyWith({
    bool? isLoading,
    bool? isSubmitting,
    Object? errorMessage = _sentinel,
    ExerciseReviewBundle? bundle,
    int? starRating,
    String? feedback,
    ReviewDecision? decision,
  }) {
    return SpecialistExerciseReviewState(
      isLoading: isLoading ?? this.isLoading,
      isSubmitting: isSubmitting ?? this.isSubmitting,
      errorMessage: identical(errorMessage, _sentinel)
          ? this.errorMessage
          : errorMessage as String?,
      bundle: bundle ?? this.bundle,
      starRating: starRating ?? this.starRating,
      feedback: feedback ?? this.feedback,
      decision: decision ?? this.decision,
    );
  }
}

final specialistExerciseReviewProvider = StateNotifierProvider.family<
    SpecialistExerciseReviewNotifier,
    SpecialistExerciseReviewState,
    String>((ref, submissionId) {
  return SpecialistExerciseReviewNotifier(
    ref,
    ref.watch(specialistExerciseReviewRepositoryProvider),
    submissionId,
  );
});

class SpecialistExerciseReviewNotifier
    extends StateNotifier<SpecialistExerciseReviewState> {
  SpecialistExerciseReviewNotifier(this._ref, this._repository, this._submissionId)
      : super(const SpecialistExerciseReviewState());

  final Ref _ref;
  final SpecialistExerciseReviewRepository _repository;
  final String _submissionId;

  void _ensureAuthToken() {
    final token = _ref.read(authProvider).token;
    if (token != null && token.isNotEmpty) {
      _ref.read(authRepositoryProvider).setAuthToken(token);
    }
  }

  Future<void> initialize() async {
    _ensureAuthToken();
    state = state.copyWith(isLoading: true, errorMessage: null);

    try {
      final bundle = await _repository.fetchReviewBundle(_submissionId);
      final existing = bundle.existingReview;

      state = state.copyWith(
        isLoading: false,
        bundle: bundle,
        starRating: existing?.starRating ?? 3,
        feedback: existing?.feedback ?? '',
        decision: existing?.decision ?? ReviewDecision.approved,
      );
    } catch (error) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Failed to load submission: $error',
      );
    }
  }

  void setStarRating(int rating) {
    state = state.copyWith(starRating: rating.clamp(1, 5));
  }

  void setFeedback(String value) {
    state = state.copyWith(feedback: value);
  }

  void setDecision(ReviewDecision decision) {
    state = state.copyWith(decision: decision);
  }

  Future<bool> submitReview() async {
    final userId = _ref.read(authProvider).user?.id;
    if (userId == null || userId.isEmpty) {
      state = state.copyWith(errorMessage: 'Please sign in to submit a review.');
      return false;
    }

    _ensureAuthToken();
    state = state.copyWith(isSubmitting: true, errorMessage: null);

    try {
      final input = SubmitExerciseReviewInput(
        specialistId: userId,
        starRating: state.starRating,
        feedback: state.feedback.trim(),
        decision: state.decision,
      );

      final existing = state.bundle?.existingReview;
      if (existing != null && existing.id.isNotEmpty) {
        await _repository.updateReview(existing.id, input);
      } else {
        await _repository.createReview(_submissionId, input);
      }

      await _refreshRelatedLists();

      state = state.copyWith(isSubmitting: false);
      return true;
    } catch (error) {
      state = state.copyWith(
        isSubmitting: false,
        errorMessage: 'Failed to submit review: $error',
      );
      return false;
    }
  }

  Future<void> _refreshRelatedLists() async {
    await Future.wait([
      _ref.read(specialistPendingReviewsListProvider.notifier).refresh(),
      _ref.read(specialistDashboardProvider.notifier).refresh(),
    ]);

    final patientId = state.bundle?.submission.patientId;
    if (patientId != null && patientId.isNotEmpty) {
      await _ref
          .read(specialistPatientDetailsProvider(patientId).notifier)
          .refresh();
    }
  }
}

const _sentinel = Object();
