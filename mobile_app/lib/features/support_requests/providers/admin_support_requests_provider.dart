import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../auth/data/auth_repository.dart';
import '../../auth/providers/auth_provider.dart';
import '../../dashboard/data/admin_patient_assignments_repository.dart';
import '../../dashboard/models/admin_assignments_models.dart';
import '../../dashboard/providers/admin_patient_assignments_provider.dart';
import '../data/support_requests_repository.dart';
import '../models/support_request_models.dart';

class AdminSupportRequestsState {
  const AdminSupportRequestsState({
    this.items = const [],
    this.pagination = const SupportRequestPagination(),
    this.specialists = const [],
    this.isInitialLoading = false,
    this.isRefreshing = false,
    this.isLoadingMore = false,
    this.errorMessage,
    this.loadMoreErrorMessage,
    this.selectedStatus,
    this.selectedSpecialistId,
    this.selectedCategory,
  });

  final List<SupportRequestItem> items;
  final SupportRequestPagination pagination;
  final List<SpecialistUserOption> specialists;
  final bool isInitialLoading;
  final bool isRefreshing;
  final bool isLoadingMore;
  final String? errorMessage;
  final String? loadMoreErrorMessage;
  final SupportRequestStatus? selectedStatus;
  final String? selectedSpecialistId;
  final SupportRequestCategory? selectedCategory;

  bool get hasActiveFilters =>
      selectedStatus != null ||
      (selectedSpecialistId != null && selectedSpecialistId!.isNotEmpty) ||
      selectedCategory != null;

  bool get canLoadMore =>
      !isInitialLoading &&
      !isRefreshing &&
      !isLoadingMore &&
      pagination.hasNextPage;

  AdminSupportRequestsState copyWith({
    List<SupportRequestItem>? items,
    SupportRequestPagination? pagination,
    List<SpecialistUserOption>? specialists,
    bool? isInitialLoading,
    bool? isRefreshing,
    bool? isLoadingMore,
    Object? errorMessage = _sentinel,
    Object? loadMoreErrorMessage = _sentinel,
    Object? selectedStatus = _sentinel,
    Object? selectedSpecialistId = _sentinel,
    Object? selectedCategory = _sentinel,
  }) {
    return AdminSupportRequestsState(
      items: items ?? this.items,
      pagination: pagination ?? this.pagination,
      specialists: specialists ?? this.specialists,
      isInitialLoading: isInitialLoading ?? this.isInitialLoading,
      isRefreshing: isRefreshing ?? this.isRefreshing,
      isLoadingMore: isLoadingMore ?? this.isLoadingMore,
      errorMessage: identical(errorMessage, _sentinel)
          ? this.errorMessage
          : errorMessage as String?,
      loadMoreErrorMessage: identical(loadMoreErrorMessage, _sentinel)
          ? this.loadMoreErrorMessage
          : loadMoreErrorMessage as String?,
      selectedStatus: identical(selectedStatus, _sentinel)
          ? this.selectedStatus
          : selectedStatus as SupportRequestStatus?,
      selectedSpecialistId: identical(selectedSpecialistId, _sentinel)
          ? this.selectedSpecialistId
          : selectedSpecialistId as String?,
      selectedCategory: identical(selectedCategory, _sentinel)
          ? this.selectedCategory
          : selectedCategory as SupportRequestCategory?,
    );
  }
}

const _sentinel = Object();

final adminSupportRequestsProvider = StateNotifierProvider<
    AdminSupportRequestsNotifier,
    AdminSupportRequestsState>((ref) {
  return AdminSupportRequestsNotifier(
    ref,
    ref.watch(supportRequestsRepositoryProvider),
    ref.watch(adminPatientAssignmentsRepositoryProvider),
    ref.watch(authRepositoryProvider),
  );
});

class AdminSupportRequestsNotifier
    extends StateNotifier<AdminSupportRequestsState> {
  AdminSupportRequestsNotifier(
    this._ref,
    this._repository,
    this._assignmentsRepository,
    this._authRepository,
  ) : super(const AdminSupportRequestsState());

  final Ref _ref;
  final SupportRequestsRepository _repository;
  final AdminPatientAssignmentsRepository _assignmentsRepository;
  final AuthRepository _authRepository;

  int _requestSerial = 0;

  void _ensureAuth() {
    final token = _ref.read(authProvider).token;
    if (token != null && token.isNotEmpty) {
      _authRepository.setAuthToken(token);
    }
  }

  Future<void> initialize() async {
    _ensureAuth();
    state = state.copyWith(isInitialLoading: true, errorMessage: null);
    try {
      final specialists = await _assignmentsRepository.fetchSpecialists();
      final page = await _fetchPage(page: 1);
      state = state.copyWith(
        isInitialLoading: false,
        specialists: specialists.where((s) => s.userId.isNotEmpty).toList(),
        items: page.items,
        pagination: page.pagination,
      );
    } catch (error) {
      state = state.copyWith(
        isInitialLoading: false,
        errorMessage: error.toString(),
      );
    }
  }

  Future<void> refresh() async {
    _ensureAuth();
    final serial = ++_requestSerial;
    state = state.copyWith(isRefreshing: true, errorMessage: null);
    try {
      final page = await _fetchPage(page: 1);
      if (serial != _requestSerial) return;
      state = state.copyWith(
        isRefreshing: false,
        items: page.items,
        pagination: page.pagination,
        loadMoreErrorMessage: null,
      );
    } catch (error) {
      if (serial != _requestSerial) return;
      state = state.copyWith(
        isRefreshing: false,
        errorMessage: error.toString(),
      );
    }
  }

  Future<void> loadMore() async {
    if (!state.canLoadMore) return;
    _ensureAuth();
    final serial = ++_requestSerial;
    state = state.copyWith(isLoadingMore: true, loadMoreErrorMessage: null);
    try {
      final page = await _fetchPage(page: state.pagination.page + 1);
      if (serial != _requestSerial) return;
      state = state.copyWith(
        isLoadingMore: false,
        items: [...state.items, ...page.items],
        pagination: page.pagination,
      );
    } catch (error) {
      if (serial != _requestSerial) return;
      state = state.copyWith(
        isLoadingMore: false,
        loadMoreErrorMessage: error.toString(),
      );
    }
  }

  Future<AdminSupportRequestsPage> _fetchPage({required int page}) {
    return _repository.fetchAdminSupportRequests(
      status: state.selectedStatus,
      specialistId: state.selectedSpecialistId,
      category: state.selectedCategory,
      page: page,
      limit: supportRequestPageLimit,
    );
  }

  Future<void> _reloadWithFilters() async {
    _ensureAuth();
    final serial = ++_requestSerial;
    state = state.copyWith(isRefreshing: true, errorMessage: null);
    try {
      final page = await _fetchPage(page: 1);
      if (serial != _requestSerial) return;
      state = state.copyWith(
        isRefreshing: false,
        items: page.items,
        pagination: page.pagination,
      );
    } catch (error) {
      if (serial != _requestSerial) return;
      state = state.copyWith(
        isRefreshing: false,
        errorMessage: error.toString(),
      );
    }
  }

  void setStatusFilter(SupportRequestStatus? status) {
    state = state.copyWith(selectedStatus: status);
    unawaited(_reloadWithFilters());
  }

  void setSpecialistFilter(String? specialistId) {
    state = state.copyWith(selectedSpecialistId: specialistId);
    unawaited(_reloadWithFilters());
  }

  void setCategoryFilter(SupportRequestCategory? category) {
    state = state.copyWith(selectedCategory: category);
    unawaited(_reloadWithFilters());
  }

  void clearFilters() {
    state = state.copyWith(
      selectedStatus: null,
      selectedSpecialistId: null,
      selectedCategory: null,
    );
    unawaited(_reloadWithFilters());
  }
}

class AdminSupportRequestDetailState {
  const AdminSupportRequestDetailState({
    this.request,
    this.isLoading = false,
    this.isSubmitting = false,
    this.errorMessage,
  });

  final SupportRequestItem? request;
  final bool isLoading;
  final bool isSubmitting;
  final String? errorMessage;

  AdminSupportRequestDetailState copyWith({
    SupportRequestItem? request,
    bool? isLoading,
    bool? isSubmitting,
    Object? errorMessage = _detailSentinel,
  }) {
    return AdminSupportRequestDetailState(
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

final adminSupportRequestDetailProvider = StateNotifierProvider.family<
    AdminSupportRequestDetailNotifier,
    AdminSupportRequestDetailState,
    String>((ref, requestId) {
  return AdminSupportRequestDetailNotifier(
    ref,
    requestId,
    ref.watch(supportRequestsRepositoryProvider),
    ref.watch(authRepositoryProvider),
  );
});

class AdminSupportRequestDetailNotifier
    extends StateNotifier<AdminSupportRequestDetailState> {
  AdminSupportRequestDetailNotifier(
    this._ref,
    this._requestId,
    this._repository,
    this._authRepository,
  ) : super(const AdminSupportRequestDetailState());

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
      final request = await _repository.fetchAdminSupportRequestById(_requestId);
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
      final request = await _repository.addAdminMessage(
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

  Future<SupportRequestItem?> updateStatus(
    SupportRequestStatus status,
  ) async {
    if (state.isSubmitting) return null;
    _ensureAuth();
    state = state.copyWith(isSubmitting: true, errorMessage: null);
    try {
      final request = await _repository.updateAdminStatus(
        requestId: _requestId,
        status: status,
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
