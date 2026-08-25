import 'package:flutter/material.dart';

import '../../../../core/constants/dashboard_colors.dart';
import '../../../../l10n/app_localizations.dart';
import '../../models/communication_models.dart';
import '../../widgets/dashboard_layout.dart';
import '../../widgets/dashboard_profile_avatar.dart';
import 'communication_conversation_list_utils.dart';

class CommunicationConversationTile extends StatelessWidget {
  const CommunicationConversationTile({
    super.key,
    required this.conversation,
    required this.role,
    required this.onTap,
    this.isSelected = false,
  });

  final CommunicationConversation conversation;
  final String? role;
  final VoidCallback onTap;
  final bool isSelected;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final theme = Theme.of(context);
    final localeName = Localizations.localeOf(context).toLanguageTag();
    final participantName = conversation.otherParticipantName(role);
    final patientName = conversation.patientDisplayName();
    final preview = resolveConversationLastMessagePreview(conversation, l10n);
    final activityTime = formatConversationActivityTime(
      conversation.activityAt,
      l10n,
      localeName,
    );
    final unreadCount = conversation.unreadCount;
    final showBadge = unreadCount > 0;
    final isParent = role?.toLowerCase() == 'parent';

    return Material(
      color: isSelected
          ? DashboardColors.brandSoft.withValues(alpha: 0.65)
          : Colors.transparent,
      child: InkWell(
        onTap: onTap,
        child: DecoratedBox(
          decoration: BoxDecoration(
            border: BorderDirectional(
              bottom: BorderSide(
                color: DashboardColors.border.withValues(alpha: 0.85),
              ),
              start: BorderSide(
                color: isSelected
                    ? DashboardColors.primary
                    : Colors.transparent,
                width: 3,
              ),
            ),
          ),
          child: Padding(
            padding: EdgeInsetsDirectional.fromSTEB(
              isSelected ? 9 : 12,
              8,
              12,
              8,
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Padding(
                  padding: const EdgeInsets.only(top: 1),
                  child: DashboardProfileAvatar(
                    initials: dashboardInitials(
                      participantName,
                      fallback: isParent ? 'S' : 'P',
                    ),
                    imageUrl: conversation.otherParticipantProfileImageUrl(role),
                    radius: 18,
                    backgroundColor: isParent
                        ? DashboardColors.brandSoft
                        : DashboardColors.tealSoft,
                  ),
                ),
                SizedBox(width: context.dashSpacing * 0.55),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        participantName,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: theme.textTheme.bodyMedium?.copyWith(
                          fontWeight: showBadge
                              ? FontWeight.w700
                              : FontWeight.w600,
                          fontSize: 13,
                          height: 1.25,
                          color: DashboardColors.textPrimary,
                        ),
                      ),
                      if (patientName != null) ...[
                        const SizedBox(height: 1),
                        Text(
                          patientName,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: theme.textTheme.bodySmall?.copyWith(
                            fontSize: 12,
                            height: 1.25,
                            color: DashboardColors.textSecondary,
                          ),
                        ),
                      ],
                      if (preview.isNotEmpty) ...[
                        const SizedBox(height: 2),
                        Text(
                          preview,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: theme.textTheme.bodySmall?.copyWith(
                            fontSize: 12,
                            height: 1.3,
                            fontWeight: showBadge
                                ? FontWeight.w500
                                : FontWeight.w400,
                            color: showBadge
                                ? DashboardColors.textSecondary
                                : DashboardColors.textMuted,
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
                SizedBox(width: context.dashSpacing * 0.35),
                SizedBox(
                  height: 52,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      if (activityTime.isNotEmpty)
                        Text(
                          activityTime,
                          style: theme.textTheme.labelSmall?.copyWith(
                            fontSize: 11,
                            height: 1.2,
                            color: DashboardColors.textMuted,
                          ),
                        )
                      else
                        const SizedBox.shrink(),
                      if (showBadge)
                        _UnreadCountBadge(count: unreadCount)
                      else
                        const SizedBox.shrink(),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _UnreadCountBadge extends StatelessWidget {
  const _UnreadCountBadge({required this.count});

  final int count;

  @override
  Widget build(BuildContext context) {
    final label = formatConversationUnreadBadge(count);
    final isWide = label.length > 1;

    return Container(
      constraints: BoxConstraints(
        minWidth: 18,
        minHeight: 18,
        maxWidth: isWide ? 28 : 18,
      ),
      height: 18,
      padding: EdgeInsets.symmetric(horizontal: isWide ? 4 : 0),
      alignment: Alignment.center,
      decoration: BoxDecoration(
        color: DashboardColors.primary,
        borderRadius: BorderRadius.circular(isWide ? 9 : 9),
      ),
      child: Text(
        label,
        style: const TextStyle(
          color: Colors.white,
          fontSize: 10,
          fontWeight: FontWeight.w700,
          height: 1,
        ),
      ),
    );
  }
}
