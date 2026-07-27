import 'package:flutter/material.dart';



import '../../../core/constants/dashboard_colors.dart';

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



  @override

  Size get preferredSize => const Size.fromHeight(kToolbarHeight);



  @override

  Widget build(BuildContext context) {

    final theme = Theme.of(context);



    return AppBar(
      backgroundColor: DashboardColors.background,
      surfaceTintColor: Colors.transparent,
      automaticallyImplyLeading: false,
      centerTitle: false,
      leadingWidth: showMenuButton ? null : 0,
      titleSpacing: showMenuButton ? null : 16,
      leading: showMenuButton
          ? IconButton(
              onPressed: onMenuTap,
              icon: const Icon(Icons.menu_rounded),
              color: DashboardColors.textPrimary,
            )
          : null,
      title: Row(

        mainAxisSize: MainAxisSize.min,

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

          SizedBox(width: context.dashSpacing * 0.45),

          Text(

            'Smart Rehabilitation',

            style: theme.textTheme.titleMedium?.copyWith(

              fontWeight: FontWeight.w700,

              color: DashboardColors.textPrimary,

            ),

          ),

        ],

      ),

      actions: [
        if (userDisplayName != null && userDisplayName!.isNotEmpty) ...[
          Center(
            child: Padding(
              padding: EdgeInsets.only(right: context.dashSpacing * 0.25),
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
        Stack(
          clipBehavior: Clip.none,
          children: [
            IconButton(
              onPressed: onMessagesTap,
              icon: const Icon(Icons.chat_bubble_outline_rounded),
              color: DashboardColors.textPrimary,
              tooltip: 'Messages',
            ),
            if (messageCount > 0)
              Positioned(
                top: 10,
                right: 10,
                child: Container(
                  padding: const EdgeInsets.all(4),
                  decoration: const BoxDecoration(
                    color: DashboardColors.highPriority,
                    shape: BoxShape.circle,
                  ),
                  constraints: const BoxConstraints(minWidth: 16, minHeight: 16),
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
        Stack(
          clipBehavior: Clip.none,
          children: [
            IconButton(
              onPressed: onNotificationsTap,
              icon: const Icon(Icons.notifications_none_rounded),
              color: DashboardColors.textPrimary,
            ),
            if (notificationCount > 0)
              Positioned(
                top: 10,
                right: 10,
                child: Container(
                  padding: const EdgeInsets.all(4),
                  decoration: const BoxDecoration(
                    color: DashboardColors.highPriority,
                    shape: BoxShape.circle,
                  ),
                  constraints: const BoxConstraints(minWidth: 16, minHeight: 16),
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

        Padding(

          padding: EdgeInsets.only(right: context.dashSpacing * 0.5),

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


