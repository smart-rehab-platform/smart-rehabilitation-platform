import 'package:dio/dio.dart';

import '../../../core/utils/api_response_parser.dart';
import '../models/specialist_speech_analysis_models.dart';

/// Specialist speech analysis API access.
///
/// Endpoints:
/// - GET  /patients/:id/speech-analyses
/// - GET  /patients/:id/speech-progress
/// - GET  /exercise-submissions/:id/speech-analysis
/// - POST /speech-analyses/analyze
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
    final response = await _dio.post(
      '/speech-analyses/analyze',
      data: {'submission_id': submissionId},
      options: Options(
        connectTimeout: const Duration(seconds: 120),
        receiveTimeout: const Duration(seconds: 120),
      ),
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
  }

  Future<String?> fetchPatientName(String patientId) async {
    final map = await _getMap('/patients/$patientId');
    return ApiResponseParser.readString(map ?? {}, const [
      'full_name',
      'fullName',
      'name',
    ]);
  }
}
