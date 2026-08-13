import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../auth/data/auth_repository.dart';
import '../../auth/providers/auth_provider.dart';
import '../../dashboard/data/parent_dashboard_repository.dart';
import '../../dashboard/models/admin_assignments_models.dart';
import '../../dashboard/models/parent_dashboard_models.dart';
import '../../dashboard/providers/parent_dashboard_provider.dart';
import '../data/complaints_repository.dart';
import '../models/complaint_models.dart';

class ParentComplaintsState {
  const ParentComplaintsState({
    this.complaints = const [],
    this.isLoading = false,
    this.errorMessage,
    this.isSubmitting = false,
    this.submitErrorMessage,
  });

  final List<ComplaintItem> complaints;
  final bool isLoading;
  final String? errorMessage;
  final bool isSubmitting;
  final String? submitErrorMessage;

  ParentComplaintsState copyWith({
    List<ComplaintItem>? complaints,
    bool? isLoading,
    Object? errorMessage = _sentinel,
    bool? isSubmitting,
    Object? submitErrorMessage = _sentinel,
  }) {
    return ParentComplaintsState(
      complaints: complaints ?? this.complaints,
      isLoading: isLoading ?? this.isLoading,
      errorMessage: identical(errorMessage, _sentinel)
          ? this.errorMessage
          : errorMessage as String?,
      isSubmitting: isSubmitting ?? this.isSubmitting,
      submitErrorMessage: identical(submitErrorMessage, _sentinel)
          ? this.submitErrorMessage
          : submitErrorMessage as String?,
    );
  }
}

const _sentinel = Object();

final parentComplaintsProvider =
    StateNotifierProvider<ParentComplaintsNotifier, ParentComplaintsState>(
      (ref) => ParentComplaintsNotifier(
        ref,
        ref.watch(complaintsRepositoryProvider),
        ref.watch(parentDashboardRepositoryProvider),
        ref.watch(authRepositoryProvider),
      ),
    );

class ParentComplaintsNotifier extends StateNotifier<ParentComplaintsState> {
  ParentComplaintsNotifier(
    this._ref,
    this._repository,
    this._dashboardRepository,
    this._authRepository,
  ) : super(const ParentComplaintsState());

  final Ref _ref;
  final ComplaintsRepository _repository;
  final ParentDashboardRepository _dashboardRepository;
  final AuthRepository _authRepository;

  void _ensureAuth() {
    final token = _ref.read(authProvider).token;
    if (token != null && token.isNotEmpty) {
      _authRepository.setAuthToken(token);
    }
  }

  Future<void> loadComplaints() async {
    _ensureAuth();
    state = state.copyWith(isLoading: true, errorMessage: null);
    try {
      final complaints = await _repository.fetchMyComplaints();
      state = state.copyWith(isLoading: false, complaints: complaints);
    } catch (error) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: error.toString(),
      );
    }
  }

  Future<List<ParentChild>> loadChildren() async {
    _ensureAuth();
    final userId = _ref.read(authProvider).user?.id;
    if (userId == null || userId.isEmpty) {
      return const [];
    }
    return _dashboardRepository.fetchChildren(userId);
  }

  Future<List<PatientSpecialistLink>> loadSpecialists(String patientId) {
    _ensureAuth();
    return _repository.fetchSpecialistsForPatient(patientId);
  }

  Future<ComplaintItem?> submitComplaint(CreateComplaintPayload payload) async {
    if (state.isSubmitting) {
      return null;
    }

    _ensureAuth();
    state = state.copyWith(isSubmitting: true, submitErrorMessage: null);
    try {
      final complaint = await _repository.createComplaint(payload);
      state = state.copyWith(
        isSubmitting: false,
        complaints: [complaint, ...state.complaints],
      );
      return complaint;
    } on DioException catch (error) {
      final message = _mapSubmitError(error);
      state = state.copyWith(isSubmitting: false, submitErrorMessage: message);
      return null;
    } catch (error) {
      state = state.copyWith(
        isSubmitting: false,
        submitErrorMessage: 'submit_failed',
      );
      return null;
    }
  }

  String _mapSubmitError(DioException error) {
    final data = error.response?.data;
    if (data is Map && data['message'] is String) {
      return data['message'] as String;
    }
    if (error.response?.statusCode == 409) {
      return 'duplicate_active_complaint';
    }
    return 'submit_failed';
  }
}
