import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/constants/admin_dashboard_colors.dart';
import '../../../core/routes/app_routes.dart';
import '../../../core/theme/admin_dashboard_theme.dart';
import '../../auth/providers/auth_provider.dart';
import '../providers/specialist_features_provider.dart';
import 'admin_navigation.dart';
import 'admin_ui_components.dart';
import 'dashboard_app_bar.dart';
import 'dashboard_bottom_nav.dart';
import 'dashboard_layout.dart';
import 'dashboard_profile_avatar.dart';

class AdminPageScaffold extends ConsumerWidget {
  const AdminPageScaffold({
    super.key,
    required this.title,
    required this.body,
    this.currentNav,
    this.showBackButton = false,
    this.showBottomNav = true,
    this.actions,
    this.floatingActionButton,
    this.wrapBodyInScrollView = false,
    this.onBackPressed,
    this.useBrandedAppBar = false,
  });

  final String title;
  final Widget body;
  final DashboardNavItem? currentNav;
  final bool showBackButton;
  final bool showBottomNav;
  final List<Widget>? actions;
  final Widget? floatingActionButton;
  final bool wrapBodyInScrollView;
  final VoidCallback? onBackPressed;
  final bool useBrandedAppBar;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final auth = ref.watch(authProvider);
    final userName = auth.user?.fullName;
    final unread = ref.watch(specialistNotificationsProvider).unreadCount;

    return Theme(
      data: AdminDashboardTheme.light,
      child: Scaffold(
        backgroundColor: AdminDashboardColors.background,
        drawer: const AdminDrawer(),
        appBar: useBrandedAppBar
            ? DashboardAppBar(
                avatarInitials: dashboardInitials(userName, fallback: 'AD'),
                avatarImageUrl: auth.user?.profileImageUrl,
                notificationCount: unread,
                onMenuTap: () => AdminNavigation.openDrawer(context),
                onNotificationsTap: () =>
                    context.push(AppRoutes.adminNotifications),
                onAvatarTap: () => context.push(AppRoutes.adminProfile),
              )
            : AppBar(
                backgroundColor: AdminDashboardColors.appBar,
                surfaceTintColor: Colors.transparent,
                elevation: 0,
                leading: showBackButton
                    ? IconButton(
                        icon: const Icon(
                          Icons.arrow_back_rounded,
                          color: Colors.white,
                        ),
                        onPressed:
                            onBackPressed ??
                            () => AdminNavigation.popOrGoAdmin(context),
                      )
                    : IconButton(
                        icon: const Icon(
                          Icons.menu_rounded,
                          color: Colors.white,
                        ),
                        onPressed: () => AdminNavigation.openDrawer(context),
                      ),
                title: Text(
                  title,
                  style: Theme.of(context).appBarTheme.titleTextStyle,
                ),
                actions: [
                  ...?actions,
                  _NotificationAction(
                    count: unread,
                    onTap: () => context.push(AppRoutes.adminNotifications),
                  ),
                  _AvatarAction(
                    initials: dashboardInitials(userName, fallback: 'AD'),
                    imageUrl: auth.user?.profileImageUrl,
                    onTap: () => context.push(AppRoutes.adminProfile),
                  ),
                  const SizedBox(width: 8),
                ],
              ),
        body: SafeArea(
          child: wrapBodyInScrollView
              ? SingleChildScrollView(padding: context.dashPadding, child: body)
              : body,
        ),
        floatingActionButton: floatingActionButton,
        bottomNavigationBar: showBottomNav
            ? AdminBottomNav(
                currentIndex: currentNav,
                onTap: (item) => AdminNavigation.onNavTap(context, item),
              )
            : null,
      ),
    );
  }
}

class _NotificationAction extends StatelessWidget {
  const _NotificationAction({required this.count, required this.onTap});

  final int count;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Stack(
      clipBehavior: Clip.none,
      children: [
        IconButton(
          onPressed: onTap,
          icon: const Icon(
            Icons.notifications_none_rounded,
            color: Colors.white,
          ),
        ),
        if (count > 0)
          Positioned(
            top: 10,
            right: 10,
            child: Container(
              padding: const EdgeInsets.all(4),
              decoration: const BoxDecoration(
                color: AdminDashboardColors.danger,
                shape: BoxShape.circle,
              ),
              constraints: const BoxConstraints(minWidth: 16, minHeight: 16),
              child: Text(
                '$count',
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
    );
  }
}

class _AvatarAction extends StatelessWidget {
  const _AvatarAction({
    required this.initials,
    this.imageUrl,
    required this.onTap,
  });

  final String initials;
  final String? imageUrl;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(24),
      child: Padding(
        padding: EdgeInsets.only(right: context.dashSpacing * 0.35),
        child: Container(
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            border: Border.all(
              color: Colors.white.withValues(alpha: 0.35),
              width: 2,
            ),
          ),
          child: DashboardProfileAvatar(
            initials: initials,
            imageUrl: imageUrl,
            radius: context.dashSpacing * 0.55,
          ),
        ),
      ),
    );
  }
}
