import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/constants/dashboard_colors.dart';
import '../../../core/routes/app_routes.dart';
import '../../../core/theme/dashboard_theme.dart';
import '../../auth/providers/auth_provider.dart';
import '../providers/specialist_features_provider.dart';
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
  });

  final String title;
  final Widget body;
  final DashboardNavItem? currentNav;
  final bool showBackButton;
  final List<Widget>? actions;
  final Widget? floatingActionButton;
  final VoidCallback? onBackPressed;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final auth = ref.watch(authProvider);
    final userName = auth.user?.fullName;
    final unread = ref.watch(specialistNotificationsProvider).unreadCount;

    return Theme(
      data: DashboardTheme.light,
      child: Scaffold(
        backgroundColor: DashboardColors.background,
        drawer: const SpecialistDrawer(),
        appBar: AppBar(
          backgroundColor: DashboardColors.background,
          surfaceTintColor: Colors.transparent,
          leading: showBackButton
              ? IconButton(
                  icon: const Icon(Icons.arrow_back_rounded),
                  onPressed: onBackPressed ?? () => context.pop(),
                )
              : IconButton(
                  icon: const Icon(Icons.menu_rounded),
                  onPressed: () => SpecialistNavigation.openDrawer(context),
                ),
          title: Text(
            title,
            style: Theme.of(
              context,
            ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700),
          ),
          actions: [
            ...?actions,
            _NotificationAction(
              count: unread,
              onTap: () => context.push(AppRoutes.specialistNotifications),
            ),
            _AvatarAction(
              initials: dashboardInitials(userName, fallback: 'SP'),
              onTap: () => context.push(AppRoutes.specialistProfile),
            ),
            SizedBox(width: context.dashSpacing * 0.35),
          ],
        ),
        body: SafeArea(child: body),
        floatingActionButton: floatingActionButton,
        bottomNavigationBar: currentNav == null
            ? null
            : DashboardBottomNav(
                currentIndex: currentNav!,
                onTap: (item) => SpecialistNavigation.onNavTap(context, item),
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
    final theme = Theme.of(context);

    return Stack(
      clipBehavior: Clip.none,
      children: [
        IconButton(
          onPressed: onTap,
          icon: const Icon(Icons.notifications_none_rounded),
          color: DashboardColors.textPrimary,
        ),
        if (count > 0)
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
  const _AvatarAction({required this.initials, required this.onTap});

  final String initials;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(24),
      child: Padding(
        padding: EdgeInsets.only(right: context.dashSpacing * 0.35),
        child: CircleAvatar(
          radius: context.dashSpacing * 0.55,
          backgroundColor: DashboardColors.purpleSoft,
          child: Text(
            initials,
            style: Theme.of(context).textTheme.labelLarge?.copyWith(
              color: DashboardColors.primary,
              fontWeight: FontWeight.w700,
            ),
          ),
        ),
      ),
    );
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
