import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/services/api_client.dart';
import '../../auth/data/auth_repository.dart';
import '../../auth/providers/auth_provider.dart';
import '../data/parent_links_repository.dart';
import '../models/parent_links_models.dart';

final parentLinksRepositoryProvider = Provider<ParentLinksRepository>((ref) {
  return ParentLinksRepository(ref.watch(dioProvider));
});

final parentLinksProvider =
    StateNotifierProvider<ParentLinksNotifier, ParentLinksState>((ref) {
  final repository = ref.watch(parentLinksRepositoryProvider);
  final authRepository = ref.watch(authRepositoryProvider);
  return ParentLinksNotifier(ref, repository, authRepository);
});

class ParentLinksState {
  const ParentLinksState({
    this.isLoading = false,
    this.isSubmitting = false,
    this.isLoadingGuardians = false,
    this.errorMessage,
    this.successMessage,
    this.patients = const [],
    this.parents = const [],
    this.guardians = const [],
    this.selectedPatientId,
    this.selectedParentUserId,
    this.selectedRelationship = 'mother',
    this.isPrimaryContact = true,
  });

  final bool isLoading;
  final bool isSubmitting;
  final bool isLoadingGuardians;
  final String? errorMessage;
  final String? successMessage;
  final List<PatientOption> patients;
  final List<ParentUserOption> parents;
  final List<PatientGuardianLink> guardians;
  final String? selectedPatientId;
  final String? selectedParentUserId;
  final String selectedRelationship;
  final bool isPrimaryContact;

  ParentLinksState copyWith({
    bool? isLoading,
    bool? isSubmitting,
    bool? isLoadingGuardians,
    Object? errorMessage = _sentinel,
    Object? successMessage = _sentinel,
    List<PatientOption>? patients,
    List<ParentUserOption>? parents,
    List<PatientGuardianLink>? guardians,
    Object? selectedPatientId = _sentinel,
    Object? selectedParentUserId = _sentinel,
    String? selectedRelationship,
    bool? isPrimaryContact,
  }) {
    return ParentLinksState(
      isLoading: isLoading ?? this.isLoading,
      isSubmitting: isSubmitting ?? this.isSubmitting,
      isLoadingGuardians: isLoadingGuardians ?? this.isLoadingGuardians,
      errorMessage: identical(errorMessage, _sentinel)
          ? this.errorMessage
          : errorMessage as String?,
      successMessage: identical(successMessage, _sentinel)
          ? this.successMessage
          : successMessage as String?,
      patients: patients ?? this.patients,
      parents: parents ?? this.parents,
      guardians: guardians ?? this.guardians,
      selectedPatientId: identical(selectedPatientId, _sentinel)
          ? this.selectedPatientId
          : selectedPatientId as String?,
      selectedParentUserId: identical(selectedParentUserId, _sentinel)
          ? this.selectedParentUserId
          : selectedParentUserId as String?,
      selectedRelationship: selectedRelationship ?? this.selectedRelationship,
      isPrimaryContact: isPrimaryContact ?? this.isPrimaryContact,
    );
  }
}

class ParentLinksNotifier extends StateNotifier<ParentLinksState> {
  ParentLinksNotifier(this._ref, this._repository, this._authRepository)
      : super(const ParentLinksState());

  final Ref _ref;
  final ParentLinksRepository _repository;
  final AuthRepository _authRepository;

  Future<void> initialize() async {
    final auth = _ref.read(authProvider);
    if (auth.token != null && auth.token!.isNotEmpty) {
      _authRepository.setAuthToken(auth.token);
    }

    state = state.copyWith(isLoading: true, errorMessage: null, successMessage: null);

    try {
      final isAdmin = auth.user?.role?.toLowerCase() == 'admin';
      final results = await Future.wait([
        _repository.fetchPatients(),
        _repository.fetchParentUsers(tryUsersEndpoint: isAdmin),
      ]);

      final patients = results[0] as List<PatientOption>;
      final parents = results[1] as List<ParentUserOption>;
      final selectedPatientId = patients.isNotEmpty ? patients.first.id : null;

      state = state.copyWith(
        isLoading: false,
        patients: patients,
        parents: parents,
        selectedPatientId: selectedPatientId,
        selectedParentUserId: parents.isNotEmpty ? parents.first.userId : null,
        errorMessage: parents.isEmpty
            ? 'No parent accounts found. Make sure parent users exist with role "parent".'
            : null,
      );

      if (selectedPatientId != null) {
        await loadGuardians(selectedPatientId);
      }
    } catch (error) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Failed to load parent link data: $error',
      );
    }
  }

  Future<void> refresh() => initialize();

  void selectPatient(String? patientId) {
    state = state.copyWith(
      selectedPatientId: patientId,
      guardians: const [],
      successMessage: null,
      errorMessage: null,
    );
    if (patientId != null && patientId.isNotEmpty) {
      loadGuardians(patientId);
    }
  }

  void selectParent(String? parentUserId) {
    state = state.copyWith(selectedParentUserId: parentUserId);
  }

  void selectRelationship(String? relationship) {
    if (relationship == null || relationship.isEmpty) {
      return;
    }
    state = state.copyWith(selectedRelationship: relationship);
  }

  void setPrimaryContact(bool value) {
    state = state.copyWith(isPrimaryContact: value);
  }

  Future<void> loadGuardians(String patientId) async {
    state = state.copyWith(isLoadingGuardians: true);
    final guardians = await _repository.fetchGuardians(patientId);
    state = state.copyWith(
      isLoadingGuardians: false,
      guardians: guardians,
    );
  }

  Future<void> submitLink() async {
    final patientId = state.selectedPatientId;
    final parentUserId = state.selectedParentUserId;

    if (patientId == null || patientId.isEmpty) {
      state = state.copyWith(errorMessage: 'Please select a patient.');
      return;
    }
    if (parentUserId == null || parentUserId.isEmpty) {
      state = state.copyWith(errorMessage: 'Please select a parent.');
      return;
    }

    state = state.copyWith(
      isSubmitting: true,
      errorMessage: null,
      successMessage: null,
    );

    final error = await _repository.linkGuardian(
      patientId: patientId,
      parentUserId: parentUserId,
      relationship: state.selectedRelationship,
      isPrimaryContact: state.isPrimaryContact,
    );

    if (error != null) {
      state = state.copyWith(isSubmitting: false, errorMessage: error);
      return;
    }

    state = state.copyWith(
      isSubmitting: false,
      successMessage: 'Parent linked to child successfully.',
    );
    await loadGuardians(patientId);
  }
}

const _sentinel = Object();
