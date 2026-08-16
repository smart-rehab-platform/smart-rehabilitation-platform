import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../auth/providers/auth_provider.dart';
import '../data/communication_repository.dart';
import '../models/communication_models.dart';
import '../presentation/communication/communication_attachment_picker.dart';
import 'communication_list_provider.dart';

final communicationThreadProvider =
    StateNotifierProvider.family<
      CommunicationThreadNotifier,
      CommunicationThreadState,
      String
    >((ref, conversationId) {
      final notifier = CommunicationThreadNotifier(
        ref,
        ref.read(communicationRepositoryProvider),
        conversationId,
      );
      ref.onDispose(notifier.disposePolling);
      return notifier;
    });

class CommunicationThreadState {
  const CommunicationThreadState({
    this.isLoading = false,
    this.isRefreshing = false,
    this.isSending = false,
    this.isUploadingAttachment = false,
    this.uploadProgress,
    this.hasLoaded = false,
    this.errorMessage,
    this.sendErrorMessage,
    this.conversation,
    this.messages = const [],
    this.pendingAttachment,
  });

  final bool isLoading;
  final bool isRefreshing;
  final bool isSending;
  final bool isUploadingAttachment;
  final double? uploadProgress;
  final bool hasLoaded;
  final String? errorMessage;
  final String? sendErrorMessage;
  final CommunicationConversation? conversation;
  final List<CommunicationMessage> messages;
  final CommunicationAttachmentSelection? pendingAttachment;

  bool get hasPendingAttachment => pendingAttachment != null;

  bool get isEmpty => hasLoaded && messages.isEmpty && errorMessage == null;

  CommunicationThreadState copyWith({
    bool? isLoading,
    bool? isRefreshing,
    bool? isSending,
    bool? isUploadingAttachment,
    Object? uploadProgress = _sentinel,
    bool? hasLoaded,
    Object? errorMessage = _sentinel,
    Object? sendErrorMessage = _sentinel,
    CommunicationConversation? conversation,
    List<CommunicationMessage>? messages,
    Object? pendingAttachment = _sentinel,
  }) {
    return CommunicationThreadState(
      isLoading: isLoading ?? this.isLoading,
      isRefreshing: isRefreshing ?? this.isRefreshing,
      isSending: isSending ?? this.isSending,
      isUploadingAttachment:
          isUploadingAttachment ?? this.isUploadingAttachment,
      uploadProgress: identical(uploadProgress, _sentinel)
          ? this.uploadProgress
          : uploadProgress as double?,
      hasLoaded: hasLoaded ?? this.hasLoaded,
      errorMessage: identical(errorMessage, _sentinel)
          ? this.errorMessage
          : errorMessage as String?,
      sendErrorMessage: identical(sendErrorMessage, _sentinel)
          ? this.sendErrorMessage
          : sendErrorMessage as String?,
      conversation: conversation ?? this.conversation,
      messages: messages ?? this.messages,
      pendingAttachment: identical(pendingAttachment, _sentinel)
          ? this.pendingAttachment
          : pendingAttachment as CommunicationAttachmentSelection?,
    );
  }
}

const _sentinel = Object();

class CommunicationThreadNotifier
    extends StateNotifier<CommunicationThreadState> {
  CommunicationThreadNotifier(this._ref, this._repository, this._conversationId)
    : super(const CommunicationThreadState());

  final Ref _ref;
  final CommunicationRepository _repository;
  final String _conversationId;

  Timer? _pollTimer;
  bool _pollInFlight = false;
  bool _markReadInFlight = false;
  bool _notifierDisposed = false;

  void setPendingAttachment(CommunicationAttachmentSelection? selection) {
    if (_notifierDisposed) {
      return;
    }
    state = state.copyWith(pendingAttachment: selection);
  }

  void clearPendingAttachment() {
    if (_notifierDisposed) {
      return;
    }
    state = state.copyWith(pendingAttachment: null);
  }

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

  List<CommunicationMessage> _mergeMessages(
    List<CommunicationMessage> current,
    List<CommunicationMessage> incoming,
  ) {
    final byId = <String, CommunicationMessage>{};
    for (final message in [...current, ...incoming]) {
      if (message.id.isEmpty) {
        continue;
      }
      final existing = byId[message.id];
      byId[message.id] = existing == null
          ? message
          : _pickRicherMessage(existing, message);
    }
    final merged = byId.values.toList()
      ..sort((a, b) {
        final aTime = a.sentAt ?? DateTime.fromMillisecondsSinceEpoch(0);
        final bTime = b.sentAt ?? DateTime.fromMillisecondsSinceEpoch(0);
        return aTime.compareTo(bTime);
      });
    return merged;
  }

  CommunicationMessage _pickRicherMessage(
    CommunicationMessage existing,
    CommunicationMessage incoming,
  ) {
    final preferred = incoming.attachments.length >= existing.attachments.length
        ? incoming
        : existing;
    final fallback = identical(preferred, incoming) ? existing : incoming;

    return preferred.copyWith(
      isRead: existing.isRead || incoming.isRead,
      senderName: preferred.senderName ?? fallback.senderName,
      senderRole: preferred.senderRole ?? fallback.senderRole,
      attachments: preferred.attachments.length >= existing.attachments.length
          ? preferred.attachments
          : existing.attachments,
      content: preferred.content.trim().isNotEmpty
          ? preferred.content
          : fallback.content,
    );
  }

  Future<void> initialize({CommunicationConversation? conversation}) async {
    _ensureAuthToken();
    state = state.copyWith(
      isLoading: true,
      errorMessage: null,
      conversation: conversation ?? state.conversation,
    );

    try {
      final resolvedConversation =
          conversation ??
          state.conversation ??
          await _repository.fetchConversation(_conversationId);
      final messages = await _repository.fetchMessages(_conversationId);

      if (_notifierDisposed) {
        return;
      }

      state = state.copyWith(
        isLoading: false,
        hasLoaded: true,
        conversation: resolvedConversation,
        messages: messages,
      );

      await _markUnreadIncomingAsRead();
      startPolling();
    } catch (error) {
      if (_notifierDisposed) {
        return;
      }
      state = state.copyWith(
        isLoading: false,
        hasLoaded: true,
        errorMessage: _formatError(error),
      );
    }
  }

  Future<void> refreshMessages({bool silent = false}) async {
    if (_notifierDisposed) {
      return;
    }

    if (!silent) {
      state = state.copyWith(isRefreshing: true, errorMessage: null);
    }

    _ensureAuthToken();

    try {
      final messages = await _repository.fetchMessages(_conversationId);
      if (_notifierDisposed) {
        return;
      }

      state = state.copyWith(
        isRefreshing: false,
        hasLoaded: true,
        messages: _mergeMessages(state.messages, messages),
      );
      await _markUnreadIncomingAsRead();
    } catch (error) {
      if (_notifierDisposed) {
        return;
      }
      if (!silent) {
        state = state.copyWith(
          isRefreshing: false,
          errorMessage: _formatError(error),
        );
      }
    }
  }

  void startPolling() {
    _pollTimer?.cancel();
    _pollTimer = Timer.periodic(const Duration(seconds: 5), (_) {
      _pollTick();
    });
  }

  void disposePolling() {
    _notifierDisposed = true;
    _pollTimer?.cancel();
    _pollTimer = null;
  }

  Future<void> _pollTick() async {
    if (_notifierDisposed ||
        _pollInFlight ||
        state.isLoading ||
        state.isSending ||
        state.isUploadingAttachment) {
      return;
    }
    _pollInFlight = true;
    try {
      await refreshMessages(silent: true);
    } finally {
      _pollInFlight = false;
    }
  }

  Future<String?> sendMessage(String content) async {
    final trimmed = content.trim();
    if (trimmed.isEmpty ||
        state.isSending ||
        state.isUploadingAttachment ||
        _notifierDisposed) {
      return null;
    }

    _ensureAuthToken();
    state = state.copyWith(isSending: true, sendErrorMessage: null);

    try {
      final sent = await _repository.sendMessage(
        conversationId: _conversationId,
        content: trimmed,
      );

      if (_notifierDisposed) {
        return null;
      }

      state = state.copyWith(
        isSending: false,
        messages: _mergeMessages(state.messages, [
          sent.copyWith(
            senderName: _ref.read(authProvider).user?.fullName,
            senderRole: _ref.read(authProvider).user?.role,
          ),
        ]),
      );
      return null;
    } catch (error) {
      if (_notifierDisposed) {
        return null;
      }
      final message = _formatError(error);
      debugPrint('[CommunicationThread] send failed: $message');
      state = state.copyWith(isSending: false, sendErrorMessage: message);
      return message;
    }
  }

  Future<String?> sendAttachment({
    required CommunicationAttachmentSelection selection,
    String? caption,
  }) async {
    if (_notifierDisposed) {
      return 'Unable to send attachment right now. Please reopen the chat.';
    }
    if (state.isSending || state.isUploadingAttachment) {
      return 'Please wait for the current send to finish.';
    }
    if (selection.bytes.isEmpty) {
      return 'The selected file could not be read. Please choose it again.';
    }

    _ensureAuthToken();
    state = state.copyWith(
      isUploadingAttachment: true,
      isSending: true,
      uploadProgress: 0.0,
      sendErrorMessage: null,
    );

    try {
      debugPrint('[CommunicationThread] Starting attachment upload');
      final uploaded = await _repository.uploadMessageAttachment(
        bytes: selection.bytes,
        filename: selection.filename,
        onProgress: (sent, total) {
          if (_notifierDisposed || total <= 0) {
            return;
          }
          state = state.copyWith(uploadProgress: sent / total.toDouble());
        },
      );

      debugPrint('[CommunicationThread] Creating attachment message');
      final mimeType = uploaded.mimeType.isNotEmpty
          ? uploaded.mimeType
          : selection.mimeType;

      final sent = await _repository.sendAttachmentMessage(
        conversationId: _conversationId,
        fileUrl: uploaded.url,
        fileType: mimeType,
        caption: caption,
      );

      if (_notifierDisposed) {
        return 'Unable to send attachment right now. Please reopen the chat.';
      }

      state = state.copyWith(
        isSending: false,
        isUploadingAttachment: false,
        uploadProgress: null,
        pendingAttachment: null,
        messages: _mergeMessages(state.messages, [
          sent.copyWith(
            senderName: _ref.read(authProvider).user?.fullName,
            senderRole: _ref.read(authProvider).user?.role,
          ),
        ]),
      );
      return null;
    } catch (error) {
      if (_notifierDisposed) {
        return 'Unable to send attachment right now. Please reopen the chat.';
      }
      final message = _formatError(error);
      debugPrint('[CommunicationThread] attachment send failed: $message');
      state = state.copyWith(
        isSending: false,
        isUploadingAttachment: false,
        uploadProgress: null,
        sendErrorMessage: message,
      );
      return message;
    }
  }

  Future<void> _markUnreadIncomingAsRead() async {
    if (_notifierDisposed) {
      return;
    }

    final userId = _ref.read(authProvider).user?.id;
    if (userId == null || userId.isEmpty) {
      return;
    }

    final hasUnreadIncoming = state.messages.any(
      (message) => message.isIncomingFor(userId) && !message.isRead,
    );

    if (!hasUnreadIncoming || _markReadInFlight) {
      return;
    }

    _ensureAuthToken();
    _markReadInFlight = true;

    try {
      await _repository.markConversationMessagesRead(_conversationId);
      if (_notifierDisposed) {
        return;
      }

      state = state.copyWith(
        messages: [
          for (final message in state.messages)
            message.isIncomingFor(userId)
                ? message.copyWith(isRead: true)
                : message,
        ],
      );
    } catch (error) {
      debugPrint(
        '[CommunicationThread] mark conversation read failed: $error',
      );
    } finally {
      _markReadInFlight = false;
    }
  }
}
