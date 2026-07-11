import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/services/api_client.dart';
import '../../auth/providers/auth_provider.dart';
import '../data/parent_profile_repository.dart';
import '../models/parent_profile_models.dart';

final parentProfileRepositoryProvider =
    Provider<ParentProfileRepository>((ref) {
  return ParentProfileRepository(ref.watch(dioProvider));
});

class ParentProfileState {
  const ParentProfileState({
    this.isLoading = false,
    this.errorMessage,
    this.bundle,
  });

  final bool isLoading;
  final String? errorMessage;
  final ParentProfileBundle? bundle;

  ParentProfileState copyWith({
    bool? isLoading,
    Object? errorMessage = _sentinel,
    ParentProfileBundle? bundle,
  }) {
    return ParentProfileState(
      isLoading: isLoading ?? this.isLoading,
      errorMessage: identical(errorMessage, _sentinel)
          ? this.errorMessage
          : errorMessage as String?,
      bundle: bundle ?? this.bundle,
    );
  }
}

final parentProfileProvider =
    StateNotifierProvider<ParentProfileNotifier, ParentProfileState>(
  (ref) => ParentProfileNotifier(
    ref,
    ref.watch(parentProfileRepositoryProvider),
  ),
);

class ParentProfileNotifier extends StateNotifier<ParentProfileState> {
  ParentProfileNotifier(this._ref, this._repository)
      : super(const ParentProfileState());

  final Ref _ref;
  final ParentProfileRepository _repository;

  void _ensureAuthToken() {
    final token = _ref.read(authProvider).token;
    if (token != null && token.isNotEmpty) {
      _ref.read(authRepositoryProvider).setAuthToken(token);
    }
  }

  Future<void> initialize() async {
    final userId = _ref.read(authProvider).user?.id;
    if (userId == null || userId.isEmpty) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Not signed in',
      );
      return;
    }

    _ensureAuthToken();
    state = state.copyWith(isLoading: true, errorMessage: null);

    try {
      final bundle = await _repository.fetchProfileBundle(userId);
      state = state.copyWith(isLoading: false, bundle: bundle);
    } catch (error) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Failed to load profile: $error',
      );
    }
  }

  Future<void> refresh() => initialize();
}

const _sentinel = Object();
