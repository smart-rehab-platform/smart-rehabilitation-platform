import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/constants/dashboard_colors.dart';
import '../../../core/routes/app_routes.dart';
import '../../../core/theme/dashboard_theme.dart';
import '../../auth/providers/auth_provider.dart';
import '../providers/specialist_features_provider.dart';
import 'admin_navigation.dart';
import 'dashboard_app_bar.dart';
import 'dashboard_bottom_nav.dart';
import 'dashboard_layout.dart';

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
    this.appBarShowBrandTitle = true,
    this.appBarShowMessagesAction = false,
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
  final bool appBarShowBrandTitle;
  final bool appBarShowMessagesAction;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final auth = ref.watch(authProvider);
    final notifications = ref.watch(specialistNotificationsProvider);
    final displayName = auth.user?.fullName ?? '';
    final avatarInitials = dashboardInitials(displayName, fallback: 'AD');

    final bodyContent = wrapBodyInScrollView
        ? SingleChildScrollView(padding: context.dashPadding, child: body)
        : body;

    final scaffold = Scaffold(
      backgroundColor: DashboardColors.background,
      drawer: const AdminDrawer(),
      appBar: DashboardAppBar(
        showMenuButton: false,
        showBrandTitle: appBarShowBrandTitle,
        showMessagesAction: appBarShowMessagesAction,
        avatarInitials: avatarInitials,
        avatarImageUrl: auth.user?.profileImageUrl,
        messageCount: notifications.unreadMessageCount,
        notificationCount: notifications.unreadCount,
        additionalActions: actions,
        onMessagesTap: () => context.push(AppRoutes.specialistMessages),
        onNotificationsTap: () => context.push(AppRoutes.adminNotifications),
        onAvatarTap: () => context.push(AppRoutes.adminProfile),
      ),
      body: SafeArea(child: bodyContent),
      floatingActionButton: floatingActionButton,
      bottomNavigationBar: showBottomNav && currentNav != null
          ? DashboardBottomNav(
              currentIndex: currentNav!,
              onTap: (item) => AdminNavigation.onNavTap(context, item),
              accentColor: DashboardColors.brandCyan,
            )
          : null,
    );

    Widget child = scaffold;
    if (showBackButton && onBackPressed != null) {
      child = PopScope(
        canPop: false,
        onPopInvokedWithResult: (didPop, _) {
          if (!didPop) {
            onBackPressed!();
          }
        },
        child: scaffold,
      );
    }

    return Theme(data: DashboardTheme.light, child: child);
  }
}
