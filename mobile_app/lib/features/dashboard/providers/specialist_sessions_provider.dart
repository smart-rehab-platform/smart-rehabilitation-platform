import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../auth/providers/auth_provider.dart';
import '../data/specialist_features_repository.dart';
import '../models/specialist_feature_models.dart';
import 'specialist_features_provider.dart';

class SpecialistSessionsState {
  const SpecialistSessionsState({
    this.isLoading = false,
    this.errorMessage,
    this.sessions = const [],
    this.searchQuery = '',
    this.filter = SessionListFilter.all,
  });

  final bool isLoading;
  final String? errorMessage;
  final List<SpecialistSessionDetail> sessions;
  final String searchQuery;
  final SessionListFilter filter;

  List<SpecialistSessionDetail> get visibleSessions {
    final query = searchQuery.trim().toLowerCase();
    return sessions.where((session) {
      if (!session.matchesFilter(filter)) {
        return false;
      }
      if (query.isEmpty) {
        return true;
      }
      return session.patientName.toLowerCase().contains(query);
    }).toList();
  }

  SpecialistSessionsState copyWith({
    bool? isLoading,
    Object? errorMessage = _sentinel,
    List<SpecialistSessionDetail>? sessions,
    String? searchQuery,
    SessionListFilter? filter,
  }) {
    return SpecialistSessionsState(
      isLoading: isLoading ?? this.isLoading,
      errorMessage: identical(errorMessage, _sentinel)
          ? this.errorMessage
          : errorMessage as String?,
      sessions: sessions ?? this.sessions,
      searchQuery: searchQuery ?? this.searchQuery,
      filter: filter ?? this.filter,
    );
  }
}

final specialistSessionsProvider =
    StateNotifierProvider<SpecialistSessionsNotifier, SpecialistSessionsState>(
  (ref) => SpecialistSessionsNotifier(
    ref,
    ref.watch(specialistFeaturesRepositoryProvider),
  ),
);

class SpecialistSessionsNotifier extends StateNotifier<SpecialistSessionsState> {
  SpecialistSessionsNotifier(this._ref, this._repository)
      : super(const SpecialistSessionsState());

  final Ref _ref;
  final SpecialistFeaturesRepository _repository;

  void _ensureAuthToken() {
    final token = _ref.read(authProvider).token;
    if (token != null && token.isNotEmpty) {
      _ref.read(authRepositoryProvider).setAuthToken(token);
    }
  }

  Future<void> initialize() async {
    _ensureAuthToken();
    final userId = _ref.read(authProvider).user?.id;
    if (userId == null || userId.isEmpty) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Please sign in to continue.',
      );
      return;
    }

    state = state.copyWith(isLoading: true, errorMessage: null);
    try {
      final sessions = await _repository.fetchSessions(userId);
      sessions.sort((a, b) {
        final aDate = a.scheduledAt ?? DateTime.fromMillisecondsSinceEpoch(0);
        final bDate = b.scheduledAt ?? DateTime.fromMillisecondsSinceEpoch(0);
        return aDate.compareTo(bDate);
      });
      state = state.copyWith(isLoading: false, sessions: sessions);
    } catch (error) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Failed to load sessions: $error',
      );
    }
  }

  Future<void> refresh() => initialize();

  void setSearchQuery(String value) =>
      state = state.copyWith(searchQuery: value);

  void setFilter(SessionListFilter filter) =>
      state = state.copyWith(filter: filter);
}

const _sentinel = Object();
