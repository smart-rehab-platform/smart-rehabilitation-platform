import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/services/api_client.dart';
import '../../auth/providers/auth_provider.dart';
import '../data/specialist_ai_recommendations_repository.dart';
import '../models/specialist_ai_recommendations_models.dart';
import 'specialist_patient_details_provider.dart';

final specialistAiRecommendationsRepositoryProvider =
    Provider<SpecialistAiRecommendationsRepository>((ref) {
  return SpecialistAiRecommendationsRepository(ref.watch(dioProvider));
});

class SpecialistAiRecommendationsState {
  const SpecialistAiRecommendationsState({
    this.isLoading = false,
    this.isGenerating = false,
    this.generatingType,
    this.updatingRecommendationId,
    this.errorMessage,
    this.bundle,
  });

  final bool isLoading;
  final bool isGenerating;
  final AiRecommendationType? generatingType;
  final String? updatingRecommendationId;
  final String? errorMessage;
  final SpecialistAiRecommendationsBundle? bundle;

  SpecialistAiRecommendationsState copyWith({
    bool? isLoading,
    bool? isGenerating,
    Object? generatingType = _sentinel,
    Object? updatingRecommendationId = _sentinel,
    Object? errorMessage = _sentinel,
    SpecialistAiRecommendationsBundle? bundle,
  }) {
    return SpecialistAiRecommendationsState(
      isLoading: isLoading ?? this.isLoading,
      isGenerating: isGenerating ?? this.isGenerating,
      generatingType: identical(generatingType, _sentinel)
          ? this.generatingType
          : generatingType as AiRecommendationType?,
      updatingRecommendationId: identical(updatingRecommendationId, _sentinel)
          ? this.updatingRecommendationId
          : updatingRecommendationId as String?,
      errorMessage: identical(errorMessage, _sentinel)
          ? this.errorMessage
          : errorMessage as String?,
      bundle: bundle ?? this.bundle,
    );
  }
}

final specialistAiRecommendationsProvider = StateNotifierProvider.family<
    SpecialistAiRecommendationsNotifier,
    SpecialistAiRecommendationsState,
    String>((ref, patientId) {
  return SpecialistAiRecommendationsNotifier(
    ref,
    ref.watch(specialistAiRecommendationsRepositoryProvider),
    patientId,
  );
});

class SpecialistAiRecommendationsNotifier
    extends StateNotifier<SpecialistAiRecommendationsState> {
  SpecialistAiRecommendationsNotifier(
    this._ref,
    this._repository,
    this._patientId,
  ) : super(const SpecialistAiRecommendationsState());

  final Ref _ref;
  final SpecialistAiRecommendationsRepository _repository;
  final String _patientId;

  void _ensureAuthToken() {
    final token = _ref.read(authProvider).token;
    if (token != null && token.isNotEmpty) {
      _ref.read(authRepositoryProvider).setAuthToken(token);
    }
  }

  Future<void> _reloadBundle() async {
    final bundle = await _repository.fetchBundle(_patientId);
    state = state.copyWith(bundle: bundle, errorMessage: null);
  }

  Future<void> initialize() async {
    _ensureAuthToken();
    state = state.copyWith(isLoading: true, errorMessage: null);

    try {
      final bundle = await _repository.fetchBundle(_patientId);
      state = state.copyWith(isLoading: false, bundle: bundle);
    } catch (error) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Failed to load AI recommendations: $error',
      );
    }
  }

  Future<void> refresh() => initialize();

  Future<bool> generate(AiRecommendationType type) async {
    _ensureAuthToken();
    state = state.copyWith(
      isGenerating: true,
      generatingType: type,
      errorMessage: null,
    );

    try {
      await _repository.generateRecommendation(
        patientId: _patientId,
        type: type,
        relatedPlanId: state.bundle?.planId,
      );
      await _reloadBundle();
      state = state.copyWith(
        isGenerating: false,
        generatingType: null,
      );
      return true;
    } catch (error) {
      state = state.copyWith(
        isGenerating: false,
        generatingType: null,
        errorMessage: 'Failed to generate recommendation: $error',
      );
      return false;
    }
  }

  Future<bool> accept(String recommendationId) async {
    return _updateStatus(
      recommendationId: recommendationId,
      action: _repository.acceptRecommendation,
      failureMessage: 'Failed to accept recommendation',
      successRefreshPatientDetails: true,
    );
  }

  Future<bool> reject(String recommendationId) async {
    return _updateStatus(
      recommendationId: recommendationId,
      action: _repository.rejectRecommendation,
      failureMessage: 'Failed to reject recommendation',
      successRefreshPatientDetails: false,
    );
  }

  Future<bool> _updateStatus({
    required String recommendationId,
    required Future<void> Function(String id) action,
    required String failureMessage,
    required bool successRefreshPatientDetails,
  }) async {
    _ensureAuthToken();
    state = state.copyWith(
      updatingRecommendationId: recommendationId,
      errorMessage: null,
    );

    try {
      await action(recommendationId);
      await _reloadBundle();
      if (successRefreshPatientDetails) {
        await _ref
            .read(specialistPatientDetailsProvider(_patientId).notifier)
            .refresh();
      }
      state = state.copyWith(updatingRecommendationId: null);
      return true;
    } catch (error) {
      state = state.copyWith(
        updatingRecommendationId: null,
        errorMessage: '$failureMessage: $error',
      );
      return false;
    }
  }
}

const _sentinel = Object();
