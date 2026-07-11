import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/constants/dashboard_colors.dart';
import '../../../core/routes/app_routes.dart';
import '../../dashboard/models/parent_dashboard_models.dart';
import '../../dashboard/providers/parent_dashboard_provider.dart';
import '../../dashboard/providers/parent_features_provider.dart';
import '../../dashboard/widgets/dashboard_bottom_nav.dart';
import '../../dashboard/widgets/dashboard_components.dart';
import '../../dashboard/widgets/dashboard_layout.dart';
import '../../dashboard/widgets/dashboard_scaffold.dart';
import '../../dashboard/widgets/dashboard_surface_card.dart';
import '../../dashboard/widgets/parent_dashboard_cards.dart';
import '../../dashboard/widgets/parent_navigation.dart';
import '../../dashboard/presentation/parent/parent_ui_helpers.dart';

class ParentDailyTasksScreen extends ConsumerStatefulWidget {
  const ParentDailyTasksScreen({super.key});

  @override
  ConsumerState<ParentDailyTasksScreen> createState() =>
      _ParentDailyTasksScreenState();
}

class _ParentDailyTasksScreenState extends ConsumerState<ParentDailyTasksScreen>
    with SingleTickerProviderStateMixin {
  late final TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _tabController.addListener(_onTabChanged);
    WidgetsBinding.instance.addPostFrameCallback((_) => _bootstrap());
  }

  @override
  void dispose() {
    _tabController.removeListener(_onTabChanged);
    _tabController.dispose();
    super.dispose();
  }

  void _onTabChanged() {
    if (!_tabController.indexIsChanging) {
      ref.read(parentExercisesProvider.notifier).selectTab(_tabController.index);
      setState(() {});
    }
  }

  Future<void> _bootstrap() async {
    final dashboard = ref.read(parentDashboardProvider);
    if (!dashboard.hasAuth) {
      await ref.read(parentDashboardProvider.notifier).initialize();
    }
    _loadExercisesForSelectedChild();
  }

  void _loadExercisesForSelectedChild() {
    final childId = ref.read(parentDashboardProvider).selectedChildId;
    if (childId != null) {
      ref.read(parentExercisesProvider.notifier).loadForChild(childId);
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

  void _onNotificationsTap() {
    context.push(AppRoutes.parentNotifications);
  }

  void _onAvatarTap() {
    context.push(AppRoutes.parentProfile);
  }

  void _openExercise(String assignedExerciseId) {
    context.push(
      '${AppRoutes.parentExerciseDetails}?assignedExerciseId=${Uri.encodeComponent(assignedExerciseId)}',
    );
  }

  String _taskSubtitle({
    required String childName,
    ParentDailyTask? task,
    ParentAssignedExercise? exercise,
  }) {
    final parts = <String>[childName];
    if (task != null) {
      if (task.dueTime != null) parts.add(task.dueTime!);
      if (task.frequency != null) parts.add(task.frequency!);
      parts.add(task.isCompleted ? 'Completed' : 'Pending');
    } else if (exercise != null) {
      if (exercise.frequency != null) parts.add(exercise.frequency!);
      if (exercise.dueDate != null) {
        parts.add('Due ${parentFormatDate(exercise.dueDate)}');
      }
      if (exercise.status != null) parts.add(exercise.status!);
    }
    return parts.join(' • ');
  }

  Widget _buildTaskList({
    required ThemeData theme,
    required String childName,
    required List<ParentDailyTask> tasks,
    required String emptyMessage,
  }) {
    if (tasks.isEmpty) {
      return DashboardEmptyCard(message: emptyMessage);
    }

    return Column(
      children: tasks.asMap().entries.map((entry) {
        final index = entry.key;
        final task = entry.value;
        return Padding(
          padding: EdgeInsets.only(bottom: context.dashSpacing * 0.6),
          child: DashboardSurfaceCard(
            onTap: () => _openExercise(task.id),
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
                    color: task.isCompleted
                        ? DashboardColors.accent
                        : _taskColor(index),
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
                        _taskSubtitle(childName: childName, task: task),
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
      }).toList(),
    );
  }

  Widget _buildAssignedList({
    required ThemeData theme,
    required String childName,
    required List<ParentAssignedExercise> exercises,
  }) {
    if (exercises.isEmpty) {
      return DashboardEmptyCard(
        message: 'No assigned exercises for $childName yet.',
      );
    }

    return Column(
      children: exercises.asMap().entries.map((entry) {
        final index = entry.key;
        final exercise = entry.value;
        return Padding(
          padding: EdgeInsets.only(bottom: context.dashSpacing * 0.6),
          child: DashboardSurfaceCard(
            onTap: () => _openExercise(exercise.id),
            child: Row(
              children: [
                Container(
                  padding: EdgeInsets.all(context.dashSpacing * 0.45),
                  decoration: BoxDecoration(
                    color: _taskColor(index).withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(
                    _taskIcon(exercise.title),
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
                        exercise.title,
                        style: theme.textTheme.bodyMedium?.copyWith(
                          fontWeight: FontWeight.w700,
                          color: DashboardColors.textPrimary,
                        ),
                      ),
                      if (exercise.instructions != null &&
                          exercise.instructions!.isNotEmpty) ...[
                        SizedBox(height: context.dashSpacing * 0.15),
                        Text(
                          exercise.instructions!,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: DashboardColors.textSecondary,
                          ),
                        ),
                      ],
                      SizedBox(height: context.dashSpacing * 0.15),
                      Text(
                        _taskSubtitle(childName: childName, exercise: exercise),
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: DashboardColors.textMuted,
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
      }).toList(),
    );
  }

  @override
  Widget build(BuildContext context) {
    final dashboard = ref.watch(parentDashboardProvider);
    final exercises = ref.watch(parentExercisesProvider);
    final theme = Theme.of(context);
    final selectedChild = dashboard.selectedChild;

    if (dashboard.isLoading) {
      return DashboardScaffold(
        avatarInitials: dashboardInitials(dashboard.user?.fullName),
        notificationCount: dashboard.unreadNotifications,
        currentNav: DashboardNavItem.exercises,
        onNavTap: (item) => ParentNavigation.onNavTap(context, item),
        onNotificationsTap: _onNotificationsTap,
        onAvatarTap: _onAvatarTap,
        body: const DashboardLoadingCard(),
      );
    }

    if (dashboard.errorMessage != null && !dashboard.hasAuth) {
      return DashboardScaffold(
        avatarInitials: dashboardInitials(dashboard.user?.fullName),
        notificationCount: dashboard.unreadNotifications,
        currentNav: DashboardNavItem.exercises,
        onNavTap: (item) => ParentNavigation.onNavTap(context, item),
        onNotificationsTap: _onNotificationsTap,
        onAvatarTap: _onAvatarTap,
        body: DashboardErrorCard(
          message: dashboard.errorMessage!,
          onRetry: () => context.go(AppRoutes.login),
        ),
      );
    }

    return DashboardScaffold(
      avatarInitials: dashboardInitials(dashboard.user?.fullName),
      notificationCount: dashboard.unreadNotifications,
      currentNav: DashboardNavItem.exercises,
      onNavTap: (item) => ParentNavigation.onNavTap(context, item),
      onNotificationsTap: _onNotificationsTap,
      onAvatarTap: _onAvatarTap,
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const DashboardSectionHeader(title: 'Exercises'),
          if (selectedChild != null) ...[
            SizedBox(height: context.dashSpacing * 0.35),
            Text(
              'Exercises for ${selectedChild.name}',
              style: theme.textTheme.bodyMedium?.copyWith(
                color: DashboardColors.textSecondary,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
          SizedBox(height: context.dashSpacing * 0.75),
          ParentChildSwitcher(
            children: dashboard.children,
            selectedChildId: dashboard.selectedChildId,
            onSelected: (childId) {
              ref.read(parentDashboardProvider.notifier).selectChild(childId);
              ref.read(parentExercisesProvider.notifier).loadForChild(childId);
            },
          ),
          if (dashboard.errorMessage != null) ...[
            SizedBox(height: context.dashSpacing * 0.75),
            DashboardErrorCard(
              message: dashboard.errorMessage!,
              onRetry: () =>
                  ref.read(parentDashboardProvider.notifier).refresh(),
            ),
          ],
          if (exercises.errorMessage != null) ...[
            SizedBox(height: context.dashSpacing * 0.75),
            DashboardErrorCard(
              message: exercises.errorMessage!,
              onRetry: _loadExercisesForSelectedChild,
            ),
          ],
          SizedBox(height: context.dashSpacing * 0.5),
          TabBar(
            controller: _tabController,
            labelColor: DashboardColors.primary,
            unselectedLabelColor: DashboardColors.textMuted,
            indicatorColor: DashboardColors.primary,
            tabs: const [
              Tab(text: 'Daily'),
              Tab(text: 'Weekly'),
              Tab(text: 'Assigned'),
            ],
          ),
          SizedBox(height: context.dashSpacing),
          if (dashboard.children.isEmpty)
            const DashboardEmptyCard(
              message:
                  'No linked children yet. Add a child from the specialist portal.',
            )
          else if (exercises.isLoading || dashboard.isLoadingChild)
            const DashboardLoadingCard(message: 'Loading exercises...')
          else if (selectedChild == null)
            const DashboardEmptyCard(
              message: 'Select a child to view exercises.',
            )
          else
            switch (_tabController.index) {
              0 => _buildTaskList(
                  theme: theme,
                  childName: selectedChild.name,
                  tasks: exercises.dailyTasks,
                  emptyMessage:
                      'No daily tasks assigned for ${selectedChild.name} today.',
                ),
              1 => _buildTaskList(
                  theme: theme,
                  childName: selectedChild.name,
                  tasks: exercises.weeklyTasks,
                  emptyMessage:
                      'No weekly tasks assigned for ${selectedChild.name}.',
                ),
              _ => _buildAssignedList(
                  theme: theme,
                  childName: selectedChild.name,
                  exercises: exercises.assignedExercises,
                ),
            },
          SizedBox(height: context.dashSpacing),
        ],
      ),
    );
  }
}
