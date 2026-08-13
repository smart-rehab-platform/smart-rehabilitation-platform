import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../auth/data/auth_repository.dart';
import '../../auth/providers/auth_provider.dart';
import '../../dashboard/data/admin_patient_assignments_repository.dart';
import '../../dashboard/models/admin_assignments_models.dart';
import '../../dashboard/providers/admin_patient_assignments_provider.dart';
import '../data/complaints_repository.dart';
import '../models/complaint_models.dart';

class AdminComplaintsState {
  const AdminComplaintsState({
    this.items = const [],
    this.pagination = const ComplaintPagination(),
    this.specialists = const [],
    this.isInitialLoading = false,
    this.isRefreshing = false,
    this.isLoadingMore = false,
    this.errorMessage,
    this.loadMoreErrorMessage,
    this.selectedStatus,
    this.selectedSpecialistId,
    this.selectedCategory,
    this.fromDate,
    this.toDate,
  });

  final List<ComplaintItem> items;
  final ComplaintPagination pagination;
  final List<SpecialistUserOption> specialists;
  final bool isInitialLoading;
  final bool isRefreshing;
  final bool isLoadingMore;
  final String? errorMessage;
  final String? loadMoreErrorMessage;
  final ComplaintStatus? selectedStatus;
  final String? selectedSpecialistId;
  final ComplaintCategory? selectedCategory;
  final DateTime? fromDate;
  final DateTime? toDate;

  bool get hasActiveFilters =>
      selectedStatus != null ||
      (selectedSpecialistId != null && selectedSpecialistId!.isNotEmpty) ||
      selectedCategory != null ||
      fromDate != null ||
      toDate != null;

  bool get canLoadMore =>
      !isInitialLoading &&
      !isRefreshing &&
      !isLoadingMore &&
      pagination.hasNextPage;

  AdminComplaintsState copyWith({
    List<ComplaintItem>? items,
    ComplaintPagination? pagination,
    List<SpecialistUserOption>? specialists,
    bool? isInitialLoading,
    bool? isRefreshing,
    bool? isLoadingMore,
    Object? errorMessage = _sentinel,
    Object? loadMoreErrorMessage = _sentinel,
    Object? selectedStatus = _sentinel,
    Object? selectedSpecialistId = _sentinel,
    Object? selectedCategory = _sentinel,
    Object? fromDate = _sentinel,
    Object? toDate = _sentinel,
  }) {
    return AdminComplaintsState(
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
          : selectedStatus as ComplaintStatus?,
      selectedSpecialistId: identical(selectedSpecialistId, _sentinel)
          ? this.selectedSpecialistId
          : selectedSpecialistId as String?,
      selectedCategory: identical(selectedCategory, _sentinel)
          ? this.selectedCategory
          : selectedCategory as ComplaintCategory?,
      fromDate: identical(fromDate, _sentinel)
          ? this.fromDate
          : fromDate as DateTime?,
      toDate: identical(toDate, _sentinel) ? this.toDate : toDate as DateTime?,
    );
  }
}

const _sentinel = Object();

final adminComplaintsProvider =
    StateNotifierProvider<AdminComplaintsNotifier, AdminComplaintsState>(
      (ref) => AdminComplaintsNotifier(
        ref,
        ref.watch(complaintsRepositoryProvider),
        ref.watch(adminPatientAssignmentsRepositoryProvider),
        ref.watch(authRepositoryProvider),
      ),
    );

class AdminComplaintsNotifier extends StateNotifier<AdminComplaintsState> {
  AdminComplaintsNotifier(
    this._ref,
    this._repository,
    this._assignmentsRepository,
    this._authRepository,
  ) : super(const AdminComplaintsState());

  final Ref _ref;
  final ComplaintsRepository _repository;
  final AdminPatientAssignmentsRepository _assignmentsRepository;
  final AuthRepository _authRepository;

  int _requestSerial = 0;
  static const _pageLimit = 20;

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

  Future<AdminComplaintsPage> _fetchPage({required int page}) {
    return _repository.fetchAdminComplaints(
      status: state.selectedStatus,
      specialistId: state.selectedSpecialistId,
      category: state.selectedCategory,
      from: state.fromDate,
      to: state.toDate,
      page: page,
      limit: _pageLimit,
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

  void setStatusFilter(ComplaintStatus? status) {
    state = state.copyWith(selectedStatus: status);
    unawaited(_reloadWithFilters());
  }

  void setSpecialistFilter(String? specialistId) {
    state = state.copyWith(selectedSpecialistId: specialistId);
    unawaited(_reloadWithFilters());
  }

  void setCategoryFilter(ComplaintCategory? category) {
    state = state.copyWith(selectedCategory: category);
    unawaited(_reloadWithFilters());
  }

  void setDateRange({DateTime? from, DateTime? to}) {
    state = state.copyWith(fromDate: from, toDate: to);
    unawaited(_reloadWithFilters());
  }

  void clearFilters() {
    state = state.copyWith(
      selectedStatus: null,
      selectedSpecialistId: null,
      selectedCategory: null,
      fromDate: null,
      toDate: null,
    );
    unawaited(_reloadWithFilters());
  }
}

class AdminComplaintDetailState {
  const AdminComplaintDetailState({
    this.complaint,
    this.isLoading = false,
    this.isSubmitting = false,
    this.errorMessage,
  });

  final ComplaintItem? complaint;
  final bool isLoading;
  final bool isSubmitting;
  final String? errorMessage;

  AdminComplaintDetailState copyWith({
    ComplaintItem? complaint,
    bool? isLoading,
    bool? isSubmitting,
    Object? errorMessage = _detailSentinel,
  }) {
    return AdminComplaintDetailState(
      complaint: complaint ?? this.complaint,
      isLoading: isLoading ?? this.isLoading,
      isSubmitting: isSubmitting ?? this.isSubmitting,
      errorMessage: identical(errorMessage, _detailSentinel)
          ? this.errorMessage
          : errorMessage as String?,
    );
  }
}

const _detailSentinel = Object();

final adminComplaintDetailProvider = StateNotifierProvider.family<
    AdminComplaintDetailNotifier,
    AdminComplaintDetailState,
    String>((ref, complaintId) {
  return AdminComplaintDetailNotifier(
    ref,
    complaintId,
    ref.watch(complaintsRepositoryProvider),
    ref.watch(authRepositoryProvider),
  );
});

class AdminComplaintDetailNotifier
    extends StateNotifier<AdminComplaintDetailState> {
  AdminComplaintDetailNotifier(
    this._ref,
    this._complaintId,
    this._repository,
    this._authRepository,
  ) : super(const AdminComplaintDetailState());

  final Ref _ref;
  final String _complaintId;
  final ComplaintsRepository _repository;
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
      final complaint = await _repository.fetchAdminComplaintById(_complaintId);
      state = state.copyWith(isLoading: false, complaint: complaint);
    } catch (error) {
      state = state.copyWith(isLoading: false, errorMessage: error.toString());
    }
  }

  Future<void> refresh() => initialize();

  Future<ComplaintItem?> startReview() async {
    if (state.isSubmitting) return null;
    _ensureAuth();
    state = state.copyWith(isSubmitting: true, errorMessage: null);
    try {
      final complaint = await _repository.startReview(_complaintId);
      state = state.copyWith(isSubmitting: false, complaint: complaint);
      return complaint;
    } catch (error) {
      state = state.copyWith(isSubmitting: false, errorMessage: error.toString());
      return null;
    }
  }

  Future<ComplaintItem?> resolve({
    required String adminNotes,
    String? parentResponse,
  }) async {
    if (state.isSubmitting) return null;
    _ensureAuth();
    state = state.copyWith(isSubmitting: true, errorMessage: null);
    try {
      final complaint = await _repository.resolveComplaint(
        complaintId: _complaintId,
        adminNotes: adminNotes,
        parentResponse: parentResponse,
      );
      state = state.copyWith(isSubmitting: false, complaint: complaint);
      return complaint;
    } catch (error) {
      state = state.copyWith(isSubmitting: false, errorMessage: error.toString());
      return null;
    }
  }

  Future<ComplaintItem?> reject({
    required String adminNotes,
    String? parentResponse,
  }) async {
    if (state.isSubmitting) return null;
    _ensureAuth();
    state = state.copyWith(isSubmitting: true, errorMessage: null);
    try {
      final complaint = await _repository.rejectComplaint(
        complaintId: _complaintId,
        adminNotes: adminNotes,
        parentResponse: parentResponse,
      );
      state = state.copyWith(isSubmitting: false, complaint: complaint);
      return complaint;
    } catch (error) {
      state = state.copyWith(isSubmitting: false, errorMessage: error.toString());
      return null;
    }
  }
}
