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
    this.isRefreshing = false,
    this.patientSearchQuery = '',
    this.errorMessage,
    this.successMessage,
    this.patients = const [],
    this.parents = const [],
    this.guardiansByPatientId = const {},
    this.loadingGuardianPatientIds = const {},
    this.linkingPatientId,
    this.unlinkingPatientId,
  });

  final bool isLoading;
  final bool isRefreshing;
  final String patientSearchQuery;
  final String? errorMessage;
  final String? successMessage;
  final List<PatientOption> patients;
  final List<ParentUserOption> parents;
  final Map<String, List<PatientGuardianLink>> guardiansByPatientId;
  final Set<String> loadingGuardianPatientIds;
  final String? linkingPatientId;
  final String? unlinkingPatientId;

  List<PatientOption> get filteredPatients {
    final query = patientSearchQuery.trim().toLowerCase();
    if (query.isEmpty) {
      return patients;
    }
    return patients
        .where((patient) => patient.name.toLowerCase().contains(query))
        .toList();
  }

  List<PatientGuardianLink> guardiansFor(String patientId) {
    return guardiansByPatientId[patientId] ?? const [];
  }

  PatientGuardianLink? primaryGuardianFor(String patientId) {
    final guardians = guardiansFor(patientId);
    if (guardians.isEmpty) {
      return null;
    }
    return guardians.firstWhere(
      (guardian) => guardian.isPrimaryContact,
      orElse: () => guardians.first,
    );
  }

  bool isLoadingGuardiansFor(String patientId) {
    return loadingGuardianPatientIds.contains(patientId);
  }

  ParentLinksState copyWith({
    bool? isLoading,
    bool? isRefreshing,
    String? patientSearchQuery,
    Object? errorMessage = _sentinel,
    Object? successMessage = _sentinel,
    List<PatientOption>? patients,
    List<ParentUserOption>? parents,
    Map<String, List<PatientGuardianLink>>? guardiansByPatientId,
    Set<String>? loadingGuardianPatientIds,
    Object? linkingPatientId = _sentinel,
    Object? unlinkingPatientId = _sentinel,
  }) {
    return ParentLinksState(
      isLoading: isLoading ?? this.isLoading,
      isRefreshing: isRefreshing ?? this.isRefreshing,
      patientSearchQuery: patientSearchQuery ?? this.patientSearchQuery,
      errorMessage: identical(errorMessage, _sentinel)
          ? this.errorMessage
          : errorMessage as String?,
      successMessage: identical(successMessage, _sentinel)
          ? this.successMessage
          : successMessage as String?,
      patients: patients ?? this.patients,
      parents: parents ?? this.parents,
      guardiansByPatientId: guardiansByPatientId ?? this.guardiansByPatientId,
      loadingGuardianPatientIds:
          loadingGuardianPatientIds ?? this.loadingGuardianPatientIds,
      linkingPatientId: identical(linkingPatientId, _sentinel)
          ? this.linkingPatientId
          : linkingPatientId as String?,
      unlinkingPatientId: identical(unlinkingPatientId, _sentinel)
          ? this.unlinkingPatientId
          : unlinkingPatientId as String?,
    );
  }
}

class ParentLinksNotifier extends StateNotifier<ParentLinksState> {
  ParentLinksNotifier(this._ref, this._repository, this._authRepository)
    : super(const ParentLinksState());

  final Ref _ref;
  final ParentLinksRepository _repository;
  final AuthRepository _authRepository;

  String? get _specialistUserId => _ref.read(authProvider).user?.id;

  Future<void> initialize() async {
    final auth = _ref.read(authProvider);
    if (auth.token != null && auth.token!.isNotEmpty) {
      _authRepository.setAuthToken(auth.token);
    }

    final specialistUserId = _specialistUserId;
    if (specialistUserId == null || specialistUserId.isEmpty) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Unable to determine your specialist account.',
      );
      return;
    }

    state = state.copyWith(
      isLoading: true,
      errorMessage: null,
      successMessage: null,
    );

    try {
      final patients = await _repository.fetchAssignedPatients(
        specialistUserId,
      );
      final parents = await _repository.fetchParentUsers();

      state = state.copyWith(
        isLoading: false,
        patients: patients,
        parents: parents,
      );

      await _loadGuardiansForPatients(patients.map((patient) => patient.id));
    } catch (error) {
      final message = error.toString().replaceFirst('Exception: ', '');
      state = state.copyWith(
        isLoading: false,
        errorMessage: message.isNotEmpty
            ? message
            : 'Failed to load assigned patients.',
      );
    }
  }

  Future<void> refresh() async {
    final specialistUserId = _specialistUserId;
    if (specialistUserId == null || specialistUserId.isEmpty) {
      return;
    }

    final previousGuardians = state.guardiansByPatientId;

    state = state.copyWith(
      isRefreshing: true,
      errorMessage: null,
      successMessage: null,
    );

    try {
      final results = await Future.wait([
        _repository.fetchAssignedPatients(specialistUserId),
        _repository.fetchParentUsers(),
      ]);

      final patients = results[0] as List<PatientOption>;
      final parents = results[1] as List<ParentUserOption>;

      state = state.copyWith(
        isRefreshing: false,
        patients: patients,
        parents: parents,
        guardiansByPatientId: previousGuardians,
      );

      await _loadGuardiansForPatients(patients.map((patient) => patient.id));
    } catch (error) {
      state = state.copyWith(
        isRefreshing: false,
        errorMessage: 'Failed to refresh assigned patients.',
        guardiansByPatientId: previousGuardians,
      );
    }
  }

  void setPatientSearchQuery(String query) {
    state = state.copyWith(patientSearchQuery: query);
  }

  void clearMessages() {
    state = state.copyWith(errorMessage: null, successMessage: null);
  }

  Future<void> _loadGuardiansForPatients(Iterable<String> patientIds) async {
    final ids = patientIds.where((id) => id.isNotEmpty).toList();
    if (ids.isEmpty) {
      return;
    }

    state = state.copyWith(
      loadingGuardianPatientIds: {...state.loadingGuardianPatientIds, ...ids},
    );

    final updated = Map<String, List<PatientGuardianLink>>.from(
      state.guardiansByPatientId,
    );
    final stillLoading = Set<String>.from(state.loadingGuardianPatientIds);

    await Future.wait(
      ids.map((patientId) async {
        try {
          final guardians = await _repository.fetchGuardians(patientId);
          updated[patientId] = guardians;
        } catch (_) {
          // Preserve existing guardian data on failure.
        } finally {
          stillLoading.remove(patientId);
        }
      }),
    );

    state = state.copyWith(
      guardiansByPatientId: updated,
      loadingGuardianPatientIds: stillLoading,
    );
  }

  Future<String?> linkParent({
    required String patientId,
    required String parentUserId,
    required String relationship,
    required bool isPrimaryContact,
  }) async {
    if (state.linkingPatientId != null || state.unlinkingPatientId != null) {
      return 'Please wait for the current action to finish.';
    }

    state = state.copyWith(
      linkingPatientId: patientId,
      errorMessage: null,
      successMessage: null,
    );

    final error = await _repository.linkGuardian(
      patientId: patientId,
      parentUserId: parentUserId,
      relationship: relationship,
      isPrimaryContact: isPrimaryContact,
    );

    if (error != null) {
      state = state.copyWith(linkingPatientId: null, errorMessage: error);
      return error;
    }

    state = state.copyWith(
      linkingPatientId: null,
      successMessage: 'Parent linked successfully.',
    );
    await _loadGuardiansForPatients([patientId]);
    return null;
  }

  Future<String?> unlinkParent({
    required String patientId,
    required String parentUserId,
  }) async {
    if (state.linkingPatientId != null || state.unlinkingPatientId != null) {
      return 'Please wait for the current action to finish.';
    }

    state = state.copyWith(
      unlinkingPatientId: patientId,
      errorMessage: null,
      successMessage: null,
    );

    final error = await _repository.unlinkGuardian(
      patientId: patientId,
      parentUserId: parentUserId,
    );

    if (error != null) {
      state = state.copyWith(unlinkingPatientId: null, errorMessage: error);
      return error;
    }

    state = state.copyWith(
      unlinkingPatientId: null,
      successMessage: 'Parent unlinked successfully.',
    );
    await _loadGuardiansForPatients([patientId]);
    return null;
  }
}

const _sentinel = Object();
