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
    this.patientProfileImageUrl,
    this.analyses = const [],
    this.latestAnalysis,
    this.progressItems = const [],
    this.progressInsights,
    this.acousticProgress,
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
  final String? patientProfileImageUrl;
  final List<SpecialistSpeechAnalysisItem> analyses;
  final SpecialistSpeechAnalysisItem? latestAnalysis;
  final List<SpecialistSpeechProgressPoint> progressItems;
  final SpeechProgressInsights? progressInsights;
  final SpeechAcousticProgress? acousticProgress;
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
    Object? patientProfileImageUrl = _sentinel,
    List<SpecialistSpeechAnalysisItem>? analyses,
    Object? latestAnalysis = _sentinel,
    List<SpecialistSpeechProgressPoint>? progressItems,
    Object? progressInsights = _sentinel,
    Object? acousticProgress = _sentinel,
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
      patientProfileImageUrl: identical(patientProfileImageUrl, _sentinel)
          ? this.patientProfileImageUrl
          : patientProfileImageUrl as String?,
      analyses: analyses ?? this.analyses,
      latestAnalysis: identical(latestAnalysis, _sentinel)
          ? this.latestAnalysis
          : latestAnalysis as SpecialistSpeechAnalysisItem?,
      progressItems: progressItems ?? this.progressItems,
      progressInsights: identical(progressInsights, _sentinel)
          ? this.progressInsights
          : progressInsights as SpeechProgressInsights?,
      acousticProgress: identical(acousticProgress, _sentinel)
          ? this.acousticProgress
          : acousticProgress as SpeechAcousticProgress?,
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
        error: SpecialistSpeechAnalysisRepository.friendlySpeechAnalysisError(
          error,
          action: 'load',
        ),
      );
    }
  }

  Future<void> refresh() async {
    if (state.isRefreshing || state.isAnalyzing) {
      return;
    }
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
        error: SpecialistSpeechAnalysisRepository.friendlySpeechAnalysisError(
          error,
          action: 'load',
        ),
      );
    }
  }

  Future<void> _loadData({required bool showRefreshing}) async {
    final patientId = _args.patientId;
    final submissionId = _args.submissionId;

    final results = await Future.wait([
      _repository.fetchPatientSpeechAnalyses(patientId),
      _repository.fetchPatientSpeechProgress(patientId),
      _repository.fetchPatientIdentity(patientId),
      if (submissionId != null && submissionId.isNotEmpty)
        _repository.fetchSubmissionSpeechAnalysis(submissionId, patientId: patientId)
      else
        Future<SpecialistSpeechAnalysisItem?>.value(null),
    ]);

    final analyses = results[0] as List<SpecialistSpeechAnalysisItem>;
    final progress = results[1] as List<SpecialistSpeechProgressPoint>;
    final patientIdentity =
        results[2] as ({String? name, String? profileImageUrl});
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

    final progressBundle = await _fetchProgressBundleForSelection(selected);

    final comparison = _buildComparison(selected, mergedAnalyses);

    state = state.copyWith(
      patientName:
          patientIdentity.name ?? latest?.patientName ?? state.patientName,
      patientProfileImageUrl:
          patientIdentity.profileImageUrl ?? state.patientProfileImageUrl,
      analyses: mergedAnalyses,
      latestAnalysis: latest,
      progressItems: progress,
      progressInsights: progressBundle.insights ?? selected?.progressInsights,
      acousticProgress: progressBundle.acousticProgress,
      selectedAnalysis: selected,
      comparison: comparison,
    );
  }

  Future<({SpeechProgressInsights? insights, SpeechAcousticProgress? acousticProgress})>
      _fetchProgressBundleForSelection(
    SpecialistSpeechAnalysisItem? selected,
  ) async {
    if (selected == null) {
      return (insights: null, acousticProgress: null);
    }

    return _repository.fetchPatientSpeechProgressBundle(
      _args.patientId,
      exerciseId: selected.exerciseId,
      expectedText: selected.expectedSpeech?.expectedText,
      targetPhoneme: selected.phonemeAnalysis?.targetPhone?.requested ??
          selected.expectedSpeech?.targetPhoneme,
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

  Future<void> selectAnalysis(String analysisId) async {
    final selected = state.analyses
        .where((item) => item.id == analysisId)
        .cast<SpecialistSpeechAnalysisItem?>()
        .firstWhere((item) => item != null, orElse: () => null);
    if (selected == null) {
      return;
    }

    final progressBundle = await _fetchProgressBundleForSelection(selected);

    state = state.copyWith(
      selectedAnalysis: selected,
      progressInsights: progressBundle.insights ?? selected.progressInsights,
      acousticProgress: progressBundle.acousticProgress,
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

    if (state.isAnalyzing) {
      return;
    }

    _ensureAuthToken();
    state = state.copyWith(
      isAnalyzing: true,
      error: null,
      successMessage: null,
    );

    try {
      final existing = await _repository.fetchSubmissionSpeechAnalysis(
        submissionId,
        patientId: state.patientId,
        patientName: state.patientName,
      );
      if (existing != null && existing.id.isNotEmpty) {
        final refreshedAnalyses =
            await _repository.fetchPatientSpeechAnalyses(state.patientId);
        final refreshedProgress =
            await _repository.fetchPatientSpeechProgress(state.patientId);
        final merged = _mergeAnalyses(refreshedAnalyses, existing);
        final comparison = _buildComparison(existing, merged);
        final progressBundle =
            await _fetchProgressBundleForSelection(existing);
        state = state.copyWith(
          isAnalyzing: false,
          analyses: merged,
          progressItems: refreshedProgress,
          progressInsights: progressBundle.insights ?? existing.progressInsights,
          acousticProgress: progressBundle.acousticProgress,
          latestAnalysis: merged.isNotEmpty ? merged.first : existing,
          selectedAnalysis: existing.withComparison(comparison),
          comparison: comparison,
          successMessage: 'Existing speech analysis loaded.',
        );
        return;
      }

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
      final progressBundle = await _fetchProgressBundleForSelection(analysis);

      state = state.copyWith(
        isAnalyzing: false,
        analyses: merged,
        progressItems: refreshedProgress,
        progressInsights:
            analysis.progressInsights ?? progressBundle.insights,
        acousticProgress: progressBundle.acousticProgress,
        latestAnalysis: merged.isNotEmpty ? merged.first : analysis,
        selectedAnalysis: analysis.withComparison(comparison),
        comparison: comparison,
        successMessage: 'Speech analysis completed successfully.',
      );
    } catch (error) {
      state = state.copyWith(
        isAnalyzing: false,
        error: SpecialistSpeechAnalysisRepository.friendlySpeechAnalysisError(
          error,
          action: 'analyze',
        ),
      );
    }
  }

  void clearMessages() {
    state = state.copyWith(error: null, successMessage: null);
  }
}

const _sentinel = Object();
