import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../auth/data/auth_repository.dart';
import '../../auth/providers/auth_provider.dart';
import '../data/support_requests_repository.dart';
import '../models/support_request_models.dart';

class SpecialistSupportRequestsState {
  const SpecialistSupportRequestsState({
    this.items = const [],
    this.isLoading = false,
    this.isRefreshing = false,
    this.errorMessage,
    this.selectedStatus,
    this.selectedCategory,
    this.isSubmitting = false,
    this.submitErrorMessage,
  });

  final List<SupportRequestItem> items;
  final bool isLoading;
  final bool isRefreshing;
  final String? errorMessage;
  final SupportRequestStatus? selectedStatus;
  final SupportRequestCategory? selectedCategory;
  final bool isSubmitting;
  final String? submitErrorMessage;

  bool get hasActiveFilters =>
      selectedStatus != null || selectedCategory != null;

  SpecialistSupportRequestsState copyWith({
    List<SupportRequestItem>? items,
    bool? isLoading,
    bool? isRefreshing,
    Object? errorMessage = _sentinel,
    Object? selectedStatus = _sentinel,
    Object? selectedCategory = _sentinel,
    bool? isSubmitting,
    Object? submitErrorMessage = _sentinel,
  }) {
    return SpecialistSupportRequestsState(
      items: items ?? this.items,
      isLoading: isLoading ?? this.isLoading,
      isRefreshing: isRefreshing ?? this.isRefreshing,
      errorMessage: identical(errorMessage, _sentinel)
          ? this.errorMessage
          : errorMessage as String?,
      selectedStatus: identical(selectedStatus, _sentinel)
          ? this.selectedStatus
          : selectedStatus as SupportRequestStatus?,
      selectedCategory: identical(selectedCategory, _sentinel)
          ? this.selectedCategory
          : selectedCategory as SupportRequestCategory?,
      isSubmitting: isSubmitting ?? this.isSubmitting,
      submitErrorMessage: identical(submitErrorMessage, _sentinel)
          ? this.submitErrorMessage
          : submitErrorMessage as String?,
    );
  }
}

const _sentinel = Object();

final specialistSupportRequestsProvider = StateNotifierProvider<
    SpecialistSupportRequestsNotifier,
    SpecialistSupportRequestsState>((ref) {
  return SpecialistSupportRequestsNotifier(
    ref,
    ref.watch(supportRequestsRepositoryProvider),
    ref.watch(authRepositoryProvider),
  );
});

class SpecialistSupportRequestsNotifier
    extends StateNotifier<SpecialistSupportRequestsState> {
  SpecialistSupportRequestsNotifier(
    this._ref,
    this._repository,
    this._authRepository,
  ) : super(const SpecialistSupportRequestsState());

  final Ref _ref;
  final SupportRequestsRepository _repository;
  final AuthRepository _authRepository;

  void _ensureAuth() {
    final token = _ref.read(authProvider).token;
    if (token != null && token.isNotEmpty) {
      _authRepository.setAuthToken(token);
    }
  }

  Future<void> loadRequests() async {
    _ensureAuth();
    state = state.copyWith(isLoading: true, errorMessage: null);
    try {
      final items = await _repository.fetchMySupportRequests(
        status: state.selectedStatus,
        category: state.selectedCategory,
      );
      state = state.copyWith(isLoading: false, items: items);
    } catch (error) {
      state = state.copyWith(isLoading: false, errorMessage: error.toString());
    }
  }

  Future<void> refresh() async {
    _ensureAuth();
    state = state.copyWith(isRefreshing: true, errorMessage: null);
    try {
      final items = await _repository.fetchMySupportRequests(
        status: state.selectedStatus,
        category: state.selectedCategory,
      );
      state = state.copyWith(isRefreshing: false, items: items);
    } catch (error) {
      state = state.copyWith(
        isRefreshing: false,
        errorMessage: error.toString(),
      );
    }
  }

  void setStatusFilter(SupportRequestStatus? status) {
    state = state.copyWith(selectedStatus: status);
    unawaited(loadRequests());
  }

  void setCategoryFilter(SupportRequestCategory? category) {
    state = state.copyWith(selectedCategory: category);
    unawaited(loadRequests());
  }

  void clearFilters() {
    state = state.copyWith(selectedStatus: null, selectedCategory: null);
    unawaited(loadRequests());
  }

  Future<SupportRequestItem?> createRequest(
    CreateSupportRequestPayload payload,
  ) async {
    if (state.isSubmitting) return null;
    _ensureAuth();
    state = state.copyWith(isSubmitting: true, submitErrorMessage: null);
    try {
      final item = await _repository.createSupportRequest(payload);
      state = state.copyWith(
        isSubmitting: false,
        items: [item, ...state.items],
      );
      return item;
    } catch (error) {
      state = state.copyWith(
        isSubmitting: false,
        submitErrorMessage: error.toString(),
      );
      return null;
    }
  }
}

class SpecialistSupportRequestDetailState {
  const SpecialistSupportRequestDetailState({
    this.request,
    this.isLoading = false,
    this.isSubmitting = false,
    this.errorMessage,
  });

  final SupportRequestItem? request;
  final bool isLoading;
  final bool isSubmitting;
  final String? errorMessage;

  SpecialistSupportRequestDetailState copyWith({
    SupportRequestItem? request,
    bool? isLoading,
    bool? isSubmitting,
    Object? errorMessage = _detailSentinel,
  }) {
    return SpecialistSupportRequestDetailState(
      request: request ?? this.request,
      isLoading: isLoading ?? this.isLoading,
      isSubmitting: isSubmitting ?? this.isSubmitting,
      errorMessage: identical(errorMessage, _detailSentinel)
          ? this.errorMessage
          : errorMessage as String?,
    );
  }
}

const _detailSentinel = Object();

final specialistSupportRequestDetailProvider = StateNotifierProvider.family<
    SpecialistSupportRequestDetailNotifier,
    SpecialistSupportRequestDetailState,
    String>((ref, requestId) {
  return SpecialistSupportRequestDetailNotifier(
    ref,
    requestId,
    ref.watch(supportRequestsRepositoryProvider),
    ref.watch(authRepositoryProvider),
  );
});

class SpecialistSupportRequestDetailNotifier
    extends StateNotifier<SpecialistSupportRequestDetailState> {
  SpecialistSupportRequestDetailNotifier(
    this._ref,
    this._requestId,
    this._repository,
    this._authRepository,
  ) : super(const SpecialistSupportRequestDetailState());

  final Ref _ref;
  final String _requestId;
  final SupportRequestsRepository _repository;
  final AuthRepository _authRepository;

  void _ensureAuth() {
    final token = _ref.read(authProvider).token;
    if (token != null && token.isNotEmpty) {
      _authRepository.setAuthToken(token);
    }
  }

  Future<void> initialize() async {
    _ensureAuth();
    state = state.copyWith(isLoading: true, errorMessage: null);
    try {
      final request = await _repository.fetchMySupportRequestById(_requestId);
      state = state.copyWith(isLoading: false, request: request);
    } catch (error) {
      state = state.copyWith(isLoading: false, errorMessage: error.toString());
    }
  }

  Future<void> refresh() => initialize();

  Future<SupportRequestItem?> sendMessage(
    CreateSupportRequestMessagePayload payload,
  ) async {
    if (state.isSubmitting) return null;
    _ensureAuth();
    state = state.copyWith(isSubmitting: true, errorMessage: null);
    try {
      final request = await _repository.addSpecialistMessage(
        requestId: _requestId,
        payload: payload,
      );
      state = state.copyWith(isSubmitting: false, request: request);
      return request;
    } catch (error) {
      state = state.copyWith(
        isSubmitting: false,
        errorMessage: error.toString(),
      );
      return null;
    }
  }
}
