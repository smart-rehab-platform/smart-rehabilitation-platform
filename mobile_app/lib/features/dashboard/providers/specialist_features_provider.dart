import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/services/api_client.dart';
import '../../auth/providers/auth_provider.dart';
import '../data/specialist_features_repository.dart';
import '../models/specialist_dashboard_models.dart';
import '../models/specialist_feature_models.dart';

final specialistFeaturesRepositoryProvider =
    Provider<SpecialistFeaturesRepository>((ref) {
  return SpecialistFeaturesRepository(ref.watch(dioProvider));
});

class SpecialistListState<T> {
  SpecialistListState({
    this.isLoading = false,
    this.errorMessage,
    List<T>? items,
  }) : items = items ?? <T>[];

  final bool isLoading;
  final String? errorMessage;
  final List<T> items;

  SpecialistListState<T> copyWith({
    bool? isLoading,
    Object? errorMessage = _sentinel,
    List<T>? items,
  }) {
    return SpecialistListState<T>(
      isLoading: isLoading ?? this.isLoading,
      errorMessage: identical(errorMessage, _sentinel)
          ? this.errorMessage
          : errorMessage as String?,
      items: items ?? this.items,
    );
  }
}

abstract class SpecialistListNotifier<T> extends StateNotifier<SpecialistListState<T>> {
  SpecialistListNotifier(this._ref, this._repository)
      : super(SpecialistListState<T>());

  final Ref _ref;
  final SpecialistFeaturesRepository _repository;

  void _ensureAuthToken() {
    final token = _ref.read(authProvider).token;
    if (token != null && token.isNotEmpty) {
      _ref.read(authRepositoryProvider).setAuthToken(token);
    }
  }

  String? get _userId => _ref.read(authProvider).user?.id;

  Future<void> load(Future<List<T>> Function(String userId) fetcher) async {
    _ensureAuthToken();
    final userId = _userId;
    if (userId == null || userId.isEmpty) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Please sign in to continue.',
      );
      return;
    }

    state = state.copyWith(isLoading: true, errorMessage: null);
    try {
      final items = await fetcher(userId);
      state = state.copyWith(isLoading: false, items: items);
    } catch (error) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Failed to load data: $error',
      );
    }
  }
}

final specialistPatientsProvider =
    StateNotifierProvider<SpecialistPatientsNotifier, SpecialistListState<SpecialistPatientItem>>(
  (ref) => SpecialistPatientsNotifier(ref, ref.watch(specialistFeaturesRepositoryProvider)),
);

class SpecialistPatientsNotifier extends SpecialistListNotifier<SpecialistPatientItem> {
  SpecialistPatientsNotifier(super.ref, super.repository);

  Future<void> initialize() => load(_repository.fetchPatients);
  Future<void> refresh() => initialize();
}

final specialistPendingReviewsListProvider = StateNotifierProvider<
    SpecialistPendingReviewsListNotifier,
    SpecialistListState<SpecialistPendingReview>>(
  (ref) => SpecialistPendingReviewsListNotifier(
    ref,
    ref.watch(specialistFeaturesRepositoryProvider),
  ),
);

class SpecialistPendingReviewsListNotifier
    extends SpecialistListNotifier<SpecialistPendingReview> {
  SpecialistPendingReviewsListNotifier(super.ref, super.repository);

  Future<void> initialize() => load(_repository.fetchPendingReviews);
  Future<void> refresh() => initialize();
}

final specialistTreatmentPlansProvider = StateNotifierProvider<
    SpecialistTreatmentPlansNotifier,
    SpecialistListState<SpecialistTreatmentPlanItem>>(
  (ref) => SpecialistTreatmentPlansNotifier(
    ref,
    ref.watch(specialistFeaturesRepositoryProvider),
  ),
);

class SpecialistTreatmentPlansNotifier
    extends SpecialistListNotifier<SpecialistTreatmentPlanItem> {
  SpecialistTreatmentPlansNotifier(super.ref, super.repository);

  Future<void> initialize() => load(_repository.fetchTreatmentPlans);
  Future<void> refresh() => initialize();
}

final specialistProgressListProvider = StateNotifierProvider<
    SpecialistProgressListNotifier,
    SpecialistListState<SpecialistPatientProgress>>(
  (ref) => SpecialistProgressListNotifier(
    ref,
    ref.watch(specialistFeaturesRepositoryProvider),
  ),
);

class SpecialistProgressListNotifier
    extends SpecialistListNotifier<SpecialistPatientProgress> {
  SpecialistProgressListNotifier(super.ref, super.repository);

  Future<void> initialize() async {
    _ensureAuthToken();
    final userId = _userId;
    if (userId == null || userId.isEmpty) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Please sign in to continue.',
      );
      return;
    }

    state = state.copyWith(isLoading: true, errorMessage: null);
    try {
      final items = await _repository.fetchProgressForSpecialist(userId);
      state = state.copyWith(isLoading: false, items: items);
    } catch (error) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Failed to load progress: $error',
      );
    }
  }

  Future<void> refresh() => initialize();
}

final specialistExercisesProvider = StateNotifierProvider<
    SpecialistExercisesNotifier,
    SpecialistListState<SpecialistExerciseItem>>(
  (ref) => SpecialistExercisesNotifier(
    ref,
    ref.watch(specialistFeaturesRepositoryProvider),
  ),
);

class SpecialistExercisesNotifier extends SpecialistListNotifier<SpecialistExerciseItem> {
  SpecialistExercisesNotifier(super.ref, super.repository);

  Future<void> initialize() async {
    _ensureAuthToken();
    state = state.copyWith(isLoading: true, errorMessage: null);
    try {
      final items = await _repository.fetchExercises();
      state = state.copyWith(isLoading: false, items: items);
    } catch (error) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Failed to load exercises: $error',
      );
    }
  }

  Future<void> refresh() => initialize();
}

class SpecialistNotificationsState {
  const SpecialistNotificationsState({
    this.isLoading = false,
    this.isUpdating = false,
    this.errorMessage,
    this.items = const [],
    this.unreadCount = 0,
  });

  final bool isLoading;
  final bool isUpdating;
  final String? errorMessage;
  final List<SpecialistNotificationItem> items;
  final int unreadCount;

  SpecialistNotificationsState copyWith({
    bool? isLoading,
    bool? isUpdating,
    Object? errorMessage = _sentinel,
    List<SpecialistNotificationItem>? items,
    int? unreadCount,
  }) {
    return SpecialistNotificationsState(
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

final specialistNotificationsProvider = StateNotifierProvider<
    SpecialistNotificationsNotifier,
    SpecialistNotificationsState>(
  (ref) => SpecialistNotificationsNotifier(
    ref,
    ref.watch(specialistFeaturesRepositoryProvider),
  ),
);

class SpecialistNotificationsNotifier extends StateNotifier<SpecialistNotificationsState> {
  SpecialistNotificationsNotifier(this._ref, this._repository)
      : super(const SpecialistNotificationsState());

  final Ref _ref;
  final SpecialistFeaturesRepository _repository;

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
        _repository.fetchUnreadCount(userId),
      ]);
      state = state.copyWith(
        isLoading: false,
        items: results[0] as List<SpecialistNotificationItem>,
        unreadCount: results[1] as int,
      );
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
              ? SpecialistNotificationItem(
                  id: item.id,
                  title: item.title,
                  body: item.body,
                  type: item.type,
                  createdAt: item.createdAt,
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
          (item) => SpecialistNotificationItem(
            id: item.id,
            title: item.title,
            body: item.body,
            type: item.type,
            createdAt: item.createdAt,
            isRead: true,
          ),
        )
        .toList();
    state = state.copyWith(
      isUpdating: false,
      items: updated,
      unreadCount: 0,
    );
  }
}

const _sentinel = Object();
