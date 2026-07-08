import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/services/api_client.dart';
import '../../auth/providers/auth_provider.dart';
import '../data/specialist_goals_repository.dart';
import '../models/specialist_goals_models.dart';
import 'specialist_patient_details_provider.dart';

final specialistGoalsRepositoryProvider = Provider<SpecialistGoalsRepository>((ref) {
  return SpecialistGoalsRepository(ref.watch(dioProvider));
});

class SpecialistGoalsState {
  const SpecialistGoalsState({
    this.isLoading = false,
    this.isSaving = false,
    this.errorMessage,
    this.validationMessage,
    this.bundle,
  });

  final bool isLoading;
  final bool isSaving;
  final String? errorMessage;
  final String? validationMessage;
  final SpecialistGoalsBundle? bundle;

  SpecialistGoalsState copyWith({
    bool? isLoading,
    bool? isSaving,
    Object? errorMessage = _sentinel,
    Object? validationMessage = _sentinel,
    SpecialistGoalsBundle? bundle,
  }) {
    return SpecialistGoalsState(
      isLoading: isLoading ?? this.isLoading,
      isSaving: isSaving ?? this.isSaving,
      errorMessage: identical(errorMessage, _sentinel)
          ? this.errorMessage
          : errorMessage as String?,
      validationMessage: identical(validationMessage, _sentinel)
          ? this.validationMessage
          : validationMessage as String?,
      bundle: bundle ?? this.bundle,
    );
  }
}

final specialistGoalsProvider = StateNotifierProvider.family<
    SpecialistGoalsNotifier,
    SpecialistGoalsState,
    String>((ref, patientId) {
  return SpecialistGoalsNotifier(
    ref,
    ref.watch(specialistGoalsRepositoryProvider),
    patientId,
  );
});

class SpecialistGoalsNotifier extends StateNotifier<SpecialistGoalsState> {
  SpecialistGoalsNotifier(this._ref, this._repository, this._patientId)
      : super(const SpecialistGoalsState());

  final Ref _ref;
  final SpecialistGoalsRepository _repository;
  final String _patientId;

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
      final bundle = await _repository.fetchGoalsBundle(_patientId);
      state = state.copyWith(isLoading: false, bundle: bundle);
    } catch (error) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Failed to load goals: $error',
      );
    }
  }

  Future<void> refresh() async {
    _ensureAuthToken();
    try {
      final bundle = await _repository.fetchGoalsBundle(_patientId);
      state = state.copyWith(bundle: bundle, errorMessage: null);
    } catch (error) {
      state = state.copyWith(errorMessage: 'Failed to refresh goals: $error');
    }
  }

  Future<void> _refreshAll() async {
    await refresh();
    await _ref
        .read(specialistPatientDetailsProvider(_patientId).notifier)
        .refresh();
  }

  Future<bool> createGoal(CreateGoalInput input) async {
    final planId = state.bundle?.planId;
    if (planId == null || planId.isEmpty) {
      state = state.copyWith(
        validationMessage: 'No active treatment plan found',
      );
      return false;
    }
    if (input.title.trim().isEmpty) {
      state = state.copyWith(validationMessage: 'Goal title is required');
      return false;
    }

    _ensureAuthToken();
    state = state.copyWith(
      isSaving: true,
      errorMessage: null,
      validationMessage: null,
    );

    try {
      await _repository.createGoal(planId, input);
      await _refreshAll();
      state = state.copyWith(isSaving: false);
      return true;
    } catch (error) {
      state = state.copyWith(
        isSaving: false,
        errorMessage: 'Failed to create goal: $error',
      );
      return false;
    }
  }

  Future<bool> updateGoal(String goalId, UpdateGoalInput input) async {
    if (input.title.trim().isEmpty) {
      state = state.copyWith(validationMessage: 'Goal title is required');
      return false;
    }

    _ensureAuthToken();
    state = state.copyWith(
      isSaving: true,
      errorMessage: null,
      validationMessage: null,
    );

    try {
      await _repository.updateGoal(goalId, input);
      await _refreshAll();
      state = state.copyWith(isSaving: false);
      return true;
    } catch (error) {
      state = state.copyWith(
        isSaving: false,
        errorMessage: 'Failed to update goal: $error',
      );
      return false;
    }
  }

  Future<bool> updateProgress(
    String goalId,
    CreateGoalProgressInput input,
  ) async {
    if (input.completionPercentage < 0 || input.completionPercentage > 100) {
      state = state.copyWith(
        validationMessage: 'Progress must be between 0 and 100',
      );
      return false;
    }

    _ensureAuthToken();
    state = state.copyWith(
      isSaving: true,
      errorMessage: null,
      validationMessage: null,
    );

    try {
      await _repository.createGoalProgress(goalId, input);
      await _refreshAll();
      state = state.copyWith(isSaving: false);
      return true;
    } catch (error) {
      state = state.copyWith(
        isSaving: false,
        errorMessage: 'Failed to update progress: $error',
      );
      return false;
    }
  }

  Future<bool> archiveGoal(String goalId) async {
    _ensureAuthToken();
    state = state.copyWith(
      isSaving: true,
      errorMessage: null,
      validationMessage: null,
    );

    try {
      await _repository.achieveGoal(goalId);
      await _refreshAll();
      state = state.copyWith(isSaving: false);
      return true;
    } catch (error) {
      state = state.copyWith(
        isSaving: false,
        errorMessage: 'Failed to archive goal: $error',
      );
      return false;
    }
  }

  void clearValidationMessage() {
    state = state.copyWith(validationMessage: null);
  }
}

const _sentinel = Object();
