import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/constants/dashboard_colors.dart';
import '../models/presence_status.dart';
import '../providers/presence_provider.dart';

class OnlineStatusDot extends ConsumerWidget {
  const OnlineStatusDot({
    super.key,
    required this.userId,
    this.size = 10,
  });

  final String userId;
  final double size;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final status = ref.watch(presenceProvider).statusFor(userId);
    final isOnline = status?.isOnline ?? false;

    return Tooltip(
      message: formatPresenceLabel(status),
      child: Container(
        width: size,
        height: size,
        decoration: BoxDecoration(
          color: isOnline ? DashboardColors.accent : DashboardColors.textMuted,
          shape: BoxShape.circle,
          border: Border.all(color: Colors.white, width: 1.5),
        ),
      ),
    );
  }
}

class PresenceStatusLabel extends ConsumerWidget {
  const PresenceStatusLabel({
    super.key,
    required this.userId,
    this.style,
  });

  final String userId;
  final TextStyle? style;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final status = ref.watch(presenceProvider).statusFor(userId);
    final theme = Theme.of(context);

    return Text(
      formatPresenceLabel(status),
      style: style ??
          theme.textTheme.labelSmall?.copyWith(
            color: (status?.isOnline ?? false)
                ? DashboardColors.accent
                : DashboardColors.textSecondary,
            fontWeight: FontWeight.w600,
          ),
    );
  }
}
