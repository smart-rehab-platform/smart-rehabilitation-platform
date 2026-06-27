import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../../core/constants/dashboard_colors.dart';
import '../../../core/routes/app_routes.dart';
import '../models/parent_dashboard_models.dart';
import '../providers/parent_dashboard_provider.dart';
import '../widgets/dashboard_components.dart';
import '../widgets/dashboard_layout.dart';
import '../widgets/dashboard_scaffold.dart';
import '../widgets/dashboard_surface_card.dart';
import '../widgets/dashboard_visuals.dart';
import '../widgets/parent_dashboard_cards.dart';

class ParentDashboardScreen extends ConsumerStatefulWidget {
  const ParentDashboardScreen({super.key});

  @override
  ConsumerState<ParentDashboardScreen> createState() =>
      _ParentDashboardScreenState();
}

class _ParentDashboardScreenState extends ConsumerState<ParentDashboardScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(parentDashboardProvider.notifier).initialize();
    });
  }

  void _handleNextAction(ParentNextAction action) {
    switch (action.type) {
      case ParentNextActionType.startExercise:
        debugPrint('Navigate: Start Today\'s Exercise');
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Exercise flow coming soon')),
        );
      case ParentNextActionType.reviewFeedback:
        debugPrint('Navigate: Review Specialist Feedback');
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Feedback details coming soon')),
        );
      case ParentNextActionType.viewReport:
        debugPrint('Navigate: View Latest Report');
        if (mounted) {
          context.push(AppRoutes.dashboard);
        }
    }
  }

  IconData _taskIcon(String title) {
    final lower = title.toLowerCase();
    if (lower.contains('speech') || lower.contains('pronunciation')) {
      return Icons.mic_none_rounded;
    }
    if (lower.contains('motor') || lower.contains('hand')) {
      return Icons.back_hand_outlined;
    }
    if (lower.contains('balance')) {
      return Icons.accessibility_new_rounded;
    }
    return Icons.fitness_center_outlined;
  }

  Color _taskColor(int index) {
    const colors = [
      DashboardColors.primary,
      DashboardColors.accent,
      Color(0xFF3B82F6),
      DashboardColors.warning,
    ];
    return colors[index % colors.length];
  }

  Color _progressColor(int index) {
    const colors = [
      Color(0xFF3B82F6),
      DashboardColors.accent,
      DashboardColors.warning,
      DashboardColors.primary,
    ];
    return colors[index % colors.length];
  }

  String _formatDate(DateTime? date) {
    if (date == null) {
      return 'Recently';
    }
    return DateFormat('MMM d, yyyy').format(date);
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(parentDashboardProvider);
    final theme = Theme.of(context);
    final userName = dashboardDisplayName(state.user?.fullName);
    final selectedChild = state.selectedChild;

    if (state.isLoading) {
      return DashboardScaffold(
        avatarInitials: dashboardInitials(state.user?.fullName),
        notificationCount: state.unreadNotifications,
        body: const DashboardLoadingCard(),
      );
    }

    if (state.errorMessage != null && !state.hasAuth) {
      return DashboardScaffold(
        avatarInitials: dashboardInitials(state.user?.fullName),
        body: DashboardErrorCard(
          message: state.errorMessage!,
          onRetry: () => context.go(AppRoutes.login),
        ),
      );
    }

    return DashboardScaffold(
      avatarInitials: dashboardInitials(state.user?.fullName),
      notificationCount: state.unreadNotifications,
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          DashboardGreeting(message: 'Welcome back, $userName'),
          SizedBox(height: context.dashSpacing * 0.75),
          ParentChildSwitcher(
            children: state.children,
            selectedChildId: state.selectedChildId,
            onSelected: (childId) {
              ref.read(parentDashboardProvider.notifier).selectChild(childId);
            },
          ),
          if (state.errorMessage != null) ...[
            SizedBox(height: context.dashSpacing * 0.75),
            DashboardErrorCard(
              message: state.errorMessage!,
              onRetry: () => ref.read(parentDashboardProvider.notifier).refresh(),
            ),
          ],
          SizedBox(height: context.dashSpacing),
          DashboardSummaryGrid(
            cards: [
              DashboardSummaryCard(
                label: 'Children',
                value: '${state.overview.childrenCount}',
                icon: Icons.family_restroom_outlined,
                iconBackground: DashboardColors.purpleSoft,
                iconColor: DashboardColors.primary,
              ),
              DashboardSummaryCard(
                label: "Today's Tasks",
                value: '${state.streakInfo.totalToday > 0 ? state.streakInfo.totalToday : state.overview.todaysTasksCount}',
                icon: Icons.task_alt_outlined,
                iconBackground: DashboardColors.tealSoft,
                iconColor: DashboardColors.accent,
              ),
              DashboardSummaryCard(
                label: 'Upcoming Sessions',
                value: '${state.overview.upcomingSessionsCount}',
                icon: Icons.event_outlined,
                iconBackground: DashboardColors.blueSoft,
                iconColor: const Color(0xFF3B82F6),
              ),
              DashboardSummaryCard(
                label: 'Latest Report',
                value: _shortLabel(state.overview.latestReportLabel),
                icon: Icons.insights_outlined,
                iconBackground: DashboardColors.amberSoft,
                iconColor: DashboardColors.warning,
              ),
            ],
          ),
          SizedBox(height: context.dashSpacing),
          if (state.isLoadingChild)
            const DashboardLoadingCard(message: 'Updating child insights...')
          else ...[
            if (state.aiInsight != null) ...[
              ParentAiInsightCard(insight: state.aiInsight!),
              SizedBox(height: context.dashSpacing * 0.75),
            ],
            ParentStreakCard(streakInfo: state.streakInfo),
            SizedBox(height: context.dashSpacing * 0.75),
            if (state.attentionAlert != null) ...[
              ParentAttentionAlertCard(alert: state.attentionAlert!),
              SizedBox(height: context.dashSpacing * 0.75),
            ],
            ParentNextActionButton(
              action: state.nextAction,
              onPressed: () => _handleNextAction(state.nextAction),
            ),
            SizedBox(height: context.dashSpacing * 0.75),
            if (state.latestFeedback != null) ...[
              ParentFeedbackCard(feedback: state.latestFeedback!),
              SizedBox(height: context.dashSpacing * 0.75),
            ],
            if (state.speechSummary != null &&
                state.speechSummary!.overallScore != null) ...[
              ParentSpeechAnalysisCard(summary: state.speechSummary!),
              SizedBox(height: context.dashSpacing * 0.75),
            ],
          ],
          SizedBox(height: context.dashSpacing * 0.5),
          const DashboardSectionHeader(title: "Today's Tasks"),
          SizedBox(height: context.dashSpacing * 0.5),
          if (state.dailyTasks.isEmpty)
            DashboardEmptyCard(
              message: selectedChild == null
                  ? 'Select a child to view today\'s tasks.'
                  : 'No tasks assigned for ${selectedChild.name} today.',
            )
          else
            ...state.dailyTasks.asMap().entries.map((entry) {
              final index = entry.key;
              final task = entry.value;
              return Padding(
                padding: EdgeInsets.only(bottom: context.dashSpacing * 0.6),
                child: DashboardSurfaceCard(
                  child: Row(
                    children: [
                      Container(
                        padding: EdgeInsets.all(context.dashSpacing * 0.45),
                        decoration: BoxDecoration(
                          color: _taskColor(index).withValues(alpha: 0.12),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Icon(
                          task.isCompleted
                              ? Icons.check_circle_outline_rounded
                              : _taskIcon(task.title),
                          color: _taskColor(index),
                          size: context.dashSpacing * 0.55,
                        ),
                      ),
                      SizedBox(width: context.dashSpacing * 0.65),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              task.title,
                              style: theme.textTheme.bodyMedium?.copyWith(
                                fontWeight: FontWeight.w700,
                                color: DashboardColors.textPrimary,
                              ),
                            ),
                            SizedBox(height: context.dashSpacing * 0.15),
                            Text(
                              [
                                if (selectedChild != null) selectedChild.name,
                                if (task.dueTime != null) task.dueTime,
                              ].join(' • '),
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
                        size: context.dashSpacing * 0.55,
                      ),
                    ],
                  ),
                ),
              );
            }),
          SizedBox(height: context.dashSpacing * 0.6),
          const DashboardSectionHeader(title: 'Child Progress'),
          SizedBox(height: context.dashSpacing * 0.75),
          if (state.childrenProgress.isEmpty)
            const DashboardEmptyCard(
              message: 'Progress data will appear once exercises are tracked.',
            )
          else
            DashboardSurfaceCard(
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  for (var i = 0; i < state.childrenProgress.length; i++)
                    if (state.childrenProgress[i].name.trim().isNotEmpty)
                      DashboardProgressRing(
                        label: state.childrenProgress[i].name,
                        progress: _normalizeProgress(
                          state.childrenProgress[i].progressPercent,
                        ),
                        color: _progressColor(i),
                      ),
                ],
              ),
            ),
          SizedBox(height: context.dashSpacing * 1.2),
          const DashboardSectionHeader(title: 'Recent Reports'),
          SizedBox(height: context.dashSpacing * 0.5),
          if (state.reports.isEmpty)
            const DashboardEmptyCard(
              message: 'No reports available yet for the selected child.',
            )
          else
            ...state.reports.take(3).map(
                  (report) => Padding(
                    padding: EdgeInsets.only(bottom: context.dashSpacing * 0.6),
                    child: DashboardSurfaceCard(
                      child: Row(
                        children: [
                          Container(
                            padding: EdgeInsets.all(context.dashSpacing * 0.5),
                            decoration: BoxDecoration(
                              color: DashboardColors.purpleSoft,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Icon(
                              Icons.description_outlined,
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
                                  report.title,
                                  style: theme.textTheme.bodyMedium?.copyWith(
                                    fontWeight: FontWeight.w700,
                                    color: DashboardColors.textPrimary,
                                  ),
                                ),
                                SizedBox(height: context.dashSpacing * 0.15),
                                Text(
                                  [
                                    if (report.summary != null) report.summary,
                                    _formatDate(report.date),
                                  ].whereType<String>().join(' • '),
                                  style: theme.textTheme.bodySmall?.copyWith(
                                    color: DashboardColors.textSecondary,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          IconButton(
                            onPressed: () {},
                            icon: Icon(
                              Icons.download_outlined,
                              color: DashboardColors.primary,
                              size: context.dashSpacing * 0.6,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
          SizedBox(height: context.dashSpacing),
        ],
      ),
    );
  }

  String _shortLabel(String value) {
    if (value.length <= 14) {
      return value;
    }
    return '${value.substring(0, 12)}...';
  }

  double _normalizeProgress(double? value) {
    if (value == null) {
      return 0;
    }
    if (value <= 1) {
      return value.clamp(0, 1);
    }
    return (value / 100).clamp(0, 1);
  }
}
