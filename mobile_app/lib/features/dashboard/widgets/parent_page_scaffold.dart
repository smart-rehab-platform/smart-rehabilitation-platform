import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/constants/dashboard_colors.dart';
import '../../../core/routes/app_routes.dart';
import '../../../core/theme/dashboard_theme.dart';
import '../../auth/providers/auth_provider.dart';
import '../providers/parent_dashboard_provider.dart';
import '../providers/parent_features_provider.dart';
import 'dashboard_bottom_nav.dart';
import 'dashboard_layout.dart';
import 'parent_navigation.dart';
import 'specialist_page_scaffold.dart';

class ParentPageScaffold extends ConsumerWidget {
  const ParentPageScaffold({
    super.key,
    required this.title,
    required this.body,
    this.currentNav,
    this.showBackButton = false,
    this.actions,
  });

  final String title;
  final Widget body;
  final DashboardNavItem? currentNav;
  final bool showBackButton;
  final List<Widget>? actions;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final auth = ref.watch(authProvider);
    final userName = auth.user?.fullName;
    final dashboardUnread = ref.watch(parentDashboardProvider).unreadNotifications;
    final notificationsUnread =
        ref.watch(parentNotificationsProvider).unreadCount;
    final unread = notificationsUnread > 0 ? notificationsUnread : dashboardUnread;

    return Theme(
      data: DashboardTheme.light,
      child: Scaffold(
        backgroundColor: DashboardColors.background,
        appBar: AppBar(
          backgroundColor: DashboardColors.background,
          surfaceTintColor: Colors.transparent,
          leading: showBackButton
              ? IconButton(
                  icon: const Icon(Icons.arrow_back_rounded),
                  onPressed: () => context.pop(),
                )
              : null,
          automaticallyImplyLeading: showBackButton,
          title: Text(
            title,
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w700,
                ),
          ),
          actions: [
            ...?actions,
            _NotificationAction(
              count: unread,
              onTap: () => context.push(AppRoutes.parentNotifications),
            ),
            _AvatarAction(
              initials: dashboardInitials(userName, fallback: 'PR'),
              onTap: () => context.push(AppRoutes.parentProfile),
            ),
            SizedBox(width: context.dashSpacing * 0.35),
          ],
        ),
        body: SafeArea(child: body),
        bottomNavigationBar: currentNav == null
            ? null
            : DashboardBottomNav(
                currentIndex: currentNav!,
                onTap: (item) => ParentNavigation.onNavTap(context, item),
              ),
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
    return Stack(
      clipBehavior: Clip.none,
      children: [
        IconButton(
          onPressed: onTap,
          icon: const Icon(Icons.notifications_none_rounded),
        ),
        if (count > 0)
          Positioned(
            right: 6,
            top: 6,
            child: Container(
              padding: const EdgeInsets.all(4),
              decoration: const BoxDecoration(
                color: DashboardColors.warning,
                shape: BoxShape.circle,
              ),
              constraints: const BoxConstraints(minWidth: 16, minHeight: 16),
              child: Text(
                count > 9 ? '9+' : '$count',
                textAlign: TextAlign.center,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 9,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
          ),
      ],
    );
  }
}

class _AvatarAction extends StatelessWidget {
  const _AvatarAction({required this.initials, required this.onTap});

  final String initials;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(20),
      child: CircleAvatar(
        radius: 18,
        backgroundColor: DashboardColors.purpleSoft,
        child: Text(
          initials,
          style: const TextStyle(
            color: DashboardColors.primary,
            fontWeight: FontWeight.w700,
            fontSize: 13,
          ),
        ),
      ),
    );
  }
}

class ParentAsyncBody extends StatelessWidget {
  const ParentAsyncBody({
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
    return SpecialistAsyncBody(
      isLoading: isLoading,
      errorMessage: errorMessage,
      onRetry: onRetry,
      isEmpty: isEmpty,
      emptyMessage: emptyMessage,
      child: child,
    );
  }
}
