import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../../core/services/api_client.dart';
import '../../auth/data/auth_repository.dart';
import '../../auth/providers/auth_provider.dart';
import '../data/specialist_dashboard_repository.dart';
import '../data/specialist_features_repository.dart';
import '../models/specialist_dashboard_models.dart';

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
    this.progress = const [],
    this.unreadNotifications = 0,
    this.hasAssignedPatients = false,
  });

  final bool isLoading;
  final String? errorMessage;
  final String? userName;
  final SpecialistOverviewData overview;
  final List<SpecialistPendingReview> pendingReviews;
  final List<SpecialistScheduleItem> schedule;
  final List<SpecialistPatientProgress> progress;
  final int unreadNotifications;
  final bool hasAssignedPatients;

  SpecialistDashboardState copyWith({
    bool? isLoading,
    Object? errorMessage = _sentinel,
    Object? userName = _sentinel,
    SpecialistOverviewData? overview,
    List<SpecialistPendingReview>? pendingReviews,
    List<SpecialistScheduleItem>? schedule,
    List<SpecialistPatientProgress>? progress,
    int? unreadNotifications,
    bool? hasAssignedPatients,
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
      progress: progress ?? this.progress,
      unreadNotifications: unreadNotifications ?? this.unreadNotifications,
      hasAssignedPatients: hasAssignedPatients ?? this.hasAssignedPatients,
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

  Future<void> initialize() async {
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
    );

    try {
      final bundle = await _repository.fetchDashboardBundle(user.id!);
      final unreadCount = await _featuresRepository.fetchUnreadCount(user.id!);

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
        progress: bundle.progress,
        unreadNotifications: unreadCount,
        hasAssignedPatients: bundle.patients.isNotEmpty,
      );
    } catch (error) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Failed to load specialist dashboard: $error',
      );
    }
  }

  Future<void> refresh() => initialize();

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
