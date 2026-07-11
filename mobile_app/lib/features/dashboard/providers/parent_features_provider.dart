import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../auth/providers/auth_provider.dart';
import '../data/parent_dashboard_repository.dart';
import '../models/parent_dashboard_models.dart';
import '../utils/notification_message_utils.dart';
import 'parent_dashboard_provider.dart';

class ParentNotificationsState {
  const ParentNotificationsState({
    this.isLoading = false,
    this.isUpdating = false,
    this.errorMessage,
    this.items = const [],
    this.unreadCount = 0,
  });

  final bool isLoading;
  final bool isUpdating;
  final String? errorMessage;
  final List<ParentNotificationItem> items;
  final int unreadCount;

  ParentNotificationsState copyWith({
    bool? isLoading,
    bool? isUpdating,
    Object? errorMessage = _sentinel,
    List<ParentNotificationItem>? items,
    int? unreadCount,
  }) {
    return ParentNotificationsState(
      isLoading: isLoading ?? this.isLoading,
      isUpdating: isUpdating ?? this.isUpdating,
      errorMessage: identical(errorMessage, _sentinel)
          ? this.errorMessage
          : errorMessage as String?,
      items: items ?? this.items,
      unreadCount: unreadCount ?? this.unreadCount,
    );
  }
}

const _sentinel = Object();

final parentNotificationsProvider =
    StateNotifierProvider<
      ParentNotificationsNotifier,
      ParentNotificationsState
    >(
      (ref) => ParentNotificationsNotifier(
        ref,
        ref.watch(parentDashboardRepositoryProvider),
      ),
    );

class ParentNotificationsNotifier
    extends StateNotifier<ParentNotificationsState> {
  ParentNotificationsNotifier(this._ref, this._repository)
    : super(const ParentNotificationsState());

  final Ref _ref;
  final ParentDashboardRepository _repository;

  void _ensureAuthToken() {
    final token = _ref.read(authProvider).token;
    if (token != null && token.isNotEmpty) {
      _ref.read(authRepositoryProvider).setAuthToken(token);
    }
  }

  String? get _userId => _ref.read(authProvider).user?.id;

  Future<void> initialize() async {
    _ensureAuthToken();
    final userId = _userId;
    if (userId == null || userId.isEmpty) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Please sign in to view notifications.',
      );
      return;
    }

    state = state.copyWith(isLoading: true, errorMessage: null);
    try {
      final results = await Future.wait([
        _repository.fetchNotifications(userId),
        _repository.fetchUnreadNotificationCount(userId),
      ]);
      state = state.copyWith(
        isLoading: false,
        items: results[0] as List<ParentNotificationItem>,
        unreadCount: results[1] as int,
      );
      await _ref.read(parentDashboardProvider.notifier).refreshUnreadCount();
    } catch (error) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Failed to load notifications: $error',
      );
    }
  }

  Future<void> refresh() => initialize();

  Future<void> markAsRead(String notificationId) async {
    state = state.copyWith(isUpdating: true);
    final error = await _repository.markNotificationRead(notificationId);
    if (error != null) {
      state = state.copyWith(isUpdating: false, errorMessage: error);
      return;
    }

    final updated = state.items
        .map(
          (item) => item.id == notificationId
              ? ParentNotificationItem(
                  id: item.id,
                  title: item.title,
                  message: item.message,
                  type: item.type,
                  createdAt: item.createdAt,
                  relatedEntityType: item.relatedEntityType,
                  relatedEntityId: item.relatedEntityId,
                  isRead: true,
                )
              : item,
        )
        .toList();
    state = state.copyWith(
      isUpdating: false,
      items: updated,
      unreadCount: updated.where((item) => !item.isRead).length,
    );
    await _ref.read(parentDashboardProvider.notifier).refreshUnreadCount();
  }

  Future<void> markAllAsRead() async {
    state = state.copyWith(isUpdating: true);
    final error = await _repository.markAllNotificationsRead();
    if (error != null) {
      state = state.copyWith(isUpdating: false, errorMessage: error);
      return;
    }

    final updated = state.items
        .map(
          (item) => ParentNotificationItem(
            id: item.id,
            title: item.title,
            message: item.message,
            type: item.type,
            createdAt: item.createdAt,
            relatedEntityType: item.relatedEntityType,
            relatedEntityId: item.relatedEntityId,
            isRead: true,
          ),
        )
        .toList();
    state = state.copyWith(isUpdating: false, items: updated, unreadCount: 0);
    await _ref.read(parentDashboardProvider.notifier).refreshUnreadCount();
  }

  Future<Set<String>> markUnreadConversationMessageNotificationsRead(
    String conversationId, {
    Set<String> skipIds = const {},
  }) async {
    final toMark = state.items.where((item) {
      return matchesUnreadConversationMessageNotification(
            conversationId: conversationId,
            type: item.type,
            relatedEntityType: item.relatedEntityType,
            relatedEntityId: item.relatedEntityId,
            isRead: item.isRead,
          ) &&
          !skipIds.contains(item.id);
    }).toList();

    if (toMark.isEmpty) {
      return skipIds;
    }

    final processed = Set<String>.from(skipIds);
    final successfullyMarked = <String>{};

    for (final item in toMark) {
      try {
        final error = await _repository.markNotificationRead(item.id);
        if (error == null) {
          successfullyMarked.add(item.id);
          processed.add(item.id);
        } else {
          debugPrint(
            '[ParentNotifications] mark read failed for ${item.id}: $error',
          );
        }
      } catch (error) {
        debugPrint(
          '[ParentNotifications] mark read failed for ${item.id}: $error',
        );
      }
    }

    if (successfullyMarked.isEmpty) {
      return processed;
    }

    final updated = state.items
        .map(
          (item) => successfullyMarked.contains(item.id)
              ? ParentNotificationItem(
                  id: item.id,
                  title: item.title,
                  message: item.message,
                  type: item.type,
                  createdAt: item.createdAt,
                  relatedEntityType: item.relatedEntityType,
                  relatedEntityId: item.relatedEntityId,
                  isRead: true,
                )
              : item,
        )
        .toList();

    state = state.copyWith(
      items: updated,
      unreadCount: updated.where((item) => !item.isRead).length,
    );
    await _ref.read(parentDashboardProvider.notifier).refreshUnreadCount();

    return processed;
  }
}

int countUnreadMessageNotifications(List<ParentNotificationItem> items) {
  return countUnreadParentMessageNotifications(items);
}

extension ParentNotificationsStateX on ParentNotificationsState {
  int get unreadMessageCount => countUnreadMessageNotifications(items);
}

class ParentExercisesState {
  const ParentExercisesState({
    this.isLoading = false,
    this.isSubmitting = false,
    this.errorMessage,
    this.dailyTasks = const [],
    this.weeklyTasks = const [],
    this.assignedExercises = const [],
    this.selectedTab = 0,
  });

  final bool isLoading;
  final bool isSubmitting;
  final String? errorMessage;
  final List<ParentDailyTask> dailyTasks;
  final List<ParentDailyTask> weeklyTasks;
  final List<ParentAssignedExercise> assignedExercises;
  final int selectedTab;

  ParentExercisesState copyWith({
    bool? isLoading,
    bool? isSubmitting,
    Object? errorMessage = _sentinel,
    List<ParentDailyTask>? dailyTasks,
    List<ParentDailyTask>? weeklyTasks,
    List<ParentAssignedExercise>? assignedExercises,
    int? selectedTab,
  }) {
    return ParentExercisesState(
      isLoading: isLoading ?? this.isLoading,
      isSubmitting: isSubmitting ?? this.isSubmitting,
      errorMessage: identical(errorMessage, _sentinel)
          ? this.errorMessage
          : errorMessage as String?,
      dailyTasks: dailyTasks ?? this.dailyTasks,
      weeklyTasks: weeklyTasks ?? this.weeklyTasks,
      assignedExercises: assignedExercises ?? this.assignedExercises,
      selectedTab: selectedTab ?? this.selectedTab,
    );
  }
}

final parentExercisesProvider =
    StateNotifierProvider<ParentExercisesNotifier, ParentExercisesState>(
      (ref) => ParentExercisesNotifier(
        ref,
        ref.watch(parentDashboardRepositoryProvider),
      ),
    );

class ParentExercisesNotifier extends StateNotifier<ParentExercisesState> {
  ParentExercisesNotifier(this._ref, this._repository)
    : super(const ParentExercisesState());

  final Ref _ref;
  final ParentDashboardRepository _repository;

  Future<void> loadForChild(String patientId) async {
    state = state.copyWith(isLoading: true, errorMessage: null);
    try {
      final results = await Future.wait([
        _repository.fetchDailyTasks(patientId),
        _repository.fetchWeeklyTasks(patientId),
        _repository.fetchAssignedExercises(patientId),
        _repository.fetchSubmissions(patientId),
      ]);
      final submissions = results[3] as List<ParentSubmissionItem>;
      final submittedIds = submissions
          .map((item) => item.assignedExerciseId)
          .toSet();
      ParentDailyTask mark(ParentDailyTask task) => ParentDailyTask(
        id: task.id,
        title: task.title,
        dueTime: task.dueTime,
        status: submittedIds.contains(task.id) ? 'completed' : task.status,
        isCompleted: task.isCompleted || submittedIds.contains(task.id),
        instructions: task.instructions,
        frequency: task.frequency,
        dueDate: task.dueDate,
        exerciseId: task.exerciseId,
      );

      state = state.copyWith(
        isLoading: false,
        dailyTasks: (results[0] as List<ParentDailyTask>).map(mark).toList(),
        weeklyTasks: (results[1] as List<ParentDailyTask>).map(mark).toList(),
        assignedExercises: results[2] as List<ParentAssignedExercise>,
      );
    } catch (error) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Failed to load exercises: $error',
      );
    }
  }

  void selectTab(int index) => state = state.copyWith(selectedTab: index);

  Future<String?> submitExercise({
    required String assignedExerciseId,
    String? parentNotes,
    List<int>? mediaBytes,
    String? mediaFilename,
    String? mediaType,
  }) async {
    state = state.copyWith(isSubmitting: true, errorMessage: null);
    try {
      final submissionId = await _repository.createExerciseSubmission(
        assignedExerciseId: assignedExerciseId,
        parentNotes: parentNotes,
      );
      if (mediaBytes != null &&
          mediaFilename != null &&
          mediaBytes.isNotEmpty) {
        final fileUrl = await _repository.uploadExerciseMediaFile(
          mediaBytes,
          mediaFilename,
        );
        await _repository.attachSubmissionMedia(
          submissionId: submissionId,
          mediaType: mediaType ?? _inferMediaType(mediaFilename),
          fileUrl: fileUrl,
        );
      }
      state = state.copyWith(isSubmitting: false);
      final childId = _ref.read(parentDashboardProvider).selectedChildId;
      if (childId != null) {
        await loadForChild(childId);
        await _ref
            .read(parentDashboardProvider.notifier)
            .loadSelectedChildData(childId, showLoader: false);
      }
      return null;
    } catch (error) {
      final message = 'Failed to submit exercise: $error';
      state = state.copyWith(isSubmitting: false, errorMessage: message);
      return message;
    }
  }

  String _inferMediaType(String filename) {
    final lower = filename.toLowerCase();
    if (lower.endsWith('.mp4') ||
        lower.endsWith('.mov') ||
        lower.endsWith('.avi')) {
      return 'video';
    }
    if (lower.endsWith('.mp3') ||
        lower.endsWith('.wav') ||
        lower.endsWith('.m4a')) {
      return 'audio';
    }
    return 'image';
  }
}

class ParentChildDetailState {
  const ParentChildDetailState({
    this.isLoading = false,
    this.errorMessage,
    this.child,
    this.progress = const [],
    this.assignedExercises = const [],
    this.reports = const [],
    this.sessions = const [],
    this.reviews = const [],
  });

  final bool isLoading;
  final String? errorMessage;
  final ParentChild? child;
  final List<ParentProgressSnapshot> progress;
  final List<ParentAssignedExercise> assignedExercises;
  final List<ParentReportItem> reports;
  final List<ParentSessionItem> sessions;
  final List<ParentSpecialistFeedback> reviews;

  ParentChildDetailState copyWith({
    bool? isLoading,
    Object? errorMessage = _sentinel,
    ParentChild? child,
    List<ParentProgressSnapshot>? progress,
    List<ParentAssignedExercise>? assignedExercises,
    List<ParentReportItem>? reports,
    List<ParentSessionItem>? sessions,
    List<ParentSpecialistFeedback>? reviews,
  }) {
    return ParentChildDetailState(
      isLoading: isLoading ?? this.isLoading,
      errorMessage: identical(errorMessage, _sentinel)
          ? this.errorMessage
          : errorMessage as String?,
      child: child ?? this.child,
      progress: progress ?? this.progress,
      assignedExercises: assignedExercises ?? this.assignedExercises,
      reports: reports ?? this.reports,
      sessions: sessions ?? this.sessions,
      reviews: reviews ?? this.reviews,
    );
  }
}

final parentChildDetailProvider =
    StateNotifierProvider.family<
      ParentChildDetailNotifier,
      ParentChildDetailState,
      String
    >(
      (ref, childId) => ParentChildDetailNotifier(
        ref,
        ref.watch(parentDashboardRepositoryProvider),
        childId,
      ),
    );

class ParentChildDetailNotifier extends StateNotifier<ParentChildDetailState> {
  ParentChildDetailNotifier(this._ref, this._repository, this._childId)
    : super(const ParentChildDetailState());

  final Ref _ref;
  final ParentDashboardRepository _repository;
  final String _childId;

  Future<void> initialize() async {
    final dashboard = _ref.read(parentDashboardProvider);
    final child = dashboard.children.firstWhere(
      (item) => item.id == _childId,
      orElse: () => ParentChild(id: _childId, name: 'Child'),
    );
    final userId = _ref.read(authProvider).user?.id;

    state = state.copyWith(isLoading: true, errorMessage: null, child: child);
    try {
      final results = await Future.wait([
        _repository.fetchProgress(_childId),
        _repository.fetchAssignedExercises(_childId),
        _repository.fetchPatientReports(_childId),
        if (userId != null)
          _repository.fetchParentSessions(userId)
        else
          Future<List<ParentSessionItem>>.value(const []),
        _repository.fetchReviews(_childId),
      ]);

      final allSessions = results[3] as List<ParentSessionItem>;
      state = state.copyWith(
        isLoading: false,
        progress: results[0] as List<ParentProgressSnapshot>,
        assignedExercises: results[1] as List<ParentAssignedExercise>,
        reports: results[2] as List<ParentReportItem>,
        sessions: allSessions
            .where(
              (session) =>
                  session.patientId == _childId ||
                  session.patientName == child.name,
            )
            .toList(),
        reviews: results[4] as List<ParentSpecialistFeedback>,
      );
    } catch (error) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Failed to load child details: $error',
      );
    }
  }

  Future<void> refresh() => initialize();
}

class ParentProgressState {
  const ParentProgressState({
    this.isLoading = false,
    this.errorMessage,
    this.snapshots = const [],
    this.daily = const [],
    this.weekly = const [],
    this.monthly = const [],
    this.improvementPercentage,
    this.metrics = const ParentPerformanceMetrics(),
  });

  final bool isLoading;
  final String? errorMessage;
  final List<ParentProgressSnapshot> snapshots;
  final List<ParentProgressSnapshot> daily;
  final List<ParentProgressSnapshot> weekly;
  final List<ParentProgressSnapshot> monthly;
  final double? improvementPercentage;
  final ParentPerformanceMetrics metrics;

  ParentProgressState copyWith({
    bool? isLoading,
    Object? errorMessage = _sentinel,
    List<ParentProgressSnapshot>? snapshots,
    List<ParentProgressSnapshot>? daily,
    List<ParentProgressSnapshot>? weekly,
    List<ParentProgressSnapshot>? monthly,
    double? improvementPercentage,
    ParentPerformanceMetrics? metrics,
  }) {
    return ParentProgressState(
      isLoading: isLoading ?? this.isLoading,
      errorMessage: identical(errorMessage, _sentinel)
          ? this.errorMessage
          : errorMessage as String?,
      snapshots: snapshots ?? this.snapshots,
      daily: daily ?? this.daily,
      weekly: weekly ?? this.weekly,
      monthly: monthly ?? this.monthly,
      improvementPercentage:
          improvementPercentage ?? this.improvementPercentage,
      metrics: metrics ?? this.metrics,
    );
  }
}

final parentProgressProvider =
    StateNotifierProvider.family<
      ParentProgressNotifier,
      ParentProgressState,
      String
    >(
      (ref, childId) => ParentProgressNotifier(
        ref.watch(parentDashboardRepositoryProvider),
        childId,
      ),
    );

class ParentProgressNotifier extends StateNotifier<ParentProgressState> {
  ParentProgressNotifier(this._repository, this._childId)
    : super(const ParentProgressState());

  final ParentDashboardRepository _repository;
  final String _childId;

  Future<void> initialize() async {
    state = state.copyWith(isLoading: true, errorMessage: null);
    try {
      final results = await Future.wait([
        _repository.fetchProgress(_childId),
        _repository.fetchDailyProgress(_childId),
        _repository
            .fetchWeeklyProgress(_childId)
            .then((rows) => rows.map(ParentProgressSnapshot.fromMap).toList()),
        _repository.fetchMonthlyProgress(_childId),
        _repository.fetchImprovementPercentage(_childId),
        _repository.fetchPerformanceMetrics(_childId),
      ]);
      state = state.copyWith(
        isLoading: false,
        snapshots: results[0] as List<ParentProgressSnapshot>,
        daily: results[1] as List<ParentProgressSnapshot>,
        weekly: results[2] as List<ParentProgressSnapshot>,
        monthly: results[3] as List<ParentProgressSnapshot>,
        improvementPercentage: results[4] as double?,
        metrics: results[5] as ParentPerformanceMetrics,
      );
    } catch (error) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Failed to load progress: $error',
      );
    }
  }

  Future<void> refresh() => initialize();
}

class ParentSessionsState {
  const ParentSessionsState({
    this.isLoading = false,
    this.errorMessage,
    this.sessions = const [],
  });

  final bool isLoading;
  final String? errorMessage;
  final List<ParentSessionItem> sessions;

  ParentSessionsState copyWith({
    bool? isLoading,
    Object? errorMessage = _sentinel,
    List<ParentSessionItem>? sessions,
  }) {
    return ParentSessionsState(
      isLoading: isLoading ?? this.isLoading,
      errorMessage: identical(errorMessage, _sentinel)
          ? this.errorMessage
          : errorMessage as String?,
      sessions: sessions ?? this.sessions,
    );
  }
}

final parentSessionsProvider =
    StateNotifierProvider<ParentSessionsNotifier, ParentSessionsState>(
      (ref) => ParentSessionsNotifier(
        ref,
        ref.watch(parentDashboardRepositoryProvider),
      ),
    );

class ParentSessionsNotifier extends StateNotifier<ParentSessionsState> {
  ParentSessionsNotifier(this._ref, this._repository)
    : super(const ParentSessionsState());

  final Ref _ref;
  final ParentDashboardRepository _repository;

  Future<void> initialize() async {
    final userId = _ref.read(authProvider).user?.id;
    if (userId == null || userId.isEmpty) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Please sign in to view sessions.',
      );
      return;
    }

    state = state.copyWith(isLoading: true, errorMessage: null);
    try {
      final sessions = await _repository.fetchParentSessions(userId);
      sessions.sort((a, b) {
        final aDate = a.scheduledAt ?? DateTime.fromMillisecondsSinceEpoch(0);
        final bDate = b.scheduledAt ?? DateTime.fromMillisecondsSinceEpoch(0);
        return aDate.compareTo(bDate);
      });
      state = state.copyWith(isLoading: false, sessions: sessions);
    } catch (error) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Failed to load sessions: $error',
      );
    }
  }

  Future<void> refresh() => initialize();
}
