import 'package:dio/dio.dart';

import '../../../core/utils/api_response_parser.dart';
import '../models/specialist_edit_treatment_plan_models.dart';
import '../models/specialist_patient_details_models.dart';

/// Treatment plan edit API access.
///
/// Endpoints:
/// - GET /treatment-plans/:id
/// - GET /goals/treatment-plans/:planId/goals
/// - GET /goals/goals/:id/progress
/// - PUT /treatment-plans/:id
///
/// Not supported by backend schema:
/// - description on treatment_plans
/// - sessions_per_week on treatment_plans
class SpecialistEditTreatmentPlanRepository {
  SpecialistEditTreatmentPlanRepository(this._dio);

  final Dio _dio;

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

  Future<List<Map<String, dynamic>>> _getList(String path) async {
    final response = await _dio.get(path);
    return ApiResponseParser.extractList(response.data)
        .whereType<Map>()
        .map((item) => item.map((key, value) => MapEntry(key.toString(), value)))
        .toList();
  }

  Future<EditTreatmentPlanBundle> fetchEditBundle(String planId) async {
    final planMap = await _getMap('/treatment-plans/$planId');
    if (planMap == null) {
      throw Exception('Treatment plan not found');
    }

    final plan = EditableTreatmentPlan.fromMap(planMap);
    final patientId = ApiResponseParser.readString(planMap, const [
          'patient_id',
          'patientId',
        ]) ??
        '';
    final patientName = ApiResponseParser.readString(planMap, const [
          'patient_name',
          'patientName',
        ]) ??
        'Patient';

    final goals = await _fetchGoalsWithProgress(planId);

    return EditTreatmentPlanBundle(
      patientId: patientId,
      patientName: patientName,
      plan: plan,
      goals: goals,
    );
  }

  Future<List<PatientGoalItem>> _fetchGoalsWithProgress(String planId) async {
    final goalRows = await _getList('/goals/treatment-plans/$planId/goals');
    if (goalRows.isEmpty) {
      return const [];
    }

    return Future.wait(
      goalRows.map((row) async {
        final goalId =
            ApiResponseParser.readString(row, const ['id', '_id']) ?? '';
        final progressRows = goalId.isEmpty
            ? <Map<String, dynamic>>[]
            : await _getList('/goals/goals/$goalId/progress');
        final latest = progressRows.isNotEmpty
            ? ApiResponseParser.readDouble(progressRows.first, const [
                  'completion_percentage',
                  'completionPercentage',
                ]) ??
                0
            : 0.0;

        return PatientGoalItem.fromMap(
          row,
          completionPercentage: latest > 1 ? latest / 100 : latest,
        );
      }),
    );
  }

  Future<EditableTreatmentPlan> updatePlan(
    String planId,
    UpdateTreatmentPlanInput input,
  ) async {
    final response = await _dio.put(
      '/treatment-plans/$planId',
      data: input.toJson(),
    );
    final map = ApiResponseParser.extractMap(response.data);
    if (map == null) {
      throw Exception('Invalid treatment plan response');
    }
    return EditableTreatmentPlan.fromMap(map);
  }
}
