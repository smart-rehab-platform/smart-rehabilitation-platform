import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../auth/data/auth_repository.dart';
import '../../auth/providers/auth_provider.dart';
import '../data/case_intake_repository.dart';
import '../models/assign_specialist_result_model.dart';
import '../models/matching_specialist_model.dart';
import 'case_categories_provider.dart';

enum AssignSpecialistOutcome { success, failure, staleRequest }

class AssignSpecialistActionResult {
  const AssignSpecialistActionResult({
    required this.outcome,
    this.result,
    this.errorMessage,
    this.statusCode,
  });

  final AssignSpecialistOutcome outcome;
  final AssignSpecialistResult? result;
  final String? errorMessage;
  final int? statusCode;

  bool get isSuccess => outcome == AssignSpecialistOutcome.success;
}

class AdminMatchingSpecialistsState {
  const AdminMatchingSpecialistsState({
    this.specialists = const [],
    this.selectedSpecialistId,
    this.isLoading = false,
    this.isAssigning = false,
    this.errorMessage,
    this.assignmentErrorMessage,
  });

  final List<MatchingSpecialist> specialists;
  final String? selectedSpecialistId;
  final bool isLoading;
  final bool isAssigning;
  final String? errorMessage;
  final String? assignmentErrorMessage;

  MatchingSpecialist? get selectedSpecialist {
    final id = selectedSpecialistId;
    if (id == null || id.isEmpty) {
      return null;
    }
    for (final specialist in specialists) {
      if (specialist.id == id) {
        return specialist;
      }
    }
    return null;
  }

  AdminMatchingSpecialistsState copyWith({
    List<MatchingSpecialist>? specialists,
    Object? selectedSpecialistId = _sentinel,
    bool? isLoading,
    bool? isAssigning,
    Object? errorMessage = _sentinel,
    Object? assignmentErrorMessage = _sentinel,
  }) {
    return AdminMatchingSpecialistsState(
      specialists: specialists ?? this.specialists,
      selectedSpecialistId: identical(selectedSpecialistId, _sentinel)
          ? this.selectedSpecialistId
          : selectedSpecialistId as String?,
      isLoading: isLoading ?? this.isLoading,
      isAssigning: isAssigning ?? this.isAssigning,
      errorMessage: identical(errorMessage, _sentinel)
          ? this.errorMessage
          : errorMessage as String?,
      assignmentErrorMessage: identical(assignmentErrorMessage, _sentinel)
          ? this.assignmentErrorMessage
          : assignmentErrorMessage as String?,
    );
  }
}

const _sentinel = Object();

final adminMatchingSpecialistsProvider = StateNotifierProvider.autoDispose
    .family<
      AdminMatchingSpecialistsNotifier,
      AdminMatchingSpecialistsState,
      String
    >((ref, requestId) {
      return AdminMatchingSpecialistsNotifier(
        ref,
        ref.watch(caseIntakeRepositoryProvider),
        ref.watch(authRepositoryProvider),
        requestId,
      );
    });

class AdminMatchingSpecialistsNotifier
    extends StateNotifier<AdminMatchingSpecialistsState> {
  AdminMatchingSpecialistsNotifier(
    this._ref,
    this._repository,
    this._authRepository,
    this.requestId,
  ) : super(const AdminMatchingSpecialistsState());

  final Ref _ref;
  final CaseIntakeRepository _repository;
  final AuthRepository _authRepository;
  final String requestId;

  void _ensureAuthToken() {
    final token = _ref.read(authProvider).token;
    if (token != null && token.isNotEmpty) {
      _authRepository.setAuthToken(token);
    }
  }

  Future<void> initialize() async {
    if (requestId.trim().isEmpty) {
      state = state.copyWith(
        isLoading: false,
        specialists: const [],
        errorMessage: 'Case request not found.',
      );
      return;
    }

    _ensureAuthToken();
    state = state.copyWith(
      isLoading: true,
      errorMessage: null,
      assignmentErrorMessage: null,
    );

    try {
      final specialists = await _repository.fetchMatchingSpecialists(requestId);
      if (!mounted) {
        return;
      }
      final selectedId = state.selectedSpecialistId;
      final stillSelected =
          selectedId != null &&
          specialists.any((specialist) => specialist.id == selectedId);

      state = state.copyWith(
        isLoading: false,
        specialists: specialists,
        selectedSpecialistId: stillSelected ? selectedId : null,
        errorMessage: null,
      );
    } on CaseIntakeApiException catch (error) {
      if (!mounted) {
        return;
      }
      state = state.copyWith(
        isLoading: false,
        specialists: const [],
        errorMessage: error.message,
      );
    } catch (error) {
      if (!mounted) {
        return;
      }
      state = state.copyWith(
        isLoading: false,
        specialists: const [],
        errorMessage: 'Failed to load matching specialists: $error',
      );
    }
  }

  Future<void> retry() => initialize();

  void select(String specialistId) {
    if (state.isAssigning) {
      return;
    }
    final trimmed = specialistId.trim();
    if (trimmed.isEmpty) {
      return;
    }
    if (!state.specialists.any((specialist) => specialist.id == trimmed)) {
      return;
    }
    state = state.copyWith(
      selectedSpecialistId: trimmed,
      errorMessage: null,
      assignmentErrorMessage: null,
    );
  }

  void clearSelection() {
    if (state.isAssigning) {
      return;
    }
    state = state.copyWith(selectedSpecialistId: null);
  }

  void clearAssignmentError() {
    state = state.copyWith(assignmentErrorMessage: null);
  }

  Future<AssignSpecialistActionResult> assignSelectedSpecialist() async {
    if (state.isAssigning) {
      return const AssignSpecialistActionResult(
        outcome: AssignSpecialistOutcome.failure,
        errorMessage: 'Assignment already in progress.',
      );
    }

    final specialistId = state.selectedSpecialistId?.trim();
    if (specialistId == null || specialistId.isEmpty) {
      return const AssignSpecialistActionResult(
        outcome: AssignSpecialistOutcome.failure,
        errorMessage: 'Select a specialist to continue.',
      );
    }

    _ensureAuthToken();
    state = state.copyWith(isAssigning: true, assignmentErrorMessage: null);

    try {
      final result = await _repository.assignSpecialist(
        requestId: requestId,
        specialistId: specialistId,
      );
      if (!mounted) {
        return AssignSpecialistActionResult(
          outcome: AssignSpecialistOutcome.success,
          result: result,
        );
      }
      state = state.copyWith(isAssigning: false, assignmentErrorMessage: null);
      return AssignSpecialistActionResult(
        outcome: AssignSpecialistOutcome.success,
        result: result,
      );
    } on CaseIntakeApiException catch (error) {
      if (!mounted) {
        return AssignSpecialistActionResult(
          outcome: _isStalePendingMessage(error.message)
              ? AssignSpecialistOutcome.staleRequest
              : AssignSpecialistOutcome.failure,
          errorMessage: error.message,
          statusCode: error.statusCode,
        );
      }

      final stale = _isStalePendingMessage(error.message);
      state = state.copyWith(
        isAssigning: false,
        assignmentErrorMessage: error.message,
      );

      if (error.statusCode == 404) {
        // Specialist may have disappeared; refresh matching list quietly.
        initialize();
      }

      return AssignSpecialistActionResult(
        outcome: stale
            ? AssignSpecialistOutcome.staleRequest
            : AssignSpecialistOutcome.failure,
        errorMessage: error.message,
        statusCode: error.statusCode,
      );
    } catch (error) {
      const message = 'Failed to assign specialist. Please try again.';
      if (!mounted) {
        return const AssignSpecialistActionResult(
          outcome: AssignSpecialistOutcome.failure,
          errorMessage: message,
        );
      }
      state = state.copyWith(
        isAssigning: false,
        assignmentErrorMessage: message,
      );
      return const AssignSpecialistActionResult(
        outcome: AssignSpecialistOutcome.failure,
        errorMessage: message,
      );
    }
  }

  bool _isStalePendingMessage(String message) {
    return message.trim().toLowerCase() ==
        'only pending case requests can be assigned';
  }
}
