import 'package:dio/dio.dart';

import '../../../core/utils/api_response_parser.dart';
import '../models/specialist_goals_models.dart';
import '../models/specialist_patient_details_models.dart';

/// Goals management API access.
///
/// Endpoints:
/// - GET /patients/:id
/// - GET /treatment-plans/patient/:id
/// - GET /goals/treatment-plans/:planId/goals
/// - GET /goals/goals/:id/progress
/// - POST /goals/treatment-plans/:planId/goals
/// - PUT /goals/:id
/// - PATCH /goals/:id/achieve
/// - POST /goals/goals/:id/progress
///
/// Archive note: no dedicated archive endpoint for specialists.
/// Use PATCH /goals/:id/achieve to mark a goal as achieved.
/// DELETE /goals/:id is admin-only.
class SpecialistGoalsRepository {
  SpecialistGoalsRepository(this._dio);

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

  Future<SpecialistGoalsBundle> fetchGoalsBundle(String patientId) async {
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

    final planRows = await _getList('/treatment-plans/patient/$patientId');
    final activePlan = _selectActivePlan(planRows);
    if (activePlan == null) {
      return SpecialistGoalsBundle(
        patientId: patientId,
        patientName: patientName,
        planId: '',
        planTitle: '',
        goals: const [],
      );
    }

    final planId =
        ApiResponseParser.readString(activePlan, const ['id', '_id']) ?? '';
    final planTitle = ApiResponseParser.readString(activePlan, const [
          'title',
        ]) ??
        'Treatment Plan';

    final goals = await fetchPlanGoalsWithProgress(planId);

    return SpecialistGoalsBundle(
      patientId: patientId,
      patientName: patientName,
      planId: planId,
      planTitle: planTitle,
      goals: goals,
    );
  }

  Future<List<PatientGoalItem>> fetchPlanGoalsWithProgress(String planId) async {
    if (planId.isEmpty) {
      return const [];
    }

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

  Future<PatientGoalItem> createGoal(String planId, CreateGoalInput input) async {
    final response = await _dio.post(
      '/goals/treatment-plans/$planId/goals',
      data: input.toJson(),
    );
    final map = ApiResponseParser.extractMap(response.data);
    if (map == null) {
      throw Exception('Invalid goal response');
    }
    return PatientGoalItem.fromMap(map);
  }

  Future<PatientGoalItem> updateGoal(String goalId, UpdateGoalInput input) async {
    final response = await _dio.put(
      '/goals/goals/$goalId',
      data: input.toJson(),
    );
    final map = ApiResponseParser.extractMap(response.data);
    if (map == null) {
      throw Exception('Invalid goal response');
    }
    return PatientGoalItem.fromMap(map);
  }

  Future<void> achieveGoal(String goalId) async {
    await _dio.patch('/goals/goals/$goalId/achieve');
  }

  Future<void> createGoalProgress(
    String goalId,
    CreateGoalProgressInput input,
  ) async {
    await _dio.post(
      '/goals/goals/$goalId/progress',
      data: input.toJson(),
    );
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
