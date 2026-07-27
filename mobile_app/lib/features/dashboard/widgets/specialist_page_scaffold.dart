import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/constants/dashboard_colors.dart';
import '../../../core/routes/app_routes.dart';
import '../../../core/theme/dashboard_theme.dart';
import '../../auth/providers/auth_provider.dart';
import '../providers/specialist_features_provider.dart';
import 'dashboard_app_bar.dart';
import 'dashboard_bottom_nav.dart';
import 'dashboard_layout.dart';
import 'parent_dashboard_cards.dart';
import 'specialist_navigation.dart';

class SpecialistPageScaffold extends ConsumerWidget {
  const SpecialistPageScaffold({
    super.key,
    required this.title,
    required this.body,
    this.currentNav,
    this.showBackButton = false,
    this.actions,
    this.floatingActionButton,
    this.onBackPressed,
    this.appBarShowBrandTitle = true,
    this.appBarShowMessagesAction = true,
  });

  final String title;
  final Widget body;
  final DashboardNavItem? currentNav;
  final bool showBackButton;
  final List<Widget>? actions;
  final Widget? floatingActionButton;
  final VoidCallback? onBackPressed;
  final bool appBarShowBrandTitle;
  final bool appBarShowMessagesAction;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final auth = ref.watch(authProvider);
    final notifications = ref.watch(specialistNotificationsProvider);
    final displayName = auth.user?.fullName ?? '';
    final avatarInitials = dashboardInitials(displayName, fallback: 'SP');

    final scaffold = Scaffold(
      backgroundColor: DashboardColors.background,
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
        onNotificationsTap: () => context.push(AppRoutes.specialistNotifications),
        onAvatarTap: () => context.push(AppRoutes.specialistProfile),
      ),
      body: SafeArea(child: body),
      floatingActionButton: floatingActionButton,
      bottomNavigationBar: currentNav == null
          ? null
          : DashboardBottomNav(
              currentIndex: currentNav!,
              onTap: (item) => SpecialistNavigation.onNavTap(context, item),
              accentColor: DashboardColors.brandCyan,
            ),
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

class SpecialistAsyncBody extends StatelessWidget {
  const SpecialistAsyncBody({
    super.key,
    required this.isLoading,
    required this.errorMessage,
    required this.onRetry,
    required this.isEmpty,
    required this.emptyMessage,
    required this.child,
  });

  final bool isLoading;
  final String? errorMessage;
  final VoidCallback onRetry;
  final bool isEmpty;
  final String emptyMessage;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return const Center(child: DashboardLoadingCard());
    }

    return SingleChildScrollView(
      padding: context.dashPadding,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          if (errorMessage != null)
            DashboardErrorCard(message: errorMessage!, onRetry: onRetry),
          if (isEmpty) DashboardEmptyCard(message: emptyMessage) else child,
        ],
      ),
    );
  }
}
