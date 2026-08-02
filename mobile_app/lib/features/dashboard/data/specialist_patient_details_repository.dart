import 'package:dio/dio.dart';

import '../../../core/utils/api_response_parser.dart';
import '../models/family_pattern_details_models.dart';
import '../models/family_pattern_insight_models.dart';
import '../models/specialist_patient_details_models.dart';

/// Aggregates patient detail data from existing backend endpoints.
///
/// Endpoints used:
/// - GET /patients/:id
/// - GET /patients/:id/diagnoses
/// - GET /patients/:id/improvement-percentage
/// - GET /treatment-plans/patient/:id
/// - GET /goals/treatment-plans/:planId/goals
/// - GET /goals/goals/:id/progress
/// - GET /patients/:id/assigned-exercises
/// - GET /patients/:id/submissions
/// - GET /exercise-submissions/:id/media
/// - GET /patients/:id/reports
/// - GET /patients/:id/notes
/// - GET /patients/:id/family-patterns
/// - GET /patients/:id/family-patterns/details
///
/// Note: category_name is joined from exercise_categories when available.
class SpecialistPatientDetailsRepository {
  SpecialistPatientDetailsRepository(this._dio);

  final Dio _dio;

  Future<List<Map<String, dynamic>>> _getList(String path) async {
    final response = await _dio.get(path);
    return ApiResponseParser.extractList(response.data)
        .whereType<Map>()
        .map(
          (item) => item.map((key, value) => MapEntry(key.toString(), value)),
        )
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

  Future<SpecialistPatientDetailsBundle> fetchPatientDetails(
    String patientId,
  ) async {
    final results = await Future.wait([
      _getMap('/patients/$patientId'),
      _getList('/patients/$patientId/diagnoses'),
      _getMap('/patients/$patientId/improvement-percentage'),
      _getList('/treatment-plans/patient/$patientId'),
      _getList('/patients/$patientId/assigned-exercises'),
      _getList('/patients/$patientId/submissions'),
      _getList('/patients/$patientId/reports'),
      _getList('/patients/$patientId/notes'),
    ]);

    final patientMap = results[0] as Map<String, dynamic>?;
    if (patientMap == null) {
      throw Exception('Patient not found');
    }

    final diagnoses = (results[1] as List<Map<String, dynamic>>)
        .map(PatientDiagnosisItem.fromMap)
        .toList();
    final improvementMap = results[2] as Map<String, dynamic>?;
    final treatmentPlans = (results[3] as List<Map<String, dynamic>>)
        .map(PatientTreatmentPlan.fromMap)
        .toList();
    final assignedExercises = (results[4] as List<Map<String, dynamic>>)
        .map(PatientAssignedExerciseItem.fromMap)
        .toList();
    final submissionRows = results[5] as List<Map<String, dynamic>>;
    final reports = results[6] as List<Map<String, dynamic>>;
    final notes = (results[7] as List<Map<String, dynamic>>)
        .map(PatientSpecialistNote.fromMap)
        .toList();

    final overallProgress = _readImprovementPercentage(improvementMap);
    final activePlan = _selectActivePlan(treatmentPlans);
    final goals = await _fetchGoalsWithProgress(activePlan?.id);
    final recentSubmissions = await _fetchRecentSubmissions(submissionRows);

    final pendingReviews = submissionRows
        .where(
          (row) =>
              (ApiResponseParser.readString(row, const ['status']) ?? '')
                  .toLowerCase() ==
              'pending',
        )
        .length;

    final activeGoals = goals.where((goal) => !goal.isAchieved).length;
    final activeAssigned = assignedExercises
        .where((item) => item.statusLabel == 'Active')
        .length;

    return SpecialistPatientDetailsBundle(
      patient: PatientProfile.fromMap(patientMap),
      diagnosis: diagnoses.isNotEmpty ? diagnoses.first.title : null,
      overallProgress: overallProgress,
      stats: PatientQuickStats(
        activeGoals: activeGoals,
        assignedExercises: activeAssigned,
        pendingReviews: pendingReviews,
        reports: reports.length,
      ),
      treatmentPlan: activePlan,
      goals: goals,
      assignedExercises: assignedExercises,
      recentSubmissions: recentSubmissions,
      notes: notes.reversed.toList(),
    );
  }

  Future<void> addSpecialistNote(String patientId, String note) async {
    await _dio.post('/patients/$patientId/notes', data: {'note': note});
  }

  /// Supplementary family-pattern insight for specialist decision support.
  Future<FamilyPatternInsight> fetchFamilyPatternInsight(
    String patientId,
  ) async {
    final map = await _getMap('/patients/$patientId/family-patterns');
    if (map == null) {
      throw Exception('Family pattern insight not found');
    }
    return FamilyPatternInsight.fromMap(map);
  }

  /// Specialist-only matched children breakdown for review workflow.
  Future<FamilyPatternDetails> fetchFamilyPatternDetails(
    String patientId,
  ) async {
    final map = await _getMap('/patients/$patientId/family-patterns/details');
    if (map == null) {
      throw Exception('Family pattern details not found');
    }
    return FamilyPatternDetails.fromMap(map);
  }

  /// Updates patient profile fields supported by PUT /patients/:id.
  Future<PatientProfile> updatePatient({
    required String patientId,
    required String fullName,
    DateTime? dateOfBirth,
    String? gender,
    String? profileImageUrl,
  }) async {
    final response = await _dio.put(
      '/patients/$patientId',
      data: {
        'full_name': fullName,
        if (dateOfBirth != null)
          'date_of_birth':
              '${dateOfBirth.year.toString().padLeft(4, '0')}-${dateOfBirth.month.toString().padLeft(2, '0')}-${dateOfBirth.day.toString().padLeft(2, '0')}',
        if (gender != null && gender.isNotEmpty) 'gender': gender,
        if (profileImageUrl != null) 'profile_image_url': profileImageUrl,
      },
    );

    final map = ApiResponseParser.extractMap(response.data);
    if (map == null) {
      throw Exception('Patient update returned no data');
    }
    return PatientProfile.fromMap(map);
  }

  PatientTreatmentPlan? _selectActivePlan(List<PatientTreatmentPlan> plans) {
    if (plans.isEmpty) {
      return null;
    }
    return plans.firstWhere(
      (plan) => plan.status.toLowerCase() == 'active',
      orElse: () => plans.first,
    );
  }

  double _readImprovementPercentage(Map<String, dynamic>? map) {
    if (map == null) {
      return 0;
    }
    final value =
        ApiResponseParser.readDouble(map, const [
          'improvement_percentage',
          'improvementPercentage',
          'percentage',
        ]) ??
        0;
    return value > 1 ? value / 100 : value;
  }

  Future<List<PatientGoalItem>> _fetchGoalsWithProgress(String? planId) async {
    if (planId == null || planId.isEmpty) {
      return const [];
    }

    final goalRows = await _getList('/goals/treatment-plans/$planId/goals');
    if (goalRows.isEmpty) {
      return const [];
    }

    final goals = await Future.wait(
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

    return goals;
  }

  Future<List<PatientSubmissionItem>> _fetchRecentSubmissions(
    List<Map<String, dynamic>> rows,
  ) async {
    final recent = rows.take(5).toList();
    if (recent.isEmpty) {
      return const [];
    }

    return Future.wait(
      recent.map((row) async {
        final submissionId =
            ApiResponseParser.readString(row, const ['id', '_id']) ?? '';
        var mediaLabel = '—';
        if (submissionId.isNotEmpty) {
          final mediaRows = await _getList(
            '/exercise-submissions/$submissionId/media',
          );
          if (mediaRows.isNotEmpty) {
            final raw = ApiResponseParser.readString(mediaRows.first, const [
              'media_type',
              'mediaType',
            ]);
            mediaLabel = PatientSubmissionItem.mediaTypeFromRaw(raw);
          }
        }
        return PatientSubmissionItem.fromMap(row, mediaTypeLabel: mediaLabel);
      }),
    );
  }
}
