import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/constants/dashboard_colors.dart';
import '../../../../core/theme/dashboard_theme.dart';
import '../../models/parent_ai_chat_models.dart';
import '../../providers/parent_ai_chat_provider.dart';
import '../../providers/parent_dashboard_provider.dart';
import '../../widgets/dashboard_layout.dart';
import '../../widgets/dashboard_surface_card.dart';

const _quickPrompts = [
  'Explain today\'s exercise',
  'Summarize my child\'s progress',
  'What should I focus on today?',
  'Explain the latest report',
];

const _safetyNotice =
    'AI guidance is for support only. Always follow your specialist\'s instructions.';

class ParentAiChatScreen extends ConsumerStatefulWidget {
  const ParentAiChatScreen({super.key});

  @override
  ConsumerState<ParentAiChatScreen> createState() => _ParentAiChatScreenState();
}

class _ParentAiChatScreenState extends ConsumerState<ParentAiChatScreen> {
  final _inputController = TextEditingController();
  final _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _bootstrap());
  }

  @override
  void dispose() {
    _inputController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _bootstrap() {
    final dashboard = ref.read(parentDashboardProvider);
    final child = dashboard.selectedChild;
    ref.read(parentAiChatProvider.notifier).initialize(
          patientId: child?.id,
          patientName: child?.name,
        );
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!_scrollController.hasClients) {
        return;
      }
      _scrollController.animateTo(
        _scrollController.position.maxScrollExtent,
        duration: const Duration(milliseconds: 250),
        curve: Curves.easeOut,
      );
    });
  }

  Future<void> _send([String? preset]) async {
    final text = preset ?? _inputController.text;
    if (text.trim().isEmpty) {
      return;
    }

    if (preset == null) {
      _inputController.clear();
    }

    final error = await ref.read(parentAiChatProvider.notifier).sendMessage(text);
    _scrollToBottom();

    if (error != null && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(error),
          duration: const Duration(seconds: 6),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(parentAiChatProvider);
    final theme = Theme.of(context);

    ref.listen(parentAiChatProvider, (previous, next) {
      if ((next.messages.length) != (previous?.messages.length ?? 0)) {
        _scrollToBottom();
      }
    });

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
                'AI Assistant',
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w700,
                ),
              ),
              if (state.patientName != null && state.patientName!.isNotEmpty)
                Text(
                  'For ${state.patientName}',
                  style: theme.textTheme.labelSmall?.copyWith(
                    color: DashboardColors.textSecondary,
                  ),
                ),
            ],
          ),
        ),
        body: SafeArea(
          child: Column(
            children: [
              Padding(
                padding: EdgeInsets.fromLTRB(
                  context.dashPadding.left,
                  context.dashSpacing * 0.35,
                  context.dashPadding.right,
                  context.dashSpacing * 0.35,
                ),
                child: DashboardSurfaceCard(
                  padding: EdgeInsets.all(context.dashSpacing * 0.65),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Icon(
                        Icons.info_outline_rounded,
                        size: context.dashSpacing * 0.55,
                        color: DashboardColors.primary,
                      ),
                      SizedBox(width: context.dashSpacing * 0.5),
                      Expanded(
                        child: Text(
                          _safetyNotice,
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: DashboardColors.textSecondary,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              if (state.isLoading)
                const Expanded(
                  child: Center(child: CircularProgressIndicator()),
                )
              else if (state.errorMessage != null && state.messages.isEmpty)
                Expanded(
                  child: Center(
                    child: Padding(
                      padding: context.dashPadding,
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            state.errorMessage!,
                            textAlign: TextAlign.center,
                            style: theme.textTheme.bodyMedium,
                          ),
                          SizedBox(height: context.dashSpacing),
                          ElevatedButton(
                            onPressed: () => ref
                                .read(parentAiChatProvider.notifier)
                                .refresh(),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: DashboardColors.primary,
                              foregroundColor: Colors.white,
                            ),
                            child: const Text('Retry'),
                          ),
                        ],
                      ),
                    ),
                  ),
                )
              else
                Expanded(
                  child: state.messages.isEmpty
                      ? _EmptyChatState(
                          onPromptTap: _send,
                          isSending: state.isSending,
                        )
                      : ListView.builder(
                          controller: _scrollController,
                          padding: EdgeInsets.fromLTRB(
                            context.dashPadding.left,
                            context.dashSpacing * 0.35,
                            context.dashPadding.right,
                            context.dashSpacing * 0.35,
                          ),
                          itemCount: state.messages.length,
                          itemBuilder: (context, index) {
                            return _ChatBubble(
                              message: state.messages[index],
                            );
                          },
                        ),
                ),
              if (!state.isLoading && state.messages.isNotEmpty)
                _QuickPromptRow(
                  onPromptTap: state.isSending ? null : _send,
                ),
              if (state.isSending)
                Padding(
                  padding: EdgeInsets.symmetric(
                    vertical: context.dashSpacing * 0.35,
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      SizedBox(
                        width: 16,
                        height: 16,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: DashboardColors.primary,
                        ),
                      ),
                      SizedBox(width: context.dashSpacing * 0.45),
                      Text(
                        'AI is thinking...',
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: DashboardColors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ),
              _ChatInputBar(
                controller: _inputController,
                isSending: state.isSending,
                onSend: () => _send(),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _EmptyChatState extends StatelessWidget {
  const _EmptyChatState({
    required this.onPromptTap,
    required this.isSending,
  });

  final ValueChanged<String> onPromptTap;
  final bool isSending;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return SingleChildScrollView(
      padding: context.dashPadding,
      child: Column(
        children: [
          SizedBox(height: context.dashSpacing),
          Container(
            padding: EdgeInsets.all(context.dashSpacing),
            decoration: BoxDecoration(
              color: DashboardColors.purpleSoft,
              shape: BoxShape.circle,
            ),
            child: Icon(
              Icons.smart_toy_outlined,
              size: context.dashSpacing * 1.2,
              color: DashboardColors.primary,
            ),
          ),
          SizedBox(height: context.dashSpacing),
          Text(
            'Ask me anything about your child\'s exercises, reports, or progress.',
            textAlign: TextAlign.center,
            style: theme.textTheme.bodyMedium?.copyWith(
              color: DashboardColors.textSecondary,
            ),
          ),
          SizedBox(height: context.dashSpacing),
          Wrap(
            spacing: context.dashSpacing * 0.4,
            runSpacing: context.dashSpacing * 0.4,
            alignment: WrapAlignment.center,
            children: _quickPrompts
                .map(
                  (prompt) => ActionChip(
                    label: Text(prompt),
                    onPressed: isSending ? null : () => onPromptTap(prompt),
                    backgroundColor: DashboardColors.surface,
                    side: BorderSide(color: DashboardColors.border),
                    labelStyle: theme.textTheme.labelMedium?.copyWith(
                      color: DashboardColors.primary,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                )
                .toList(),
          ),
        ],
      ),
    );
  }
}

class _QuickPromptRow extends StatelessWidget {
  const _QuickPromptRow({required this.onPromptTap});

  final ValueChanged<String>? onPromptTap;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: context.dashSpacing * 2.1,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: EdgeInsets.symmetric(horizontal: context.dashSpacing * 0.75),
        itemCount: _quickPrompts.length,
        separatorBuilder: (_, __) => SizedBox(width: context.dashSpacing * 0.35),
        itemBuilder: (context, index) {
          final prompt = _quickPrompts[index];
          return ActionChip(
            label: Text(prompt),
            onPressed: onPromptTap == null ? null : () => onPromptTap!(prompt),
            backgroundColor: DashboardColors.surface,
            side: BorderSide(color: DashboardColors.border),
            labelStyle: Theme.of(context).textTheme.labelSmall?.copyWith(
                  color: DashboardColors.primary,
                  fontWeight: FontWeight.w600,
                ),
          );
        },
      ),
    );
  }
}

class _ChatBubble extends StatelessWidget {
  const _ChatBubble({required this.message});

  final ParentAiChatMessage message;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isUser = message.isUser;
    final alignment = isUser ? Alignment.centerRight : Alignment.centerLeft;
    final bubbleColor = isUser
        ? DashboardColors.primary
        : DashboardColors.surface;
    final textColor = isUser ? Colors.white : DashboardColors.textPrimary;

    return Align(
      alignment: alignment,
      child: Container(
        constraints: BoxConstraints(
          maxWidth: MediaQuery.sizeOf(context).width * 0.82,
        ),
        margin: EdgeInsets.only(bottom: context.dashSpacing * 0.55),
        padding: EdgeInsets.symmetric(
          horizontal: context.dashSpacing * 0.75,
          vertical: context.dashSpacing * 0.55,
        ),
        decoration: BoxDecoration(
          color: message.hasFailed
              ? DashboardColors.warning.withValues(alpha: 0.12)
              : bubbleColor,
          borderRadius: BorderRadius.only(
            topLeft: const Radius.circular(16),
            topRight: const Radius.circular(16),
            bottomLeft: Radius.circular(isUser ? 16 : 4),
            bottomRight: Radius.circular(isUser ? 4 : 16),
          ),
          border: isUser
              ? null
              : Border.all(color: DashboardColors.border.withValues(alpha: 0.8)),
          boxShadow: isUser
              ? [
                  BoxShadow(
                    color: DashboardColors.primary.withValues(alpha: 0.18),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ]
              : null,
        ),
        child: Column(
          crossAxisAlignment:
              isUser ? CrossAxisAlignment.end : CrossAxisAlignment.start,
          children: [
            if (!isUser) ...[
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    Icons.auto_awesome,
                    size: 14,
                    color: DashboardColors.primary,
                  ),
                  SizedBox(width: context.dashSpacing * 0.2),
                  Text(
                    'AI Assistant',
                    style: theme.textTheme.labelSmall?.copyWith(
                      color: DashboardColors.primary,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ],
              ),
              SizedBox(height: context.dashSpacing * 0.25),
            ],
            Text(
              message.content,
              style: theme.textTheme.bodyMedium?.copyWith(
                color: message.hasFailed
                    ? DashboardColors.textPrimary
                    : textColor,
                height: 1.45,
              ),
            ),
            if (message.isPending || message.hasFailed) ...[
              SizedBox(height: context.dashSpacing * 0.2),
              Text(
                message.hasFailed ? 'Failed to send' : 'Sending...',
                style: theme.textTheme.labelSmall?.copyWith(
                  color: message.hasFailed
                      ? DashboardColors.warning
                      : DashboardColors.textMuted,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _ChatInputBar extends StatelessWidget {
  const _ChatInputBar({
    required this.controller,
    required this.isSending,
    required this.onSend,
  });

  final TextEditingController controller;
  final bool isSending;
  final VoidCallback onSend;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.fromLTRB(
        context.dashSpacing * 0.75,
        context.dashSpacing * 0.5,
        context.dashSpacing * 0.75,
        context.dashSpacing * 0.75,
      ),
      decoration: BoxDecoration(
        color: DashboardColors.surface,
        border: Border(
          top: BorderSide(color: DashboardColors.border.withValues(alpha: 0.8)),
        ),
      ),
      child: Row(
        children: [
          Expanded(
            child: TextField(
              controller: controller,
              minLines: 1,
              maxLines: 4,
              enabled: !isSending,
              textInputAction: TextInputAction.send,
              onSubmitted: (_) => onSend(),
              decoration: InputDecoration(
                hintText: 'Ask about exercises, reports, or progress…',
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
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(16),
                  borderSide: const BorderSide(color: DashboardColors.primary),
                ),
                contentPadding: EdgeInsets.symmetric(
                  horizontal: context.dashSpacing * 0.75,
                  vertical: context.dashSpacing * 0.55,
                ),
              ),
            ),
          ),
          SizedBox(width: context.dashSpacing * 0.45),
          Material(
            color: DashboardColors.primary,
            borderRadius: BorderRadius.circular(16),
            child: InkWell(
              onTap: isSending ? null : onSend,
              borderRadius: BorderRadius.circular(16),
              child: SizedBox(
                width: context.dashSpacing * 2.2,
                height: context.dashSpacing * 2.2,
                child: Icon(
                  Icons.send_rounded,
                  color: Colors.white,
                  size: context.dashSpacing * 0.7,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
