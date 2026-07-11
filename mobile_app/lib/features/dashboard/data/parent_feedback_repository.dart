import 'package:dio/dio.dart';

import '../../../core/utils/api_response_parser.dart';
import '../models/parent_feedback_models.dart';

class ParentFeedbackApiException implements Exception {
  ParentFeedbackApiException({
    required this.message,
    this.statusCode,
  });

  final String message;
  final int? statusCode;

  @override
  String toString() => message;
}

class ParentFeedbackRepository {
  ParentFeedbackRepository(this._dio);

  final Dio _dio;

  static const _basePath = '/specialist-feedback';

  String _extractMessage(dynamic responseData, {String? fallback}) {
    final map = ApiResponseParser.asMap(responseData);
    if (map != null) {
      final message = ApiResponseParser.readString(map, const ['message', 'error']);
      if (message != null && message.isNotEmpty) {
        return message;
      }
    }
    return fallback ?? 'Request failed';
  }

  Future<List<ParentTreatmentPlan>> fetchPatientTreatmentPlans(
    String patientId,
  ) async {
    try {
      final response = await _dio.get('/treatment-plans/patient/$patientId');
      return ApiResponseParser.extractList(response.data)
          .whereType<Map>()
          .map((item) => item.map((key, value) => MapEntry(key.toString(), value)))
          .map(ParentTreatmentPlan.fromMap)
          .where((plan) => plan.id.isNotEmpty)
          .toList();
    } on DioException {
      return const [];
    } catch (_) {
      return const [];
    }
  }

  Future<ParentSpecialistFeedbackCheck?> checkFeedback(
    String treatmentPlanId,
  ) async {
    try {
      final response = await _dio.get('$_basePath/check/$treatmentPlanId');
      final map = ApiResponseParser.extractMap(response.data);
      if (map == null) {
        return null;
      }
      return ParentSpecialistFeedbackCheck.fromMap(map);
    } on DioException {
      return null;
    } catch (_) {
      return null;
    }
  }

  Future<ParentSpecialistFeedbackSubmission> submitFeedback({
    required String patientId,
    required String treatmentPlanId,
    required int rating,
    String? comment,
  }) async {
    try {
      final response = await _dio.post(
        _basePath,
        data: {
          'patient_id': patientId,
          'treatment_plan_id': treatmentPlanId,
          'rating': rating,
          if (comment != null && comment.trim().isNotEmpty)
            'comment': comment.trim(),
        },
      );
      final map = ApiResponseParser.extractMap(response.data);
      if (map == null) {
        throw ParentFeedbackApiException(message: 'Invalid feedback response');
      }
      return ParentSpecialistFeedbackSubmission.fromMap(map);
    } on ParentFeedbackApiException {
      rethrow;
    } on DioException catch (error) {
      throw ParentFeedbackApiException(
        message: error.response?.data != null
            ? _extractMessage(
                error.response!.data,
                fallback: error.message ?? 'Request failed',
              )
            : (error.message ?? 'Request failed'),
        statusCode: error.response?.statusCode,
      );
    }
  }
}
