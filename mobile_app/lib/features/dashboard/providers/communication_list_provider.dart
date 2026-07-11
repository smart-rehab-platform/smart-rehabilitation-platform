import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/services/api_client.dart';
import '../../auth/providers/auth_provider.dart';
import '../data/communication_repository.dart';
import '../models/communication_models.dart';

final communicationRepositoryProvider = Provider<CommunicationRepository>((
  ref,
) {
  return CommunicationRepository(ref.watch(dioProvider));
});

class CommunicationListState {
  const CommunicationListState({
    this.isLoading = false,
    this.isRefreshing = false,
    this.hasLoaded = false,
    this.errorMessage,
    this.conversations = const [],
  });

  final bool isLoading;
  final bool isRefreshing;
  final bool hasLoaded;
  final String? errorMessage;
  final List<CommunicationConversation> conversations;

  bool get isEmpty =>
      hasLoaded && conversations.isEmpty && errorMessage == null;

  CommunicationListState copyWith({
    bool? isLoading,
    bool? isRefreshing,
    bool? hasLoaded,
    Object? errorMessage = _sentinel,
    List<CommunicationConversation>? conversations,
  }) {
    return CommunicationListState(
      isLoading: isLoading ?? this.isLoading,
      isRefreshing: isRefreshing ?? this.isRefreshing,
      hasLoaded: hasLoaded ?? this.hasLoaded,
      errorMessage: identical(errorMessage, _sentinel)
          ? this.errorMessage
          : errorMessage as String?,
      conversations: conversations ?? this.conversations,
    );
  }
}

const _sentinel = Object();

final communicationListProvider =
    StateNotifierProvider<CommunicationListNotifier, CommunicationListState>(
      (ref) => CommunicationListNotifier(
        ref,
        ref.watch(communicationRepositoryProvider),
      ),
    );

class CommunicationListNotifier extends StateNotifier<CommunicationListState> {
  CommunicationListNotifier(this._ref, this._repository)
    : super(const CommunicationListState());

  final Ref _ref;
  final CommunicationRepository _repository;

  void _ensureAuthToken() {
    final token = _ref.read(authProvider).token;
    if (token != null && token.isNotEmpty) {
      _ref.read(authRepositoryProvider).setAuthToken(token);
    }
  }

  String _formatError(Object error) {
    if (error is CommunicationApiException) {
      final parts = <String>[error.message];
      if (error.statusCode != null) {
        parts.add('(HTTP ${error.statusCode})');
      }
      return parts.join(' ');
    }
    return error.toString();
  }

  Future<void> initialize() async {
    final userId = _ref.read(authProvider).user?.id;
    if (userId == null || userId.isEmpty) {
      state = state.copyWith(
        isLoading: false,
        hasLoaded: true,
        errorMessage: 'You must be signed in to view messages.',
      );
      return;
    }

    _ensureAuthToken();
    state = state.copyWith(
      isLoading: !state.hasLoaded,
      isRefreshing: state.hasLoaded,
      errorMessage: null,
    );

    try {
      final conversations = await _repository.fetchUserConversations(userId);
      state = state.copyWith(
        isLoading: false,
        isRefreshing: false,
        hasLoaded: true,
        conversations: conversations,
      );
    } catch (error) {
      state = state.copyWith(
        isLoading: false,
        isRefreshing: false,
        hasLoaded: true,
        errorMessage: _formatError(error),
      );
    }
  }

  Future<void> refresh() => initialize();
}
