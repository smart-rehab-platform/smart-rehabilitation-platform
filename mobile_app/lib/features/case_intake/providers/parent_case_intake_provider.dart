import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../auth/data/auth_repository.dart';
import '../../auth/providers/auth_provider.dart';
import '../../dashboard/data/communication_repository.dart';
import '../../dashboard/providers/communication_list_provider.dart';
import '../data/case_intake_repository.dart';
import '../models/case_intake_request_model.dart';
import '../models/case_request_attachment_model.dart';
import 'case_categories_provider.dart';

class ParentCaseIntakeState {
  const ParentCaseIntakeState({
    this.requests = const [],
    this.selectedRequest,
    this.isLoading = false,
    this.isRefreshing = false,
    this.isSubmitting = false,
    this.isUpdating = false,
    this.isUploadingAttachment = false,
    this.errorMessage,
  });

  final List<CaseIntakeRequest> requests;
  final CaseIntakeRequest? selectedRequest;
  final bool isLoading;
  final bool isRefreshing;
  final bool isSubmitting;
  final bool isUpdating;
  final bool isUploadingAttachment;
  final String? errorMessage;

  ParentCaseIntakeState copyWith({
    List<CaseIntakeRequest>? requests,
    Object? selectedRequest = _selectedSentinel,
    bool? isLoading,
    bool? isRefreshing,
    bool? isSubmitting,
    bool? isUpdating,
    bool? isUploadingAttachment,
    Object? errorMessage = _errorSentinel,
  }) {
    return ParentCaseIntakeState(
      requests: requests ?? this.requests,
      selectedRequest: identical(selectedRequest, _selectedSentinel)
          ? this.selectedRequest
          : selectedRequest as CaseIntakeRequest?,
      isLoading: isLoading ?? this.isLoading,
      isRefreshing: isRefreshing ?? this.isRefreshing,
      isSubmitting: isSubmitting ?? this.isSubmitting,
      isUpdating: isUpdating ?? this.isUpdating,
      isUploadingAttachment:
          isUploadingAttachment ?? this.isUploadingAttachment,
      errorMessage: identical(errorMessage, _errorSentinel)
          ? this.errorMessage
          : errorMessage as String?,
    );
  }
}

const _selectedSentinel = Object();
const _errorSentinel = Object();

final parentCaseIntakeProvider =
    StateNotifierProvider<ParentCaseIntakeNotifier, ParentCaseIntakeState>(
      (ref) => ParentCaseIntakeNotifier(
        ref,
        ref.watch(caseIntakeRepositoryProvider),
        ref.watch(communicationRepositoryProvider),
        ref.watch(authRepositoryProvider),
      ),
    );

class ParentCaseIntakeNotifier extends StateNotifier<ParentCaseIntakeState> {
  ParentCaseIntakeNotifier(
    this._ref,
    this._repository,
    this._communicationRepository,
    this._authRepository,
  ) : super(const ParentCaseIntakeState());

  final Ref _ref;
  final CaseIntakeRepository _repository;
  final CommunicationRepository _communicationRepository;
  final AuthRepository _authRepository;

  void _ensureAuthToken() {
    final token = _ref.read(authProvider).token;
    if (token != null && token.isNotEmpty) {
      _authRepository.setAuthToken(token);
    }
  }

  void clearError() {
    state = state.copyWith(errorMessage: null);
  }

  Future<void> loadRequests() async {
    _ensureAuthToken();
    final userId = _ref.read(authProvider).user?.id;
    if (userId == null || userId.isEmpty) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Please sign in to view case requests.',
      );
      return;
    }

    state = state.copyWith(isLoading: true, errorMessage: null);
    try {
      final requests = await _repository.fetchMyRequests();
      state = state.copyWith(isLoading: false, requests: requests);
      await enrichConversationsForLoadedRequests();
    } on CaseIntakeApiException catch (error) {
      state = state.copyWith(isLoading: false, errorMessage: error.message);
    } catch (error) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Failed to load case requests: $error',
      );
    }
  }

  Future<void> refreshRequests() async {
    _ensureAuthToken();
    state = state.copyWith(isRefreshing: true, errorMessage: null);
    try {
      final requests = await _repository.fetchMyRequests();
      state = state.copyWith(isRefreshing: false, requests: requests);
      await enrichConversationsForLoadedRequests();
    } on CaseIntakeApiException catch (error) {
      state = state.copyWith(isRefreshing: false, errorMessage: error.message);
    } catch (error) {
      state = state.copyWith(
        isRefreshing: false,
        errorMessage: 'Failed to refresh case requests: $error',
      );
    }
  }

  /// Fetches user conversations once and stamps matching [conversationId]
  /// onto loaded case requests. Safe to call after list loads; no-ops when
  /// nothing needs enrichment.
  Future<void> enrichConversationsForLoadedRequests() async {
    final needsEnrichment = state.requests.any(
      (request) =>
          (request.conversationId == null || request.conversationId!.isEmpty) &&
          (request.status?.conversationAvailable ?? false) &&
          request.assignedSpecialistId != null &&
          request.assignedSpecialistId!.isNotEmpty,
    );
    if (!needsEnrichment) {
      return;
    }

    final userId = _ref.read(authProvider).user?.id;
    if (userId == null || userId.isEmpty) {
      return;
    }

    try {
      final conversations = await _communicationRepository
          .fetchUserConversations(userId);
      if (conversations.isEmpty) {
        return;
      }

      final byCaseRequestId = <String, String>{};
      for (final conversation in conversations) {
        final caseRequestId = conversation.caseRequestId?.trim();
        if (caseRequestId != null &&
            caseRequestId.isNotEmpty &&
            conversation.id.isNotEmpty) {
          byCaseRequestId[caseRequestId] = conversation.id;
        }
      }
      if (byCaseRequestId.isEmpty) {
        return;
      }

      var changed = false;
      final updated = state.requests.map((request) {
        if (request.conversationId != null &&
            request.conversationId!.isNotEmpty) {
          return request;
        }
        final conversationId = byCaseRequestId[request.id];
        if (conversationId == null || conversationId.isEmpty) {
          return request;
        }
        changed = true;
        return request.copyWith(conversationId: conversationId);
      }).toList();

      if (!changed) {
        return;
      }

      CaseIntakeRequest? selected = state.selectedRequest;
      if (selected != null) {
        final conversationId = byCaseRequestId[selected.id];
        if ((selected.conversationId == null ||
                selected.conversationId!.isEmpty) &&
            conversationId != null) {
          selected = selected.copyWith(conversationId: conversationId);
        }
      }

      state = state.copyWith(requests: updated, selectedRequest: selected);
    } catch (_) {
      // Leave requests without conversation IDs; UI hides Open Conversation.
    }
  }

  Future<CaseIntakeRequest?> loadRequestDetails(String id) async {
    _ensureAuthToken();
    state = state.copyWith(isLoading: true, errorMessage: null);
    try {
      final request = await _repository.fetchRequestById(id);
      final enriched = await _enrichWithConversationId(request);
      state = state.copyWith(
        isLoading: false,
        selectedRequest: enriched,
        requests: _upsertRequest(enriched),
      );
      return enriched;
    } on CaseIntakeApiException catch (error) {
      state = state.copyWith(isLoading: false, errorMessage: error.message);
      return null;
    } catch (error) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Failed to load case request: $error',
      );
      return null;
    }
  }

  Future<CaseIntakeRequest?> refreshRequestDetails(String id) async {
    _ensureAuthToken();
    state = state.copyWith(isRefreshing: true, errorMessage: null);
    try {
      final request = await _repository.fetchRequestById(id);
      final enriched = await _enrichWithConversationId(request);
      state = state.copyWith(
        isRefreshing: false,
        selectedRequest: enriched,
        requests: _upsertRequest(enriched),
      );
      return enriched;
    } on CaseIntakeApiException catch (error) {
      state = state.copyWith(isRefreshing: false, errorMessage: error.message);
      return null;
    } catch (error) {
      state = state.copyWith(
        isRefreshing: false,
        errorMessage: 'Failed to refresh case request: $error',
      );
      return null;
    }
  }

  Future<CaseIntakeRequest?> createRequest(CaseIntakeRequestInput input) async {
    _ensureAuthToken();
    state = state.copyWith(isSubmitting: true, errorMessage: null);
    try {
      final request = await _repository.createRequest(input);
      state = state.copyWith(
        isSubmitting: false,
        requests: _upsertRequest(request),
        selectedRequest: request,
      );
      await refreshRequests();
      return request;
    } on CaseIntakeApiException catch (error) {
      state = state.copyWith(isSubmitting: false, errorMessage: error.message);
      return null;
    } catch (error) {
      state = state.copyWith(
        isSubmitting: false,
        errorMessage: 'Failed to submit case request: $error',
      );
      return null;
    }
  }

  Future<CaseIntakeRequest?> updateRequest(
    String id,
    CaseIntakeRequestInput input,
  ) async {
    _ensureAuthToken();
    state = state.copyWith(isUpdating: true, errorMessage: null);
    try {
      final request = await _repository.updateRequest(id, input);
      final enriched = await _enrichWithConversationId(request);
      state = state.copyWith(
        isUpdating: false,
        selectedRequest: enriched,
        requests: _upsertRequest(enriched),
      );
      await refreshRequests();
      return enriched;
    } on CaseIntakeApiException catch (error) {
      state = state.copyWith(isUpdating: false, errorMessage: error.message);
      return null;
    } catch (error) {
      state = state.copyWith(
        isUpdating: false,
        errorMessage: 'Failed to update case request: $error',
      );
      return null;
    }
  }

  Future<CaseRequestAttachment?> uploadAndAttachFile({
    required String requestId,
    required List<int> bytes,
    required String filename,
    required String mimeType,
  }) async {
    _ensureAuthToken();
    state = state.copyWith(isUploadingAttachment: true, errorMessage: null);
    try {
      final uploaded = await _repository.uploadAttachmentFile(
        bytes: bytes,
        filename: filename,
      );
      final attachment = await _repository.bindAttachment(
        requestId: requestId,
        fileUrl: uploaded.url,
        fileType: mimeType.isNotEmpty ? mimeType : uploaded.mimeType,
        originalName: filename,
      );
      await _refreshDetailAndList(requestId);
      state = state.copyWith(isUploadingAttachment: false);
      return attachment;
    } on CaseIntakeApiException catch (error) {
      state = state.copyWith(
        isUploadingAttachment: false,
        errorMessage: error.message,
      );
      return null;
    } catch (error) {
      state = state.copyWith(
        isUploadingAttachment: false,
        errorMessage: 'Failed to upload attachment: $error',
      );
      return null;
    }
  }

  Future<bool> deleteAttachment({
    required String requestId,
    required String attachmentId,
  }) async {
    _ensureAuthToken();
    state = state.copyWith(errorMessage: null);
    try {
      await _repository.deleteAttachment(
        requestId: requestId,
        attachmentId: attachmentId,
      );
      await _refreshDetailAndList(requestId);
      return true;
    } on CaseIntakeApiException catch (error) {
      state = state.copyWith(errorMessage: error.message);
      return false;
    } catch (error) {
      state = state.copyWith(
        errorMessage: 'Failed to delete attachment: $error',
      );
      return false;
    }
  }

  Future<void> _refreshDetailAndList(String requestId) async {
    final request = await _repository.fetchRequestById(requestId);
    final enriched = await _enrichWithConversationId(request);
    state = state.copyWith(
      selectedRequest: enriched,
      requests: _upsertRequest(enriched),
    );
    await refreshRequests();
  }

  Future<CaseIntakeRequest> _enrichWithConversationId(
    CaseIntakeRequest request,
  ) async {
    if (request.conversationId != null && request.conversationId!.isNotEmpty) {
      return request;
    }

    if (!request.showsConversationAction) {
      return request;
    }

    final userId = _ref.read(authProvider).user?.id;
    if (userId == null || userId.isEmpty) {
      return request;
    }

    try {
      final conversations = await _communicationRepository
          .fetchUserConversations(userId);
      for (final conversation in conversations) {
        if (conversation.caseRequestId == request.id) {
          return request.copyWith(conversationId: conversation.id);
        }
      }
    } catch (_) {
      return request;
    }

    return request;
  }

  List<CaseIntakeRequest> _upsertRequest(CaseIntakeRequest request) {
    final updated = [...state.requests];
    final index = updated.indexWhere((item) => item.id == request.id);
    if (index >= 0) {
      updated[index] = request;
    } else {
      updated.insert(0, request);
    }
    return updated;
  }
}
