import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/services/api_client.dart';
import '../../auth/providers/auth_provider.dart';
import '../data/specialist_speech_analysis_repository.dart';
import '../models/specialist_speech_analysis_models.dart';

final specialistSpeechAnalysisRepositoryProvider =
    Provider<SpecialistSpeechAnalysisRepository>((ref) {
  return SpecialistSpeechAnalysisRepository(ref.watch(dioProvider));
});

typedef SpecialistSpeechAnalysisArgs = ({
  String patientId,
  String? submissionId,
});

class SpecialistSpeechAnalysisState {
  const SpecialistSpeechAnalysisState({
    this.isLoading = false,
    this.isRefreshing = false,
    this.isAnalyzing = false,
    this.error,
    this.patientId = '',
    this.submissionId,
    this.patientName,
    this.analyses = const [],
    this.latestAnalysis,
    this.progressItems = const [],
    this.selectedAnalysis,
    this.successMessage,
    this.comparison,
  });

  final bool isLoading;
  final bool isRefreshing;
  final bool isAnalyzing;
  final String? error;
  final String patientId;
  final String? submissionId;
  final String? patientName;
  final List<SpecialistSpeechAnalysisItem> analyses;
  final SpecialistSpeechAnalysisItem? latestAnalysis;
  final List<SpecialistSpeechProgressPoint> progressItems;
  final SpecialistSpeechAnalysisItem? selectedAnalysis;
  final String? successMessage;
  final SpeechAnalysisComparison? comparison;

  SpecialistSpeechAnalysisState copyWith({
    bool? isLoading,
    bool? isRefreshing,
    bool? isAnalyzing,
    Object? error = _sentinel,
    String? patientId,
    Object? submissionId = _sentinel,
    Object? patientName = _sentinel,
    List<SpecialistSpeechAnalysisItem>? analyses,
    Object? latestAnalysis = _sentinel,
    List<SpecialistSpeechProgressPoint>? progressItems,
    Object? selectedAnalysis = _sentinel,
    Object? successMessage = _sentinel,
    Object? comparison = _sentinel,
  }) {
    return SpecialistSpeechAnalysisState(
      isLoading: isLoading ?? this.isLoading,
      isRefreshing: isRefreshing ?? this.isRefreshing,
      isAnalyzing: isAnalyzing ?? this.isAnalyzing,
      error: identical(error, _sentinel) ? this.error : error as String?,
      patientId: patientId ?? this.patientId,
      submissionId: identical(submissionId, _sentinel)
          ? this.submissionId
          : submissionId as String?,
      patientName: identical(patientName, _sentinel)
          ? this.patientName
          : patientName as String?,
      analyses: analyses ?? this.analyses,
      latestAnalysis: identical(latestAnalysis, _sentinel)
          ? this.latestAnalysis
          : latestAnalysis as SpecialistSpeechAnalysisItem?,
      progressItems: progressItems ?? this.progressItems,
      selectedAnalysis: identical(selectedAnalysis, _sentinel)
          ? this.selectedAnalysis
          : selectedAnalysis as SpecialistSpeechAnalysisItem?,
      successMessage: identical(successMessage, _sentinel)
          ? this.successMessage
          : successMessage as String?,
      comparison: identical(comparison, _sentinel)
          ? this.comparison
          : comparison as SpeechAnalysisComparison?,
    );
  }
}

final specialistSpeechAnalysisProvider = StateNotifierProvider.family<
    SpecialistSpeechAnalysisNotifier,
    SpecialistSpeechAnalysisState,
    SpecialistSpeechAnalysisArgs>((ref, args) {
  return SpecialistSpeechAnalysisNotifier(
    ref,
    ref.watch(specialistSpeechAnalysisRepositoryProvider),
    args,
  );
});

class SpecialistSpeechAnalysisNotifier
    extends StateNotifier<SpecialistSpeechAnalysisState> {
  SpecialistSpeechAnalysisNotifier(this._ref, this._repository, this._args)
      : super(
          SpecialistSpeechAnalysisState(
            patientId: _args.patientId,
            submissionId: _args.submissionId,
          ),
        );

  final Ref _ref;
  final SpecialistSpeechAnalysisRepository _repository;
  final SpecialistSpeechAnalysisArgs _args;

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
      error: null,
      successMessage: null,
    );

    try {
      await _loadData(showRefreshing: false);
      state = state.copyWith(isLoading: false);
    } catch (error) {
      state = state.copyWith(
        isLoading: false,
        error: 'Failed to load speech analysis: $error',
      );
    }
  }

  Future<void> refresh() async {
    _ensureAuthToken();
    state = state.copyWith(
      isRefreshing: true,
      error: null,
      successMessage: null,
    );

    try {
      await _loadData(showRefreshing: true);
      state = state.copyWith(isRefreshing: false);
    } catch (error) {
      state = state.copyWith(
        isRefreshing: false,
        error: 'Failed to refresh speech analysis: $error',
      );
    }
  }

  Future<void> _loadData({required bool showRefreshing}) async {
    final patientId = _args.patientId;
    final submissionId = _args.submissionId;

    final results = await Future.wait([
      _repository.fetchPatientSpeechAnalyses(patientId),
      _repository.fetchPatientSpeechProgress(patientId),
      _repository.fetchPatientName(patientId),
      if (submissionId != null && submissionId.isNotEmpty)
        _repository.fetchSubmissionSpeechAnalysis(submissionId, patientId: patientId)
      else
        Future<SpecialistSpeechAnalysisItem?>.value(null),
    ]);

    final analyses = results[0] as List<SpecialistSpeechAnalysisItem>;
    final progress = results[1] as List<SpecialistSpeechProgressPoint>;
    final patientName = results[2] as String?;
    final submissionAnalysis = results.length > 3
        ? results[3] as SpecialistSpeechAnalysisItem?
        : null;

    final mergedAnalyses = _mergeAnalyses(analyses, submissionAnalysis);
    final latest = mergedAnalyses.isNotEmpty ? mergedAnalyses.first : null;

    SpecialistSpeechAnalysisItem? selected;
    if (submissionId != null && submissionId.isNotEmpty) {
      final matches =
          mergedAnalyses.where((item) => item.submissionId == submissionId);
      selected = matches.isNotEmpty ? matches.first : submissionAnalysis;
    }
    selected ??= latest;

    final comparison = _buildComparison(selected, mergedAnalyses);

    state = state.copyWith(
      patientName: patientName ?? latest?.patientName ?? state.patientName,
      analyses: mergedAnalyses,
      latestAnalysis: latest,
      progressItems: progress,
      selectedAnalysis: selected,
      comparison: comparison,
    );
  }

  List<SpecialistSpeechAnalysisItem> _mergeAnalyses(
    List<SpecialistSpeechAnalysisItem> analyses,
    SpecialistSpeechAnalysisItem? extra,
  ) {
    if (extra == null || extra.id.isEmpty) {
      return analyses;
    }

    final merged = [extra, ...analyses.where((item) => item.id != extra.id)];
    merged.sort((a, b) {
      final aDate = a.analyzedAt ?? DateTime.fromMillisecondsSinceEpoch(0);
      final bDate = b.analyzedAt ?? DateTime.fromMillisecondsSinceEpoch(0);
      return bDate.compareTo(aDate);
    });
    return merged;
  }

  SpeechAnalysisComparison? _buildComparison(
    SpecialistSpeechAnalysisItem? selected,
    List<SpecialistSpeechAnalysisItem> analyses,
  ) {
    if (selected == null) {
      return null;
    }

    if (selected.comparison != null) {
      return selected.comparison;
    }

    final compareId = selected.comparedToAnalysisId;
    SpecialistSpeechAnalysisItem? previous;
    if (compareId != null && compareId.isNotEmpty) {
      for (final item in analyses) {
        if (item.id == compareId) {
          previous = item;
          break;
        }
      }
    }

    previous ??= _findPreviousAnalysis(selected, analyses);

    return SpeechAnalysisComparison.fromMaps(
      current: selected,
      previous: previous,
    );
  }

  SpecialistSpeechAnalysisItem? _findPreviousAnalysis(
    SpecialistSpeechAnalysisItem selected,
    List<SpecialistSpeechAnalysisItem> analyses,
  ) {
    final index = analyses.indexWhere((item) => item.id == selected.id);
    if (index < 0 || index + 1 >= analyses.length) {
      return null;
    }
    return analyses[index + 1];
  }

  void selectAnalysis(String analysisId) {
    final selected = state.analyses
        .where((item) => item.id == analysisId)
        .cast<SpecialistSpeechAnalysisItem?>()
        .firstWhere((item) => item != null, orElse: () => null);
    if (selected == null) {
      return;
    }

    state = state.copyWith(
      selectedAnalysis: selected,
      comparison: _buildComparison(selected, state.analyses),
      error: null,
    );
  }

  Future<void> analyzeSubmission() async {
    final submissionId = state.submissionId ?? _args.submissionId;
    if (submissionId == null || submissionId.isEmpty) {
      state = state.copyWith(
        error: 'No submission selected for speech analysis.',
      );
      return;
    }

    _ensureAuthToken();
    state = state.copyWith(
      isAnalyzing: true,
      error: null,
      successMessage: null,
    );

    try {
      final analysis = await _repository.analyzeSubmission(
        submissionId,
        patientId: state.patientId,
        patientName: state.patientName,
      );

      final refreshedAnalyses =
          await _repository.fetchPatientSpeechAnalyses(state.patientId);
      final refreshedProgress =
          await _repository.fetchPatientSpeechProgress(state.patientId);
      final merged = _mergeAnalyses(refreshedAnalyses, analysis);
      final comparison = _buildComparison(analysis, merged);

      state = state.copyWith(
        isAnalyzing: false,
        analyses: merged,
        progressItems: refreshedProgress,
        latestAnalysis: merged.isNotEmpty ? merged.first : analysis,
        selectedAnalysis: analysis.withComparison(comparison),
        comparison: comparison,
        successMessage: 'Speech analysis completed successfully.',
      );
    } catch (error) {
      state = state.copyWith(
        isAnalyzing: false,
        error: 'Failed to analyze submission: $error',
      );
    }
  }

  void clearMessages() {
    state = state.copyWith(error: null, successMessage: null);
  }
}

const _sentinel = Object();
