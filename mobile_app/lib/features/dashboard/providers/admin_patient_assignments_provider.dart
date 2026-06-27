import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/services/api_client.dart';
import '../../auth/data/auth_repository.dart';
import '../../auth/providers/auth_provider.dart';
import '../data/admin_patient_assignments_repository.dart';
import '../models/admin_assignments_models.dart';
import '../models/parent_links_models.dart';

final adminPatientAssignmentsRepositoryProvider =
    Provider<AdminPatientAssignmentsRepository>((ref) {
  return AdminPatientAssignmentsRepository(ref.watch(dioProvider));
});

final adminPatientAssignmentsProvider = StateNotifierProvider<
    AdminPatientAssignmentsNotifier,
    AdminPatientAssignmentsState>((ref) {
  final repository = ref.watch(adminPatientAssignmentsRepositoryProvider);
  final authRepository = ref.watch(authRepositoryProvider);
  return AdminPatientAssignmentsNotifier(ref, repository, authRepository);
});

class AdminPatientAssignmentsState {
  AdminPatientAssignmentsState({
    this.isLoading = false,
    this.isSubmittingSpecialist = false,
    this.isSubmittingParent = false,
    this.isLoadingRelationships = false,
    this.errorMessage,
    this.successMessage,
    this.patients = const [],
    this.specialists = const [],
    this.parents = const [],
    this.assignedSpecialists = const [],
    this.linkedParents = const [],
    this.selectedPatientId,
    this.selectedSpecialistUserId,
    this.selectedParentUserId,
    this.selectedRelationship = 'mother',
    this.isPrimarySpecialist = true,
    this.isPrimaryContact = true,
  });

  final bool isLoading;
  final bool isSubmittingSpecialist;
  final bool isSubmittingParent;
  final bool isLoadingRelationships;
  final String? errorMessage;
  final String? successMessage;
  final List<PatientOption> patients;
  final List<SpecialistUserOption> specialists;
  final List<ParentUserOption> parents;
  final List<PatientSpecialistLink> assignedSpecialists;
  final List<PatientGuardianLink> linkedParents;
  final String? selectedPatientId;
  final String? selectedSpecialistUserId;
  final String? selectedParentUserId;
  final String selectedRelationship;
  final bool isPrimarySpecialist;
  final bool isPrimaryContact;

  AdminPatientAssignmentsState copyWith({
    bool? isLoading,
    bool? isSubmittingSpecialist,
    bool? isSubmittingParent,
    bool? isLoadingRelationships,
    Object? errorMessage = _sentinel,
    Object? successMessage = _sentinel,
    List<PatientOption>? patients,
    List<SpecialistUserOption>? specialists,
    List<ParentUserOption>? parents,
    List<PatientSpecialistLink>? assignedSpecialists,
    List<PatientGuardianLink>? linkedParents,
    Object? selectedPatientId = _sentinel,
    Object? selectedSpecialistUserId = _sentinel,
    Object? selectedParentUserId = _sentinel,
    String? selectedRelationship,
    bool? isPrimarySpecialist,
    bool? isPrimaryContact,
  }) {
    return AdminPatientAssignmentsState(
      isLoading: isLoading ?? this.isLoading,
      isSubmittingSpecialist: isSubmittingSpecialist ?? this.isSubmittingSpecialist,
      isSubmittingParent: isSubmittingParent ?? this.isSubmittingParent,
      isLoadingRelationships: isLoadingRelationships ?? this.isLoadingRelationships,
      errorMessage: identical(errorMessage, _sentinel)
          ? this.errorMessage
          : errorMessage as String?,
      successMessage: identical(successMessage, _sentinel)
          ? this.successMessage
          : successMessage as String?,
      patients: patients ?? this.patients,
      specialists: specialists ?? this.specialists,
      parents: parents ?? this.parents,
      assignedSpecialists: assignedSpecialists ?? this.assignedSpecialists,
      linkedParents: linkedParents ?? this.linkedParents,
      selectedPatientId: identical(selectedPatientId, _sentinel)
          ? this.selectedPatientId
          : selectedPatientId as String?,
      selectedSpecialistUserId: identical(selectedSpecialistUserId, _sentinel)
          ? this.selectedSpecialistUserId
          : selectedSpecialistUserId as String?,
      selectedParentUserId: identical(selectedParentUserId, _sentinel)
          ? this.selectedParentUserId
          : selectedParentUserId as String?,
      selectedRelationship: selectedRelationship ?? this.selectedRelationship,
      isPrimarySpecialist: isPrimarySpecialist ?? this.isPrimarySpecialist,
      isPrimaryContact: isPrimaryContact ?? this.isPrimaryContact,
    );
  }
}

class AdminPatientAssignmentsNotifier extends StateNotifier<AdminPatientAssignmentsState> {
  AdminPatientAssignmentsNotifier(this._ref, this._repository, this._authRepository)
      : super(AdminPatientAssignmentsState());

  final Ref _ref;
  final AdminPatientAssignmentsRepository _repository;
  final AuthRepository _authRepository;

  void _ensureAuthToken() {
    final token = _ref.read(authProvider).token;
    if (token != null && token.isNotEmpty) {
      _authRepository.setAuthToken(token);
    }
  }

  Future<void> initialize() async {
    _ensureAuthToken();
    state = state.copyWith(isLoading: true, errorMessage: null, successMessage: null);

    try {
      final results = await Future.wait([
        _repository.fetchPatients(),
        _repository.fetchSpecialists(),
        _repository.fetchParents(),
      ]);

      final patients = results[0] as List<PatientOption>;
      final specialists = results[1] as List<SpecialistUserOption>;
      final parents = results[2] as List<ParentUserOption>;
      final selectedPatientId = patients.isNotEmpty ? patients.first.id : null;

      state = state.copyWith(
        isLoading: false,
        patients: patients,
        specialists: specialists,
        parents: parents,
        selectedPatientId: selectedPatientId,
        selectedSpecialistUserId:
            specialists.isNotEmpty ? specialists.first.userId : null,
        selectedParentUserId: parents.isNotEmpty ? parents.first.userId : null,
      );

      if (selectedPatientId != null) {
        await loadRelationships(selectedPatientId);
      }
    } catch (error) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Failed to load assignment data: $error',
      );
    }
  }

  Future<void> refresh() => initialize();

  void selectPatient(String? patientId) {
    state = state.copyWith(
      selectedPatientId: patientId,
      assignedSpecialists: const [],
      linkedParents: const [],
      successMessage: null,
      errorMessage: null,
    );
    if (patientId != null && patientId.isNotEmpty) {
      loadRelationships(patientId);
    }
  }

  void selectSpecialist(String? userId) {
    state = state.copyWith(selectedSpecialistUserId: userId);
  }

  void selectParent(String? userId) {
    state = state.copyWith(selectedParentUserId: userId);
  }

  void selectRelationship(String? relationship) {
    if (relationship == null || relationship.isEmpty) {
      return;
    }
    state = state.copyWith(selectedRelationship: relationship);
  }

  void setPrimarySpecialist(bool value) {
    state = state.copyWith(isPrimarySpecialist: value);
  }

  void setPrimaryContact(bool value) {
    state = state.copyWith(isPrimaryContact: value);
  }

  Future<void> loadRelationships(String patientId) async {
    state = state.copyWith(isLoadingRelationships: true);
    final results = await Future.wait([
      _repository.fetchPatientSpecialists(patientId),
      _repository.fetchPatientGuardians(patientId),
    ]);
    state = state.copyWith(
      isLoadingRelationships: false,
      assignedSpecialists: results[0] as List<PatientSpecialistLink>,
      linkedParents: results[1] as List<PatientGuardianLink>,
    );
  }

  Future<void> assignSpecialist() async {
    final patientId = state.selectedPatientId;
    final specialistId = state.selectedSpecialistUserId;

    if (patientId == null || patientId.isEmpty) {
      state = state.copyWith(errorMessage: 'Please select a patient.');
      return;
    }
    if (specialistId == null || specialistId.isEmpty) {
      state = state.copyWith(errorMessage: 'Please select a specialist.');
      return;
    }

    state = state.copyWith(
      isSubmittingSpecialist: true,
      errorMessage: null,
      successMessage: null,
    );

    final error = await _repository.assignSpecialist(
      patientId: patientId,
      specialistUserId: specialistId,
      isPrimary: state.isPrimarySpecialist,
    );

    if (error != null) {
      state = state.copyWith(isSubmittingSpecialist: false, errorMessage: error);
      return;
    }

    state = state.copyWith(
      isSubmittingSpecialist: false,
      successMessage: 'Specialist assigned to patient successfully.',
    );
    await loadRelationships(patientId);
  }

  Future<void> linkParent() async {
    final patientId = state.selectedPatientId;
    final parentId = state.selectedParentUserId;

    if (patientId == null || patientId.isEmpty) {
      state = state.copyWith(errorMessage: 'Please select a patient.');
      return;
    }
    if (parentId == null || parentId.isEmpty) {
      state = state.copyWith(errorMessage: 'Please select a parent.');
      return;
    }

    state = state.copyWith(
      isSubmittingParent: true,
      errorMessage: null,
      successMessage: null,
    );

    final error = await _repository.linkParent(
      patientId: patientId,
      parentUserId: parentId,
      relationship: state.selectedRelationship,
      isPrimaryContact: state.isPrimaryContact,
    );

    if (error != null) {
      state = state.copyWith(isSubmittingParent: false, errorMessage: error);
      return;
    }

    state = state.copyWith(
      isSubmittingParent: false,
      successMessage: 'Parent linked to patient successfully.',
    );
    await loadRelationships(patientId);
  }
}

const _sentinel = Object();
