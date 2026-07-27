import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../../../core/constants/dashboard_colors.dart';
import '../../../../core/theme/dashboard_theme.dart';
import '../../../auth/providers/auth_provider.dart';
import '../../../presence/widgets/chat_presence_subtitle.dart';
import '../../models/communication_models.dart';
import '../../providers/communication_thread_provider.dart';
import '../../providers/conversation_notification_read.dart';
import '../../widgets/dashboard_layout.dart';
import '../../widgets/dashboard_components.dart';
import '../../widgets/parent_dashboard_cards.dart';
import 'communication_attachment_picker.dart';
import 'communication_attachment_widgets.dart';

class CommunicationChatScreen extends ConsumerStatefulWidget {
  const CommunicationChatScreen({
    super.key,
    required this.conversationId,
    this.initialConversation,
  });

  final String conversationId;
  final CommunicationConversation? initialConversation;

  @override
  ConsumerState<CommunicationChatScreen> createState() =>
      _CommunicationChatScreenState();
}

class _CommunicationChatScreenState
    extends ConsumerState<CommunicationChatScreen> {
  final _inputController = TextEditingController();
  final _scrollController = ScrollController();
  bool _showScrollToLatest = false;
  bool _initialScrollDone = false;
  final Set<String> _processedConversationNotificationIds = {};
  bool _notificationSyncInFlight = false;

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      await ref
          .read(communicationThreadProvider(widget.conversationId).notifier)
          .initialize(conversation: widget.initialConversation);
      if (!mounted) {
        return;
      }
      await _syncConversationNotificationsRead();
    });
  }

  Future<void> _syncConversationNotificationsRead({
    bool refreshNotifications = false,
  }) async {
    if (_notificationSyncInFlight || !mounted) {
      return;
    }

    _notificationSyncInFlight = true;
    try {
      if (refreshNotifications) {
        await refreshRoleNotifications(ref);
      } else {
        await ensureRoleNotificationsLoaded(ref);
      }

      if (!mounted) {
        return;
      }

      final processed = await markConversationMessageNotificationsRead(
        ref,
        widget.conversationId,
        skipIds: _processedConversationNotificationIds,
      );
      _processedConversationNotificationIds.addAll(processed);
    } finally {
      _notificationSyncInFlight = false;
    }
  }

  Future<void> _handleNewIncomingChatActivity() async {
    await _syncConversationNotificationsRead(refreshNotifications: true);
  }

  @override
  void dispose() {
    _scrollController.removeListener(_onScroll);
    _inputController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (!_scrollController.hasClients || !mounted) {
      return;
    }
    final nearBottom = _isNearBottom();
    if (_showScrollToLatest != !nearBottom) {
      setState(() => _showScrollToLatest = !nearBottom);
    }
  }

  bool _isNearBottom({double threshold = 120}) {
    if (!_scrollController.hasClients) {
      return true;
    }
    final position = _scrollController.position;
    return position.maxScrollExtent - position.pixels <= threshold;
  }

  void _scrollToLatest({bool force = false}) {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!_scrollController.hasClients) {
        return;
      }
      if (!force && !_isNearBottom()) {
        return;
      }
      _scrollController.animateTo(
        _scrollController.position.maxScrollExtent,
        duration: const Duration(milliseconds: 250),
        curve: Curves.easeOut,
      );
    });
  }

  Future<void> _send() async {
    debugPrint(
      '[CHAT_ATTACH] SEND ENTERED '
      'attachment=${ref.read(communicationThreadProvider(widget.conversationId)).pendingAttachment} '
      'text=${_inputController.text}',
    );

    final currentState = ref.read(
      communicationThreadProvider(widget.conversationId),
    );
    final notifier = ref.read(
      communicationThreadProvider(widget.conversationId).notifier,
    );
    final attachment = currentState.pendingAttachment;
    final text = _inputController.text.trim();

    if (attachment != null) {
      debugPrint('[CHAT_ATTACH] ATTACHMENT BRANCH');
      final error = await notifier.sendAttachment(
        selection: attachment,
        caption: text.isEmpty ? null : text,
      );

      if (error == null) {
        _inputController.clear();
        _scrollToLatest(force: true);
      } else if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(error), duration: const Duration(seconds: 5)),
        );
      }
      return;
    }

    if (text.isNotEmpty) {
      debugPrint('[CHAT_ATTACH] TEXT BRANCH');
      final error = await notifier.sendMessage(text);

      if (error == null) {
        _inputController.clear();
        _scrollToLatest(force: true);
      } else if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(error), duration: const Duration(seconds: 5)),
        );
      }
    }
  }

  Future<void> _pickAttachment() async {
    final state = ref.read(communicationThreadProvider(widget.conversationId));
    if (state.isSending || state.isUploadingAttachment) {
      return;
    }

    await showCommunicationAttachmentSheet(
      context: context,
      onSelected: (selection) async {
        ref
            .read(communicationThreadProvider(widget.conversationId).notifier)
            .setPendingAttachment(selection);
        if (mounted) {
          setState(() {});
        }
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(communicationThreadProvider(widget.conversationId));
    final auth = ref.watch(authProvider);
    final role = auth.user?.role;
    final userId = auth.user?.id;
    final conversation = state.conversation ?? widget.initialConversation;
    final theme = Theme.of(context);

    ref.listen(communicationThreadProvider(widget.conversationId), (
      previous,
      next,
    ) {
      if (previous == null) {
        return;
      }

      final hadMessages = previous.messages.length;
      final hasMessages = next.messages.length;
      if (!next.isLoading && hasMessages > 0 && !_initialScrollDone) {
        _initialScrollDone = true;
        _scrollToLatest(force: true);
        return;
      }

      if (hasMessages > hadMessages) {
        final lastMessage = next.messages.last;
        if (lastMessage.isFromAuthenticatedUser(userId)) {
          _scrollToLatest(force: true);
        } else {
          _scrollToLatest();
        }

        if (userId != null && userId.isNotEmpty) {
          final previousIds = previous.messages
              .map((message) => message.id)
              .toSet();
          final hasNewIncoming = next.messages.any(
            (message) =>
                !previousIds.contains(message.id) &&
                message.isIncomingFor(userId),
          );
          if (hasNewIncoming) {
            _handleNewIncomingChatActivity();
          }
        }
      }
    });

    final headerParticipant =
        conversation?.otherParticipantName(role) ?? 'Messages';
    final headerSubtitle = conversation?.conversationSubtitle();
    final otherParticipantId = conversation?.otherParticipantId(role) ?? '';

    return Theme(
      data: DashboardTheme.light,
      child: Scaffold(
        backgroundColor: DashboardColors.background,
        appBar: AppBar(
          backgroundColor: DashboardColors.background,
          surfaceTintColor: Colors.transparent,
          leading: IconButton(
            icon: const Icon(Icons.arrow_back_rounded),
            onPressed: () => Navigator.of(context).maybePop(),
          ),
          title: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                headerParticipant,
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w700,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              if (otherParticipantId.isNotEmpty)
                ChatPresenceSubtitle(userId: otherParticipantId),
              if (headerSubtitle != null)
                Text(
                  headerSubtitle,
                  style: theme.textTheme.labelSmall?.copyWith(
                    color: DashboardColors.textSecondary,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
            ],
          ),
        ),
        body: SafeArea(
          child: CommunicationAudioPlaybackScope(
            child: Column(
              children: [
                Expanded(child: _buildBody(context, state, userId, theme)),
                _buildComposer(context, state),
              ],
            ),
          ),
        ),
        floatingActionButton: _showScrollToLatest
            ? FloatingActionButton.small(
                onPressed: () => _scrollToLatest(force: true),
                backgroundColor: DashboardColors.brandCyan,
                foregroundColor: Colors.white,
                child: const Icon(Icons.arrow_downward_rounded),
              )
            : null,
      ),
    );
  }

  Widget _buildBody(
    BuildContext context,
    CommunicationThreadState state,
    String? userId,
    ThemeData theme,
  ) {
    if (state.isLoading && !state.hasLoaded) {
      return const Center(
        child: DashboardLoadingCard(message: 'Loading messages...'),
      );
    }

    if (state.errorMessage != null && state.messages.isEmpty) {
      return Center(
        child: DashboardErrorCard(
          message: state.errorMessage!,
          onRetry: () => ref
              .read(communicationThreadProvider(widget.conversationId).notifier)
              .initialize(conversation: widget.initialConversation),
        ),
      );
    }

    if (state.isEmpty) {
      return Center(
        child: Padding(
          padding: context.dashPadding,
          child: const DashboardEmptyCard(
            message: 'No messages yet. Say hello to start the conversation.',
          ),
        ),
      );
    }

    return ListView.builder(
      controller: _scrollController,
      padding: EdgeInsets.fromLTRB(
        context.dashPadding.left,
        context.dashSpacing * 0.5,
        context.dashPadding.right,
        context.dashSpacing,
      ),
      itemCount: _itemCount(state.messages),
      itemBuilder: (context, index) {
        return _buildListItem(context, state.messages, index, userId, theme);
      },
    );
  }

  int _itemCount(List<CommunicationMessage> messages) {
    var count = messages.length;
    for (var i = 0; i < messages.length; i++) {
      if (_shouldShowDaySeparator(messages, i)) {
        count++;
      }
    }
    return count;
  }

  int _messageIndexForListIndex(
    List<CommunicationMessage> messages,
    int listIndex,
  ) {
    var messageIndex = 0;
    var currentListIndex = 0;
    while (messageIndex < messages.length) {
      if (_shouldShowDaySeparator(messages, messageIndex)) {
        if (currentListIndex == listIndex) {
          return -1;
        }
        currentListIndex++;
      }
      if (currentListIndex == listIndex) {
        return messageIndex;
      }
      currentListIndex++;
      messageIndex++;
    }
    return -1;
  }

  bool _shouldShowDaySeparator(List<CommunicationMessage> messages, int index) {
    if (index == 0) {
      return true;
    }
    final current = messages[index].sentAt;
    final previous = messages[index - 1].sentAt;
    if (current == null || previous == null) {
      return false;
    }
    return !_isSameDay(current, previous);
  }

  bool _isSameDay(DateTime a, DateTime b) {
    return a.year == b.year && a.month == b.month && a.day == b.day;
  }

  Widget _buildListItem(
    BuildContext context,
    List<CommunicationMessage> messages,
    int listIndex,
    String? userId,
    ThemeData theme,
  ) {
    final messageIndex = _messageIndexForListIndex(messages, listIndex);
    if (messageIndex == -1) {
      final separatorDate = _separatorDateForListIndex(messages, listIndex);
      return _DaySeparator(date: separatorDate);
    }

    final message = messages[messageIndex];
    final isMine = message.isFromAuthenticatedUser(userId);
    return CommunicationMessageBubble(
      message: message,
      isMine: isMine,
      showSenderName: !isMine,
    );
  }

  DateTime? _separatorDateForListIndex(
    List<CommunicationMessage> messages,
    int listIndex,
  ) {
    var currentListIndex = 0;
    for (var i = 0; i < messages.length; i++) {
      if (_shouldShowDaySeparator(messages, i)) {
        if (currentListIndex == listIndex) {
          return messages[i].sentAt ?? DateTime.now();
        }
        currentListIndex++;
      }
      if (currentListIndex == listIndex) {
        return messages[i].sentAt;
      }
      currentListIndex++;
    }
    return null;
  }

  Widget _buildComposer(BuildContext context, CommunicationThreadState state) {
    final pendingAttachment = state.pendingAttachment;
    final hasText = _inputController.text.trim().isNotEmpty;
    final hasAttachment = pendingAttachment != null;
    final canSend =
        (hasText || hasAttachment) &&
        !state.isSending &&
        !state.isUploadingAttachment;

    return Container(
      padding: EdgeInsets.fromLTRB(
        context.dashPadding.left,
        context.dashSpacing * 0.5,
        context.dashPadding.right,
        context.dashSpacing * 0.5,
      ),
      decoration: BoxDecoration(
        color: DashboardColors.surface,
        border: Border(
          top: BorderSide(color: DashboardColors.border.withValues(alpha: 0.6)),
        ),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          if (pendingAttachment != null) ...[
            CommunicationPendingAttachmentPreview(
              selection: pendingAttachment,
              uploadProgress: state.uploadProgress,
              removeEnabled: !state.isSending && !state.isUploadingAttachment,
              onRemove: () => ref
                  .read(
                    communicationThreadProvider(widget.conversationId).notifier,
                  )
                  .clearPendingAttachment(),
            ),
            SizedBox(height: context.dashSpacing * 0.45),
          ],
          Padding(
            padding: EdgeInsets.only(right: _showScrollToLatest ? 56 : 0),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                IconButton(
                  onPressed: state.isSending || state.isUploadingAttachment
                      ? null
                      : _pickAttachment,
                  icon: const Icon(Icons.attach_file_rounded),
                  color: DashboardColors.brandCyan,
                ),
                Expanded(
                  child: TextField(
                    controller: _inputController,
                    maxLines: 4,
                    minLines: 1,
                    enabled: !state.isSending && !state.isUploadingAttachment,
                    textInputAction: TextInputAction.newline,
                    onChanged: (_) => setState(() {}),
                    decoration: InputDecoration(
                      hintText: hasAttachment
                          ? 'Add a caption (optional)...'
                          : 'Type a message...',
                      filled: true,
                      fillColor: DashboardColors.background,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(16),
                        borderSide: BorderSide(color: DashboardColors.border),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(16),
                        borderSide: BorderSide(color: DashboardColors.border),
                      ),
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: 14,
                        vertical: 10,
                      ),
                    ),
                  ),
                ),
                SizedBox(width: context.dashSpacing * 0.5),
                BrandGradientIconButton(
                  onPressed: canSend ? _send : null,
                  enabled: canSend,
                  isLoading: state.isSending || state.isUploadingAttachment,
                  icon: Icons.send_rounded,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _DaySeparator extends StatelessWidget {
  const _DaySeparator({required this.date});

  final DateTime? date;

  @override
  Widget build(BuildContext context) {
    final label = date == null
        ? 'Earlier'
        : DateFormat('EEEE, MMM d, yyyy').format(date!);

    return Padding(
      padding: EdgeInsets.symmetric(vertical: context.dashSpacing * 0.5),
      child: Center(
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
          decoration: BoxDecoration(
            color: DashboardColors.border.withValues(alpha: 0.35),
            borderRadius: BorderRadius.circular(999),
          ),
          child: Text(
            label,
            style: Theme.of(context).textTheme.labelSmall?.copyWith(
              color: DashboardColors.textMuted,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
      ),
    );
  }
}

class CommunicationMessageBubble extends StatelessWidget {
  const CommunicationMessageBubble({
    super.key,
    required this.message,
    required this.isMine,
    this.showSenderName = false,
  });

  final CommunicationMessage message;
  final bool isMine;
  final bool showSenderName;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final timeLabel = message.sentAt == null
        ? null
        : DateFormat('h:mm a').format(message.sentAt!.toLocal());

    final textColor = isMine ? Colors.white : DashboardColors.textPrimary;
    final border = isMine
        ? null
        : Border.all(color: DashboardColors.border.withValues(alpha: 0.8));

    return Padding(
      padding: EdgeInsets.only(
        top: context.dashSpacing * 0.25,
        bottom: context.dashSpacing * 0.25,
        left: isMine ? context.dashSpacing * 2 : 0,
        right: isMine ? 0 : context.dashSpacing * 2,
      ),
      child: Align(
        alignment: isMine ? Alignment.centerRight : Alignment.centerLeft,
        child: ConstrainedBox(
          constraints: BoxConstraints(
            maxWidth: MediaQuery.sizeOf(context).width * 0.78,
          ),
          child: DecoratedBox(
            decoration: BoxDecoration(
              gradient: isMine ? DashboardColors.brandPrimaryGradient : null,
              color: isMine ? null : DashboardColors.surface,
              borderRadius: BorderRadius.only(
                topLeft: const Radius.circular(16),
                topRight: const Radius.circular(16),
                bottomLeft: Radius.circular(isMine ? 16 : 4),
                bottomRight: Radius.circular(isMine ? 4 : 16),
              ),
              border: border,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.04),
                  blurRadius: 6,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Padding(
              padding: EdgeInsets.symmetric(
                horizontal: context.dashSpacing * 0.65,
                vertical: context.dashSpacing * 0.45,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (showSenderName &&
                      message.senderName != null &&
                      message.senderName!.trim().isNotEmpty)
                    Padding(
                      padding: EdgeInsets.only(
                        bottom: context.dashSpacing * 0.15,
                      ),
                      child: Text(
                        message.senderName!.trim(),
                        style: theme.textTheme.labelSmall?.copyWith(
                          color: isMine
                              ? Colors.white.withValues(alpha: 0.9)
                              : DashboardColors.textSecondary,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                  if (message.content.trim().isNotEmpty)
                    Text(
                      message.content,
                      style: theme.textTheme.bodyMedium?.copyWith(
                        color: textColor,
                        height: 1.35,
                      ),
                    ),
                  if (message.attachments.isNotEmpty) ...[
                    if (message.content.trim().isNotEmpty)
                      SizedBox(height: context.dashSpacing * 0.35),
                    ...message.attachments.map(
                      (attachment) => Padding(
                        padding: EdgeInsets.only(
                          bottom: context.dashSpacing * 0.25,
                        ),
                        child: CommunicationAttachmentContent(
                          attachment: attachment,
                          isMine: isMine,
                        ),
                      ),
                    ),
                  ],
                  if (timeLabel != null) ...[
                    SizedBox(height: context.dashSpacing * 0.2),
                    Text(
                      timeLabel,
                      style: theme.textTheme.labelSmall?.copyWith(
                        color: isMine
                            ? Colors.white.withValues(alpha: 0.85)
                            : DashboardColors.textMuted,
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
