import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/services/api_client.dart';
import '../../../core/utils/api_response_parser.dart';
import '../../auth/data/auth_repository.dart';
import '../../auth/models/auth_user.dart';
import '../../auth/providers/auth_provider.dart';
import '../data/parent_dashboard_repository.dart';
import '../models/parent_dashboard_models.dart';
import 'parent_features_provider.dart';

final parentDashboardRepositoryProvider = Provider<ParentDashboardRepository>((
  ref,
) {
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
    this.selectedPatientId,
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
    this.sessions = const [],
  });

  final bool isLoading;
  final bool isLoadingChild;
  final String? errorMessage;
  final AuthUser? user;
  final ParentOverviewData overview;
  final List<ParentChild> children;
  final String? selectedPatientId;
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
  final List<ParentSessionItem> sessions;

  ParentChild? get selectedChild {
    if (selectedPatientId == null) {
      return null;
    }
    for (final child in children) {
      if (child.id == selectedPatientId) {
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
    Object? selectedPatientId = _sentinel,
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
    List<ParentSessionItem>? sessions,
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
      selectedPatientId: identical(selectedPatientId, _sentinel)
          ? this.selectedPatientId
          : selectedPatientId as String?,
      unreadNotifications: unreadNotifications ?? this.unreadNotifications,
      dailyTasks: dailyTasks ?? this.dailyTasks,
      submissions: submissions ?? this.submissions,
      childrenProgress: childrenProgress ?? this.childrenProgress,
      reports: reports ?? this.reports,
      aiInsight: identical(aiInsight, _sentinel)
          ? this.aiInsight
          : aiInsight as ParentAiInsight?,
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
      sessions: sessions ?? this.sessions,
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

    state = state.copyWith(isLoading: true, errorMessage: null, user: user);

    try {
      final previousSelectedId = state.selectedPatientId;

      final results = await Future.wait([
        _repository.fetchOverview(),
        _repository.fetchChildren(user.id!),
        _repository.fetchChildrenProgress(),
        _repository.fetchUnreadNotificationCount(user.id!),
        _repository.fetchParentSessions(user.id!),
      ]);

      final overview = results[0] as ParentOverviewData;
      var children = results[1] as List<ParentChild>;
      final progressChildren = results[2] as List<ParentChild>;
      final unread = results[3] as int;
      final sessions = results[4] as List<ParentSessionItem>;

      if (children.isEmpty && progressChildren.isNotEmpty) {
        children = progressChildren;
      }

      final mergedChildren = _mergeChildren(children, progressChildren);
      final selectedId = _resolveSelectedPatientId(
        mergedChildren,
        previousSelectedId,
      );

      state = state.copyWith(
        isLoading: false,
        overview: ParentOverviewData(
          childrenCount: mergedChildren.length,
          todaysTasksCount: overview.todaysTasksCount,
          upcomingSessionsCount: _upcomingSessionsCountForPatient(
            sessions,
            selectedId,
          ),
          latestReportLabel: 'No report yet',
        ),
        children: mergedChildren,
        childrenProgress: progressChildren.isNotEmpty
            ? progressChildren
            : mergedChildren,
        selectedPatientId: selectedId,
        unreadNotifications: unread,
        reports: const [],
        sessions: sessions,
        dailyTasks: const [],
        submissions: const [],
        aiInsight: null,
        latestFeedback: null,
        speechSummary: null,
        attentionAlert: null,
        streakInfo: const ParentStreakInfo(
          completedToday: 0,
          totalToday: 0,
          streakDays: 0,
        ),
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

  /// Reloads dashboard data and, when [preferredPatientId] is present in the
  /// refreshed children list, selects that child and loads its dashboard data.
  ///
  /// If [preferOnlyIfNoPriorSelection] is true, selection only changes when the
  /// previous [ParentDashboardState.selectedPatientId] was null/empty.
  Future<void> refreshAndPreferChild(
    String? preferredPatientId, {
    bool preferOnlyIfNoPriorSelection = false,
  }) async {
    final previousSelectedId = state.selectedPatientId;
    final previouslyHadNoChildren = state.children.isEmpty;

    await initialize();

    final preferred = preferredPatientId?.trim();
    if (preferred == null || preferred.isEmpty) {
      return;
    }

    final exists = state.children.any((child) => child.id == preferred);
    if (!exists) {
      return;
    }

    if (preferOnlyIfNoPriorSelection &&
        previousSelectedId != null &&
        previousSelectedId.isNotEmpty &&
        !previouslyHadNoChildren) {
      return;
    }

    if (state.selectedPatientId == preferred) {
      return;
    }

    await selectPatient(preferred);
  }

  void syncUserFromAuth() {
    final user = _ref.read(authProvider).user;
    if (user == null) {
      return;
    }
    state = state.copyWith(user: user);
  }

  Future<void> refreshUnreadCount() async {
    final userId = state.user?.id ?? _ref.read(authProvider).user?.id;
    if (userId == null || userId.isEmpty) {
      return;
    }

    try {
      final count = await _repository.fetchUnreadNotificationCount(userId);
      state = state.copyWith(unreadNotifications: count);
    } catch (_) {}
  }

  Future<void> selectPatient(String patientId) async {
    if (patientId == state.selectedPatientId) {
      return;
    }

    state = state.copyWith(
      selectedPatientId: patientId,
      isLoadingChild: true,
      errorMessage: null,
      dailyTasks: const [],
      submissions: const [],
      reports: const [],
      aiInsight: null,
      latestFeedback: null,
      speechSummary: null,
      attentionAlert: null,
      streakInfo: const ParentStreakInfo(
        completedToday: 0,
        totalToday: 0,
        streakDays: 0,
      ),
      nextAction: const ParentNextAction(
        label: 'Start Today\'s Exercise',
        type: ParentNextActionType.startExercise,
      ),
      overview: state.overview.copyWithCounts(
        todaysTasksCount: 0,
        upcomingSessionsCount: _upcomingSessionsCountForPatient(
          state.sessions,
          patientId,
        ),
        latestReportLabel: 'No report yet',
      ),
    );

    await loadSelectedChildData(patientId, showLoader: false);
  }

  Future<void> loadSelectedChildData(
    String patientId, {
    bool showLoader = true,
  }) async {
    if (state.selectedPatientId != patientId) {
      state = state.copyWith(selectedPatientId: patientId);
    }

    final child = state.children.firstWhere(
      (item) => item.id == patientId,
      orElse: () => ParentChild(id: patientId, name: 'Child'),
    );

    if (showLoader) {
      state = state.copyWith(isLoadingChild: true, errorMessage: null);
    }

    try {
      final results = await Future.wait([
        _repository.fetchDailyTasks(patientId),
        _repository.fetchSubmissions(patientId),
        _repository.fetchPatientReports(patientId),
        _repository.fetchAiInsight(patientId, child.name),
        _repository.fetchLatestFeedback(patientId),
        _repository.fetchSpeechSummary(patientId),
        _repository.fetchImprovementPercentage(patientId),
        _repository.fetchWeeklyProgress(patientId),
        if (state.user?.id != null)
          _repository.fetchNotifications(state.user!.id!)
        else
          Future<List<ParentNotificationItem>>.value(const []),
      ]);

      if (state.selectedPatientId != patientId) {
        return;
      }

      final dailyTasks = _applySubmissionStatus(
        results[0] as List<ParentDailyTask>,
        results[1] as List<ParentSubmissionItem>,
      );
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

      state = state.copyWith(
        isLoadingChild: false,
        dailyTasks: dailyTasks,
        submissions: submissions,
        reports: reports,
        aiInsight: aiInsight,
        latestFeedback: feedback,
        speechSummary: speech,
        attentionAlert: attentionAlert,
        nextAction: nextAction,
        streakInfo: streakInfo,
        overview: state.overview.copyWithCounts(
          todaysTasksCount: dailyTasks.length,
          upcomingSessionsCount: _upcomingSessionsCountForPatient(
            state.sessions,
            patientId,
          ),
          latestReportLabel: reports.isNotEmpty
              ? reports.first.title
              : 'No report yet',
        ),
      );

      _ensureTreatmentJourneyLoaded(patientId);
    } catch (error) {
      if (state.selectedPatientId != patientId) {
        return;
      }
      state = state.copyWith(
        isLoadingChild: false,
        errorMessage: 'Failed to load child data: $error',
      );
    }
  }

  String? _resolveSelectedPatientId(
    List<ParentChild> children,
    String? previousSelectedId,
  ) {
    if (children.isEmpty) {
      return null;
    }

    final previous = previousSelectedId?.trim();
    if (previous != null &&
        previous.isNotEmpty &&
        children.any((child) => child.id == previous)) {
      return previous;
    }

    return children.first.id;
  }

  int _upcomingSessionsCountForPatient(
    List<ParentSessionItem> sessions,
    String? patientId,
  ) {
    final id = patientId?.trim();
    if (id == null || id.isEmpty) {
      return 0;
    }

    return sessions.where((session) {
      return session.patientId == id && session.isUpcoming;
    }).length;
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
        dateOfBirth: existing?.dateOfBirth ?? child.dateOfBirth,
        gender: existing?.gender ?? child.gender,
        profileImageUrl: existing?.profileImageUrl ?? child.profileImageUrl,
      );
    }
    return map.values.toList();
  }

  List<ParentDailyTask> _applySubmissionStatus(
    List<ParentDailyTask> tasks,
    List<ParentSubmissionItem> submissions,
  ) {
    final submittedIds = submissions
        .map((item) => item.assignedExerciseId)
        .toSet();
    return tasks
        .map(
          (task) => ParentDailyTask(
            id: task.id,
            title: task.title,
            dueTime: task.dueTime,
            status: task.isCompleted || submittedIds.contains(task.id)
                ? 'completed'
                : task.status,
            isCompleted: task.isCompleted || submittedIds.contains(task.id),
            instructions: task.instructions,
            frequency: task.frequency,
            dueDate: task.dueDate,
            exerciseId: task.exerciseId,
          ),
        )
        .toList();
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

    final warningNotification = notifications.firstWhere((item) {
      final type = item.type?.toLowerCase() ?? '';
      final text = '${item.title} ${item.message}'.toLowerCase();
      return type.contains('warning') ||
          type.contains('alert') ||
          text.contains('missed') ||
          text.contains('attention');
    }, orElse: () => const ParentNotificationItem(id: '', title: ''));

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

  void _ensureTreatmentJourneyLoaded(String patientId) {
    if (patientId.trim().isEmpty) {
      return;
    }

    _ref
        .read(parentProgressProvider(patientId).notifier)
        .changeJourneyPeriod(patientId, 'weekly');
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
      upcomingSessionsCount:
          upcomingSessionsCount ?? this.upcomingSessionsCount,
      latestReportLabel: latestReportLabel ?? this.latestReportLabel,
    );
  }
}

const _sentinel = Object();
