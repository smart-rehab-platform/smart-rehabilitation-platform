import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../auth/data/auth_repository.dart';
import '../../auth/providers/auth_provider.dart';
import '../data/case_intake_repository.dart';
import '../models/case_intake_request_model.dart';
import '../models/specialist_assigned_case_models.dart';
import 'case_categories_provider.dart';

class SpecialistAssignedCasesState {
  const SpecialistAssignedCasesState({
    this.items = const [],
    this.pagination = const SpecialistAssignedPagination(),
    this.isInitialLoading = false,
    this.isRefreshing = false,
    this.isLoadingMore = false,
    this.errorMessage,
    this.loadMoreErrorMessage,
    this.selectedStatus,
    this.selectedCategoryId,
    this.searchText = '',
  });

  final List<SpecialistAssignedCaseItem> items;
  final SpecialistAssignedPagination pagination;
  final bool isInitialLoading;
  final bool isRefreshing;
  final bool isLoadingMore;
  final String? errorMessage;
  final String? loadMoreErrorMessage;
  final CaseIntakeStatus? selectedStatus;
  final String? selectedCategoryId;
  final String searchText;

  bool get hasActiveFilters =>
      selectedStatus != null ||
      (selectedCategoryId != null && selectedCategoryId!.isNotEmpty) ||
      searchText.trim().isNotEmpty;

  bool get canLoadMore =>
      !isInitialLoading &&
      !isRefreshing &&
      !isLoadingMore &&
      pagination.hasNextPage;

  SpecialistAssignedCasesState copyWith({
    List<SpecialistAssignedCaseItem>? items,
    SpecialistAssignedPagination? pagination,
    bool? isInitialLoading,
    bool? isRefreshing,
    bool? isLoadingMore,
    Object? errorMessage = _sentinel,
    Object? loadMoreErrorMessage = _sentinel,
    Object? selectedStatus = _sentinel,
    Object? selectedCategoryId = _sentinel,
    String? searchText,
  }) {
    return SpecialistAssignedCasesState(
      items: items ?? this.items,
      pagination: pagination ?? this.pagination,
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
          : selectedStatus as CaseIntakeStatus?,
      selectedCategoryId: identical(selectedCategoryId, _sentinel)
          ? this.selectedCategoryId
          : selectedCategoryId as String?,
      searchText: searchText ?? this.searchText,
    );
  }
}

const _sentinel = Object();

final specialistAssignedCasesProvider =
    StateNotifierProvider<
      SpecialistAssignedCasesNotifier,
      SpecialistAssignedCasesState
    >(
      (ref) => SpecialistAssignedCasesNotifier(
        ref,
        ref.watch(caseIntakeRepositoryProvider),
        ref.watch(authRepositoryProvider),
      ),
    );

class SpecialistAssignedCasesNotifier
    extends StateNotifier<SpecialistAssignedCasesState> {
  SpecialistAssignedCasesNotifier(
    this._ref,
    this._repository,
    this._authRepository,
  ) : super(const SpecialistAssignedCasesState());

  final Ref _ref;
  final CaseIntakeRepository _repository;
  final AuthRepository _authRepository;

  Timer? _searchDebounce;
  int _requestSerial = 0;

  static const _pageLimit = 20;
  static const _searchDebounceDuration = Duration(milliseconds: 400);

  void _ensureAuthToken() {
    final token = _ref.read(authProvider).token;
    if (token != null && token.isNotEmpty) {
      _authRepository.setAuthToken(token);
    }
  }

  void clearError() {
    state = state.copyWith(errorMessage: null, loadMoreErrorMessage: null);
  }

  Future<void> initialize() async {
    _ensureAuthToken();
    await _ref.read(caseCategoriesProvider.notifier).loadCategories();
    await _loadPage(page: 1, mode: _LoadMode.initial);
  }

  Future<void> refresh() async {
    await _loadPage(page: 1, mode: _LoadMode.refresh);
  }

  Future<void> retry() async {
    if (state.items.isEmpty) {
      await _loadPage(page: 1, mode: _LoadMode.initial);
    } else {
      await refresh();
    }
  }

  Future<void> loadMore() async {
    if (!state.canLoadMore) {
      return;
    }
    await _loadPage(page: state.pagination.page + 1, mode: _LoadMode.loadMore);
  }

  Future<void> retryLoadMore() async {
    state = state.copyWith(loadMoreErrorMessage: null);
    await loadMore();
  }

  void setStatusFilter(CaseIntakeStatus? status) {
    if (status == CaseIntakeStatus.pending) {
      return;
    }
    if (state.selectedStatus == status) {
      return;
    }
    state = state.copyWith(selectedStatus: status);
    _reloadFromFilters();
  }

  void setCategoryFilter(String? categoryId) {
    final normalized = categoryId == null || categoryId.isEmpty
        ? null
        : categoryId;
    if (state.selectedCategoryId == normalized) {
      return;
    }
    state = state.copyWith(selectedCategoryId: normalized);
    _reloadFromFilters();
  }

  void setSearchText(String value) {
    state = state.copyWith(searchText: value);
    _searchDebounce?.cancel();
    _searchDebounce = Timer(_searchDebounceDuration, () {
      _reloadFromFilters();
    });
  }

  void clearFilters() {
    _searchDebounce?.cancel();
    state = state.copyWith(
      selectedStatus: null,
      selectedCategoryId: null,
      searchText: '',
    );
    _reloadFromFilters();
  }

  void _reloadFromFilters() {
    _loadPage(page: 1, mode: _LoadMode.initial);
  }

  Future<void> _loadPage({required int page, required _LoadMode mode}) async {
    _ensureAuthToken();
    final serial = ++_requestSerial;

    switch (mode) {
      case _LoadMode.initial:
        state = state.copyWith(
          isInitialLoading: true,
          errorMessage: null,
          loadMoreErrorMessage: null,
        );
      case _LoadMode.refresh:
        state = state.copyWith(
          isRefreshing: true,
          errorMessage: null,
          loadMoreErrorMessage: null,
        );
      case _LoadMode.loadMore:
        state = state.copyWith(isLoadingMore: true, loadMoreErrorMessage: null);
    }

    final query = SpecialistAssignedQuery(
      status: state.selectedStatus,
      categoryId: state.selectedCategoryId,
      childName: state.searchText.trim().isEmpty
          ? null
          : state.searchText.trim(),
      page: page,
      limit: _pageLimit,
    );

    try {
      final result = await _repository.fetchSpecialistAssigned(query);
      if (serial != _requestSerial) {
        return;
      }

      final mergedItems = mode == _LoadMode.loadMore
          ? _mergeItems(state.items, result.items)
          : result.items;

      state = state.copyWith(
        items: mergedItems,
        pagination: result.pagination,
        isInitialLoading: false,
        isRefreshing: false,
        isLoadingMore: false,
        errorMessage: null,
        loadMoreErrorMessage: null,
      );
    } on CaseIntakeApiException catch (error) {
      if (serial != _requestSerial) {
        return;
      }
      _applyLoadError(mode, error.message);
    } catch (error) {
      if (serial != _requestSerial) {
        return;
      }
      _applyLoadError(mode, 'Failed to load assigned case requests: $error');
    }
  }

  void _applyLoadError(_LoadMode mode, String message) {
    switch (mode) {
      case _LoadMode.initial:
        state = state.copyWith(
          isInitialLoading: false,
          isRefreshing: false,
          isLoadingMore: false,
          errorMessage: message,
        );
      case _LoadMode.refresh:
        state = state.copyWith(
          isInitialLoading: false,
          isRefreshing: false,
          isLoadingMore: false,
          errorMessage: message,
        );
      case _LoadMode.loadMore:
        state = state.copyWith(
          isInitialLoading: false,
          isRefreshing: false,
          isLoadingMore: false,
          loadMoreErrorMessage: message,
        );
    }
  }

  List<SpecialistAssignedCaseItem> _mergeItems(
    List<SpecialistAssignedCaseItem> existing,
    List<SpecialistAssignedCaseItem> incoming,
  ) {
    final seen = existing.map((item) => item.id).toSet();
    final merged = [...existing];
    for (final item in incoming) {
      if (seen.add(item.id)) {
        merged.add(item);
      }
    }
    return merged;
  }

  @override
  void dispose() {
    _searchDebounce?.cancel();
    super.dispose();
  }
}

enum _LoadMode { initial, refresh, loadMore }
