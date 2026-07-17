import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../auth/providers/auth_provider.dart';
import '../data/specialist_features_repository.dart';
import '../models/specialist_feature_models.dart';
import 'specialist_features_provider.dart';
import 'specialist_patient_details_provider.dart';

final specialistExerciseDetailProvider = StateNotifierProvider.family<
    SpecialistExerciseDetailNotifier,
    SpecialistExerciseDetailState,
    String>((ref, exerciseId) {
  return SpecialistExerciseDetailNotifier(
    ref,
    ref.watch(specialistFeaturesRepositoryProvider),
    exerciseId,
  );
});

class SpecialistExerciseDetailState {
  const SpecialistExerciseDetailState({
    this.isLoading = false,
    this.errorMessage,
    this.exercise,
  });

  final bool isLoading;
  final String? errorMessage;
  final SpecialistExerciseItem? exercise;

  SpecialistExerciseDetailState copyWith({
    bool? isLoading,
    Object? errorMessage = _sentinel,
    Object? exercise = _sentinel,
  }) {
    return SpecialistExerciseDetailState(
      isLoading: isLoading ?? this.isLoading,
      errorMessage: identical(errorMessage, _sentinel)
          ? this.errorMessage
          : errorMessage as String?,
      exercise: identical(exercise, _sentinel)
          ? this.exercise
          : exercise as SpecialistExerciseItem?,
    );
  }
}

class SpecialistExerciseDetailNotifier
    extends StateNotifier<SpecialistExerciseDetailState> {
  SpecialistExerciseDetailNotifier(this._ref, this._repository, this._exerciseId)
      : super(const SpecialistExerciseDetailState());

  final Ref _ref;
  final SpecialistFeaturesRepository _repository;
  final String _exerciseId;

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
      final exercise = await _repository.fetchExerciseById(_exerciseId);
      if (exercise == null) {
        state = state.copyWith(
          isLoading: false,
          exercise: null,
          errorMessage: 'Exercise not found.',
        );
        return;
      }
      state = state.copyWith(isLoading: false, exercise: exercise);
    } catch (error) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Failed to load exercise. Please try again.',
      );
    }
  }

  Future<void> refresh() => initialize();
}

typedef AssignExerciseArgs = ({String patientId, String planId});

final specialistAssignExerciseProvider = StateNotifierProvider.family<
    SpecialistAssignExerciseNotifier,
    SpecialistAssignExerciseState,
    AssignExerciseArgs>((ref, args) {
  return SpecialistAssignExerciseNotifier(
    ref,
    ref.watch(specialistFeaturesRepositoryProvider),
    args,
  );
});

class SpecialistAssignExerciseState {
  const SpecialistAssignExerciseState({
    this.isSubmitting = false,
    this.errorMessage,
  });

  final bool isSubmitting;
  final String? errorMessage;

  SpecialistAssignExerciseState copyWith({
    bool? isSubmitting,
    Object? errorMessage = _sentinel,
  }) {
    return SpecialistAssignExerciseState(
      isSubmitting: isSubmitting ?? this.isSubmitting,
      errorMessage: identical(errorMessage, _sentinel)
          ? this.errorMessage
          : errorMessage as String?,
    );
  }
}

class SpecialistAssignExerciseNotifier
    extends StateNotifier<SpecialistAssignExerciseState> {
  SpecialistAssignExerciseNotifier(this._ref, this._repository, this._args)
      : super(const SpecialistAssignExerciseState());

  final Ref _ref;
  final SpecialistFeaturesRepository _repository;
  final AssignExerciseArgs _args;

  void _ensureAuthToken() {
    final token = _ref.read(authProvider).token;
    if (token != null && token.isNotEmpty) {
      _ref.read(authRepositoryProvider).setAuthToken(token);
    }
  }

  Future<bool> assign({
    required String exerciseId,
    required ExerciseAssignmentFrequency frequency,
    required DateTime startDate,
    DateTime? dueDate,
  }) async {
    if (state.isSubmitting) {
      return false;
    }

    final patientId = _args.patientId.trim();
    final planId = _args.planId.trim();
    final exercise = exerciseId.trim();

    if (patientId.isEmpty || planId.isEmpty || exercise.isEmpty) {
      state = state.copyWith(
        errorMessage:
            'Patient, treatment plan, and exercise are required to assign.',
      );
      return false;
    }

    if (dueDate != null) {
      final start = DateTime(startDate.year, startDate.month, startDate.day);
      final due = DateTime(dueDate.year, dueDate.month, dueDate.day);
      if (due.isBefore(start)) {
        state = state.copyWith(
          errorMessage: 'Due date cannot be before the start date.',
        );
        return false;
      }
    }

    _ensureAuthToken();
    state = state.copyWith(isSubmitting: true, errorMessage: null);

    try {
      await _repository.createAssignedExercise(
        CreateAssignedExerciseRequest(
          exerciseId: exercise,
          planId: planId,
          patientId: patientId,
          frequency: frequency,
          startDate: startDate,
          dueDate: dueDate,
        ),
      );

      if (!mounted) {
        return true;
      }

      state = state.copyWith(isSubmitting: false);
      await _ref
          .read(specialistPatientDetailsProvider(patientId).notifier)
          .refresh();
      return true;
    } catch (error) {
      if (!mounted) {
        return false;
      }
      final message = error.toString().replaceFirst('Exception: ', '');
      state = state.copyWith(
        isSubmitting: false,
        errorMessage: message.isNotEmpty
            ? message
            : 'Failed to assign exercise. Please try again.',
      );
      return false;
    }
  }
}

const _sentinel = Object();
