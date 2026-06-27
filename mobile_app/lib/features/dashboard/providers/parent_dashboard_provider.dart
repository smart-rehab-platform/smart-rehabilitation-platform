import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/services/api_client.dart';
import '../../../core/utils/api_response_parser.dart';
import '../../auth/data/auth_repository.dart';
import '../../auth/models/auth_user.dart';
import '../../auth/providers/auth_provider.dart';
import '../data/parent_dashboard_repository.dart';
import '../models/parent_dashboard_models.dart';

final parentDashboardRepositoryProvider = Provider<ParentDashboardRepository>((ref) {
  final dio = ref.watch(dioProvider);
  return ParentDashboardRepository(dio);
});

final parentDashboardProvider =
    StateNotifierProvider<ParentDashboardNotifier, ParentDashboardState>((ref) {
  final repository = ref.watch(parentDashboardRepositoryProvider);
  final authRepository = ref.watch(authRepositoryProvider);
  return ParentDashboardNotifier(ref, repository, authRepository);
});

class ParentDashboardState {
  const ParentDashboardState({
    this.isLoading = false,
    this.isLoadingChild = false,
    this.errorMessage,
    this.user,
    this.overview = const ParentOverviewData(),
    this.children = const [],
    this.selectedChildId,
    this.unreadNotifications = 0,
    this.dailyTasks = const [],
    this.submissions = const [],
    this.childrenProgress = const [],
    this.reports = const [],
    this.aiInsight,
    this.latestFeedback,
    this.speechSummary,
    this.attentionAlert,
    this.nextAction = const ParentNextAction(
      label: 'Start Today\'s Exercise',
      type: ParentNextActionType.startExercise,
    ),
    this.streakInfo = const ParentStreakInfo(
      completedToday: 0,
      totalToday: 0,
      streakDays: 0,
    ),
  });

  final bool isLoading;
  final bool isLoadingChild;
  final String? errorMessage;
  final AuthUser? user;
  final ParentOverviewData overview;
  final List<ParentChild> children;
  final String? selectedChildId;
  final int unreadNotifications;
  final List<ParentDailyTask> dailyTasks;
  final List<ParentSubmissionItem> submissions;
  final List<ParentChild> childrenProgress;
  final List<ParentReportItem> reports;
  final ParentAiInsight? aiInsight;
  final ParentSpecialistFeedback? latestFeedback;
  final ParentSpeechSummary? speechSummary;
  final ParentAttentionAlert? attentionAlert;
  final ParentNextAction nextAction;
  final ParentStreakInfo streakInfo;

  ParentChild? get selectedChild {
    if (selectedChildId == null) {
      return null;
    }
    for (final child in children) {
      if (child.id == selectedChildId) {
        return child;
      }
    }
    return null;
  }

  bool get hasAuth => user?.id != null && user!.id!.isNotEmpty;

  ParentDashboardState copyWith({
    bool? isLoading,
    bool? isLoadingChild,
    Object? errorMessage = _sentinel,
    Object? user = _sentinel,
    ParentOverviewData? overview,
    List<ParentChild>? children,
    Object? selectedChildId = _sentinel,
    int? unreadNotifications,
    List<ParentDailyTask>? dailyTasks,
    List<ParentSubmissionItem>? submissions,
    List<ParentChild>? childrenProgress,
    List<ParentReportItem>? reports,
    Object? aiInsight = _sentinel,
    Object? latestFeedback = _sentinel,
    Object? speechSummary = _sentinel,
    Object? attentionAlert = _sentinel,
    ParentNextAction? nextAction,
    ParentStreakInfo? streakInfo,
  }) {
    return ParentDashboardState(
      isLoading: isLoading ?? this.isLoading,
      isLoadingChild: isLoadingChild ?? this.isLoadingChild,
      errorMessage: identical(errorMessage, _sentinel)
          ? this.errorMessage
          : errorMessage as String?,
      user: identical(user, _sentinel) ? this.user : user as AuthUser?,
      overview: overview ?? this.overview,
      children: children ?? this.children,
      selectedChildId: identical(selectedChildId, _sentinel)
          ? this.selectedChildId
          : selectedChildId as String?,
      unreadNotifications: unreadNotifications ?? this.unreadNotifications,
      dailyTasks: dailyTasks ?? this.dailyTasks,
      submissions: submissions ?? this.submissions,
      childrenProgress: childrenProgress ?? this.childrenProgress,
      reports: reports ?? this.reports,
      aiInsight:
          identical(aiInsight, _sentinel) ? this.aiInsight : aiInsight as ParentAiInsight?,
      latestFeedback: identical(latestFeedback, _sentinel)
          ? this.latestFeedback
          : latestFeedback as ParentSpecialistFeedback?,
      speechSummary: identical(speechSummary, _sentinel)
          ? this.speechSummary
          : speechSummary as ParentSpeechSummary?,
      attentionAlert: identical(attentionAlert, _sentinel)
          ? this.attentionAlert
          : attentionAlert as ParentAttentionAlert?,
      nextAction: nextAction ?? this.nextAction,
      streakInfo: streakInfo ?? this.streakInfo,
    );
  }
}

class ParentDashboardNotifier extends StateNotifier<ParentDashboardState> {
  ParentDashboardNotifier(this._ref, this._repository, this._authRepository)
      : super(const ParentDashboardState());

  final Ref _ref;
  final ParentDashboardRepository _repository;
  final AuthRepository _authRepository;

  Future<void> initialize() async {
    final auth = _ref.read(authProvider);
    final token = auth.token;
    final user = auth.user;

    if (token != null && token.isNotEmpty) {
      _authRepository.setAuthToken(token);
    }

    if (user == null || user.id == null || user.id!.isEmpty) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Please sign in to view the parent dashboard.',
      );
      return;
    }

    state = state.copyWith(
      isLoading: true,
      errorMessage: null,
      user: user,
    );

    try {
      final results = await Future.wait([
        _repository.fetchOverview(),
        _repository.fetchChildren(user.id!),
        _repository.fetchChildrenProgress(),
        _repository.fetchUnreadNotificationCount(user.id!),
        _repository.fetchParentReports(),
      ]);

      final overview = results[0] as ParentOverviewData;
      var children = results[1] as List<ParentChild>;
      final progressChildren = results[2] as List<ParentChild>;
      final unread = results[3] as int;
      final parentReports = results[4] as List<ParentReportItem>;

      if (children.isEmpty && progressChildren.isNotEmpty) {
        children = progressChildren;
      }

      final mergedChildren = _mergeChildren(children, progressChildren);
      final selectedId = mergedChildren.isNotEmpty ? mergedChildren.first.id : null;

      final latestReportLabel = parentReports.isNotEmpty
          ? parentReports.first.title
          : overview.latestReportLabel;

      state = state.copyWith(
        isLoading: false,
        overview: ParentOverviewData(
          childrenCount: mergedChildren.isNotEmpty
              ? mergedChildren.length
              : overview.childrenCount,
          todaysTasksCount: overview.todaysTasksCount,
          upcomingSessionsCount: overview.upcomingSessionsCount,
          latestReportLabel: latestReportLabel,
        ),
        children: mergedChildren,
        childrenProgress: progressChildren.isNotEmpty ? progressChildren : mergedChildren,
        selectedChildId: selectedId,
        unreadNotifications: unread,
        reports: parentReports,
      );

      if (selectedId != null) {
        await loadSelectedChildData(selectedId, showLoader: false);
      }
    } catch (error) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Failed to load dashboard: $error',
      );
    }
  }

  Future<void> refresh() => initialize();

  Future<void> selectChild(String childId) async {
    if (childId == state.selectedChildId) {
      return;
    }
    state = state.copyWith(selectedChildId: childId);
    await loadSelectedChildData(childId);
  }

  Future<void> loadSelectedChildData(String childId, {bool showLoader = true}) async {
    final child = state.children.firstWhere(
      (item) => item.id == childId,
      orElse: () => ParentChild(id: childId, name: 'Child'),
    );

    if (showLoader) {
      state = state.copyWith(isLoadingChild: true, errorMessage: null);
    }

    try {
      final results = await Future.wait([
        _repository.fetchDailyTasks(childId),
        _repository.fetchSubmissions(childId),
        _repository.fetchPatientReports(childId),
        _repository.fetchAiInsight(childId, child.name),
        _repository.fetchLatestFeedback(childId),
        _repository.fetchSpeechSummary(childId),
        _repository.fetchImprovementPercentage(childId),
        _repository.fetchWeeklyProgress(childId),
        if (state.user?.id != null)
          _repository.fetchNotifications(state.user!.id!)
        else
          Future<List<ParentNotificationItem>>.value(const []),
      ]);

      final dailyTasks = results[0] as List<ParentDailyTask>;
      final submissions = results[1] as List<ParentSubmissionItem>;
      final reports = results[2] as List<ParentReportItem>;
      final aiInsight = results[3] as ParentAiInsight?;
      final feedback = results[4] as ParentSpecialistFeedback?;
      final speech = results[5] as ParentSpeechSummary?;
      final improvement = results[6] as double?;
      final weeklyProgress = results[7] as List<Map<String, dynamic>>;
      final notifications = results[8] as List<ParentNotificationItem>;

      final streakInfo = _computeStreak(dailyTasks, submissions);
      final attentionAlert = _computeAttentionAlert(
        childName: child.name,
        dailyTasks: dailyTasks,
        submissions: submissions,
        weeklyProgress: weeklyProgress,
        improvement: improvement,
        notifications: notifications,
      );
      final nextAction = _computeNextAction(
        dailyTasks: dailyTasks,
        submissions: submissions,
        feedback: feedback,
        reports: reports,
      );

      final resolvedReports = reports.isNotEmpty ? reports : state.reports;
      final resolvedAiInsight = aiInsight ??
          ParentAiInsight(
            message:
                '${child.name} is improving in pronunciation clarity. Recommended today: 10-min speech drill.',
          );

      state = state.copyWith(
        isLoadingChild: false,
        dailyTasks: dailyTasks,
        submissions: submissions,
        reports: resolvedReports,
        aiInsight: resolvedAiInsight,
        latestFeedback: feedback,
        speechSummary: speech,
        attentionAlert: attentionAlert,
        nextAction: nextAction,
        streakInfo: streakInfo,
        overview: state.overview.copyWithCounts(
          todaysTasksCount: dailyTasks.isNotEmpty ? dailyTasks.length : state.overview.todaysTasksCount,
          latestReportLabel: resolvedReports.isNotEmpty
              ? resolvedReports.first.title
              : state.overview.latestReportLabel,
        ),
      );
    } catch (error) {
      state = state.copyWith(
        isLoadingChild: false,
        errorMessage: 'Failed to load child data: $error',
      );
    }
  }

  List<ParentChild> _mergeChildren(
    List<ParentChild> children,
    List<ParentChild> progressChildren,
  ) {
    final map = <String, ParentChild>{};
    for (final child in children) {
      if (child.id.isEmpty) {
        continue;
      }
      map[child.id] = child;
    }
    for (final child in progressChildren) {
      if (child.id.isEmpty) {
        continue;
      }
      final existing = map[child.id];
      map[child.id] = ParentChild(
        id: child.id,
        name: child.name.isNotEmpty ? child.name : (existing?.name ?? 'Child'),
        progressPercent: child.progressPercent ?? existing?.progressPercent,
      );
    }
    return map.values.toList();
  }

  ParentStreakInfo _computeStreak(
    List<ParentDailyTask> tasks,
    List<ParentSubmissionItem> submissions,
  ) {
    final today = DateTime.now();
    bool isSameDay(DateTime? date) {
      if (date == null) {
        return false;
      }
      return date.year == today.year &&
          date.month == today.month &&
          date.day == today.day;
    }

    final todaySubmissionExerciseIds = submissions
        .where((item) => isSameDay(item.submittedAt))
        .map((item) => item.assignedExerciseId)
        .where((id) => id.isNotEmpty)
        .toSet();

    final completedToday = tasks.where((task) {
      return task.isCompleted || todaySubmissionExerciseIds.contains(task.id);
    }).length;

    var streakDays = 0;
    for (var offset = 0; offset < 7; offset++) {
      final day = today.subtract(Duration(days: offset));
      final hasActivity = submissions.any((submission) {
        final date = submission.submittedAt;
        if (date == null) {
          return false;
        }
        return date.year == day.year &&
            date.month == day.month &&
            date.day == day.day;
      });
      if (hasActivity) {
        streakDays++;
      } else if (offset > 0) {
        break;
      }
    }

    return ParentStreakInfo(
      completedToday: completedToday,
      totalToday: tasks.length,
      streakDays: streakDays,
    );
  }

  ParentAttentionAlert? _computeAttentionAlert({
    required String childName,
    required List<ParentDailyTask> dailyTasks,
    required List<ParentSubmissionItem> submissions,
    required List<Map<String, dynamic>> weeklyProgress,
    required double? improvement,
    required List<ParentNotificationItem> notifications,
  }) {
    final now = DateTime.now();
    final weekAgo = now.subtract(const Duration(days: 7));
    final recentSubmissions = submissions.where((item) {
      final date = item.submittedAt;
      return date != null && date.isAfter(weekAgo);
    }).length;

    if (dailyTasks.length >= 2 && recentSubmissions == 0) {
      return ParentAttentionAlert(
        message: '$childName missed ${dailyTasks.length} exercises this week',
        severity: 'high',
      );
    }

    if (improvement != null && improvement < 0) {
      return ParentAttentionAlert(
        message: 'Speech progress dropped this week for $childName',
        severity: 'warning',
      );
    }

    if (weeklyProgress.length >= 2) {
      final latest = ApiResponseParser.readDouble(weeklyProgress.first, const [
        'improvement_percentage',
        'average_performance',
        'score',
      ]);
      final previous = ApiResponseParser.readDouble(weeklyProgress[1], const [
        'improvement_percentage',
        'average_performance',
        'score',
      ]);
      if (latest != null && previous != null && latest < previous) {
        return ParentAttentionAlert(
          message: 'Speech progress dropped this week for $childName',
          severity: 'warning',
        );
      }
    }

    final warningNotification = notifications.firstWhere(
      (item) {
        final type = item.type?.toLowerCase() ?? '';
        final text = '${item.title} ${item.message}'.toLowerCase();
        return type.contains('warning') ||
            type.contains('alert') ||
            text.contains('missed') ||
            text.contains('attention');
      },
      orElse: () => const ParentNotificationItem(id: '', title: ''),
    );

    if (warningNotification.id.isNotEmpty) {
      return ParentAttentionAlert(
        message: warningNotification.message ?? warningNotification.title,
        severity: 'warning',
      );
    }

    return null;
  }

  ParentNextAction _computeNextAction({
    required List<ParentDailyTask> dailyTasks,
    required List<ParentSubmissionItem> submissions,
    required ParentSpecialistFeedback? feedback,
    required List<ParentReportItem> reports,
  }) {
    final today = DateTime.now();
    final todaySubmissionIds = submissions
        .where((item) {
          final date = item.submittedAt;
          return date != null &&
              date.year == today.year &&
              date.month == today.month &&
              date.day == today.day;
        })
        .map((item) => item.assignedExerciseId)
        .toSet();

    final pendingTask = dailyTasks.firstWhere(
      (task) => !task.isCompleted && !todaySubmissionIds.contains(task.id),
      orElse: () => const ParentDailyTask(id: '', title: ''),
    );

    if (pendingTask.id.isNotEmpty) {
      return const ParentNextAction(
        label: 'Start Today\'s Exercise',
        type: ParentNextActionType.startExercise,
      );
    }

    if (feedback != null) {
      return const ParentNextAction(
        label: 'Review Specialist Feedback',
        type: ParentNextActionType.reviewFeedback,
      );
    }

    return const ParentNextAction(
      label: 'View Latest Report',
      type: ParentNextActionType.viewReport,
    );
  }
}

extension on ParentOverviewData {
  ParentOverviewData copyWithCounts({
    int? childrenCount,
    int? todaysTasksCount,
    int? upcomingSessionsCount,
    String? latestReportLabel,
  }) {
    return ParentOverviewData(
      childrenCount: childrenCount ?? this.childrenCount,
      todaysTasksCount: todaysTasksCount ?? this.todaysTasksCount,
      upcomingSessionsCount: upcomingSessionsCount ?? this.upcomingSessionsCount,
      latestReportLabel: latestReportLabel ?? this.latestReportLabel,
    );
  }
}

const _sentinel = Object();
