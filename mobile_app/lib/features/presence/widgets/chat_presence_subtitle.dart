import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/constants/dashboard_colors.dart';
import '../models/presence_status.dart';
import '../providers/presence_provider.dart';

class ChatPresenceSubtitle extends ConsumerStatefulWidget {
  const ChatPresenceSubtitle({
    super.key,
    required this.userId,
  });

  final String userId;

  @override
  ConsumerState<ChatPresenceSubtitle> createState() =>
      _ChatPresenceSubtitleState();
}

class _ChatPresenceSubtitleState extends ConsumerState<ChatPresenceSubtitle> {
  Timer? _refreshTimer;
  bool _fetchInFlight = false;

  @override
  void initState() {
    super.initState();
    if (widget.userId.isNotEmpty) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _fetchPresence();
        _refreshTimer = Timer.periodic(
          const Duration(seconds: 30),
          (_) => _fetchPresence(),
        );
      });
    }
  }

  @override
  void didUpdateWidget(ChatPresenceSubtitle oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.userId != widget.userId) {
      _refreshTimer?.cancel();
      _refreshTimer = null;
      if (widget.userId.isNotEmpty) {
        _fetchPresence();
        _refreshTimer = Timer.periodic(
          const Duration(seconds: 30),
          (_) => _fetchPresence(),
        );
      }
    }
  }

  @override
  void dispose() {
    _refreshTimer?.cancel();
    super.dispose();
  }

  Future<void> _fetchPresence() async {
    if (!mounted || widget.userId.isEmpty || _fetchInFlight) {
      return;
    }

    _fetchInFlight = true;
    try {
      await ref.read(presenceProvider.notifier).refreshUser(widget.userId);
    } finally {
      _fetchInFlight = false;
    }
  }

  @override
  Widget build(BuildContext context) {
    if (widget.userId.isEmpty) {
      return const SizedBox.shrink();
    }

    final status = ref.watch(
      presenceProvider.select((state) => state.statusFor(widget.userId)),
    );

    if (status == null) {
      return const SizedBox.shrink();
    }

    final theme = Theme.of(context);
    final isOnline = status.isOnline;
    final label = formatPresenceLabel(status);

    return Padding(
      padding: const EdgeInsets.only(top: 2),
      child: Row(
        children: [
          Container(
            width: 8,
            height: 8,
            decoration: BoxDecoration(
              color: isOnline
                  ? DashboardColors.accent
                  : DashboardColors.textMuted,
              shape: BoxShape.circle,
            ),
          ),
          const SizedBox(width: 6),
          Expanded(
            child: Text(
              label,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: theme.textTheme.labelSmall?.copyWith(
                color: isOnline
                    ? DashboardColors.accent
                    : DashboardColors.textSecondary,
                fontWeight: FontWeight.w500,
                fontSize: 11,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
