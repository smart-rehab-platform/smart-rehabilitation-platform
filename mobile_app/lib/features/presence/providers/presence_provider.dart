import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/services/api_client.dart';
import '../data/presence_repository.dart';
import '../data/presence_socket_service.dart';
import '../models/presence_status.dart';

final presenceRepositoryProvider = Provider<PresenceRepository>((ref) {
  return PresenceRepository(ref.watch(dioProvider));
});

final presenceSocketServiceProvider = Provider<PresenceSocketService>((ref) {
  final service = PresenceSocketService();
  ref.onDispose(service.disconnect);
  return service;
});

class PresenceState {
  const PresenceState({
    this.statusByUserId = const {},
    this.isLoading = false,
    this.isConnected = false,
    this.errorMessage,
  });

  final Map<String, PresenceStatus> statusByUserId;
  final bool isLoading;
  final bool isConnected;
  final String? errorMessage;

  PresenceStatus? statusFor(String? userId) {
    if (userId == null || userId.isEmpty) {
      return null;
    }
    return statusByUserId[userId];
  }

  PresenceState copyWith({
    Map<String, PresenceStatus>? statusByUserId,
    bool? isLoading,
    bool? isConnected,
    Object? errorMessage = _sentinel,
  }) {
    return PresenceState(
      statusByUserId: statusByUserId ?? this.statusByUserId,
      isLoading: isLoading ?? this.isLoading,
      isConnected: isConnected ?? this.isConnected,
      errorMessage: identical(errorMessage, _sentinel)
          ? this.errorMessage
          : errorMessage as String?,
    );
  }
}

class PresenceNotifier extends StateNotifier<PresenceState> {
  PresenceNotifier(this._repository, this._socketService)
      : super(const PresenceState());

  final PresenceRepository _repository;
  final PresenceSocketService _socketService;

  Future<void> connect(String token) async {
    _socketService.connect(
      token: token,
      onUserOnline: _applyOnline,
      onUserOffline: _applyOffline,
    );

    state = state.copyWith(isConnected: _socketService.isConnected, errorMessage: null);
    await refreshFromApi();
  }

  Future<void> disconnect() async {
    await _socketService.disconnect();
    state = const PresenceState();
  }

  Future<void> refreshFromApi() async {
    state = state.copyWith(isLoading: true, errorMessage: null);

    try {
      final rows = await _repository.fetchAllUsers();
      final nextMap = Map<String, PresenceStatus>.from(state.statusByUserId);
      for (final row in rows) {
        nextMap[row.userId] = row;
      }

      state = state.copyWith(
        statusByUserId: nextMap,
        isLoading: false,
      );
    } catch (error) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Failed to load presence: $error',
      );
    }
  }

  Future<void> refreshUser(String userId) async {
    if (userId.isEmpty) {
      return;
    }

    try {
      final status = await _repository.fetchUser(userId);
      if (status == null) {
        return;
      }

      state = state.copyWith(
        statusByUserId: {
          ...state.statusByUserId,
          userId: status,
        },
      );
    } catch (_) {
      // Presence refresh failures are non-critical for chat UI.
    }
  }

  void _applyOnline(PresenceStatus status) {
    final current = state.statusByUserId[status.userId];
    state = state.copyWith(
      statusByUserId: {
        ...state.statusByUserId,
        status.userId: (current ?? status).copyWith(
          isOnline: true,
          clearLastSeen: true,
        ),
      },
    );
  }

  void _applyOffline(PresenceStatus status) {
    final current = state.statusByUserId[status.userId];
    state = state.copyWith(
      statusByUserId: {
        ...state.statusByUserId,
        status.userId: (current ?? status).copyWith(
          isOnline: false,
          lastSeen: status.lastSeen ?? DateTime.now(),
        ),
      },
    );
  }
}

final presenceProvider =
    StateNotifierProvider<PresenceNotifier, PresenceState>((ref) {
  return PresenceNotifier(
    ref.watch(presenceRepositoryProvider),
    ref.watch(presenceSocketServiceProvider),
  );
});

const _sentinel = Object();
