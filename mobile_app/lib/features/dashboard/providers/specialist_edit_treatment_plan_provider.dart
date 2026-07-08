import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/services/api_client.dart';
import '../../auth/providers/auth_provider.dart';
import '../data/specialist_edit_treatment_plan_repository.dart';
import '../models/specialist_edit_treatment_plan_models.dart';
import 'specialist_patient_details_provider.dart';

final specialistEditTreatmentPlanRepositoryProvider =
    Provider<SpecialistEditTreatmentPlanRepository>((ref) {
  return SpecialistEditTreatmentPlanRepository(ref.watch(dioProvider));
});

class SpecialistEditTreatmentPlanState {
  const SpecialistEditTreatmentPlanState({
    this.isLoading = false,
    this.isSaving = false,
    this.errorMessage,
    this.validationMessage,
    this.bundle,
    this.title = '',
    this.status = TreatmentPlanStatus.active,
    this.startDate,
    this.endDate,
  });

  final bool isLoading;
  final bool isSaving;
  final String? errorMessage;
  final String? validationMessage;
  final EditTreatmentPlanBundle? bundle;
  final String title;
  final TreatmentPlanStatus status;
  final DateTime? startDate;
  final DateTime? endDate;

  SpecialistEditTreatmentPlanState copyWith({
    bool? isLoading,
    bool? isSaving,
    Object? errorMessage = _sentinel,
    Object? validationMessage = _sentinel,
    EditTreatmentPlanBundle? bundle,
    String? title,
    TreatmentPlanStatus? status,
    DateTime? startDate,
    DateTime? endDate,
    bool clearEndDate = false,
  }) {
    return SpecialistEditTreatmentPlanState(
      isLoading: isLoading ?? this.isLoading,
      isSaving: isSaving ?? this.isSaving,
      errorMessage: identical(errorMessage, _sentinel)
          ? this.errorMessage
          : errorMessage as String?,
      validationMessage: identical(validationMessage, _sentinel)
          ? this.validationMessage
          : validationMessage as String?,
      bundle: bundle ?? this.bundle,
      title: title ?? this.title,
      status: status ?? this.status,
      startDate: startDate ?? this.startDate,
      endDate: clearEndDate ? null : (endDate ?? this.endDate),
    );
  }
}

final specialistEditTreatmentPlanProvider = StateNotifierProvider.family<
    SpecialistEditTreatmentPlanNotifier,
    SpecialistEditTreatmentPlanState,
    String>((ref, planId) {
  return SpecialistEditTreatmentPlanNotifier(
    ref,
    ref.watch(specialistEditTreatmentPlanRepositoryProvider),
    planId,
  );
});

class SpecialistEditTreatmentPlanNotifier
    extends StateNotifier<SpecialistEditTreatmentPlanState> {
  SpecialistEditTreatmentPlanNotifier(this._ref, this._repository, this._planId)
      : super(const SpecialistEditTreatmentPlanState());

  final Ref _ref;
  final SpecialistEditTreatmentPlanRepository _repository;
  final String _planId;

  void _ensureAuthToken() {
    final token = _ref.read(authProvider).token;
    if (token != null && token.isNotEmpty) {
      _ref.read(authRepositoryProvider).setAuthToken(token);
    }
  }

  Future<void> initialize() async {
    _ensureAuthToken();
    state = state.copyWith(isLoading: true, errorMessage: null);

    try {
      final bundle = await _repository.fetchEditBundle(_planId);
      state = state.copyWith(
        isLoading: false,
        bundle: bundle,
        title: bundle.plan.title,
        status: bundle.plan.status,
        startDate: bundle.plan.startDate,
        endDate: bundle.plan.endDate,
      );
    } catch (error) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Failed to load treatment plan: $error',
      );
    }
  }

  void setTitle(String value) => state = state.copyWith(title: value);

  void setStatus(TreatmentPlanStatus status) =>
      state = state.copyWith(status: status);

  void setStartDate(DateTime date) =>
      state = state.copyWith(startDate: date);

  void setEndDate(DateTime? date) => state = state.copyWith(
        endDate: date,
        clearEndDate: date == null,
      );

  String? _validate() {
    if (state.title.trim().isEmpty) {
      return 'Plan title is required';
    }
    if (state.startDate == null) {
      return 'Start date is required';
    }
    final end = state.endDate;
    final start = state.startDate!;
    if (end != null && end.isBefore(start)) {
      return 'End date cannot be before start date';
    }
    return null;
  }

  Future<bool> save() async {
    final validation = _validate();
    if (validation != null) {
      state = state.copyWith(validationMessage: validation);
      return false;
    }

    _ensureAuthToken();
    state = state.copyWith(
      isSaving: true,
      errorMessage: null,
      validationMessage: null,
    );

    try {
      await _repository.updatePlan(
        _planId,
        UpdateTreatmentPlanInput(
          title: state.title.trim(),
          status: state.status,
          startDate: state.startDate!,
          endDate: state.endDate,
        ),
      );

      final patientId = state.bundle?.patientId;
      if (patientId != null && patientId.isNotEmpty) {
        await _ref
            .read(specialistPatientDetailsProvider(patientId).notifier)
            .refresh();
      }

      state = state.copyWith(isSaving: false);
      return true;
    } catch (error) {
      state = state.copyWith(
        isSaving: false,
        errorMessage: 'Failed to save treatment plan: $error',
      );
      return false;
    }
  }
}

const _sentinel = Object();
