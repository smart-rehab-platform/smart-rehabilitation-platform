import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/services/api_client.dart';
import '../../auth/providers/auth_provider.dart';
import '../data/specialist_patient_details_repository.dart';
import '../models/specialist_patient_details_models.dart';

final specialistPatientDetailsRepositoryProvider =
    Provider<SpecialistPatientDetailsRepository>((ref) {
  return SpecialistPatientDetailsRepository(ref.watch(dioProvider));
});

class SpecialistPatientDetailsState {
  const SpecialistPatientDetailsState({
    this.isLoading = false,
    this.isSavingNote = false,
    this.errorMessage,
    this.data,
  });

  final bool isLoading;
  final bool isSavingNote;
  final String? errorMessage;
  final SpecialistPatientDetailsBundle? data;

  SpecialistPatientDetailsState copyWith({
    bool? isLoading,
    bool? isSavingNote,
    Object? errorMessage = _sentinel,
    SpecialistPatientDetailsBundle? data,
  }) {
    return SpecialistPatientDetailsState(
      isLoading: isLoading ?? this.isLoading,
      isSavingNote: isSavingNote ?? this.isSavingNote,
      errorMessage: identical(errorMessage, _sentinel)
          ? this.errorMessage
          : errorMessage as String?,
      data: data ?? this.data,
    );
  }
}

final specialistPatientDetailsProvider = StateNotifierProvider.family<
    SpecialistPatientDetailsNotifier,
    SpecialistPatientDetailsState,
    String>((ref, patientId) {
  return SpecialistPatientDetailsNotifier(
    ref,
    ref.watch(specialistPatientDetailsRepositoryProvider),
    patientId,
  );
});

class SpecialistPatientDetailsNotifier
    extends StateNotifier<SpecialistPatientDetailsState> {
  SpecialistPatientDetailsNotifier(this._ref, this._repository, this._patientId)
      : super(const SpecialistPatientDetailsState());

  final Ref _ref;
  final SpecialistPatientDetailsRepository _repository;
  final String _patientId;

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
      final data = await _repository.fetchPatientDetails(_patientId);
      state = state.copyWith(isLoading: false, data: data);
    } catch (error) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Failed to load patient details: $error',
      );
    }
  }

  Future<void> refresh() => initialize();

  Future<String?> addNote(String note) async {
    final trimmed = note.trim();
    if (trimmed.isEmpty) {
      return 'Note cannot be empty';
    }

    _ensureAuthToken();
    state = state.copyWith(isSavingNote: true, errorMessage: null);

    try {
      await _repository.addSpecialistNote(_patientId, trimmed);
      state = state.copyWith(isSavingNote: false);
      await initialize();
      return null;
    } catch (error) {
      state = state.copyWith(
        isSavingNote: false,
        errorMessage: 'Failed to save note: $error',
      );
      return 'Failed to save note';
    }
  }

  Future<String?> updatePatient({
    required String fullName,
    DateTime? dateOfBirth,
    String? gender,
  }) async {
    final trimmedName = fullName.trim();
    if (trimmedName.isEmpty) {
      return 'Full name is required';
    }

    _ensureAuthToken();

    try {
      await _repository.updatePatient(
        patientId: _patientId,
        fullName: trimmedName,
        dateOfBirth: dateOfBirth,
        gender: gender,
      );
      final data = await _repository.fetchPatientDetails(_patientId);
      state = state.copyWith(isLoading: false, data: data, errorMessage: null);
      return null;
    } catch (error) {
      return 'Failed to update patient';
    }
  }
}

const _sentinel = Object();
