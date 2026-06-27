import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/constants/dashboard_colors.dart';
import '../../../core/routes/app_routes.dart';
import '../../auth/providers/auth_provider.dart';
import '../providers/admin_dashboard_provider.dart';
import '../providers/specialist_features_provider.dart';
import '../widgets/admin_navigation.dart';
import '../widgets/dashboard_bottom_nav.dart';
import '../widgets/dashboard_components.dart';
import '../widgets/dashboard_layout.dart';
import '../widgets/dashboard_scaffold.dart';
import '../widgets/dashboard_surface_card.dart';
import '../widgets/dashboard_visuals.dart';
import '../widgets/parent_dashboard_cards.dart';

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
    final profileImageUrl = authUser?.profileImageUrl;
    final theme = Theme.of(context);
    final adminDisplayName = authUser?.fullName.trim();
    final userDisplayName = (adminDisplayName != null && adminDisplayName.isNotEmpty)
        ? adminDisplayName
        : state.userName?.trim();

    if (state.isLoading) {
      return DashboardScaffold(
        avatarInitials: dashboardInitials(state.userName, fallback: 'AD'),
        avatarImageUrl: profileImageUrl,
        userDisplayName: userDisplayName,
        showMenuButton: false,
        notificationCount: state.unreadNotifications,
        onNotificationsTap: () => context.push(AppRoutes.adminNotifications),
        onAvatarTap: () => context.push(AppRoutes.adminProfile),
        onNavTap: (item) => AdminNavigation.onNavTap(context, item),
        body: const DashboardLoadingCard(),
      );
    }

    return DashboardScaffold(
      avatarInitials: dashboardInitials(state.userName, fallback: 'AD'),
      avatarImageUrl: profileImageUrl,
      userDisplayName: userDisplayName,
      showMenuButton: false,
      notificationCount: state.unreadNotifications,
      currentNav: DashboardNavItem.home,
      onNotificationsTap: () => context.push(AppRoutes.adminNotifications),
      onAvatarTap: () => context.push(AppRoutes.adminProfile),
      onNavTap: (item) => AdminNavigation.onNavTap(context, item),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          DashboardSurfaceCard(
            tint: DashboardColors.primary,
            onTap: () => context.push(AppRoutes.adminPatientAssignments),
            child: Row(
              children: [
                Container(
                  padding: EdgeInsets.all(context.dashSpacing * 0.45),
                  decoration: BoxDecoration(
                    color: DashboardColors.purpleSoft,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(
                    Icons.assignment_ind_outlined,
                    color: DashboardColors.primary,
                    size: context.dashSpacing * 0.6,
                  ),
                ),
                SizedBox(width: context.dashSpacing * 0.65),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Patient Assignments',
                        style: theme.textTheme.bodyMedium?.copyWith(
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      Text(
                        'Assign specialists and link parents to patients',
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: DashboardColors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ),
                Icon(Icons.chevron_right_rounded, color: DashboardColors.textMuted),
              ],
            ),
          ),
          if (state.errorMessage != null) ...[
            SizedBox(height: context.dashSpacing * 0.75),
            DashboardErrorCard(
              message: state.errorMessage!,
              onRetry: () => ref.read(adminDashboardProvider.notifier).refresh(),
            ),
          ],
          SizedBox(height: context.dashSpacing),
          DashboardSummaryGrid(
            cards: [
              DashboardSummaryCard(
                label: 'Total Users',
                value: '${state.overview.totalUsers}',
                icon: Icons.groups_outlined,
                iconBackground: DashboardColors.purpleSoft,
                iconColor: DashboardColors.primary,
                onTap: () => context.push(AppRoutes.adminUsers),
              ),
              DashboardSummaryCard(
                label: 'Total Patients',
                value: '${state.overview.totalPatients}',
                icon: Icons.person_outline_rounded,
                iconBackground: DashboardColors.tealSoft,
                iconColor: DashboardColors.accent,
                onTap: () => context.push(AppRoutes.adminPatientAssignments),
              ),
              DashboardSummaryCard(
                label: 'Specialists',
                value: '${state.overview.totalSpecialists}',
                icon: Icons.medical_services_outlined,
                iconBackground: DashboardColors.amberSoft,
                iconColor: DashboardColors.warning,
                onTap: () => context.push(AppRoutes.adminPatientAssignments),
              ),
              DashboardSummaryCard(
                label: 'New Signups This Week',
                value: '${state.overview.newSignupsThisWeek}',
                icon: Icons.person_add_alt_1_outlined,
                iconBackground: DashboardColors.purpleSoft,
                iconColor: DashboardColors.primary,
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
                  style: theme.textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w700,
                    color: DashboardColors.textPrimary,
                  ),
                ),
              ),
              Container(
                padding: EdgeInsets.symmetric(
                  horizontal: context.dashSpacing * 0.55,
                  vertical: context.dashSpacing * 0.25,
                ),
                decoration: BoxDecoration(
                  color: DashboardColors.surface,
                  borderRadius: BorderRadius.circular(999),
                  border: Border.all(color: DashboardColors.border),
                ),
                child: Text(
                  'This Week',
                  style: theme.textTheme.labelSmall?.copyWith(
                    color: DashboardColors.textSecondary,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
          SizedBox(height: context.dashSpacing * 0.75),
          DashboardSurfaceCard(
            child: DashboardSimpleBarChart(
              labels: const ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
              usersValues: List.filled(7, state.overview.newSignupsThisWeek > 0 ? 1 : 0),
              patientsValues: List.filled(7, state.overview.totalPatients > 0 ? 1 : 0),
            ),
          ),
          SizedBox(height: context.dashSpacing * 1.2),
          DashboardSectionHeader(
            title: 'Recent Users',
            onActionTap: () => context.push(AppRoutes.adminUsers),
          ),
          SizedBox(height: context.dashSpacing * 0.5),
          if (state.recentUsers.isEmpty)
            const DashboardEmptyCard(message: 'No users found.')
          else
            DashboardSurfaceCard(
              child: Column(
                children: [
                  for (var i = 0; i < state.recentUsers.length; i++) ...[
                    Row(
                      children: [
                        CircleAvatar(
                          radius: context.dashSpacing * 0.55,
                          backgroundColor: adminRoleColor(state.recentUsers[i].role)
                              .withValues(alpha: 0.15),
                          child: Text(
                            dashboardAvatarLetter(state.recentUsers[i].name),
                            style: theme.textTheme.labelLarge?.copyWith(
                              color: adminRoleColor(state.recentUsers[i].role),
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                        SizedBox(width: context.dashSpacing * 0.65),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                state.recentUsers[i].name,
                                style: theme.textTheme.bodyMedium?.copyWith(
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                              Text(
                                state.recentUsers[i].role,
                                style: theme.textTheme.bodySmall?.copyWith(
                                  color: DashboardColors.textSecondary,
                                ),
                              ),
                            ],
                          ),
                        ),
                        Text(
                          state.recentUsers[i].registeredLabel,
                          style: theme.textTheme.labelSmall?.copyWith(
                            color: DashboardColors.textMuted,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                    if (i != state.recentUsers.length - 1)
                      Divider(
                        height: context.dashSpacing * 1.4,
                        color: DashboardColors.border,
                      ),
                  ],
                ],
              ),
            ),
          SizedBox(height: context.dashSpacing),
        ],
      ),
    );
  }
}
