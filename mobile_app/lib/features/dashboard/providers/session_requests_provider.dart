import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/services/api_client.dart';
import '../../auth/data/auth_repository.dart';
import '../../auth/providers/auth_provider.dart';
import '../data/parent_dashboard_repository.dart';
import '../data/session_requests_repository.dart';
import '../models/admin_assignments_models.dart';
import '../models/parent_dashboard_models.dart';
import '../models/session_requests_models.dart';
import 'parent_dashboard_provider.dart';

final sessionRequestsRepositoryProvider = Provider<SessionRequestsRepository>((ref) {
  return SessionRequestsRepository(ref.watch(dioProvider));
});

class SessionRequestsState {
  const SessionRequestsState({
    this.isLoading = false,
    this.isSubmitting = false,
    this.errorMessage,
    this.requests = const [],
  });

  final bool isLoading;
  final bool isSubmitting;
  final String? errorMessage;
  final List<SessionRequestItem> requests;

  SessionRequestsState copyWith({
    bool? isLoading,
    bool? isSubmitting,
    Object? errorMessage = _sentinel,
    List<SessionRequestItem>? requests,
  }) {
    return SessionRequestsState(
      isLoading: isLoading ?? this.isLoading,
      isSubmitting: isSubmitting ?? this.isSubmitting,
      errorMessage: identical(errorMessage, _sentinel)
          ? this.errorMessage
          : errorMessage as String?,
      requests: requests ?? this.requests,
    );
  }
}

const _sentinel = Object();

final sessionRequestsProvider =
    StateNotifierProvider<SessionRequestsNotifier, SessionRequestsState>(
  (ref) => SessionRequestsNotifier(
    ref,
    ref.watch(sessionRequestsRepositoryProvider),
    ref.watch(parentDashboardRepositoryProvider),
    ref.watch(authRepositoryProvider),
  ),
);

class SessionRequestsNotifier extends StateNotifier<SessionRequestsState> {
  SessionRequestsNotifier(
    this._ref,
    this._repository,
    this._dashboardRepository,
    this._authRepository,
  ) : super(const SessionRequestsState());

  final Ref _ref;
  final SessionRequestsRepository _repository;
  final ParentDashboardRepository _dashboardRepository;
  final AuthRepository _authRepository;

  void _ensureAuthToken() {
    final token = _ref.read(authProvider).token;
    if (token != null && token.isNotEmpty) {
      _authRepository.setAuthToken(token);
    }
  }

  Future<List<ParentChild>> resolveChildren() async {
    final dashboardChildren = _ref.read(parentDashboardProvider).children;
    if (dashboardChildren.isNotEmpty) {
      return dashboardChildren;
    }

    final userId = _ref.read(authProvider).user?.id;
    if (userId == null || userId.isEmpty) {
      return const [];
    }

    return _dashboardRepository.fetchChildren(userId);
  }

  Future<List<PatientSpecialistLink>> fetchSpecialistsForPatient(
    String patientId,
  ) async {
    _ensureAuthToken();
    return _repository.fetchPatientSpecialists(patientId);
  }

  Future<void> initialize() async {
    _ensureAuthToken();
    final userId = _ref.read(authProvider).user?.id;
    if (userId == null || userId.isEmpty) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Please sign in to view session requests.',
      );
      return;
    }

    state = state.copyWith(isLoading: true, errorMessage: null);
    try {
      final requests = await _loadEnrichedRequests();
      state = state.copyWith(isLoading: false, requests: requests);
    } on SessionRequestsApiException catch (error) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: error.message,
      );
    } catch (error) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Failed to load session requests: $error',
      );
    }
  }

  Future<void> refresh() => initialize();

  Future<List<SessionRequestItem>> _loadEnrichedRequests() async {
    final requests = await _repository.fetchMySessionRequests();
    requests.sort((a, b) {
      final aDate = a.createdAt ?? DateTime.fromMillisecondsSinceEpoch(0);
      final bDate = b.createdAt ?? DateTime.fromMillisecondsSinceEpoch(0);
      return bDate.compareTo(aDate);
    });

    return _repository.enrichWithApprovedSessions(requests);
  }

  Future<String?> submitRequest(CreateSessionRequestInput input) async {
    if (state.isSubmitting) {
      return 'A submission is already in progress.';
    }

    _ensureAuthToken();
    state = state.copyWith(isSubmitting: true, errorMessage: null);

    try {
      await _repository.submitSessionRequest(input);
      final requests = await _loadEnrichedRequests();
      state = state.copyWith(isSubmitting: false, requests: requests);
      return null;
    } on SessionRequestsApiException catch (error) {
      state = state.copyWith(isSubmitting: false, errorMessage: error.message);
      return error.message;
    } catch (error) {
      final message = 'Failed to submit session request: $error';
      state = state.copyWith(isSubmitting: false, errorMessage: message);
      return message;
    }
  }
}
