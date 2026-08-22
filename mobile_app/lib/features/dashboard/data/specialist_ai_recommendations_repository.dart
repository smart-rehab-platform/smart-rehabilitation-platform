import 'package:dio/dio.dart';

import '../../../core/utils/api_response_parser.dart';
import '../models/specialist_ai_recommendations_models.dart';

/// AI recommendations API access.
///
/// Endpoints:
/// - GET /patients/:id
/// - GET /treatment-plans/patient/:id
/// - GET /ai/recommendations/patient/:id
/// - POST /ai/recommendations/generate
/// - PATCH /ai/recommendations/:id/accept
/// - PATCH /ai/recommendations/:id/reject
class SpecialistAiRecommendationsRepository {
  SpecialistAiRecommendationsRepository(this._dio);

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

  Future<SpecialistAiRecommendationsBundle> fetchBundle(String patientId) async {
    final patientMap = await _getMap('/patients/$patientId');
    if (patientMap == null) {
      throw Exception('Patient not found');
    }

    final patientName = ApiResponseParser.readString(patientMap, const [
          'full_name',
          'fullName',
          'name',
        ]) ??
        'Patient';
    final patientProfileImageUrl = ApiResponseParser.readString(patientMap, const [
      'profile_image_url',
      'profileImageUrl',
      'profile_image',
      'profileImage',
      'image_url',
      'avatarUrl',
      'avatar',
    ]);

    final planRows = await _getList('/treatment-plans/patient/$patientId');
    final activePlan = _selectActivePlan(planRows);
    final planId = activePlan == null
        ? null
        : ApiResponseParser.readString(activePlan, const ['id', '_id']);

    final recommendationRows =
        await _getList('/ai/recommendations/patient/$patientId');
    final recommendations = recommendationRows
        .map(SpecialistAiRecommendationItem.fromMap)
        .where((item) => item.id.isNotEmpty)
        .toList();

    return SpecialistAiRecommendationsBundle(
      patientId: patientId,
      patientName: patientName,
      patientProfileImageUrl: patientProfileImageUrl,
      planId: planId,
      recommendations: recommendations,
    );
  }

  Future<void> generateRecommendation({
    required String patientId,
    required AiRecommendationType type,
    String? relatedPlanId,
  }) async {
    final data = <String, dynamic>{
      'patient_id': patientId,
      'type': type.apiValue,
    };
    if (relatedPlanId != null && relatedPlanId.isNotEmpty) {
      data['related_plan_id'] = relatedPlanId;
    }

    await _dio.post('/ai/recommendations/generate', data: data);
  }

  Future<void> acceptRecommendation(String recommendationId) async {
    await _dio.patch('/ai/recommendations/$recommendationId/accept');
  }

  Future<void> rejectRecommendation(String recommendationId) async {
    await _dio.patch('/ai/recommendations/$recommendationId/reject');
  }

  Map<String, dynamic>? _selectActivePlan(List<Map<String, dynamic>> plans) {
    if (plans.isEmpty) {
      return null;
    }
    for (final plan in plans) {
      if ((ApiResponseParser.readString(plan, const ['status']) ?? '')
              .toLowerCase() ==
          'active') {
        return plan;
      }
    }
    return plans.first;
  }
}
