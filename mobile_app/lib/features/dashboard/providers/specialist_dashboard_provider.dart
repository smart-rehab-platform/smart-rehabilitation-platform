import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../../core/services/api_client.dart';
import '../../auth/data/auth_repository.dart';
import '../../auth/providers/auth_provider.dart';
import '../data/specialist_dashboard_repository.dart';
import '../data/specialist_features_repository.dart';
import '../models/specialist_dashboard_models.dart';
import '../models/specialist_feature_models.dart';
import '../models/specialist_weekly_interactions_models.dart';

final specialistDashboardRepositoryProvider =
    Provider<SpecialistDashboardRepository>((ref) {
      return SpecialistDashboardRepository(ref.watch(dioProvider));
    });

final specialistFeaturesRepositoryForDashboardProvider =
    Provider<SpecialistFeaturesRepository>((ref) {
      return SpecialistFeaturesRepository(ref.watch(dioProvider));
    });

final specialistDashboardProvider =
    StateNotifierProvider<
      SpecialistDashboardNotifier,
      SpecialistDashboardState
    >((ref) {
      final repository = ref.watch(specialistDashboardRepositoryProvider);
      final featuresRepository = ref.watch(
        specialistFeaturesRepositoryForDashboardProvider,
      );
      final authRepository = ref.watch(authRepositoryProvider);
      return SpecialistDashboardNotifier(
        ref,
        repository,
        featuresRepository,
        authRepository,
      );
    });

class SpecialistDashboardState {
  const SpecialistDashboardState({
    this.isLoading = false,
    this.errorMessage,
    this.userName,
    this.overview = const SpecialistOverviewData(),
    this.pendingReviews = const [],
    this.schedule = const [],
    this.sessions = const [],
    this.progress = const [],
    this.unreadNotifications = 0,
    this.hasAssignedPatients = false,
    this.weeklyInteractions,
    this.weeklyInteractionsWeekOffset = 0,
    this.isWeeklyInteractionsLoading = false,
    this.weeklyInteractionsErrorMessage,
  });

  final bool isLoading;
  final String? errorMessage;
  final String? userName;
  final SpecialistOverviewData overview;
  final List<SpecialistPendingReview> pendingReviews;
  final List<SpecialistScheduleItem> schedule;
  final List<SpecialistSessionDetail> sessions;
  final List<SpecialistPatientProgress> progress;
  final int unreadNotifications;
  final bool hasAssignedPatients;
  final SpecialistWeeklyInteractionsData? weeklyInteractions;
  final int weeklyInteractionsWeekOffset;
  final bool isWeeklyInteractionsLoading;
  final String? weeklyInteractionsErrorMessage;

  SpecialistDashboardState copyWith({
    bool? isLoading,
    Object? errorMessage = _sentinel,
    Object? userName = _sentinel,
    SpecialistOverviewData? overview,
    List<SpecialistPendingReview>? pendingReviews,
    List<SpecialistScheduleItem>? schedule,
    List<SpecialistSessionDetail>? sessions,
    List<SpecialistPatientProgress>? progress,
    int? unreadNotifications,
    bool? hasAssignedPatients,
    Object? weeklyInteractions = _sentinel,
    int? weeklyInteractionsWeekOffset,
    bool? isWeeklyInteractionsLoading,
    Object? weeklyInteractionsErrorMessage = _sentinel,
  }) {
    return SpecialistDashboardState(
      isLoading: isLoading ?? this.isLoading,
      errorMessage: identical(errorMessage, _sentinel)
          ? this.errorMessage
          : errorMessage as String?,
      userName: identical(userName, _sentinel)
          ? this.userName
          : userName as String?,
      overview: overview ?? this.overview,
      pendingReviews: pendingReviews ?? this.pendingReviews,
      schedule: schedule ?? this.schedule,
      sessions: sessions ?? this.sessions,
      progress: progress ?? this.progress,
      unreadNotifications: unreadNotifications ?? this.unreadNotifications,
      hasAssignedPatients: hasAssignedPatients ?? this.hasAssignedPatients,
      weeklyInteractions: identical(weeklyInteractions, _sentinel)
          ? this.weeklyInteractions
          : weeklyInteractions as SpecialistWeeklyInteractionsData?,
      weeklyInteractionsWeekOffset:
          weeklyInteractionsWeekOffset ?? this.weeklyInteractionsWeekOffset,
      isWeeklyInteractionsLoading:
          isWeeklyInteractionsLoading ?? this.isWeeklyInteractionsLoading,
      weeklyInteractionsErrorMessage: identical(
            weeklyInteractionsErrorMessage,
            _sentinel,
          )
          ? this.weeklyInteractionsErrorMessage
          : weeklyInteractionsErrorMessage as String?,
    );
  }
}

class SpecialistDashboardNotifier
    extends StateNotifier<SpecialistDashboardState> {
  SpecialistDashboardNotifier(
    this._ref,
    this._repository,
    this._featuresRepository,
    this._authRepository,
  ) : super(const SpecialistDashboardState());

  final Ref _ref;
  final SpecialistDashboardRepository _repository;
  final SpecialistFeaturesRepository _featuresRepository;
  final AuthRepository _authRepository;
  Future<void>? _initializeFuture;

  Future<void> initialize({bool force = false}) async {
    if (!force && _initializeFuture != null) {
      return _initializeFuture!;
    }

    final future = _doInitialize();
    _initializeFuture = future;
    try {
      await future;
    } finally {
      if (identical(_initializeFuture, future)) {
        _initializeFuture = null;
      }
    }
  }

  Future<void> _doInitialize() async {
    final auth = _ref.read(authProvider);
    if (auth.token != null && auth.token!.isNotEmpty) {
      _authRepository.setAuthToken(auth.token);
    }

    final user = auth.user;
    if (user?.id == null || user!.id!.isEmpty) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Please sign in as a specialist to view this dashboard.',
      );
      return;
    }

    state = state.copyWith(
      isLoading: true,
      errorMessage: null,
      userName: user.fullName,
      isWeeklyInteractionsLoading: true,
      weeklyInteractionsErrorMessage: null,
    );

    try {
      final results = await Future.wait([
        _repository.fetchDashboardBundle(user.id!),
        _featuresRepository.fetchUnreadCount(user.id!),
      ]);
      final bundle = results[0] as SpecialistDashboardBundle;
      final unreadCount = results[1] as int;

      final schedule = bundle.todaySessions
          .map(
            (session) => SpecialistScheduleItem(
              timeLabel: session.timeLabel,
              patientName: session.patientName,
              sessionType: session.displaySubtitle,
            ),
          )
          .take(5)
          .toList();

      state = state.copyWith(
        isLoading: false,
        overview: bundle.overview,
        pendingReviews: bundle.pendingReviews.take(5).toList(),
        schedule: schedule,
        sessions: bundle.allSessions,
        progress: bundle.progress,
        unreadNotifications: unreadCount,
        hasAssignedPatients: bundle.patients.isNotEmpty,
      );
    } catch (error) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Failed to load specialist dashboard: $error',
        isWeeklyInteractionsLoading: false,
      );
      return;
    }

    await _loadWeeklyInteractions(state.weeklyInteractionsWeekOffset);
  }

  Future<void> _loadWeeklyInteractions(int weekOffset) async {
    final normalizedOffset = normalizeWeeklyInteractionsWeekOffset(weekOffset);

    state = state.copyWith(
      weeklyInteractionsWeekOffset: normalizedOffset,
      isWeeklyInteractionsLoading: true,
      weeklyInteractionsErrorMessage: null,
    );

    try {
      final interactions = await _repository.fetchWeeklyPatientInteractions(
        weekOffset: normalizedOffset,
      );

      if (normalizedOffset != state.weeklyInteractionsWeekOffset) {
        return;
      }

      state = state.copyWith(
        weeklyInteractions: interactions,
        weeklyInteractionsWeekOffset: normalizedOffset,
        isWeeklyInteractionsLoading: false,
        weeklyInteractionsErrorMessage: null,
      );
    } catch (error) {
      if (normalizedOffset != state.weeklyInteractionsWeekOffset) {
        return;
      }

      state = state.copyWith(
        isWeeklyInteractionsLoading: false,
        weeklyInteractionsErrorMessage: 'failed',
      );
    }
  }

  Future<void> setWeeklyInteractionsWeekOffset(int weekOffset) async {
    final normalizedOffset = normalizeWeeklyInteractionsWeekOffset(weekOffset);
    if (normalizedOffset == state.weeklyInteractionsWeekOffset &&
        !state.isWeeklyInteractionsLoading) {
      return;
    }

    await _loadWeeklyInteractions(normalizedOffset);
  }

  Future<void> retryWeeklyInteractions() =>
      _loadWeeklyInteractions(state.weeklyInteractionsWeekOffset);

  Future<void> refresh() => initialize(force: true);

  void syncUserFromAuth() {
    final user = _ref.read(authProvider).user;
    if (user == null) {
      return;
    }
    state = state.copyWith(userName: user.fullName);
  }
}

String formatSubmittedAgo(DateTime? date) {
  if (date == null) {
    return 'Recently submitted';
  }

  final diff = DateTime.now().difference(date);
  if (diff.inMinutes < 60) {
    return 'Submitted ${diff.inMinutes}m ago';
  }
  if (diff.inHours < 24) {
    return 'Submitted ${diff.inHours}h ago';
  }
  return 'Submitted ${DateFormat('MMM d').format(date)}';
}

const _sentinel = Object();
