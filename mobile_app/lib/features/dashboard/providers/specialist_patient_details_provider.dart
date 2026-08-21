import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/services/api_client.dart';
import '../../auth/providers/auth_provider.dart';
import '../data/specialist_patient_details_repository.dart';
import '../models/family_pattern_insight_models.dart';
import '../models/specialist_patient_details_models.dart';

final specialistPatientDetailsRepositoryProvider =
    Provider<SpecialistPatientDetailsRepository>((ref) {
      return SpecialistPatientDetailsRepository(ref.watch(dioProvider));
    });

class SpecialistPatientDetailsState {
  const SpecialistPatientDetailsState({
    this.isLoading = false,
    this.isSavingNote = false,
    this.isSavingDiagnosis = false,
    this.errorMessage,
    this.data,
    this.familyPatternLoading = false,
    this.familyPatternLoadFailed = false,
    this.familyPatternInsight,
  });

  final bool isLoading;
  final bool isSavingNote;
  final bool isSavingDiagnosis;
  final String? errorMessage;
  final SpecialistPatientDetailsBundle? data;
  final bool familyPatternLoading;
  final bool familyPatternLoadFailed;
  final FamilyPatternInsight? familyPatternInsight;

  SpecialistPatientDetailsState copyWith({
    bool? isLoading,
    bool? isSavingNote,
    bool? isSavingDiagnosis,
    Object? errorMessage = _sentinel,
    SpecialistPatientDetailsBundle? data,
    bool? familyPatternLoading,
    bool? familyPatternLoadFailed,
    Object? familyPatternInsight = _sentinel,
  }) {
    return SpecialistPatientDetailsState(
      isLoading: isLoading ?? this.isLoading,
      isSavingNote: isSavingNote ?? this.isSavingNote,
      isSavingDiagnosis: isSavingDiagnosis ?? this.isSavingDiagnosis,
      errorMessage: identical(errorMessage, _sentinel)
          ? this.errorMessage
          : errorMessage as String?,
      data: data ?? this.data,
      familyPatternLoading: familyPatternLoading ?? this.familyPatternLoading,
      familyPatternLoadFailed:
          familyPatternLoadFailed ?? this.familyPatternLoadFailed,
      familyPatternInsight: identical(familyPatternInsight, _sentinel)
          ? this.familyPatternInsight
          : familyPatternInsight as FamilyPatternInsight?,
    );
  }
}

final specialistPatientDetailsProvider =
    StateNotifierProvider.family<
      SpecialistPatientDetailsNotifier,
      SpecialistPatientDetailsState,
      String
    >((ref, patientId) {
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
    state = state.copyWith(
      isLoading: true,
      errorMessage: null,
      familyPatternLoading: true,
      familyPatternLoadFailed: false,
      familyPatternInsight: null,
    );

    try {
      final data = await _repository.fetchPatientDetails(_patientId);
      state = state.copyWith(isLoading: false, data: data);
      await _loadFamilyPatternInsight();
    } catch (error) {
      state = state.copyWith(
        isLoading: false,
        familyPatternLoading: false,
        errorMessage: 'Failed to load patient details: $error',
      );
    }
  }

  Future<void> refresh() async {
    await initialize();
  }

  Future<void> retryFamilyPatternInsight() => _loadFamilyPatternInsight();

  Future<void> _loadFamilyPatternInsight() async {
    state = state.copyWith(
      familyPatternLoading: true,
      familyPatternLoadFailed: false,
    );

    try {
      final insight = await _repository.fetchFamilyPatternInsight(_patientId);
      state = state.copyWith(
        familyPatternLoading: false,
        familyPatternInsight: insight,
        familyPatternLoadFailed: false,
      );
    } catch (_) {
      state = state.copyWith(
        familyPatternLoading: false,
        familyPatternLoadFailed: true,
        familyPatternInsight: null,
      );
    }
  }

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

  Future<String?> addDiagnosis({
    required String diagnosisTitle,
    String? description,
    required DateTime diagnosedAt,
  }) async {
    final trimmedTitle = diagnosisTitle.trim();
    if (trimmedTitle.isEmpty) {
      return 'Diagnosis title is required';
    }

    _ensureAuthToken();
    state = state.copyWith(isSavingDiagnosis: true, errorMessage: null);

    try {
      await _repository.addDiagnosis(
        patientId: _patientId,
        diagnosisTitle: trimmedTitle,
        description: description,
        diagnosedAt: diagnosedAt,
      );
      state = state.copyWith(isSavingDiagnosis: false);
      await initialize();
      return null;
    } catch (error) {
      state = state.copyWith(
        isSavingDiagnosis: false,
        errorMessage: 'Failed to save diagnosis: $error',
      );
      return 'Failed to save diagnosis';
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
      await _loadFamilyPatternInsight();
      return null;
    } catch (error) {
      return 'Failed to update patient';
    }
  }
}

const _sentinel = Object();
