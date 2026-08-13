import 'package:flutter/material.dart';

import '../../../core/constants/dashboard_colors.dart';
import '../../../l10n/app_localizations.dart';
import '../../../shared/widgets/auth_ui.dart';
import 'dashboard_layout.dart';
import 'dashboard_profile_avatar.dart';

class DashboardAppBar extends StatelessWidget implements PreferredSizeWidget {
  const DashboardAppBar({
    super.key,
    this.messageCount = 0,
    this.notificationCount = 0,
    this.avatarInitials = 'LM',
    this.avatarImageUrl,
    this.userDisplayName,
    this.showMenuButton = true,
    this.onMenuTap,
    this.onMessagesTap,
    this.onNotificationsTap,
    this.onAvatarTap,
    this.additionalActions,
    this.showBrandTitle = true,
    this.showMessagesAction = true,
    this.showBackButton = false,
    this.onBackPressed,
  });

  final int messageCount;
  final int notificationCount;
  final String avatarInitials;
  final String? avatarImageUrl;
  final String? userDisplayName;
  final bool showMenuButton;
  final VoidCallback? onMenuTap;
  final VoidCallback? onMessagesTap;
  final VoidCallback? onNotificationsTap;
  final VoidCallback? onAvatarTap;
  final List<Widget>? additionalActions;
  final bool showBrandTitle;
  final bool showMessagesAction;
  final bool showBackButton;
  final VoidCallback? onBackPressed;

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final l10n = AppLocalizations.of(context)!;

    return AppBar(
      backgroundColor: DashboardColors.background,
      surfaceTintColor: Colors.transparent,
      automaticallyImplyLeading: false,
      centerTitle: false,
      leadingWidth: showBackButton
          ? 56
          : (showMenuButton ? null : 0),
      titleSpacing: showBackButton ? 0 : (showMenuButton ? null : 16),
      leading: showBackButton
          ? IconButton(
              onPressed: onBackPressed,
              icon: const Icon(Icons.arrow_back_rounded),
              color: DashboardColors.textPrimary,
            )
          : showMenuButton
          ? IconButton(
              onPressed: onMenuTap,
              icon: const Icon(Icons.menu_rounded),
              color: DashboardColors.textPrimary,
            )
          : null,
      title: Row(
        children: [
          ColorFiltered(
            colorFilter: const ColorFilter.mode(
              Color(0xFF2AA4C9),
              BlendMode.srcIn,
            ),
            child: Image.asset(
              AuthTopLogo.brandingAsset,
              width: 26,
              height: 26,
              fit: BoxFit.contain,
            ),
          ),
          if (showBrandTitle) ...[
            SizedBox(width: context.dashSpacing * 0.45),
            Expanded(
              child: Text(
                l10n.appTitle,
                maxLines: 1,
                softWrap: false,
                overflow: TextOverflow.ellipsis,
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w700,
                  color: DashboardColors.textPrimary,
                ),
              ),
            ),
          ],
        ],
      ),
      actions: [
        if (userDisplayName != null && userDisplayName!.isNotEmpty) ...[
          Center(
            child: Padding(
              padding: EdgeInsetsDirectional.only(
                end: context.dashSpacing * 0.25,
              ),
              child: Text(
                userDisplayName!,
                style: theme.textTheme.bodyMedium?.copyWith(
                  fontWeight: FontWeight.w600,
                  color: DashboardColors.textPrimary,
                ),
              ),
            ),
          ),
        ],
        ...?additionalActions,
        Row(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            if (showMessagesAction) ...[
              Stack(
                clipBehavior: Clip.none,
                children: [
                  IconButton(
                    onPressed: onMessagesTap,
                    icon: const Icon(Icons.chat_bubble_outline_rounded),
                    padding: const EdgeInsetsDirectional.only(
                      start: 4,
                      end: 0,
                      top: 8,
                      bottom: 8,
                    ),
                    constraints: const BoxConstraints(
                      minWidth: 28,
                      minHeight: 48,
                    ),
                    color: DashboardColors.textPrimary,
                    tooltip: l10n.navMessages,
                  ),
                  if (messageCount > 0)
                    PositionedDirectional(
                      top: 8,
                      end: 0,
                      child: Container(
                        padding: const EdgeInsets.all(4),
                        decoration: const BoxDecoration(
                          color: DashboardColors.highPriority,
                          shape: BoxShape.circle,
                        ),
                        constraints: const BoxConstraints(
                          minWidth: 16,
                          minHeight: 16,
                        ),
                        child: Text(
                          messageCount > 99 ? '99+' : '$messageCount',
                          textAlign: TextAlign.center,
                          style: theme.textTheme.labelSmall?.copyWith(
                            color: Colors.white,
                            fontWeight: FontWeight.w700,
                            fontSize: 9,
                          ),
                        ),
                      ),
                    ),
                ],
              ),
              const SizedBox(width: 8),
            ],
            Stack(
              clipBehavior: Clip.none,
              children: [
                IconButton(
                  onPressed: onNotificationsTap,
                  icon: const Icon(Icons.notifications_none_rounded),
                  padding: EdgeInsetsDirectional.only(
                    start: showMessagesAction ? 0 : 8,
                    end: 8,
                    top: 8,
                    bottom: 8,
                  ),
                  constraints: BoxConstraints(
                    minWidth: showMessagesAction ? 32 : 40,
                    minHeight: 48,
                  ),
                  color: DashboardColors.textPrimary,
                  tooltip: l10n.navNotifications,
                ),
                if (notificationCount > 0)
                  PositionedDirectional(
                    top: 8,
                    end: 4,
                    child: Container(
                      padding: const EdgeInsets.all(4),
                      decoration: const BoxDecoration(
                        color: DashboardColors.highPriority,
                        shape: BoxShape.circle,
                      ),
                      constraints: const BoxConstraints(
                        minWidth: 16,
                        minHeight: 16,
                      ),
                      child: Text(
                        '$notificationCount',
                        textAlign: TextAlign.center,
                        style: theme.textTheme.labelSmall?.copyWith(
                          color: Colors.white,
                          fontWeight: FontWeight.w700,
                          fontSize: 9,
                        ),
                      ),
                    ),
                  ),
              ],
            ),
          ],
        ),
        Padding(
          padding: EdgeInsetsDirectional.only(end: context.dashSpacing * 0.5),
          child: InkWell(
            onTap: onAvatarTap,
            borderRadius: BorderRadius.circular(24),
            child: DashboardProfileAvatar(
              initials: avatarInitials,
              imageUrl: avatarImageUrl,
              radius: context.dashSpacing * 0.55,
            ),
          ),
        ),
      ],
    );
  }
}
