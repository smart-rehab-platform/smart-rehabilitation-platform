import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/constants/dashboard_colors.dart';
import '../../../core/routes/app_routes.dart';
import '../../auth/providers/auth_provider.dart';
import '../providers/admin_dashboard_provider.dart';
import '../providers/specialist_features_provider.dart';
import '../widgets/admin_page_scaffold.dart';
import '../widgets/admin_ui_components.dart';
import '../widgets/dashboard_bottom_nav.dart';
import '../widgets/dashboard_components.dart';
import '../widgets/dashboard_layout.dart';
import '../widgets/parent_dashboard_cards.dart';

class AdminDashboardScreen extends ConsumerStatefulWidget {
  const AdminDashboardScreen({super.key});

  @override
  ConsumerState<AdminDashboardScreen> createState() =>
      _AdminDashboardScreenState();
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
    final userDisplayName =
        (adminDisplayName != null && adminDisplayName.isNotEmpty)
        ? adminDisplayName
        : state.userName?.trim();
    final greetingName = userDisplayName != null && userDisplayName.isNotEmpty
        ? userDisplayName
        : 'Admin';

    return AdminPageScaffold(
      title: '',
      currentNav: DashboardNavItem.home,
      wrapBodyInScrollView: true,
      body: state.isLoading
          ? const DashboardLoadingCard()
          : Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                DashboardGreeting(message: 'Welcome, $greetingName'),
                const SizedBox(height: 6),
                Text(
                  'Manage your rehabilitation platform from one place.',
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: DashboardColors.textSecondary,
                  ),
                ),
                SizedBox(height: context.dashSpacing * 0.75),
                AdminSurfaceCard(
                  onTap: () => context.push(AppRoutes.adminPatientAssignments),
                  tint: DashboardColors.brandCyan,
                  padding: EdgeInsets.symmetric(
                    horizontal: context.dashSpacing * 0.9,
                    vertical: context.dashSpacing * 0.85,
                  ),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      AdminIconCircle(
                        icon: Icons.assignment_ind_outlined,
                        color: DashboardColors.brandCyan,
                        background: DashboardColors.blueSoft,
                      ),
                      SizedBox(width: context.dashSpacing * 0.65),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(
                              'Patient Assignments',
                              style: theme.textTheme.titleMedium?.copyWith(
                                fontWeight: FontWeight.w800,
                                color: DashboardColors.textPrimary,
                                height: 1.25,
                              ),
                            ),
                            SizedBox(height: context.dashSpacing * 0.15),
                            Text(
                              'Assign specialists and link parents to patients',
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                              style: theme.textTheme.bodySmall?.copyWith(
                                color: DashboardColors.textSecondary,
                                height: 1.4,
                              ),
                            ),
                          ],
                        ),
                      ),
                      Icon(
                        Icons.chevron_right_rounded,
                        color: DashboardColors.textMuted,
                        size: context.dashSpacing * 0.55,
                      ),
                    ],
                  ),
                ),
                if (state.errorMessage != null) ...[
                  SizedBox(height: context.dashSpacing * 0.75),
                  DashboardErrorCard(
                    message: state.errorMessage!,
                    onRetry: () =>
                        ref.read(adminDashboardProvider.notifier).refresh(),
                  ),
                ],
                SizedBox(height: context.dashSpacing * 1.2),
                DashboardSummaryGrid(
                  compact: true,
                  childAspectRatio: 1.52,
                  cards: [
                    DashboardSummaryCard(
                      compact: true,
                      label: 'Users',
                      value: '${state.overview.totalUsers}',
                      subtitle:
                          '+${state.overview.newSignupsThisWeek} this week',
                      icon: Icons.groups_outlined,
                      iconBackground: DashboardColors.blueSoft,
                      iconColor: const Color(0xFF3B82F6),
                      onTap: () => context.push(AppRoutes.adminUsers),
                    ),
                    DashboardSummaryCard(
                      compact: true,
                      label: 'Patients',
                      value: '${state.overview.totalPatients}',
                      icon: Icons.person_outline_rounded,
                      iconBackground: DashboardColors.tealSoft,
                      iconColor: DashboardColors.accent,
                      onTap: () => context.push(AppRoutes.adminPatients),
                    ),
                    DashboardSummaryCard(
                      compact: true,
                      label: 'Specialists',
                      value: '${state.overview.totalSpecialists}',
                      icon: Icons.medical_services_outlined,
                      iconBackground: DashboardColors.tealSoft,
                      iconColor: DashboardColors.success,
                      onTap: () => context.push(AppRoutes.adminUsers),
                    ),
                    DashboardSummaryCard(
                      compact: true,
                      label: 'New Signups',
                      value: '${state.overview.newSignupsThisWeek}',
                      subtitle: 'This week',
                      labelMaxLines: 2,
                      icon: Icons.person_add_alt_1_outlined,
                      iconBackground: DashboardColors.amberSoft,
                      iconColor: DashboardColors.warning,
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
                    AdminSystemAnalyticsPeriodControls(
                      periodLabel: state.selectedSystemActivityPeriodLabel,
                      selectedWeekOffset: state.systemActivityWeekOffset,
                      canGoForward: state.systemActivityWeekOffset > 0,
                      isLoading: state.isSystemActivityLoading,
                      onPreviousWeek: () {
                        ref
                            .read(adminDashboardProvider.notifier)
                            .showPreviousSystemActivityWeek();
                      },
                      onNextWeek: () {
                        ref
                            .read(adminDashboardProvider.notifier)
                            .showNextSystemActivityWeek();
                      },
                      onPresetSelected: (offset) {
                        ref
                            .read(adminDashboardProvider.notifier)
                            .setSystemActivityWeekOffset(offset);
                      },
                    ),
                  ],
                ),
                SizedBox(height: context.dashSpacing * 0.75),
                if (state.systemActivityErrorMessage != null)
                  DashboardErrorCard(
                    message: state.systemActivityErrorMessage!,
                    onRetry: () => ref
                        .read(adminDashboardProvider.notifier)
                        .setSystemActivityWeekOffset(
                          state.systemActivityWeekOffset,
                        ),
                  )
                else
                  AdminSurfaceCard(
                    padding: EdgeInsets.all(context.dashSpacing * 0.75),
                    child: AdminBarChart(
                      periodKey:
                          'week-${state.systemActivityWeekOffset}-${state.weeklySystemActivity.weekStart?.toIso8601String() ?? 'empty'}',
                      isLoading: state.isSystemActivityLoading,
                      labels: state.weeklySystemActivity.days
                          .map((day) => day.label)
                          .toList(),
                      fullDayLabels: state.weeklySystemActivity.days
                          .map((day) => day.fullLabel)
                          .toList(),
                      values: state.weeklySystemActivity.days
                          .map((day) => day.activityCount)
                          .toList(),
                    ),
                  ),
                SizedBox(height: context.dashSpacing * 1.2),
                AdminSectionHeader(
                  title: 'Recent Users',
                  onActionTap: () => context.push(AppRoutes.adminUsers),
                ),
                SizedBox(height: context.dashSpacing * 0.5),
                if (state.recentUsers.isEmpty)
                  const DashboardEmptyCard(message: 'No users found.')
                else
                  Column(
                    children: [
                      for (var i = 0; i < state.recentUsers.length; i++) ...[
                        if (i > 0) const SizedBox(height: 9),
                        AdminSurfaceCard(
                          padding: EdgeInsets.symmetric(
                            horizontal: context.dashSpacing * 0.75,
                            vertical: context.dashSpacing * 0.42,
                          ),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              CircleAvatar(
                                radius: 19,
                                backgroundColor: adminRoleColor(
                                  state.recentUsers[i].role,
                                ).withValues(alpha: 0.12),
                                child: Text(
                                  dashboardAvatarLetter(
                                    state.recentUsers[i].name,
                                  ),
                                  style: theme.textTheme.labelLarge?.copyWith(
                                    color: adminRoleColor(
                                      state.recentUsers[i].role,
                                    ),
                                    fontWeight: FontWeight.w700,
                                    fontSize:
                                        (theme.textTheme.labelLarge?.fontSize ??
                                            14) *
                                        0.86,
                                  ),
                                ),
                              ),
                              SizedBox(width: context.dashSpacing * 0.48),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Expanded(
                                          child: Text(
                                            state.recentUsers[i].name,
                                            maxLines: 1,
                                            overflow: TextOverflow.ellipsis,
                                            style: theme.textTheme.bodyMedium
                                                ?.copyWith(
                                                  fontWeight: FontWeight.w800,
                                                  color: DashboardColors
                                                      .textPrimary,
                                                ),
                                          ),
                                        ),
                                        const SizedBox(width: 5),
                                        Text(
                                          state.recentUsers[i].registeredLabel,
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                          style: theme.textTheme.labelSmall
                                              ?.copyWith(
                                                color:
                                                    DashboardColors.textMuted,
                                                fontWeight: FontWeight.w600,
                                              ),
                                        ),
                                      ],
                                    ),
                                    SizedBox(
                                      height: context.dashSpacing * 0.15,
                                    ),
                                    Text(
                                      state.recentUsers[i].role,
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                      style: theme.textTheme.bodySmall
                                          ?.copyWith(
                                            color:
                                                DashboardColors.textSecondary,
                                            fontWeight: FontWeight.w500,
                                          ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ],
                  ),
                SizedBox(height: context.dashSpacing),
              ],
            ),
    );
  }
}
