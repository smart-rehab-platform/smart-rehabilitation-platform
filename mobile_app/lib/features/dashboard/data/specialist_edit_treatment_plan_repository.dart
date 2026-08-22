import 'package:dio/dio.dart';

import '../../../core/utils/api_response_parser.dart';
import '../models/specialist_edit_treatment_plan_models.dart';
import '../models/specialist_patient_details_models.dart';

/// Not supported by backend schema:
/// - description on treatment_plans
/// - sessions_per_week on treatment_plans
///
/// Endpoints:
/// - GET /treatment-plans/:id
/// - GET /goals/treatment-plans/:planId/goals
/// - GET /goals/goals/:id/progress
/// - PUT /treatment-plans/:id
/// - POST /treatment-plans
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
    final patientProfileImageUrl = ApiResponseParser.readString(planMap, const [
      'patient_profile_image_url',
      'patientProfileImageUrl',
      'profile_image_url',
      'profileImageUrl',
    ]);

    final goals = await _fetchGoalsWithProgress(planId);

    return EditTreatmentPlanBundle(
      patientId: patientId,
      patientName: patientName,
      patientProfileImageUrl: patientProfileImageUrl,
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
    try {
      final response = await _dio.put(
        '/treatment-plans/$planId',
        data: input.toJson(),
      );
      final map = ApiResponseParser.extractMap(response.data);
      if (map == null) {
        throw Exception('Invalid treatment plan response');
      }
      return EditableTreatmentPlan.fromMap(map);
    } on DioException catch (error) {
      throw Exception(friendlyTreatmentPlanError(error, action: 'update'));
    }
  }

  Future<EditableTreatmentPlan> createPlan(CreateTreatmentPlanInput input) async {
    try {
      final response = await _dio.post(
        '/treatment-plans',
        data: input.toJson(),
      );
      final map = ApiResponseParser.extractMap(response.data);
      if (map == null) {
        throw Exception('Invalid treatment plan response');
      }
      return EditableTreatmentPlan.fromMap(map);
    } on DioException catch (error) {
      throw Exception(friendlyTreatmentPlanError(error, action: 'create'));
    }
  }

  /// Concise specialist-facing treatment plan errors.
  static String friendlyTreatmentPlanError(
    DioException error, {
    required String action,
  }) {
    final status = error.response?.statusCode;
    final data = error.response?.data;
    String? apiMessage;
    if (data is Map) {
      final map = data.map((key, value) => MapEntry(key.toString(), value));
      apiMessage =
          ApiResponseParser.readString(map, const ['message', 'error']);
    }

    if (status == 403) {
      return 'You do not have access to this patient.';
    }
    if (status == 409) {
      return apiMessage?.trim().isNotEmpty == true
          ? apiMessage!.trim()
          : 'This patient already has an active treatment plan.';
    }
    if (status == 404) {
      return apiMessage?.trim().isNotEmpty == true
          ? apiMessage!.trim()
          : 'Patient or treatment plan not found.';
    }
    if (status == 400) {
      final message = apiMessage?.trim();
      if (message != null &&
          message.isNotEmpty &&
          !message.contains('DioException') &&
          !message.contains('validateStatus')) {
        return message;
      }
      return 'Please check the plan details and try again.';
    }
    return action == 'create'
        ? 'Failed to create treatment plan. Please try again.'
        : 'Failed to save treatment plan. Please try again.';
  }
}
