import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/constants/dashboard_colors.dart';
import '../../../core/routes/app_routes.dart';
import '../../../l10n/app_localizations.dart';
import '../providers/specialist_dashboard_provider.dart';
import '../providers/specialist_features_provider.dart';
import '../../auth/providers/auth_provider.dart';
import '../widgets/dashboard_bottom_nav.dart';
import '../widgets/dashboard_components.dart';
import '../widgets/dashboard_layout.dart';
import '../widgets/dashboard_scaffold.dart';
import '../widgets/dashboard_surface_card.dart';
import '../widgets/dashboard_visuals.dart';
import '../widgets/parent_dashboard_cards.dart';
import '../widgets/specialist_dashboard_weekly_interactions_card.dart';
import '../widgets/specialist_dashboard_weekly_schedule_card.dart';
import '../widgets/specialist_navigation.dart';
import 'specialist/specialist_dashboard_localization_utils.dart';

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
      DashboardColors.brandCyan,
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
    final l10n = AppLocalizations.of(context)!;
    final greetingName = dashboardDisplayName(
      displayName,
      fallback: l10n.roleSpecialist,
    );
    final avatarInitials = dashboardInitials(displayName, fallback: 'SP');
    final mappedError = state.errorMessage == null
        ? null
        : mapSpecialistDashboardError(l10n, state.errorMessage!);

    if (state.isLoading) {
      return DashboardScaffold(
        avatarInitials: avatarInitials,
        avatarImageUrl: profileImageUrl,
        notificationCount: state.unreadNotifications,
        messageCount: unreadMessageCount,
        navAccentColor: DashboardColors.brandCyan,
        showMenuButton: false,
        onMessagesTap: _openMessages,
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
      messageCount: unreadMessageCount,
      currentNav: DashboardNavItem.home,
      navAccentColor: DashboardColors.brandCyan,
      showMenuButton: false,
      onMessagesTap: _openMessages,
      onNotificationsTap: () => context.push(AppRoutes.specialistNotifications),
      onAvatarTap: () => context.push(AppRoutes.specialistProfile),
      onNavTap: (item) => SpecialistNavigation.onNavTap(context, item),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          DashboardGreeting(message: l10n.dashboardWelcomeBack(greetingName)),
          SizedBox(height: context.dashSpacing * 0.75),
          SpecialistDashboardWeeklyScheduleCard(sessions: state.sessions),
          if (!state.hasAssignedPatients &&
              state.overview.activeCases == 0) ...[
            SizedBox(height: context.dashSpacing * 0.75),
            DashboardEmptyCard(message: l10n.specialistDashboardNoActiveCases),
          ],
          if (mappedError != null) ...[
            SizedBox(height: context.dashSpacing * 0.75),
            DashboardErrorCard(
              message: mappedError,
              onRetry: () =>
                  ref.read(specialistDashboardProvider.notifier).refresh(),
            ),
          ],
          SizedBox(height: context.dashSpacing),
          Text(
            l10n.specialistDashboardOverview,
            style: theme.textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.w700,
              color: DashboardColors.textPrimary,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.5),
          DashboardSummaryGrid(
            cards: [
              DashboardSummaryCard(
                label: l10n.specialistDashboardActiveCases,
                value: '${state.overview.activeCases}',
                icon: Icons.folder_open_outlined,
                backgroundColor: const Color(0xFFEEF7FF),
                iconBackground: const Color(0xFFDDEEFF),
                iconColor: const Color(0xFF2563EB),
                circularIcon: true,
                valueStyle: theme.textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.w800,
                  color: DashboardColors.textPrimary,
                  height: 1.1,
                ),
                onTap: () => context.push(AppRoutes.specialistPatients),
              ),
              DashboardSummaryCard(
                label: l10n.navPendingReviews,
                value: '${state.overview.pendingReviews}',
                icon: Icons.rate_review_outlined,
                backgroundColor: const Color(0xFFF5F1FF),
                iconBackground: const Color(0xFFE9E1FF),
                iconColor: const Color(0xFF7C3AED),
                circularIcon: true,
                valueStyle: theme.textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.w800,
                  color: DashboardColors.textPrimary,
                  height: 1.1,
                ),
                onTap: () => context.push(AppRoutes.specialistPendingReviews),
              ),
              DashboardSummaryCard(
                label: l10n.navTodaysSessions,
                value: '${state.overview.upcomingSessions}',
                icon: Icons.calendar_today_outlined,
                backgroundColor: const Color(0xFFEEFDF6),
                iconBackground: const Color(0xFFDDF7EA),
                iconColor: const Color(0xFF16A34A),
                circularIcon: true,
                valueStyle: theme.textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.w800,
                  color: DashboardColors.textPrimary,
                  height: 1.1,
                ),
                onTap: () => context.push(AppRoutes.specialistSessions),
              ),
              DashboardSummaryCard(
                label: l10n.navTreatmentPlans,
                value: '${state.overview.treatmentPlans}',
                icon: Icons.assignment_outlined,
                backgroundColor: const Color(0xFFFFF8EA),
                iconBackground: const Color(0xFFFFECC8),
                iconColor: const Color(0xFFEA580C),
                circularIcon: true,
                valueStyle: theme.textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.w800,
                  color: DashboardColors.textPrimary,
                  height: 1.1,
                ),
                onTap: () => context.push(AppRoutes.specialistTreatmentPlans),
              ),
            ],
          ),
          SizedBox(height: context.dashSpacing * 1.2),
          SpecialistDashboardWeeklyInteractionsCard(
            data: state.weeklyInteractions,
            isLoading: state.isWeeklyInteractionsLoading,
            hasError: state.weeklyInteractionsErrorMessage != null,
            onPeriodChanged: (offset) => ref
                .read(specialistDashboardProvider.notifier)
                .setWeeklyInteractionsWeekOffset(offset),
            onRetry: () => ref
                .read(specialistDashboardProvider.notifier)
                .retryWeeklyInteractions(),
          ),
          SizedBox(height: context.dashSpacing * 1.2),
          DashboardSectionHeader(
            title: l10n.navPendingReviews,
            onActionTap: () => context.push(AppRoutes.specialistPendingReviews),
          ),
          SizedBox(height: context.dashSpacing * 0.5),
          if (state.pendingReviews.isEmpty)
            DashboardEmptyCard(
              message: l10n.specialistDashboardNoPendingReviews,
            )
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
                        backgroundColor: DashboardColors.brandCyan.withValues(
                          alpha: 0.15,
                        ),
                        child: Text(
                          dashboardAvatarLetter(
                            review.patientName,
                            fallback: 'P',
                          ),
                          style: theme.textTheme.labelLarge?.copyWith(
                            color: DashboardColors.brandCyan,
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
                              '${review.exerciseTitle} • ${formatLocalizedSubmittedAgo(l10n, review.submittedAt)}',
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
            title: l10n.specialistDashboardRecentPatientProgress,
            onActionTap: () =>
                context.push(AppRoutes.specialistPatientProgress),
          ),
          SizedBox(height: context.dashSpacing * 0.5),
          if (state.progress.isEmpty)
            DashboardEmptyCard(message: l10n.specialistDashboardNoProgressData)
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
