import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/constants/dashboard_colors.dart';
import '../../../core/services/api_client.dart';
import '../../auth/data/auth_repository.dart';
import '../../auth/providers/auth_provider.dart';
import '../data/admin_dashboard_repository.dart';

final adminDashboardRepositoryProvider = Provider<AdminDashboardRepository>((ref) {
  return AdminDashboardRepository(ref.watch(dioProvider));
});

final adminDashboardProvider =
    StateNotifierProvider<AdminDashboardNotifier, AdminDashboardState>((ref) {
  final repository = ref.watch(adminDashboardRepositoryProvider);
  final authRepository = ref.watch(authRepositoryProvider);
  return AdminDashboardNotifier(ref, repository, authRepository);
});

class AdminDashboardState {
  AdminDashboardState({
    this.isLoading = false,
    this.errorMessage,
    this.userName,
    this.overview = const AdminOverviewData(),
    this.recentUsers = const [],
    this.unreadNotifications = 0,
    WeeklySystemActivityData? weeklySystemActivity,
    this.systemActivityWeekOffset = 0,
    this.isSystemActivityLoading = false,
  }) : weeklySystemActivity = weeklySystemActivity ?? WeeklySystemActivityData.empty;

  final bool isLoading;
  final String? errorMessage;
  final String? userName;
  final AdminOverviewData overview;
  final List<AdminRecentUser> recentUsers;
  final int unreadNotifications;
  final WeeklySystemActivityData weeklySystemActivity;
  final int systemActivityWeekOffset;
  final bool isSystemActivityLoading;

  AdminDashboardState copyWith({
    bool? isLoading,
    Object? errorMessage = _sentinel,
    Object? userName = _sentinel,
    AdminOverviewData? overview,
    List<AdminRecentUser>? recentUsers,
    int? unreadNotifications,
    WeeklySystemActivityData? weeklySystemActivity,
    int? systemActivityWeekOffset,
    bool? isSystemActivityLoading,
  }) {
    return AdminDashboardState(
      isLoading: isLoading ?? this.isLoading,
      errorMessage: identical(errorMessage, _sentinel)
          ? this.errorMessage
          : errorMessage as String?,
      userName: identical(userName, _sentinel) ? this.userName : userName as String?,
      overview: overview ?? this.overview,
      recentUsers: recentUsers ?? this.recentUsers,
      unreadNotifications: unreadNotifications ?? this.unreadNotifications,
      weeklySystemActivity: weeklySystemActivity ?? this.weeklySystemActivity,
      systemActivityWeekOffset:
          systemActivityWeekOffset ?? this.systemActivityWeekOffset,
      isSystemActivityLoading:
          isSystemActivityLoading ?? this.isSystemActivityLoading,
    );
  }
}

class AdminDashboardNotifier extends StateNotifier<AdminDashboardState> {
  AdminDashboardNotifier(this._ref, this._repository, this._authRepository)
      : super(AdminDashboardState());

  final Ref _ref;
  final AdminDashboardRepository _repository;
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
        errorMessage: 'Please sign in as an admin to view this dashboard.',
      );
      return;
    }

    state = state.copyWith(
      isLoading: true,
      errorMessage: null,
      userName: user.fullName,
    );

    try {
      final results = await Future.wait([
        _repository.fetchOverview(),
        _repository.fetchRecentUsers(),
        _repository.fetchUnreadNotifications(user.id!),
        _repository.fetchWeeklySystemActivity(
          weekOffset: state.systemActivityWeekOffset,
        ),
      ]);

      state = state.copyWith(
        isLoading: false,
        overview: results[0] as AdminOverviewData,
        recentUsers: results[1] as List<AdminRecentUser>,
        unreadNotifications: results[2] as int,
        weeklySystemActivity: results[3] as WeeklySystemActivityData,
        systemActivityWeekOffset:
            (results[3] as WeeklySystemActivityData).weekOffset,
      );
    } catch (error) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Failed to load admin dashboard: $error',
      );
    }
  }

  Future<void> setSystemActivityWeekOffset(int weekOffset) async {
    final normalizedOffset = weekOffset.clamp(0, 52);
    if (normalizedOffset == state.systemActivityWeekOffset &&
        !state.isSystemActivityLoading) {
      return;
    }

    state = state.copyWith(
      systemActivityWeekOffset: normalizedOffset,
      isSystemActivityLoading: true,
    );

    try {
      final activity = await _repository.fetchWeeklySystemActivity(
        weekOffset: normalizedOffset,
      );

      state = state.copyWith(
        weeklySystemActivity: activity,
        systemActivityWeekOffset: activity.weekOffset,
        isSystemActivityLoading: false,
      );
    } catch (error) {
      state = state.copyWith(isSystemActivityLoading: false);
    }
  }

  Future<void> showPreviousSystemActivityWeek() =>
      setSystemActivityWeekOffset(state.systemActivityWeekOffset + 1);

  Future<void> showNextSystemActivityWeek() {
    if (state.systemActivityWeekOffset <= 0) {
      return Future.value();
    }
    return setSystemActivityWeekOffset(state.systemActivityWeekOffset - 1);
  }

  Future<void> refresh() => initialize();
}

Color adminRoleColor(String role) {
  switch (role.toLowerCase()) {
    case 'parent':
      return DashboardColors.brandCyan;
    case 'specialist':
      return DashboardColors.success;
    case 'admin':
      return DashboardColors.warning;
    default:
      return DashboardColors.accent;
  }
}

const _sentinel = Object();
