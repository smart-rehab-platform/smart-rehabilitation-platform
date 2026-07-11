import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/constants/dashboard_colors.dart';
import '../../../core/routes/app_routes.dart';
import '../../auth/providers/auth_provider.dart';
import '../widgets/dashboard_bottom_nav.dart';

class SpecialistNavigation {
  SpecialistNavigation._();

  static void openDrawer(BuildContext context) {
    final scaffold = Scaffold.maybeOf(context);
    if (scaffold?.hasDrawer ?? false) {
      scaffold!.openDrawer();
    }
  }

  static void onNavTap(BuildContext context, DashboardNavItem item) {
    switch (item) {
      case DashboardNavItem.home:
        context.go(AppRoutes.specialistDashboard);
      case DashboardNavItem.patients:
        context.go(AppRoutes.specialistPatients);
      case DashboardNavItem.exercises:
        context.go(AppRoutes.specialistExercises);
      case DashboardNavItem.reports:
        context.go(AppRoutes.specialistReports);
      case DashboardNavItem.more:
        context.go(AppRoutes.specialistMore);
    }
  }

  static Future<void> logout(BuildContext context, WidgetRef ref) async {
    await ref.read(authProvider.notifier).logout();
    if (context.mounted) {
      context.go(AppRoutes.login);
    }
  }
}

class SpecialistDrawer extends ConsumerWidget {
  const SpecialistDrawer({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final user = ref.watch(authProvider).user;
    final name = user?.fullName ?? 'Specialist';

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
                      name.isNotEmpty ? name[0].toUpperCase() : 'S',
                      style: theme.textTheme.titleLarge?.copyWith(
                        color: DashboardColors.primary,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
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
                  _DrawerTile(
                    icon: Icons.dashboard_outlined,
                    label: 'Dashboard',
                    onTap: () => _go(context, AppRoutes.specialistDashboard),
                  ),
                  _DrawerTile(
                    icon: Icons.people_outline_rounded,
                    label: 'Patients',
                    onTap: () => _go(context, AppRoutes.specialistPatients),
                  ),
                  _DrawerTile(
                    icon: Icons.rate_review_outlined,
                    label: 'Pending Reviews',
                    onTap: () =>
                        _go(context, AppRoutes.specialistPendingReviews),
                  ),
                  _DrawerTile(
                    icon: Icons.calendar_today_outlined,
                    label: "Today's Sessions",
                    onTap: () => _go(context, AppRoutes.specialistSessions),
                  ),
                  _DrawerTile(
                    icon: Icons.assignment_outlined,
                    label: 'Treatment Plans',
                    onTap: () =>
                        _go(context, AppRoutes.specialistTreatmentPlans),
                  ),
                  _DrawerTile(
                    icon: Icons.link_rounded,
                    label: 'Manage Parent Links',
                    onTap: () => _go(context, AppRoutes.manageParentLinks),
                  ),
                  _DrawerTile(
                    icon: Icons.chat_bubble_outline_rounded,
                    label: 'Messages',
                    onTap: () => _go(context, AppRoutes.specialistMessages),
                  ),
                  _DrawerTile(
                    icon: Icons.fitness_center_outlined,
                    label: 'Exercises',
                    onTap: () => _go(context, AppRoutes.specialistExercises),
                  ),
                  _DrawerTile(
                    icon: Icons.description_outlined,
                    label: 'Reports',
                    onTap: () => _go(context, AppRoutes.specialistReports),
                  ),
                  _DrawerTile(
                    icon: Icons.notifications_none_rounded,
                    label: 'Notifications',
                    onTap: () =>
                        _go(context, AppRoutes.specialistNotifications),
                  ),
                  _DrawerTile(
                    icon: Icons.person_outline_rounded,
                    label: 'Profile',
                    onTap: () => _go(context, AppRoutes.specialistProfile),
                  ),
                ],
              ),
            ),
            const Divider(height: 1),
            _DrawerTile(
              icon: Icons.logout_rounded,
              label: 'Logout',
              onTap: () async {
                Navigator.of(context).pop();
                await SpecialistNavigation.logout(context, ref);
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

class _DrawerTile extends StatelessWidget {
  const _DrawerTile({
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
