import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../auth/providers/auth_provider.dart';
import '../data/specialist_edit_treatment_plan_repository.dart';
import '../models/specialist_edit_treatment_plan_models.dart';
import 'specialist_edit_treatment_plan_provider.dart';
import 'specialist_features_provider.dart';
import 'specialist_patient_details_provider.dart';

class SpecialistCreateTreatmentPlanState {
  const SpecialistCreateTreatmentPlanState({
    this.isSaving = false,
    this.errorMessage,
    this.validationMessage,
    this.patientId = '',
    this.patientName = '',
    this.title = '',
    this.startDate,
    this.endDate,
  });

  final bool isSaving;
  final String? errorMessage;
  final String? validationMessage;
  final String patientId;
  final String patientName;
  final String title;
  final DateTime? startDate;
  final DateTime? endDate;

  SpecialistCreateTreatmentPlanState copyWith({
    bool? isSaving,
    Object? errorMessage = _sentinel,
    Object? validationMessage = _sentinel,
    String? patientId,
    String? patientName,
    String? title,
    DateTime? startDate,
    Object? endDate = _sentinel,
  }) {
    return SpecialistCreateTreatmentPlanState(
      isSaving: isSaving ?? this.isSaving,
      errorMessage: identical(errorMessage, _sentinel)
          ? this.errorMessage
          : errorMessage as String?,
      validationMessage: identical(validationMessage, _sentinel)
          ? this.validationMessage
          : validationMessage as String?,
      patientId: patientId ?? this.patientId,
      patientName: patientName ?? this.patientName,
      title: title ?? this.title,
      startDate: startDate ?? this.startDate,
      endDate: identical(endDate, _sentinel) ? this.endDate : endDate as DateTime?,
    );
  }
}

final specialistCreateTreatmentPlanProvider = StateNotifierProvider.autoDispose<
    SpecialistCreateTreatmentPlanNotifier,
    SpecialistCreateTreatmentPlanState>((ref) {
  return SpecialistCreateTreatmentPlanNotifier(
    ref,
    ref.watch(specialistEditTreatmentPlanRepositoryProvider),
  );
});

class SpecialistCreateTreatmentPlanNotifier
    extends StateNotifier<SpecialistCreateTreatmentPlanState> {
  SpecialistCreateTreatmentPlanNotifier(this._ref, this._repository)
      : super(SpecialistCreateTreatmentPlanState(startDate: DateTime.now()));

  final Ref _ref;
  final SpecialistEditTreatmentPlanRepository _repository;

  void configure({
    required String patientId,
    required String patientName,
  }) {
    state = state.copyWith(
      patientId: patientId.trim(),
      patientName: patientName.trim().isEmpty ? 'Patient' : patientName.trim(),
      startDate: state.startDate ?? DateTime.now(),
      errorMessage: null,
      validationMessage: null,
    );
  }

  void setTitle(String value) =>
      state = state.copyWith(title: value, validationMessage: null);

  void setStartDate(DateTime date) =>
      state = state.copyWith(startDate: date, validationMessage: null);

  void setEndDate(DateTime? date) =>
      state = state.copyWith(endDate: date, validationMessage: null);

  String? _validate() {
    if (state.patientId.trim().isEmpty) {
      return 'Patient is required';
    }
    if (state.title.trim().isEmpty) {
      return 'Plan title is required';
    }
    if (state.startDate == null) {
      return 'Start date is required';
    }
    final end = state.endDate;
    if (end != null && end.isBefore(state.startDate!)) {
      return 'End date cannot be before start date';
    }
    return null;
  }

  Future<String?> create() async {
    final validation = _validate();
    if (validation != null) {
      state = state.copyWith(validationMessage: validation);
      return validation;
    }
    if (state.isSaving) {
      return 'Please wait…';
    }

    final token = _ref.read(authProvider).token;
    if (token != null && token.isNotEmpty) {
      _ref.read(authRepositoryProvider).setAuthToken(token);
    }

    state = state.copyWith(
      isSaving: true,
      errorMessage: null,
      validationMessage: null,
    );

    try {
      await _repository.createPlan(
        CreateTreatmentPlanInput(
          patientId: state.patientId.trim(),
          title: state.title.trim(),
          startDate: state.startDate!,
          endDate: state.endDate,
        ),
      );

      final patientId = state.patientId.trim();
      await Future.wait([
        _ref.read(specialistTreatmentPlansProvider.notifier).refresh(),
        if (patientId.isNotEmpty)
          _ref
              .read(specialistPatientDetailsProvider(patientId).notifier)
              .refresh(),
      ]);

      state = state.copyWith(isSaving: false);
      return null;
    } catch (error, stackTrace) {
      debugPrint('createTreatmentPlan failed: $error');
      debugPrintStack(stackTrace: stackTrace);
      final raw = error.toString().replaceFirst(RegExp(r'^Exception:\s*'), '');
      final message = raw.isEmpty ||
              raw.contains('DioException') ||
              raw.contains('validateStatus')
          ? 'Failed to create treatment plan. Please try again.'
          : raw;
      state = state.copyWith(isSaving: false, errorMessage: message);
      return message;
    }
  }
}

const _sentinel = Object();
