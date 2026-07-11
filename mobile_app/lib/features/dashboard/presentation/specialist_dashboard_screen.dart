import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/constants/dashboard_colors.dart';
import '../../../core/routes/app_routes.dart';
import '../providers/specialist_dashboard_provider.dart';
import '../providers/specialist_features_provider.dart';
import '../../auth/providers/auth_provider.dart';
import '../widgets/dashboard_bottom_nav.dart';
import '../widgets/dashboard_chat_bubble.dart';
import '../widgets/dashboard_components.dart';
import '../widgets/dashboard_layout.dart';
import '../widgets/dashboard_scaffold.dart';
import '../widgets/dashboard_surface_card.dart';
import '../widgets/dashboard_visuals.dart';
import '../widgets/parent_dashboard_cards.dart';
import '../widgets/specialist_navigation.dart';

class SpecialistDashboardScreen extends ConsumerStatefulWidget {
  const SpecialistDashboardScreen({super.key});

  @override
  ConsumerState<SpecialistDashboardScreen> createState() =>
      _SpecialistDashboardScreenState();
}

class _SpecialistDashboardScreenState
    extends ConsumerState<SpecialistDashboardScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(specialistDashboardProvider.notifier).initialize();
      ref.read(specialistNotificationsProvider.notifier).initialize();
    });
  }

  void _openMessages() {
    context.push(AppRoutes.specialistMessages);
  }

  Color _progressColor(int index) {
    const colors = [
      DashboardColors.primary,
      DashboardColors.accent,
      Color(0xFF3B82F6),
      DashboardColors.warning,
    ];
    return colors[index % colors.length];
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(specialistDashboardProvider);
    final auth = ref.watch(authProvider);
    final notifications = ref.watch(specialistNotificationsProvider);
    final unreadMessageCount = notifications.unreadMessageCount;
    final profileImageUrl = auth.user?.profileImageUrl;
    final displayName = auth.user?.fullName ?? state.userName;
    final theme = Theme.of(context);
    final greetingName = dashboardDisplayName(
      displayName,
      fallback: 'Specialist',
    );
    final avatarInitials = dashboardInitials(displayName, fallback: 'SP');

    if (state.isLoading) {
      return DashboardScaffold(
        avatarInitials: avatarInitials,
        avatarImageUrl: profileImageUrl,
        notificationCount: state.unreadNotifications,
        drawer: const SpecialistDrawer(),
        onNotificationsTap: () =>
            context.push(AppRoutes.specialistNotifications),
        onAvatarTap: () => context.push(AppRoutes.specialistProfile),
        onNavTap: (item) => SpecialistNavigation.onNavTap(context, item),
        body: const DashboardLoadingCard(),
      );
    }

    return DashboardScaffold(
      avatarInitials: avatarInitials,
      avatarImageUrl: profileImageUrl,
      notificationCount: state.unreadNotifications,
      currentNav: DashboardNavItem.home,
      drawer: const SpecialistDrawer(),
      onNotificationsTap: () => context.push(AppRoutes.specialistNotifications),
      onAvatarTap: () => context.push(AppRoutes.specialistProfile),
      onNavTap: (item) => SpecialistNavigation.onNavTap(context, item),
      floatingActionButton: DashboardChatBubble(
        unreadCount: unreadMessageCount,
        onTap: _openMessages,
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.endFloat,
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          DashboardGreeting(message: 'Welcome back, $greetingName'),
          SizedBox(height: context.dashSpacing * 0.75),
          DashboardSurfaceCard(
            tint: DashboardColors.primary,
            onTap: () => context.push(AppRoutes.manageParentLinks),
            child: Row(
              children: [
                Container(
                  padding: EdgeInsets.all(context.dashSpacing * 0.45),
                  decoration: BoxDecoration(
                    color: DashboardColors.purpleSoft,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(
                    Icons.link_rounded,
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
                        'Manage Parent Links',
                        style: theme.textTheme.bodyMedium?.copyWith(
                          fontWeight: FontWeight.w700,
                          color: DashboardColors.textPrimary,
                        ),
                      ),
                      Text(
                        'Link a parent account to a patient/child',
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: DashboardColors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ),
                Icon(
                  Icons.chevron_right_rounded,
                  color: DashboardColors.textMuted,
                ),
              ],
            ),
          ),
          if (!state.hasAssignedPatients &&
              state.overview.activeCases == 0) ...[
            SizedBox(height: context.dashSpacing * 0.75),
            const DashboardEmptyCard(message: 'No active cases assigned yet.'),
          ],
          if (state.errorMessage != null) ...[
            SizedBox(height: context.dashSpacing * 0.75),
            DashboardErrorCard(
              message: state.errorMessage!,
              onRetry: () =>
                  ref.read(specialistDashboardProvider.notifier).refresh(),
            ),
          ],
          SizedBox(height: context.dashSpacing),
          DashboardSummaryGrid(
            cards: [
              DashboardSummaryCard(
                label: 'Active Cases',
                value: '${state.overview.activeCases}',
                icon: Icons.folder_open_outlined,
                iconBackground: DashboardColors.blueSoft,
                iconColor: const Color(0xFF3B82F6),
                onTap: () => context.push(AppRoutes.specialistPatients),
              ),
              DashboardSummaryCard(
                label: 'Pending Reviews',
                value: '${state.overview.pendingReviews}',
                icon: Icons.rate_review_outlined,
                iconBackground: DashboardColors.purpleSoft,
                iconColor: DashboardColors.primary,
                onTap: () => context.push(AppRoutes.specialistPendingReviews),
              ),
              DashboardSummaryCard(
                label: "Today's Sessions",
                value: '${state.overview.upcomingSessions}',
                icon: Icons.calendar_today_outlined,
                iconBackground: DashboardColors.tealSoft,
                iconColor: DashboardColors.accent,
                onTap: () => context.push(AppRoutes.specialistSessions),
              ),
              DashboardSummaryCard(
                label: 'Treatment Plans',
                value: '${state.overview.treatmentPlans}',
                icon: Icons.assignment_outlined,
                iconBackground: DashboardColors.amberSoft,
                iconColor: DashboardColors.warning,
                onTap: () => context.push(AppRoutes.specialistTreatmentPlans),
              ),
            ],
          ),
          SizedBox(height: context.dashSpacing * 1.2),
          DashboardSectionHeader(
            title: 'Pending Reviews',
            onActionTap: () => context.push(AppRoutes.specialistPendingReviews),
          ),
          SizedBox(height: context.dashSpacing * 0.5),
          if (state.pendingReviews.isEmpty)
            const DashboardEmptyCard(message: 'No pending reviews right now.')
          else
            ...state.pendingReviews.map(
              (review) => Padding(
                padding: EdgeInsets.only(bottom: context.dashSpacing * 0.6),
                child: DashboardSurfaceCard(
                  onTap: () => context.push(AppRoutes.specialistPendingReviews),
                  child: Row(
                    children: [
                      CircleAvatar(
                        radius: context.dashSpacing * 0.55,
                        backgroundColor: DashboardColors.primary.withValues(
                          alpha: 0.15,
                        ),
                        child: Text(
                          dashboardAvatarLetter(
                            review.patientName,
                            fallback: 'P',
                          ),
                          style: theme.textTheme.labelLarge?.copyWith(
                            color: DashboardColors.primary,
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
                              review.patientName,
                              style: theme.textTheme.bodyMedium?.copyWith(
                                fontWeight: FontWeight.w700,
                                color: DashboardColors.textPrimary,
                              ),
                            ),
                            SizedBox(height: context.dashSpacing * 0.15),
                            Text(
                              '${review.exerciseTitle} • ${formatSubmittedAgo(review.submittedAt)}',
                              style: theme.textTheme.bodySmall?.copyWith(
                                color: DashboardColors.textSecondary,
                              ),
                            ),
                          ],
                        ),
                      ),
                      DashboardPriorityBadge(label: review.priority),
                    ],
                  ),
                ),
              ),
            ),
          SizedBox(height: context.dashSpacing * 0.6),
          DashboardSectionHeader(
            title: "Today's Schedule",
            onActionTap: () => context.push(AppRoutes.specialistSessions),
          ),
          SizedBox(height: context.dashSpacing * 0.5),
          if (state.schedule.isEmpty)
            const DashboardEmptyCard(
              message: 'No sessions scheduled for today.',
            )
          else
            ...state.schedule.map(
              (item) => Padding(
                padding: EdgeInsets.only(bottom: context.dashSpacing * 0.6),
                child: DashboardSurfaceCard(
                  onTap: () => context.push(AppRoutes.specialistSessions),
                  child: Row(
                    children: [
                      Container(
                        width: context.dashSpacing * 2.2,
                        padding: EdgeInsets.symmetric(
                          vertical: context.dashSpacing * 0.45,
                        ),
                        decoration: BoxDecoration(
                          color: DashboardColors.purpleSoft,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          item.timeLabel,
                          textAlign: TextAlign.center,
                          style: theme.textTheme.labelSmall?.copyWith(
                            color: DashboardColors.primary,
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
                              item.patientName,
                              style: theme.textTheme.bodyMedium?.copyWith(
                                fontWeight: FontWeight.w700,
                                color: DashboardColors.textPrimary,
                              ),
                            ),
                            SizedBox(height: context.dashSpacing * 0.15),
                            Text(
                              item.sessionType,
                              style: theme.textTheme.bodySmall?.copyWith(
                                color: DashboardColors.textSecondary,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          SizedBox(height: context.dashSpacing * 0.6),
          DashboardSectionHeader(
            title: 'Recent Patient Progress',
            onActionTap: () =>
                context.push(AppRoutes.specialistPatientProgress),
          ),
          SizedBox(height: context.dashSpacing * 0.5),
          if (state.progress.isEmpty)
            const DashboardEmptyCard(message: 'No progress data available yet.')
          else
            DashboardSurfaceCard(
              onTap: () => context.push(AppRoutes.specialistPatientProgress),
              child: Column(
                children: [
                  for (var i = 0; i < state.progress.length; i++) ...[
                    DashboardLinearProgressTile(
                      name: state.progress[i].name,
                      progress: state.progress[i].progress.clamp(0, 1),
                      avatarColor: _progressColor(i),
                    ),
                    if (i != state.progress.length - 1)
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
