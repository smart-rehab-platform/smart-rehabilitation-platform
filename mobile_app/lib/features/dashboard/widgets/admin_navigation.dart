import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/constants/dashboard_colors.dart';
import '../../../core/routes/app_routes.dart';
import '../../auth/providers/auth_provider.dart';
import '../widgets/dashboard_bottom_nav.dart';

class AdminNavigation {
  AdminNavigation._();

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
    if (location.startsWith(AppRoutes.adminPatientAssignments)) {
      return DashboardNavItem.patients;
    }
    if (location.startsWith(AppRoutes.adminExercises)) {
      return DashboardNavItem.exercises;
    }
    if (location.startsWith(AppRoutes.adminReports)) {
      return DashboardNavItem.reports;
    }
    if (location.startsWith(AppRoutes.adminMore)) {
      return DashboardNavItem.more;
    }
    return null;
  }

  static void onNavTap(BuildContext context, DashboardNavItem item) {
    switch (item) {
      case DashboardNavItem.home:
        context.go(AppRoutes.adminDashboard);
      case DashboardNavItem.patients:
        context.go(AppRoutes.adminPatientAssignments);
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
                  CircleAvatar(
                    radius: 28,
                    backgroundColor: DashboardColors.purpleSoft,
                    child: Text(
                      name.isNotEmpty ? name[0].toUpperCase() : 'A',
                      style: theme.textTheme.titleLarge?.copyWith(
                        color: DashboardColors.primary,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(name, style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700)),
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
                    onTap: () => _go(context, AppRoutes.adminUsers),
                  ),
                  _AdminDrawerTile(
                    icon: Icons.assignment_ind_outlined,
                    label: 'Patient Assignments',
                    onTap: () => _go(context, AppRoutes.adminPatientAssignments),
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
                    onTap: () => _go(context, AppRoutes.adminNotifications),
                  ),
                  _AdminDrawerTile(
                    icon: Icons.person_outline_rounded,
                    label: 'Profile',
                    onTap: () => _go(context, AppRoutes.adminProfile),
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
      leading: Icon(icon, color: DashboardColors.primary),
      title: Text(label),
      onTap: onTap,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      contentPadding: const EdgeInsets.symmetric(horizontal: 20),
    );
  }
}
