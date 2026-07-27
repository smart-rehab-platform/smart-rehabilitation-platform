import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../auth/data/auth_repository.dart';
import '../../auth/providers/auth_provider.dart';
import '../data/case_intake_repository.dart';
import '../models/specialist_case_request_detail_model.dart';
import 'case_categories_provider.dart';

class SpecialistCaseRequestDetailState {
  const SpecialistCaseRequestDetailState({
    this.detail,
    this.isLoading = false,
    this.isRefreshing = false,
    this.isStartingAssessment = false,
    this.isSavingAssessmentNotes = false,
    this.isAccepting = false,
    this.isRejecting = false,
    this.errorMessage,
    this.actionErrorMessage,
  });

  final SpecialistCaseRequestDetail? detail;
  final bool isLoading;
  final bool isRefreshing;
  final bool isStartingAssessment;
  final bool isSavingAssessmentNotes;
  final bool isAccepting;
  final bool isRejecting;
  final String? errorMessage;
  final String? actionErrorMessage;

  bool get hasActiveMutation =>
      isStartingAssessment ||
      isSavingAssessmentNotes ||
      isAccepting ||
      isRejecting;

  SpecialistCaseRequestDetailState copyWith({
    Object? detail = _sentinel,
    bool? isLoading,
    bool? isRefreshing,
    bool? isStartingAssessment,
    bool? isSavingAssessmentNotes,
    bool? isAccepting,
    bool? isRejecting,
    Object? errorMessage = _sentinel,
    Object? actionErrorMessage = _sentinel,
  }) {
    return SpecialistCaseRequestDetailState(
      detail: identical(detail, _sentinel)
          ? this.detail
          : detail as SpecialistCaseRequestDetail?,
      isLoading: isLoading ?? this.isLoading,
      isRefreshing: isRefreshing ?? this.isRefreshing,
      isStartingAssessment: isStartingAssessment ?? this.isStartingAssessment,
      isSavingAssessmentNotes:
          isSavingAssessmentNotes ?? this.isSavingAssessmentNotes,
      isAccepting: isAccepting ?? this.isAccepting,
      isRejecting: isRejecting ?? this.isRejecting,
      errorMessage: identical(errorMessage, _sentinel)
          ? this.errorMessage
          : errorMessage as String?,
      actionErrorMessage: identical(actionErrorMessage, _sentinel)
          ? this.actionErrorMessage
          : actionErrorMessage as String?,
    );
  }
}

const _sentinel = Object();

const _onlyAssignedCanStartMessage =
    'Only assigned case requests can start assessment';

const _staleAcceptMessage =
    'Only case requests under assessment can be accepted';

const _staleRejectMessages = <String>{
  'Only assigned or under-assessment requests can be rejected',
  'This case request can no longer be rejected',
};

final specialistCaseRequestDetailProvider = StateNotifierProvider.autoDispose
    .family<
      SpecialistCaseRequestDetailNotifier,
      SpecialistCaseRequestDetailState,
      String
    >((ref, requestId) {
      return SpecialistCaseRequestDetailNotifier(
        ref,
        ref.watch(caseIntakeRepositoryProvider),
        ref.watch(authRepositoryProvider),
        requestId,
      );
    });

class SpecialistCaseRequestDetailNotifier
    extends StateNotifier<SpecialistCaseRequestDetailState> {
  SpecialistCaseRequestDetailNotifier(
    this._ref,
    this._repository,
    this._authRepository,
    this.requestId,
  ) : super(const SpecialistCaseRequestDetailState());

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
        errorMessage: 'Case request not found.',
        detail: null,
      );
      return;
    }

    _ensureAuthToken();
    state = state.copyWith(isLoading: true, errorMessage: null);

    try {
      final detail = await _repository.fetchSpecialistRequestById(requestId);
      if (!mounted) {
        return;
      }
      state = state.copyWith(
        isLoading: false,
        detail: detail,
        errorMessage: null,
      );
    } on CaseIntakeApiException catch (error) {
      if (!mounted) {
        return;
      }
      final message = error.statusCode == 404
          ? 'Case request not found.'
          : error.message;
      state = state.copyWith(isLoading: false, errorMessage: message);
    } catch (error) {
      if (!mounted) {
        return;
      }
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Failed to load case request: $error',
      );
    }
  }

  Future<void> refresh() async {
    if (requestId.trim().isEmpty) {
      return;
    }

    _ensureAuthToken();
    state = state.copyWith(isRefreshing: true, errorMessage: null);

    try {
      final detail = await _repository.fetchSpecialistRequestById(requestId);
      if (!mounted) {
        return;
      }
      state = state.copyWith(
        isRefreshing: false,
        detail: detail,
        errorMessage: null,
      );
    } on CaseIntakeApiException catch (error) {
      if (!mounted) {
        return;
      }
      final message = error.statusCode == 404
          ? 'Case request not found.'
          : error.message;
      state = state.copyWith(isRefreshing: false, errorMessage: message);
    } catch (error) {
      if (!mounted) {
        return;
      }
      state = state.copyWith(
        isRefreshing: false,
        errorMessage: 'Failed to refresh case request: $error',
      );
    }
  }

  Future<bool> startAssessment() async {
    if (state.hasActiveMutation) {
      return false;
    }
    if (state.detail == null || requestId.trim().isEmpty) {
      return false;
    }

    _ensureAuthToken();
    state = state.copyWith(
      isStartingAssessment: true,
      actionErrorMessage: null,
    );

    try {
      final detail = await _repository.startAssessment(requestId);
      if (!mounted) {
        return true;
      }
      state = state.copyWith(
        isStartingAssessment: false,
        detail: detail,
        actionErrorMessage: null,
      );
      return true;
    } on CaseIntakeApiException catch (error) {
      if (!mounted) {
        return false;
      }
      state = state.copyWith(
        isStartingAssessment: false,
        actionErrorMessage: error.message,
      );
      if (error.message == _onlyAssignedCanStartMessage) {
        await refresh();
      }
      return false;
    } catch (_) {
      if (!mounted) {
        return false;
      }
      state = state.copyWith(
        isStartingAssessment: false,
        actionErrorMessage: 'Failed to start assessment. Please try again.',
      );
      return false;
    }
  }

  Future<bool> saveAssessmentNotes(String notes) async {
    if (state.hasActiveMutation) {
      return false;
    }
    if (state.detail == null || requestId.trim().isEmpty) {
      return false;
    }

    _ensureAuthToken();
    state = state.copyWith(
      isSavingAssessmentNotes: true,
      actionErrorMessage: null,
    );

    try {
      final detail = await _repository.updateAssessmentNotes(
        requestId: requestId,
        assessmentNotes: notes,
      );
      if (!mounted) {
        return true;
      }
      state = state.copyWith(
        isSavingAssessmentNotes: false,
        detail: detail,
        actionErrorMessage: null,
      );
      return true;
    } on CaseIntakeApiException catch (error) {
      if (!mounted) {
        return false;
      }
      state = state.copyWith(
        isSavingAssessmentNotes: false,
        actionErrorMessage: error.message,
      );
      return false;
    } catch (_) {
      if (!mounted) {
        return false;
      }
      state = state.copyWith(
        isSavingAssessmentNotes: false,
        actionErrorMessage:
            'Failed to update assessment notes. Please try again.',
      );
      return false;
    }
  }

  Future<String?> acceptCaseRequest() async {
    if (state.hasActiveMutation) {
      return null;
    }
    if (state.detail == null || requestId.trim().isEmpty) {
      return null;
    }

    _ensureAuthToken();
    state = state.copyWith(isAccepting: true, actionErrorMessage: null);

    try {
      final detail = await _repository.acceptCaseRequest(requestId);
      if (!mounted) {
        return detail.request.patientId;
      }
      state = state.copyWith(
        isAccepting: false,
        detail: detail,
        actionErrorMessage: null,
      );
      return detail.request.patientId;
    } on CaseIntakeApiException catch (error) {
      if (!mounted) {
        return null;
      }
      state = state.copyWith(
        isAccepting: false,
        actionErrorMessage: error.message,
      );
      if (error.message == _staleAcceptMessage) {
        await refresh();
      }
      return null;
    } catch (_) {
      if (!mounted) {
        return null;
      }
      state = state.copyWith(
        isAccepting: false,
        actionErrorMessage: 'Failed to accept case request. Please try again.',
      );
      return null;
    }
  }

  Future<bool> rejectCaseRequest(String reason) async {
    if (state.hasActiveMutation) {
      return false;
    }
    if (state.detail == null || requestId.trim().isEmpty) {
      return false;
    }

    _ensureAuthToken();
    state = state.copyWith(isRejecting: true, actionErrorMessage: null);

    try {
      final detail = await _repository.rejectCaseRequest(
        requestId: requestId,
        reason: reason,
      );
      if (!mounted) {
        return true;
      }
      state = state.copyWith(
        isRejecting: false,
        detail: detail,
        actionErrorMessage: null,
      );
      return true;
    } on CaseIntakeApiException catch (error) {
      if (!mounted) {
        return false;
      }
      state = state.copyWith(
        isRejecting: false,
        actionErrorMessage: error.message,
      );
      if (_staleRejectMessages.contains(error.message)) {
        await refresh();
      }
      return false;
    } catch (_) {
      if (!mounted) {
        return false;
      }
      state = state.copyWith(
        isRejecting: false,
        actionErrorMessage: 'Failed to reject case request. Please try again.',
      );
      return false;
    }
  }

  Future<void> retry() => initialize();

  void clearError() {
    state = state.copyWith(errorMessage: null);
  }

  void clearActionError() {
    state = state.copyWith(actionErrorMessage: null);
  }
}
