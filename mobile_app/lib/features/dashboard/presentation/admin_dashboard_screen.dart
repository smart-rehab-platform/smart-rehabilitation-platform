import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/constants/admin_dashboard_colors.dart';
import '../../../core/routes/app_routes.dart';
import '../../auth/providers/auth_provider.dart';
import '../providers/admin_dashboard_provider.dart';
import '../providers/specialist_features_provider.dart';
import '../widgets/admin_page_scaffold.dart';
import '../widgets/admin_ui_components.dart';
import '../widgets/dashboard_bottom_nav.dart';
import '../widgets/dashboard_layout.dart';

class AdminDashboardScreen extends ConsumerStatefulWidget {
  const AdminDashboardScreen({super.key});

  @override
  ConsumerState<AdminDashboardScreen> createState() => _AdminDashboardScreenState();
}

class _AdminDashboardScreenState extends ConsumerState<AdminDashboardScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(adminDashboardProvider.notifier).initialize();
      ref.read(specialistNotificationsProvider.notifier).initialize();
    });
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(adminDashboardProvider);
    final authUser = ref.watch(authProvider).user;
    final theme = Theme.of(context);
    final adminDisplayName = authUser?.fullName.trim();
    final userDisplayName = (adminDisplayName != null && adminDisplayName.isNotEmpty)
        ? adminDisplayName
        : state.userName?.trim();

    return AdminPageScaffold(
      title: 'Admin Dashboard',
      currentNav: DashboardNavItem.home,
      wrapBodyInScrollView: true,
      body: state.isLoading
          ? const AdminLoadingCard()
          : Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                AdminPageTitle(
                  title: userDisplayName != null && userDisplayName.isNotEmpty
                      ? 'Welcome, $userDisplayName'
                      : 'Welcome, Admin',
                  subtitle: 'Hospital rehabilitation management overview',
                ),
                SizedBox(height: context.dashSpacing),
                AdminSurfaceCard(
                  onTap: () => context.push(AppRoutes.adminPatientAssignments),
                  tint: AdminDashboardColors.primary,
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const AdminIconCircle(
                        icon: Icons.assignment_ind_outlined,
                        color: AdminDashboardColors.primary,
                        background: AdminDashboardColors.blueSoft,
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Patient Assignments',
                              style: theme.textTheme.titleMedium?.copyWith(
                                fontWeight: FontWeight.w700,
                                color: AdminDashboardColors.textPrimary,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              'Assign specialists and link parents to patients',
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                              style: theme.textTheme.bodySmall?.copyWith(
                                color: AdminDashboardColors.textSecondary,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 8),
                      const Icon(
                        Icons.chevron_right_rounded,
                        color: AdminDashboardColors.textMuted,
                      ),
                    ],
                  ),
                ),
                if (state.errorMessage != null) ...[
                  SizedBox(height: context.dashSpacing * 0.75),
                  AdminErrorCard(
                    message: state.errorMessage!,
                    onRetry: () => ref.read(adminDashboardProvider.notifier).refresh(),
                  ),
                ],
                SizedBox(height: context.dashSpacing),
                AdminMetricGrid(
                  cards: [
                    AdminMetricCard(
                      label: 'Users',
                      value: '${state.overview.totalUsers}',
                      subtitle: '+${state.overview.newSignupsThisWeek} this week',
                      icon: Icons.groups_outlined,
                      iconColor: AdminDashboardColors.primary,
                      iconBackground: AdminDashboardColors.blueSoft,
                      onTap: () => context.push(AppRoutes.adminUsers),
                    ),
                    AdminMetricCard(
                      label: 'Patients',
                      value: '${state.overview.totalPatients}',
                      icon: Icons.person_outline_rounded,
                      iconColor: AdminDashboardColors.primary,
                      iconBackground: AdminDashboardColors.blueSoft,
                      onTap: () => context.push(AppRoutes.adminPatients),
                    ),
                    AdminMetricCard(
                      label: 'Specialists',
                      value: '${state.overview.totalSpecialists}',
                      icon: Icons.medical_services_outlined,
                      iconColor: AdminDashboardColors.emerald,
                      iconBackground: AdminDashboardColors.emeraldSoft,
                      onTap: () => context.push(AppRoutes.adminUsers),
                    ),
                    AdminMetricCard(
                      label: 'New Signups',
                      value: '${state.overview.newSignupsThisWeek}',
                      subtitle: 'This week',
                      icon: Icons.person_add_alt_1_outlined,
                      iconColor: AdminDashboardColors.primary,
                      iconBackground: AdminDashboardColors.blueSoft,
                      onTap: () => context.push(AppRoutes.adminUsers),
                    ),
                  ],
                ),
                SizedBox(height: context.dashSpacing * 1.2),
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        'System Analytics',
                        style: theme.textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.w800,
                          color: AdminDashboardColors.textPrimary,
                        ),
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: AdminDashboardColors.surface,
                        borderRadius: BorderRadius.circular(999),
                        border: Border.all(color: AdminDashboardColors.border),
                      ),
                      child: Text(
                        'This Week',
                        style: theme.textTheme.labelSmall?.copyWith(
                          color: AdminDashboardColors.textSecondary,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ],
                ),
                SizedBox(height: context.dashSpacing * 0.75),
                AdminSurfaceCard(
                  child: AdminBarChart(
                    labels: const ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    usersValues: List.filled(7, state.overview.newSignupsThisWeek > 0 ? 1 : 0),
                    patientsValues: List.filled(7, state.overview.totalPatients > 0 ? 1 : 0),
                  ),
                ),
                SizedBox(height: context.dashSpacing * 1.2),
                AdminSectionHeader(
                  title: 'Recent Users',
                  onActionTap: () => context.push(AppRoutes.adminUsers),
                ),
                SizedBox(height: context.dashSpacing * 0.5),
                if (state.recentUsers.isEmpty)
                  const AdminEmptyCard(message: 'No users found.')
                else
                  AdminTableContainer(
                    rows: [
                      for (var i = 0; i < state.recentUsers.length; i++)
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            CircleAvatar(
                              radius: 22,
                              backgroundColor: adminRoleColor(state.recentUsers[i].role)
                                  .withValues(alpha: 0.12),
                              child: Text(
                                dashboardAvatarLetter(state.recentUsers[i].name),
                                style: theme.textTheme.labelLarge?.copyWith(
                                  color: adminRoleColor(state.recentUsers[i].role),
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                            ),
                            const SizedBox(width: 14),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    state.recentUsers[i].name,
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                    style: theme.textTheme.bodyMedium?.copyWith(
                                      fontWeight: FontWeight.w700,
                                      color: AdminDashboardColors.textPrimary,
                                    ),
                                  ),
                                  Text(
                                    state.recentUsers[i].role,
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                    style: theme.textTheme.bodySmall?.copyWith(
                                      color: AdminDashboardColors.textSecondary,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(width: 8),
                            Flexible(
                              child: Text(
                                state.recentUsers[i].registeredLabel,
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                                textAlign: TextAlign.end,
                                style: theme.textTheme.labelSmall?.copyWith(
                                  color: AdminDashboardColors.textMuted,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                          ],
                        ),
                    ],
                  ),
                SizedBox(height: context.dashSpacing),
              ],
            ),
    );
  }
}
