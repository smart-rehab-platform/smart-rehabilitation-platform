import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/services/api_client.dart';
import '../../auth/providers/auth_provider.dart';
import '../data/parent_feedback_repository.dart';
import '../models/parent_feedback_models.dart';

final parentFeedbackRepositoryProvider = Provider<ParentFeedbackRepository>((ref) {
  return ParentFeedbackRepository(ref.watch(dioProvider));
});

class ParentSpecialistRatingState {
  const ParentSpecialistRatingState({
    this.isLoading = false,
    this.isSubmitting = false,
    this.submitError,
    this.treatmentPlans = const [],
    this.completedPlan,
    this.hasFeedback,
    this.selectedRating = 0,
  });

  final bool isLoading;
  final bool isSubmitting;
  final String? submitError;
  final List<ParentTreatmentPlan> treatmentPlans;
  final ParentTreatmentPlan? completedPlan;
  final bool? hasFeedback;
  final int selectedRating;

  ParentTreatmentPlan? get latestPlan {
    if (treatmentPlans.isEmpty) {
      return null;
    }
    final sorted = [...treatmentPlans]..sort((a, b) {
        final aDate = a.updatedAt ?? a.endDate ?? a.startDate;
        final bDate = b.updatedAt ?? b.endDate ?? b.startDate;
        if (aDate == null && bDate == null) {
          return 0;
        }
        if (aDate == null) {
          return 1;
        }
        if (bDate == null) {
          return -1;
        }
        return bDate.compareTo(aDate);
      });
    return sorted.first;
  }

  bool get shouldShowFeedbackForm =>
      completedPlan != null && hasFeedback == false;

  bool get shouldShowThankYou =>
      completedPlan != null && hasFeedback == true;

  ParentSpecialistRatingState copyWith({
    bool? isLoading,
    bool? isSubmitting,
    Object? submitError = _sentinel,
    List<ParentTreatmentPlan>? treatmentPlans,
    Object? completedPlan = _sentinel,
    Object? hasFeedback = _sentinel,
    int? selectedRating,
  }) {
    return ParentSpecialistRatingState(
      isLoading: isLoading ?? this.isLoading,
      isSubmitting: isSubmitting ?? this.isSubmitting,
      submitError: identical(submitError, _sentinel)
          ? this.submitError
          : submitError as String?,
      treatmentPlans: treatmentPlans ?? this.treatmentPlans,
      completedPlan: identical(completedPlan, _sentinel)
          ? this.completedPlan
          : completedPlan as ParentTreatmentPlan?,
      hasFeedback: identical(hasFeedback, _sentinel)
          ? this.hasFeedback
          : hasFeedback as bool?,
      selectedRating: selectedRating ?? this.selectedRating,
    );
  }
}

const _sentinel = Object();

final parentSpecialistRatingProvider = StateNotifierProvider.family<
    ParentSpecialistRatingNotifier,
    ParentSpecialistRatingState,
    String>(
  (ref, childId) => ParentSpecialistRatingNotifier(
    ref,
    ref.watch(parentFeedbackRepositoryProvider),
    childId,
  ),
);

class ParentSpecialistRatingNotifier
    extends StateNotifier<ParentSpecialistRatingState> {
  ParentSpecialistRatingNotifier(this._ref, this._repository, this._childId)
      : super(const ParentSpecialistRatingState());

  final Ref _ref;
  final ParentFeedbackRepository _repository;
  final String _childId;

  void _ensureAuthToken() {
    final token = _ref.read(authProvider).token;
    if (token != null && token.isNotEmpty) {
      _ref.read(authRepositoryProvider).setAuthToken(token);
    }
  }

  ParentTreatmentPlan? _pickLatestCompletedPlan(
    List<ParentTreatmentPlan> plans,
  ) {
    final completed = plans.where((plan) => plan.isCompleted).toList();
    if (completed.isEmpty) {
      return null;
    }
    completed.sort((a, b) {
      final aDate = a.endDate ?? a.updatedAt ?? a.startDate;
      final bDate = b.endDate ?? b.updatedAt ?? b.startDate;
      if (aDate == null && bDate == null) {
        return 0;
      }
      if (aDate == null) {
        return 1;
      }
      if (bDate == null) {
        return -1;
      }
      return bDate.compareTo(aDate);
    });
    return completed.first;
  }

  Future<void> initialize() async {
    _ensureAuthToken();
    state = state.copyWith(
      isLoading: true,
      submitError: null,
      hasFeedback: null,
      completedPlan: null,
    );

    final plans = await _repository.fetchPatientTreatmentPlans(_childId);
    final completedPlan = _pickLatestCompletedPlan(plans);

    if (completedPlan == null) {
      state = state.copyWith(
        isLoading: false,
        treatmentPlans: plans,
        completedPlan: null,
        hasFeedback: null,
      );
      return;
    }

    final check = await _repository.checkFeedback(completedPlan.id);
    state = state.copyWith(
      isLoading: false,
      treatmentPlans: plans,
      completedPlan: completedPlan,
      hasFeedback: check?.hasFeedback,
    );
  }

  Future<void> refresh() => initialize();

  void setRating(int rating) {
    if (rating < 1 || rating > 5) {
      return;
    }
    state = state.copyWith(selectedRating: rating, submitError: null);
  }

  Future<String?> submit({required String comment}) async {
    final plan = state.completedPlan;
    if (plan == null || state.selectedRating < 1 || state.isSubmitting) {
      return null;
    }

    _ensureAuthToken();
    state = state.copyWith(isSubmitting: true, submitError: null);

    try {
      await _repository.submitFeedback(
        patientId: _childId,
        treatmentPlanId: plan.id,
        rating: state.selectedRating,
        comment: comment,
      );

      final check = await _repository.checkFeedback(plan.id);
      state = state.copyWith(
        isSubmitting: false,
        hasFeedback: check?.hasFeedback ?? true,
        submitError: null,
      );
      return null;
    } on ParentFeedbackApiException catch (error) {
      state = state.copyWith(
        isSubmitting: false,
        submitError: error.message,
      );
      return error.message;
    } catch (error) {
      final message = error.toString();
      state = state.copyWith(
        isSubmitting: false,
        submitError: message,
      );
      return message;
    }
  }
}
