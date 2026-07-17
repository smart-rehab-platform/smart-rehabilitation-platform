import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../auth/data/auth_repository.dart';
import '../../auth/providers/auth_provider.dart';
import '../data/case_intake_repository.dart';
import '../models/admin_case_request_detail_model.dart';
import 'case_categories_provider.dart';

class AdminCaseRequestDetailState {
  const AdminCaseRequestDetailState({
    this.detail,
    this.isLoading = false,
    this.isRefreshing = false,
    this.errorMessage,
  });

  final AdminCaseRequestDetail? detail;
  final bool isLoading;
  final bool isRefreshing;
  final String? errorMessage;

  AdminCaseRequestDetailState copyWith({
    Object? detail = _sentinel,
    bool? isLoading,
    bool? isRefreshing,
    Object? errorMessage = _sentinel,
  }) {
    return AdminCaseRequestDetailState(
      detail: identical(detail, _sentinel)
          ? this.detail
          : detail as AdminCaseRequestDetail?,
      isLoading: isLoading ?? this.isLoading,
      isRefreshing: isRefreshing ?? this.isRefreshing,
      errorMessage: identical(errorMessage, _sentinel)
          ? this.errorMessage
          : errorMessage as String?,
    );
  }
}

const _sentinel = Object();

final adminCaseRequestDetailProvider = StateNotifierProvider.autoDispose
    .family<
      AdminCaseRequestDetailNotifier,
      AdminCaseRequestDetailState,
      String
    >((ref, requestId) {
      return AdminCaseRequestDetailNotifier(
        ref,
        ref.watch(caseIntakeRepositoryProvider),
        ref.watch(authRepositoryProvider),
        requestId,
      );
    });

class AdminCaseRequestDetailNotifier
    extends StateNotifier<AdminCaseRequestDetailState> {
  AdminCaseRequestDetailNotifier(
    this._ref,
    this._repository,
    this._authRepository,
    this.requestId,
  ) : super(const AdminCaseRequestDetailState());

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
      final detail = await _repository.fetchAdminRequestById(requestId);
      state = state.copyWith(
        isLoading: false,
        detail: detail,
        errorMessage: null,
      );
    } on CaseIntakeApiException catch (error) {
      final message = error.statusCode == 404
          ? 'Case request not found.'
          : error.message;
      state = state.copyWith(isLoading: false, errorMessage: message);
    } catch (error) {
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
      final detail = await _repository.fetchAdminRequestById(requestId);
      state = state.copyWith(
        isRefreshing: false,
        detail: detail,
        errorMessage: null,
      );
    } on CaseIntakeApiException catch (error) {
      final message = error.statusCode == 404
          ? 'Case request not found.'
          : error.message;
      state = state.copyWith(isRefreshing: false, errorMessage: message);
    } catch (error) {
      state = state.copyWith(
        isRefreshing: false,
        errorMessage: 'Failed to refresh case request: $error',
      );
    }
  }

  Future<void> retry() => initialize();

  void clearError() {
    state = state.copyWith(errorMessage: null);
  }
}
