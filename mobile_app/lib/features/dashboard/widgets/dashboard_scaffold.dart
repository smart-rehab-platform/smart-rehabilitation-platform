import 'package:flutter/material.dart';

import '../../../core/constants/dashboard_colors.dart';
import '../../../core/theme/dashboard_theme.dart';
import 'dashboard_app_bar.dart';
import 'dashboard_bottom_nav.dart';
import 'dashboard_layout.dart';
import 'specialist_navigation.dart';

/// Shared shell for all role dashboards: theme, app bar, scroll body, bottom nav.
class DashboardScaffold extends StatelessWidget {
  const DashboardScaffold({
    super.key,
    required this.body,
    this.avatarInitials = 'SR',
    this.avatarImageUrl,
    this.messageCount = 0,
    this.notificationCount = 0,
    this.currentNav = DashboardNavItem.home,
    this.onNavTap,
    this.drawer,
    this.showMenuButton = true,
    this.userDisplayName,
    this.onMenuTap,
    this.onMessagesTap,
    this.onNotificationsTap,
    this.onAvatarTap,
    this.scrollBody = true,
    this.showBottomNav = true,
    this.floatingActionButton,
    this.floatingActionButtonLocation,
    this.navAccentColor = DashboardColors.brandCyan,
  });

  final Widget body;
  final String avatarInitials;
  final String? avatarImageUrl;
  final int messageCount;
  final int notificationCount;
  final DashboardNavItem currentNav;
  final ValueChanged<DashboardNavItem>? onNavTap;
  final Widget? drawer;
  final bool showMenuButton;
  final String? userDisplayName;
  final VoidCallback? onMenuTap;
  final VoidCallback? onMessagesTap;
  final VoidCallback? onNotificationsTap;
  final VoidCallback? onAvatarTap;
  final bool scrollBody;
  final bool showBottomNav;
  final Widget? floatingActionButton;
  final FloatingActionButtonLocation? floatingActionButtonLocation;
  final Color navAccentColor;

  @override
  Widget build(BuildContext context) {
    return Theme(
      data: DashboardTheme.light,
      child: Scaffold(
        backgroundColor: DashboardColors.background,
        drawer: drawer,
        appBar: DashboardAppBar(
          avatarInitials: avatarInitials,
          avatarImageUrl: avatarImageUrl,
          userDisplayName: userDisplayName,
          showMenuButton: showMenuButton,
          messageCount: messageCount,
          notificationCount: notificationCount,
          onMenuTap: onMenuTap ??
              (drawer != null ? () => SpecialistNavigation.openDrawer(context) : null),
          onMessagesTap: onMessagesTap,
          onNotificationsTap: onNotificationsTap,
          onAvatarTap: onAvatarTap,
        ),
        body: SafeArea(
          child: scrollBody
              ? SingleChildScrollView(
                  padding: context.dashPadding,
                  child: body,
                )
              : body,
        ),
        bottomNavigationBar: showBottomNav
            ? DashboardBottomNav(
                currentIndex: currentNav,
                onTap: onNavTap,
                accentColor: navAccentColor,
              )
            : null,
        floatingActionButton: floatingActionButton,
        floatingActionButtonLocation: floatingActionButtonLocation,
      ),
    );
  }
}
