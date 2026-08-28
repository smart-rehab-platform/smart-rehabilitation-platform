import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/constants/dashboard_colors.dart';
import '../../../core/routes/app_routes.dart';
import '../../dashboard/models/parent_dashboard_models.dart';
import '../../auth/providers/auth_provider.dart';
import '../../dashboard/providers/parent_dashboard_provider.dart';
import '../../dashboard/providers/parent_features_provider.dart';
import '../../dashboard/utils/exercise_category_visuals.dart';
import '../../dashboard/widgets/dashboard_bottom_nav.dart';
import '../../dashboard/widgets/dashboard_components.dart';
import '../../dashboard/widgets/dashboard_layout.dart';
import '../../dashboard/widgets/dashboard_scaffold.dart';
import '../../dashboard/widgets/dashboard_surface_card.dart';
import '../../dashboard/widgets/parent_dashboard_cards.dart';
import '../../dashboard/widgets/parent_navigation.dart';
import '../../dashboard/presentation/parent/parent_scoped_localization_utils.dart';
import '../../dashboard/presentation/parent/parent_ui_helpers.dart';
import '../../../l10n/app_localizations.dart';

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
      ref
          .read(parentExercisesProvider.notifier)
          .selectTab(_tabController.index);
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
    final childId = ref.read(parentDashboardProvider).selectedPatientId;
    if (childId != null) {
      ref.read(parentExercisesProvider.notifier).loadForChild(childId);
    }
  }

  Color _taskColor(int index) {
    const colors = [
      DashboardColors.brandCyan,
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
    required AppLocalizations l10n,
    required String childName,
    ParentDailyTask? task,
    ParentAssignedExercise? exercise,
  }) {
    final parts = <String>[childName];
    if (task != null) {
      if (task.dueTime != null) parts.add(task.dueTime!);
      if (task.frequency != null) {
        parts.add(localizedExerciseFrequency(l10n, task.frequency!));
      }
      parts.add(task.isCompleted ? l10n.statusCompleted : l10n.statusPending);
    } else if (exercise != null) {
      if (exercise.frequency != null) {
        parts.add(localizedExerciseFrequency(l10n, exercise.frequency!));
      }
      if (exercise.dueDate != null) {
        parts.add(
          l10n.parentExercisesDueDate(parentFormatDate(exercise.dueDate)),
        );
      }
      if (exercise.status != null) {
        parts.add(localizedExerciseStatus(l10n, exercise.status!));
      }
    }
    return parts.join(' • ');
  }

  Widget _buildTaskList({
    required ThemeData theme,
    required AppLocalizations l10n,
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
                        : exerciseCategoryIcon(task.category),
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
                        _taskSubtitle(
                          l10n: l10n,
                          childName: childName,
                          task: task,
                        ),
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
    required AppLocalizations l10n,
    required String childName,
    required List<ParentAssignedExercise> exercises,
  }) {
    if (exercises.isEmpty) {
      return DashboardEmptyCard(
        message: l10n.parentExercisesNoAssignedForChild(childName),
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
                    exerciseCategoryIcon(exercise.category),
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
                        _taskSubtitle(
                          l10n: l10n,
                          childName: childName,
                          exercise: exercise,
                        ),
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
    final auth = ref.watch(authProvider);
    final exercises = ref.watch(parentExercisesProvider);
    final theme = Theme.of(context);
    final l10n = AppLocalizations.of(context)!;
    final selectedChild = dashboard.selectedChild;
    final displayName = auth.user?.fullName ?? dashboard.user?.fullName;
    final avatarInitials = dashboardInitials(displayName);
    final profileImageUrl = auth.user?.profileImageUrl;
    final dashboardError = dashboard.errorMessage == null
        ? null
        : mapParentDashboardError(l10n, dashboard.errorMessage!);
    final exercisesError = exercises.errorMessage == null
        ? null
        : mapParentExercisesError(l10n, exercises.errorMessage!);

    if (dashboard.isLoading) {
      return DashboardScaffold(
        avatarInitials: avatarInitials,
        avatarImageUrl: profileImageUrl,
        notificationCount: dashboard.unreadNotifications,
        showMenuButton: false,
        currentNav: DashboardNavItem.exercises,
        onNavTap: (item) => ParentNavigation.onNavTap(context, item),
        onNotificationsTap: _onNotificationsTap,
        onAvatarTap: _onAvatarTap,
        body: DashboardLoadingCard(message: l10n.parentExercisesLoading),
      );
    }

    if (dashboard.errorMessage != null && !dashboard.hasAuth) {
      return DashboardScaffold(
        avatarInitials: avatarInitials,
        avatarImageUrl: profileImageUrl,
        notificationCount: dashboard.unreadNotifications,
        showMenuButton: false,
        currentNav: DashboardNavItem.exercises,
        onNavTap: (item) => ParentNavigation.onNavTap(context, item),
        onNotificationsTap: _onNotificationsTap,
        onAvatarTap: _onAvatarTap,
        body: DashboardErrorCard(
          message: dashboardError!,
          onRetry: () => context.go(AppRoutes.login),
        ),
      );
    }

    return DashboardScaffold(
      avatarInitials: avatarInitials,
      avatarImageUrl: profileImageUrl,
      notificationCount: dashboard.unreadNotifications,
      showMenuButton: false,
      currentNav: DashboardNavItem.exercises,
      onNavTap: (item) => ParentNavigation.onNavTap(context, item),
      onNotificationsTap: _onNotificationsTap,
      onAvatarTap: _onAvatarTap,
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          DashboardSectionHeader(
            title: l10n.navExercises,
            linkColor: DashboardColors.brandCyan,
          ),
          if (selectedChild != null) ...[
            SizedBox(height: context.dashSpacing * 0.35),
            Text(
              l10n.parentExercisesForChild(selectedChild.name),
              style: theme.textTheme.bodyMedium?.copyWith(
                color: DashboardColors.textSecondary,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
          SizedBox(height: context.dashSpacing * 0.75),
          ParentChildSwitcher(
            children: dashboard.children,
            selectedPatientId: dashboard.selectedPatientId,
            onSelected: (childId) {
              ref.read(parentDashboardProvider.notifier).selectPatient(childId);
              ref.read(parentExercisesProvider.notifier).loadForChild(childId);
            },
          ),
          if (dashboardError != null) ...[
            SizedBox(height: context.dashSpacing * 0.75),
            DashboardErrorCard(
              message: dashboardError,
              onRetry: () =>
                  ref.read(parentDashboardProvider.notifier).refresh(),
            ),
          ],
          if (exercisesError != null) ...[
            SizedBox(height: context.dashSpacing * 0.75),
            DashboardErrorCard(
              message: exercisesError,
              onRetry: _loadExercisesForSelectedChild,
            ),
          ],
          SizedBox(height: context.dashSpacing * 0.5),
          TabBar(
            controller: _tabController,
            labelColor: DashboardColors.brandCyan,
            unselectedLabelColor: DashboardColors.textMuted,
            indicatorColor: DashboardColors.brandCyan,
            tabs: [
              Tab(text: l10n.exerciseFrequencyDaily),
              Tab(text: l10n.exerciseFrequencyWeekly),
              Tab(text: l10n.parentExercisesTabAssigned),
            ],
          ),
          SizedBox(height: context.dashSpacing),
          if (dashboard.children.isEmpty)
            DashboardEmptyCard(message: l10n.parentChildrenNoLinked)
          else if (exercises.isLoading || dashboard.isLoadingChild)
            DashboardLoadingCard(message: l10n.parentExercisesLoading)
          else if (selectedChild == null)
            DashboardEmptyCard(message: l10n.parentExercisesSelectChild)
          else
            switch (_tabController.index) {
              0 => _buildTaskList(
                theme: theme,
                l10n: l10n,
                childName: selectedChild.name,
                tasks: exercises.dailyTasks,
                emptyMessage: l10n.parentExercisesNoDailyForChild(
                  selectedChild.name,
                ),
              ),
              1 => _buildTaskList(
                theme: theme,
                l10n: l10n,
                childName: selectedChild.name,
                tasks: exercises.weeklyTasks,
                emptyMessage: l10n.parentExercisesNoWeeklyForChild(
                  selectedChild.name,
                ),
              ),
              _ => _buildAssignedList(
                theme: theme,
                l10n: l10n,
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
