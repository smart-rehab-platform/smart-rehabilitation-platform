import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/services/api_client.dart';
import '../../auth/providers/auth_provider.dart';
import '../data/parent_ai_chat_repository.dart';
import '../models/parent_ai_chat_models.dart';

final parentAiChatRepositoryProvider = Provider<ParentAiChatRepository>((ref) {
  return ParentAiChatRepository(ref.watch(dioProvider));
});

class ParentAiChatState {
  const ParentAiChatState({
    this.isLoading = false,
    this.isSending = false,
    this.errorMessage,
    this.conversationId,
    this.patientId,
    this.patientName,
    this.messages = const [],
  });

  final bool isLoading;
  final bool isSending;
  final String? errorMessage;
  final String? conversationId;
  final String? patientId;
  final String? patientName;
  final List<ParentAiChatMessage> messages;

  ParentAiChatState copyWith({
    bool? isLoading,
    bool? isSending,
    Object? errorMessage = _sentinel,
    Object? conversationId = _sentinel,
    Object? patientId = _sentinel,
    Object? patientName = _sentinel,
    List<ParentAiChatMessage>? messages,
  }) {
    return ParentAiChatState(
      isLoading: isLoading ?? this.isLoading,
      isSending: isSending ?? this.isSending,
      errorMessage: identical(errorMessage, _sentinel)
          ? this.errorMessage
          : errorMessage as String?,
      conversationId: identical(conversationId, _sentinel)
          ? this.conversationId
          : conversationId as String?,
      patientId: identical(patientId, _sentinel)
          ? this.patientId
          : patientId as String?,
      patientName: identical(patientName, _sentinel)
          ? this.patientName
          : patientName as String?,
      messages: messages ?? this.messages,
    );
  }
}

const _sentinel = Object();

/// Scoped per selected child [patientId] so sibling conversations never mix.
final parentAiChatProvider = StateNotifierProvider.family<
    ParentAiChatNotifier, ParentAiChatState, String>(
  (ref, patientId) => ParentAiChatNotifier(
    ref,
    ref.watch(parentAiChatRepositoryProvider),
    patientId,
  ),
);

class ParentAiChatNotifier extends StateNotifier<ParentAiChatState> {
  ParentAiChatNotifier(this._ref, this._repository, this._patientId)
      : super(ParentAiChatState(patientId: _patientId));

  final Ref _ref;
  final ParentAiChatRepository _repository;
  final String _patientId;

  void _ensureAuthToken() {
    final token = _ref.read(authProvider).token;
    if (token != null && token.isNotEmpty) {
      _ref.read(authRepositoryProvider).setAuthToken(token);
    } else {
      debugPrint('[ParentAiChat] Warning: no auth token available before request');
    }
  }

  String _formatError(Object error) {
    if (error is ParentAiChatApiException) {
      final parts = <String>[error.message];
      if (error.statusCode != null) {
        parts.add('(HTTP ${error.statusCode})');
      }
      return parts.join(' ');
    }
    return error.toString();
  }

  Future<void> initialize({String? patientName}) async {
    if (_patientId.trim().isEmpty) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'A child must be selected before using the AI assistant.',
      );
      return;
    }

    _ensureAuthToken();
    state = state.copyWith(
      isLoading: true,
      errorMessage: null,
      patientId: _patientId,
      patientName: patientName,
      conversationId: null,
      messages: const [],
    );

    try {
      final conversations = await _repository.fetchConversations(
        patientId: _patientId,
      );

      ParentAiChatConversation conversation;
      final matching = conversations
          .where((item) => item.patientId == _patientId)
          .toList();

      if (matching.isNotEmpty) {
        conversation = matching.first;
      } else {
        conversation = await _repository.createConversation(patientId: _patientId);
      }

      if (conversation.patientId != null &&
          conversation.patientId!.isNotEmpty &&
          conversation.patientId != _patientId) {
        throw ParentAiChatApiException(
          message: 'Conversation belongs to a different child.',
        );
      }

      final messages = await _repository.fetchMessages(conversation.id);
      state = state.copyWith(
        isLoading: false,
        conversationId: conversation.id,
        messages: messages,
      );
    } catch (error) {
      final message = _formatError(error);
      debugPrint('[ParentAiChat] initialize failed: $message');
      state = state.copyWith(
        isLoading: false,
        errorMessage: message,
      );
    }
  }

  Future<void> refresh({String? patientName}) =>
      initialize(patientName: patientName ?? state.patientName);

  Future<ParentAiChatSendResult> _sendWithFallback({
    required String content,
    required String? conversationId,
  }) async {
    if (_patientId.trim().isEmpty) {
      throw ParentAiChatApiException(
        message: 'A child must be selected before using the AI assistant.',
      );
    }

    if (conversationId == null || conversationId.isEmpty) {
      debugPrint('[ParentAiChat] No conversation id, using POST /ai/chat/ask');
      return _repository.ask(
        content: content,
        patientId: _patientId,
      );
    }

    try {
      return await _repository.sendMessage(
        conversationId: conversationId,
        content: content,
        patientId: _patientId,
      );
    } on ParentAiChatApiException catch (error) {
      debugPrint(
        '[ParentAiChat] sendMessage failed (${error.statusCode}): ${error.message}',
      );

      if (error.statusCode == 404 || error.statusCode == 403) {
        debugPrint('[ParentAiChat] Falling back to POST /ai/chat/ask');
        return _repository.ask(
          content: content,
          patientId: _patientId,
          conversationId: conversationId,
        );
      }

      rethrow;
    }
  }

  Future<String?> sendMessage(String content) async {
    final trimmed = content.trim();
    if (trimmed.isEmpty || state.isSending) {
      return null;
    }

    if (_patientId.trim().isEmpty) {
      return 'A child must be selected before using the AI assistant.';
    }

    _ensureAuthToken();
    final pendingId = 'pending-${DateTime.now().millisecondsSinceEpoch}';
    final optimistic = ParentAiChatMessage(
      id: pendingId,
      conversationId: state.conversationId ?? '',
      sender: 'user',
      content: trimmed,
      createdAt: DateTime.now(),
      isPending: true,
    );

    state = state.copyWith(
      isSending: true,
      errorMessage: null,
      messages: [...state.messages, optimistic],
    );

    try {
      final result = await _sendWithFallback(
        content: trimmed,
        conversationId: state.conversationId,
      );

      final withoutPending = state.messages
          .where((message) => message.id != pendingId)
          .toList();

      state = state.copyWith(
        isSending: false,
        conversationId: result.conversation?.id ?? state.conversationId,
        messages: [
          ...withoutPending,
          result.userMessage,
          result.botMessage,
        ],
      );
      return null;
    } catch (error) {
      final message = _formatError(error);
      debugPrint('[ParentAiChat] sendMessage failed: $message');
      if (error is ParentAiChatApiException) {
        debugPrint('[ParentAiChat] Backend response data: ${error.responseData}');
      }

      final updated = state.messages
          .map(
            (item) => item.id == pendingId
                ? item.copyWith(isPending: false, hasFailed: true)
                : item,
          )
          .toList();
      state = state.copyWith(
        isSending: false,
        errorMessage: message,
        messages: updated,
      );
      return message;
    }
  }
}
