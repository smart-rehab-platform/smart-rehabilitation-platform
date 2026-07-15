import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/services/api_client.dart';
import '../../auth/data/auth_repository.dart';
import '../../auth/providers/auth_provider.dart';
import '../data/case_intake_repository.dart';
import '../models/case_category_model.dart';

final caseIntakeRepositoryProvider = Provider<CaseIntakeRepository>((ref) {
  return CaseIntakeRepository(ref.watch(dioProvider));
});

class CaseCategoriesState {
  const CaseCategoriesState({
    this.categories = const [],
    this.isLoading = false,
    this.isRefreshing = false,
    this.errorMessage,
    this.hasLoaded = false,
  });

  final List<CaseCategory> categories;
  final bool isLoading;
  final bool isRefreshing;
  final String? errorMessage;
  final bool hasLoaded;

  CaseCategoriesState copyWith({
    List<CaseCategory>? categories,
    bool? isLoading,
    bool? isRefreshing,
    Object? errorMessage = _sentinel,
    bool? hasLoaded,
  }) {
    return CaseCategoriesState(
      categories: categories ?? this.categories,
      isLoading: isLoading ?? this.isLoading,
      isRefreshing: isRefreshing ?? this.isRefreshing,
      errorMessage: identical(errorMessage, _sentinel)
          ? this.errorMessage
          : errorMessage as String?,
      hasLoaded: hasLoaded ?? this.hasLoaded,
    );
  }
}

const _sentinel = Object();

final caseCategoriesProvider =
    StateNotifierProvider<CaseCategoriesNotifier, CaseCategoriesState>(
      (ref) => CaseCategoriesNotifier(
        ref,
        ref.watch(caseIntakeRepositoryProvider),
        ref.watch(authRepositoryProvider),
      ),
    );

class CaseCategoriesNotifier extends StateNotifier<CaseCategoriesState> {
  CaseCategoriesNotifier(this._ref, this._repository, this._authRepository)
    : super(const CaseCategoriesState());

  final Ref _ref;
  final CaseIntakeRepository _repository;
  final AuthRepository _authRepository;

  void _ensureAuthToken() {
    final token = _ref.read(authProvider).token;
    if (token != null && token.isNotEmpty) {
      _authRepository.setAuthToken(token);
    }
  }

  Future<void> loadCategories({bool force = false}) async {
    if (state.hasLoaded && state.categories.isNotEmpty && !force) {
      return;
    }

    _ensureAuthToken();
    state = state.copyWith(isLoading: true, errorMessage: null);

    try {
      final categories = await _repository.fetchActiveCategories();
      state = state.copyWith(
        isLoading: false,
        categories: categories,
        hasLoaded: true,
      );
    } on CaseIntakeApiException catch (error) {
      state = state.copyWith(isLoading: false, errorMessage: error.message);
    } catch (error) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Failed to load categories: $error',
      );
    }
  }

  Future<void> refreshCategories() async {
    _ensureAuthToken();
    state = state.copyWith(isRefreshing: true, errorMessage: null);

    try {
      final categories = await _repository.fetchActiveCategories();
      state = state.copyWith(
        isRefreshing: false,
        categories: categories,
        hasLoaded: true,
      );
    } on CaseIntakeApiException catch (error) {
      state = state.copyWith(isRefreshing: false, errorMessage: error.message);
    } catch (error) {
      state = state.copyWith(
        isRefreshing: false,
        errorMessage: 'Failed to refresh categories: $error',
      );
    }
  }
}
