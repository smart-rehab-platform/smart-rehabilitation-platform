import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../auth/data/auth_repository.dart';
import '../../auth/providers/auth_provider.dart';
import '../data/session_requests_repository.dart';
import '../models/session_requests_models.dart';
import 'session_requests_provider.dart';
import 'specialist_sessions_provider.dart';

enum SessionRequestInboxFilter {
  all('All'),
  pending('Pending'),
  approved('Approved'),
  rejected('Rejected');

  const SessionRequestInboxFilter(this.label);

  final String label;

  SessionRequestStatus? get status {
    return switch (this) {
      SessionRequestInboxFilter.pending => SessionRequestStatus.pending,
      SessionRequestInboxFilter.approved => SessionRequestStatus.approved,
      SessionRequestInboxFilter.rejected => SessionRequestStatus.rejected,
      SessionRequestInboxFilter.all => null,
    };
  }
}

class SpecialistSessionRequestsState {
  const SpecialistSessionRequestsState({
    this.isLoading = false,
    this.processingRequestId,
    this.errorMessage,
    this.requests = const [],
    this.filter = SessionRequestInboxFilter.pending,
  });

  final bool isLoading;
  final String? processingRequestId;
  final String? errorMessage;
  final List<SessionRequestItem> requests;
  final SessionRequestInboxFilter filter;

  List<SessionRequestItem> get visibleRequests {
    if (filter == SessionRequestInboxFilter.all) {
      return requests;
    }
    final status = filter.status;
    return requests.where((request) => request.status == status).toList();
  }

  SpecialistSessionRequestsState copyWith({
    bool? isLoading,
    Object? processingRequestId = _sentinel,
    Object? errorMessage = _sentinel,
    List<SessionRequestItem>? requests,
    SessionRequestInboxFilter? filter,
  }) {
    return SpecialistSessionRequestsState(
      isLoading: isLoading ?? this.isLoading,
      processingRequestId: identical(processingRequestId, _sentinel)
          ? this.processingRequestId
          : processingRequestId as String?,
      errorMessage: identical(errorMessage, _sentinel)
          ? this.errorMessage
          : errorMessage as String?,
      requests: requests ?? this.requests,
      filter: filter ?? this.filter,
    );
  }
}

const _sentinel = Object();

final specialistSessionRequestsProvider = StateNotifierProvider<
    SpecialistSessionRequestsNotifier,
    SpecialistSessionRequestsState>(
  (ref) => SpecialistSessionRequestsNotifier(
    ref,
    ref.watch(sessionRequestsRepositoryProvider),
    ref.watch(authRepositoryProvider),
  ),
);

class SpecialistSessionRequestsNotifier
    extends StateNotifier<SpecialistSessionRequestsState> {
  SpecialistSessionRequestsNotifier(
    this._ref,
    this._repository,
    this._authRepository,
  ) : super(const SpecialistSessionRequestsState());

  final Ref _ref;
  final SessionRequestsRepository _repository;
  final AuthRepository _authRepository;

  void _ensureAuthToken() {
    final token = _ref.read(authProvider).token;
    if (token != null && token.isNotEmpty) {
      _authRepository.setAuthToken(token);
    }
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
      final requests = await _loadEnrichedInbox();
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

  void setFilter(SessionRequestInboxFilter filter) {
    state = state.copyWith(filter: filter);
  }

  Future<List<SessionRequestItem>> _loadEnrichedInbox() async {
    final requests = await _repository.fetchInboxSessionRequests();
    requests.sort((a, b) {
      final aPending = a.status == SessionRequestStatus.pending ? 0 : 1;
      final bPending = b.status == SessionRequestStatus.pending ? 0 : 1;
      if (aPending != bPending) {
        return aPending.compareTo(bPending);
      }
      final aDate = a.createdAt ?? DateTime.fromMillisecondsSinceEpoch(0);
      final bDate = b.createdAt ?? DateTime.fromMillisecondsSinceEpoch(0);
      return bDate.compareTo(aDate);
    });
    return _repository.enrichWithApprovedSessions(requests);
  }

  Future<String?> approveRequest(
    String requestId,
    ApproveSessionRequestInput input,
  ) async {
    if (state.processingRequestId != null) {
      return 'Another request is already being processed.';
    }

    _ensureAuthToken();
    state = state.copyWith(processingRequestId: requestId, errorMessage: null);

    try {
      await _repository.approveSessionRequest(requestId, input);
      try {
        final requests = await _loadEnrichedInbox();
        state = state.copyWith(
          processingRequestId: null,
          requests: requests,
        );
        await _ref.read(specialistSessionsProvider.notifier).refresh();
      } catch (_) {
        state = state.copyWith(processingRequestId: null);
      }
      return null;
    } on SessionRequestsApiException catch (error) {
      if (error.statusCode == 409) {
        await refresh();
        state = state.copyWith(processingRequestId: null);
        return 'This request has already been processed.';
      }
      state = state.copyWith(
        processingRequestId: null,
        errorMessage: error.message,
      );
      return error.message;
    } catch (error) {
      final message = 'Failed to approve session request: $error';
      state = state.copyWith(
        processingRequestId: null,
        errorMessage: message,
      );
      return message;
    }
  }

  Future<String?> rejectRequest(
    String requestId,
    RejectSessionRequestInput input,
  ) async {
    if (state.processingRequestId != null) {
      return 'Another request is already being processed.';
    }

    _ensureAuthToken();
    state = state.copyWith(processingRequestId: requestId, errorMessage: null);

    try {
      await _repository.rejectSessionRequest(requestId, input);
      final requests = await _loadEnrichedInbox();
      state = state.copyWith(
        processingRequestId: null,
        requests: requests,
      );
      return null;
    } on SessionRequestsApiException catch (error) {
      if (error.statusCode == 409) {
        await refresh();
        state = state.copyWith(processingRequestId: null);
        return 'This request has already been processed.';
      }
      state = state.copyWith(
        processingRequestId: null,
        errorMessage: error.message,
      );
      return error.message;
    } catch (error) {
      final message = 'Failed to reject session request: $error';
      state = state.copyWith(
        processingRequestId: null,
        errorMessage: message,
      );
      return message;
    }
  }
}
