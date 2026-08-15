import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';

import '../../../core/utils/api_response_parser.dart';
import '../models/specialist_speech_analysis_models.dart';

/// Specialist speech analysis API access.
///
/// Endpoints (mounted under /api/v1):
/// - GET  /speech-analyses/patients/:id
/// - GET  /speech-analyses/patients/:id/progress
/// - GET  /speech-analyses/exercise-submissions/:id
/// - POST /speech-analyses/analyze  body: { submission_id }
class SpecialistSpeechAnalysisRepository {
  SpecialistSpeechAnalysisRepository(this._dio);

  final Dio _dio;

  Future<List<Map<String, dynamic>>> _getList(String path) async {
    final response = await _dio.get(path);
    return ApiResponseParser.extractList(response.data)
        .whereType<Map>()
        .map((item) => item.map((key, value) => MapEntry(key.toString(), value)))
        .toList();
  }

  Future<Map<String, dynamic>?> _getMap(String path) async {
    try {
      final response = await _dio.get(path);
      return ApiResponseParser.extractMap(response.data);
    } on DioException catch (error) {
      if (error.response?.statusCode == 404) {
        return null;
      }
      rethrow;
    }
  }

  Future<List<SpecialistSpeechAnalysisItem>> fetchPatientSpeechAnalyses(
    String patientId,
  ) async {
    final rows = await _getList('/speech-analyses/patients/$patientId');
    return rows
        .map(
          (row) => SpecialistSpeechAnalysisItem.fromMap(
            row,
            fallbackPatientId: patientId,
          ),
        )
        .where((item) => item.id.isNotEmpty)
        .toList();
  }

  Future<List<SpecialistSpeechProgressPoint>> fetchPatientSpeechProgress(
    String patientId,
  ) async {
    final rows = await _getList('/speech-analyses/patients/$patientId/progress');
    return rows
        .map(SpecialistSpeechProgressPoint.fromMap)
        .where((item) => item.id.isNotEmpty)
        .toList();
  }

  Future<SpeechProgressInsights?> fetchPatientSpeechProgressInsights(
    String patientId, {
    String? exerciseId,
    String? expectedText,
    String? targetPhoneme,
  }) async {
    final bundle = await fetchPatientSpeechProgressBundle(
      patientId,
      exerciseId: exerciseId,
      expectedText: expectedText,
      targetPhoneme: targetPhoneme,
    );
    return bundle.insights;
  }

  Future<({SpeechProgressInsights? insights, SpeechAcousticProgress? acousticProgress})>
      fetchPatientSpeechProgressBundle(
    String patientId, {
    String? exerciseId,
    String? expectedText,
    String? targetPhoneme,
  }) async {
    final queryParameters = <String, dynamic>{
      'include_insights': 'true',
    };
    if (exerciseId != null && exerciseId.isNotEmpty) {
      queryParameters['exercise_id'] = exerciseId;
    }
    if (expectedText != null && expectedText.trim().isNotEmpty) {
      queryParameters['expected_text'] = expectedText.trim();
    }
    if (targetPhoneme != null && targetPhoneme.trim().isNotEmpty) {
      queryParameters['target_phoneme'] = targetPhoneme.trim();
    }

    final response = await _dio.get(
      '/speech-analyses/patients/$patientId/progress',
      queryParameters: queryParameters,
    );
    final root = response.data;
    if (root is! Map) {
      return (insights: null, acousticProgress: null);
    }

    final map = root.map((key, value) => MapEntry(key.toString(), value));
    return (
      insights: SpeechProgressInsights.fromMap(
        ApiResponseParser.asMap(map['insights']),
      ),
      acousticProgress: SpeechAcousticProgress.fromMap(
        ApiResponseParser.asMap(
          map['acoustic_progress'] ?? map['acousticProgress'],
        ),
      ),
    );
  }

  Future<SpecialistSpeechAnalysisItem?> fetchSubmissionSpeechAnalysis(
    String submissionId, {
    String? patientId,
    String? patientName,
  }) async {
    final map =
        await _getMap('/speech-analyses/exercise-submissions/$submissionId');
    if (map == null) {
      return null;
    }

    return SpecialistSpeechAnalysisItem.fromMap(
      map,
      fallbackPatientId: patientId,
      fallbackPatientName: patientName,
    );
  }

  Future<SpecialistSpeechAnalysisItem> analyzeSubmission(
    String submissionId, {
    String? patientId,
    String? patientName,
  }) async {
    try {
      debugPrint(
        '[speech-analysis] POST /speech-analyses/analyze '
        'submissionId=$submissionId',
      );
      final response = await _dio.post(
        '/speech-analyses/analyze',
        data: {'submission_id': submissionId},
        options: Options(
          connectTimeout: const Duration(seconds: 120),
          receiveTimeout: const Duration(seconds: 120),
        ),
      );
      debugPrint(
        '[speech-analysis] analyze status=${response.statusCode}',
      );
      final map = ApiResponseParser.extractMap(response.data);
      if (map == null) {
        throw Exception('Invalid speech analysis response');
      }

      return SpecialistSpeechAnalysisItem.fromMap(
        map,
        fallbackPatientId: patientId,
        fallbackPatientName: patientName,
      );
    } on DioException catch (error) {
      debugPrint(
        '[speech-analysis] analyze failed '
        'status=${error.response?.statusCode} '
        'body=${error.response?.data}',
      );
      throw Exception(friendlySpeechAnalysisError(error, action: 'analyze'));
    }
  }

  Future<String?> fetchPatientName(String patientId) async {
    final map = await _getMap('/patients/$patientId');
    return ApiResponseParser.readString(map ?? {}, const [
      'full_name',
      'fullName',
      'name',
    ]);
  }

  /// User-facing speech analysis errors (never raw DioException text).
  static String friendlySpeechAnalysisError(
    Object error, {
    String action = 'load',
  }) {
    if (error is! DioException) {
      final raw = error.toString().replaceFirst(RegExp(r'^Exception:\s*'), '');
      if (raw.isEmpty ||
          raw.contains('DioException') ||
          raw.contains('validateStatus')) {
        return action == 'analyze'
            ? 'Speech analysis could not be completed. Please try again.'
            : 'Failed to load speech analysis. Please try again.';
      }
      return raw;
    }

    final status = error.response?.statusCode;
    final data = error.response?.data;
    String? apiMessage;
    if (data is Map) {
      final map = data.map((key, value) => MapEntry(key.toString(), value));
      apiMessage =
          ApiResponseParser.readString(map, const ['message', 'error']);
    }
    final lowerApi = (apiMessage ?? '').toLowerCase();

    if (status == 401) {
      return 'Please sign in to continue.';
    }
    if (status == 403) {
      return 'You do not have permission to analyze this submission.';
    }
    if (status == 404) {
      if (lowerApi.contains('analysis') &&
          !lowerApi.contains('submission not found')) {
        return 'No speech analysis is available for this submission yet.';
      }
      return 'The exercise submission could not be found.';
    }
    if (status == 400 || status == 422) {
      if (lowerApi.contains('audio') ||
          lowerApi.contains('recording') ||
          lowerApi.contains('media') ||
          lowerApi.contains('external')) {
        return 'This submission does not contain a supported audio recording.';
      }
      if (apiMessage != null &&
          apiMessage.trim().isNotEmpty &&
          !apiMessage.contains('DioException')) {
        return apiMessage.trim();
      }
      return 'This submission does not contain a supported audio recording.';
    }
    if (status == 502 || status == 503 || status == 504) {
      return 'The speech analysis service is currently unavailable. Please try again.';
    }
    if (error.type == DioExceptionType.connectionTimeout ||
        error.type == DioExceptionType.receiveTimeout ||
        error.type == DioExceptionType.sendTimeout ||
        error.type == DioExceptionType.connectionError) {
      return 'Unable to connect to the analysis service. Check your connection and try again.';
    }

    return action == 'analyze'
        ? 'Speech analysis could not be completed. Please try again.'
        : 'Failed to load speech analysis. Please try again.';
  }
}
