import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/constants/dashboard_colors.dart';
import '../../../core/routes/app_routes.dart';
import '../../auth/providers/auth_provider.dart';
import '../widgets/dashboard_bottom_nav.dart';
import '../widgets/dashboard_layout.dart';
import '../widgets/dashboard_profile_avatar.dart';

/// Route [extra] marker for screens opened from the Admin More menu.
enum AdminModuleOrigin { more }

class AdminNavigation {
  AdminNavigation._();

  static AdminModuleOrigin? moduleOrigin(BuildContext context) {
    final extra = GoRouterState.of(context).extra;
    return extra is AdminModuleOrigin ? extra : null;
  }

  static bool isFromMore(BuildContext context) =>
      moduleOrigin(context) == AdminModuleOrigin.more;

  static void openFromMore(BuildContext context, String location) {
    context.push(location, extra: AdminModuleOrigin.more);
  }

  /// Bottom-nav highlight for top-level module list screens.
  static DashboardNavItem? listScreenNav(
    BuildContext context, {
    DashboardNavItem? tabItem,
  }) {
    if (isFromMore(context)) {
      return DashboardNavItem.more;
    }
    if (tabItem != null) {
      return tabItem;
    }
    if (context.canPop()) {
      return DashboardNavItem.home;
    }
    return null;
  }

  static void handleModuleListBack(BuildContext context) {
    if (context.canPop()) {
      context.pop();
      return;
    }
    if (isFromMore(context)) {
      context.go(AppRoutes.adminMore);
      return;
    }
    context.go(AppRoutes.adminDashboard);
  }

  static void handleDetailBack(BuildContext context) {
    if (context.canPop()) {
      context.pop();
      return;
    }
    popOrGoAdmin(context);
  }

  static void openDrawer(BuildContext context) {
    final scaffold = Scaffold.maybeOf(context);
    if (scaffold?.hasDrawer ?? false) {
      scaffold!.openDrawer();
    }
  }

  static void popOrGoAdmin(BuildContext context) {
    if (context.canPop()) {
      context.pop();
    } else {
      context.go(AppRoutes.adminDashboard);
    }
  }

  static DashboardNavItem? navItemForRoute(String location) {
    if (location == AppRoutes.adminDashboard) {
      return DashboardNavItem.home;
    }
    if (location.startsWith(AppRoutes.adminPatients) ||
        location.startsWith(AppRoutes.adminPatientAssignments)) {
      return DashboardNavItem.patients;
    }
    if (location.startsWith(AppRoutes.adminExercises)) {
      return DashboardNavItem.exercises;
    }
    if (location.startsWith(AppRoutes.adminReports)) {
      return DashboardNavItem.reports;
    }
    if (location.startsWith(AppRoutes.adminMore) ||
        location.startsWith(AppRoutes.adminUsers) ||
        location.startsWith(AppRoutes.adminSessions) ||
        location.startsWith(AppRoutes.adminAuditLogs) ||
        location.startsWith(AppRoutes.adminAiCenter) ||
        location.startsWith(AppRoutes.adminCaseRequests) ||
        location.startsWith(AppRoutes.adminNotifications)) {
      return DashboardNavItem.more;
    }
    return null;
  }

  static void onNavTap(BuildContext context, DashboardNavItem item) {
    switch (item) {
      case DashboardNavItem.home:
        context.go(AppRoutes.adminDashboard);
      case DashboardNavItem.patients:
        context.go(AppRoutes.adminPatients);
      case DashboardNavItem.exercises:
        context.go(AppRoutes.adminExercises);
      case DashboardNavItem.reports:
        context.go(AppRoutes.adminReports);
      case DashboardNavItem.more:
        context.go(AppRoutes.adminMore);
    }
  }

  static Future<void> logout(BuildContext context, WidgetRef ref) async {
    await ref.read(authProvider.notifier).logout();
    if (context.mounted) {
      context.go(AppRoutes.login);
    }
  }
}

class AdminDrawer extends ConsumerWidget {
  const AdminDrawer({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final user = ref.watch(authProvider).user;
    final name = user?.fullName ?? 'Admin';

    return Drawer(
      backgroundColor: DashboardColors.surface,
      child: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  DashboardProfileAvatar(
                    initials: dashboardInitials(name, fallback: 'AD'),
                    imageUrl: user?.profileImageUrl,
                    radius: 28,
                  ),
                  const SizedBox(height: 12),
                  Text(
                    name,
                    style: theme.textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  if (user?.email != null)
                    Text(
                      user!.email,
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: DashboardColors.textSecondary,
                      ),
                    ),
                ],
              ),
            ),
            const Divider(height: 1),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.symmetric(vertical: 8),
                children: [
                  _AdminDrawerTile(
                    icon: Icons.dashboard_outlined,
                    label: 'Dashboard',
                    onTap: () => _go(context, AppRoutes.adminDashboard),
                  ),
                  _AdminDrawerTile(
                    icon: Icons.groups_outlined,
                    label: 'Users',
                    onTap: () => _openFromMore(context, AppRoutes.adminUsers),
                  ),
                  _AdminDrawerTile(
                    icon: Icons.people_outline_rounded,
                    label: 'Patients',
                    onTap: () => _openFromMore(context, AppRoutes.adminPatients),
                  ),
                  _AdminDrawerTile(
                    icon: Icons.assignment_ind_outlined,
                    label: 'Patient Assignments',
                    onTap: () => _openFromMore(
                      context,
                      AppRoutes.adminPatientAssignments,
                    ),
                  ),
                  _AdminDrawerTile(
                    icon: Icons.inbox_outlined,
                    label: 'Case Requests',
                    onTap: () =>
                        _openFromMore(context, AppRoutes.adminCaseRequests),
                  ),
                  _AdminDrawerTile(
                    icon: Icons.event_note_outlined,
                    label: 'Sessions',
                    onTap: () => _openFromMore(context, AppRoutes.adminSessions),
                  ),
                  _AdminDrawerTile(
                    icon: Icons.psychology_outlined,
                    label: 'AI Center',
                    onTap: () => _openFromMore(context, AppRoutes.adminAiCenter),
                  ),
                  _AdminDrawerTile(
                    icon: Icons.history_rounded,
                    label: 'Audit Logs',
                    onTap: () => _openFromMore(context, AppRoutes.adminAuditLogs),
                  ),
                  _AdminDrawerTile(
                    icon: Icons.fitness_center_outlined,
                    label: 'Exercises',
                    onTap: () => _go(context, AppRoutes.adminExercises),
                  ),
                  _AdminDrawerTile(
                    icon: Icons.description_outlined,
                    label: 'Reports',
                    onTap: () => _go(context, AppRoutes.adminReports),
                  ),
                  _AdminDrawerTile(
                    icon: Icons.notifications_none_rounded,
                    label: 'Notifications',
                    onTap: () =>
                        _openFromMore(context, AppRoutes.adminNotifications),
                  ),
                  _AdminDrawerTile(
                    icon: Icons.person_outline_rounded,
                    label: 'Profile',
                    onTap: () => _openFromMore(context, AppRoutes.adminProfile),
                  ),
                ],
              ),
            ),
            const Divider(height: 1),
            _AdminDrawerTile(
              icon: Icons.logout_rounded,
              label: 'Logout',
              onTap: () async {
                Navigator.of(context).pop();
                await AdminNavigation.logout(context, ref);
              },
            ),
            const SizedBox(height: 8),
          ],
        ),
      ),
    );
  }

  void _go(BuildContext context, String route) {
    Navigator.of(context).pop();
    context.go(route);
  }

  void _openFromMore(BuildContext context, String route) {
    Navigator.of(context).pop();
    AdminNavigation.openFromMore(context, route);
  }
}

class _AdminDrawerTile extends StatelessWidget {
  const _AdminDrawerTile({
    required this.icon,
    required this.label,
    required this.onTap,
  });

  final IconData icon;
  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Icon(icon, color: DashboardColors.brandCyan),
      title: Text(
        label,
        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
          fontWeight: FontWeight.w600,
          color: DashboardColors.textPrimary,
        ),
      ),
      onTap: onTap,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      contentPadding: const EdgeInsets.symmetric(horizontal: 20),
      hoverColor: DashboardColors.brandSoft,
    );
  }
}
