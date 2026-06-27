import 'package:dio/dio.dart';

import '../../../core/utils/api_response_parser.dart';
import '../data/specialist_dashboard_debug.dart';
import '../models/specialist_dashboard_models.dart';
import '../models/specialist_feature_models.dart';

class SpecialistFeaturesRepository {
  SpecialistFeaturesRepository(this._dio);

  final Dio _dio;

  Future<List<Map<String, dynamic>>> _getList(String path) async {
    try {
      final response = await _dio.get(path);
      final rows = ApiResponseParser.extractList(response.data)
          .whereType<Map>()
          .map((item) => item.map((key, value) => MapEntry(key.toString(), value)))
          .toList();
      SpecialistDashboardDebugLog.endpoint(path, rows.length);
      return rows;
    } on DioException catch (error) {
      SpecialistDashboardDebugLog.warning('GET $path failed: ${error.response?.statusCode}');
      rethrow;
    }
  }

  Future<List<SpecialistPatientItem>> fetchPatients(
    String specialistUserId, {
    bool assignedOnly = true,
  }) async {
    try {
      var rows = await _getList('/specialists/$specialistUserId/patients');
      if (rows.isEmpty && !assignedOnly) {
        rows = await _getList('/patients');
      }
      return rows
          .map(SpecialistPatientItem.fromMap)
          .where((patient) => patient.id.isNotEmpty)
          .toList();
    } on DioException {
      return const [];
    }
  }

  Future<List<SpecialistPendingReview>> fetchPendingReviews(
    String specialistUserId,
  ) async {
    try {
      final rows = await _getList('/specialists/$specialistUserId/pending-reviews');
      return rows.map(SpecialistPendingReview.fromMap).toList();
    } on DioException {
      return const [];
    }
  }

  Future<List<SpecialistSessionDetail>> fetchSessions(String specialistUserId) async {
    try {
      var rows = await _getList('/specialists/$specialistUserId/sessions');
      if (rows.isEmpty) {
        rows = await _getList('/dashboard/specialist/upcoming-sessions');
      }
      return rows.map(SpecialistSessionDetail.fromMap).toList();
    } on DioException {
      return const [];
    }
  }

  Future<List<SpecialistTreatmentPlanItem>> fetchTreatmentPlans(
    String specialistUserId,
  ) async {
    try {
      final rows = await _getList('/treatment-plans');
      return rows
          .map(SpecialistTreatmentPlanItem.fromMap)
          .where((plan) => plan.specialistId == specialistUserId)
          .toList();
    } on DioException {
      return const [];
    }
  }

  Future<List<SpecialistPatientProgress>> fetchProgressForSpecialist(
    String specialistUserId,
  ) async {
    try {
      final patients = await fetchPatients(specialistUserId);
      final patientIds = patients.map((patient) => patient.id).toSet();
      final patientNames = {
        for (final patient in patients) patient.id: patient.name,
      };

      if (patientIds.isEmpty) {
        SpecialistDashboardDebugLog.endpoint(
          'progress-snapshots',
          0,
          note: 'no assigned patients',
        );
        return const [];
      }

      final rows = await _getList('/progress-snapshots');
      final latestByPatient = <String, SpecialistPatientProgress>{};

      for (final row in rows) {
        final patientId = ApiResponseParser.readString(row, const [
          'patient_id',
          'patientId',
        ]);
        if (patientId == null || patientId.isEmpty || !patientIds.contains(patientId)) {
          continue;
        }

        latestByPatient[patientId] = SpecialistPatientProgress.fromSnapshot(
          row,
          patientName: patientNames[patientId],
        );
      }

      return latestByPatient.values.toList();
    } on DioException {
      return const [];
    }
  }

  Future<List<SpecialistExerciseItem>> fetchExercises() async {
    try {
      final rows = await _getList('/exercises');
      return rows
          .map(SpecialistExerciseItem.fromMap)
          .where((exercise) => exercise.id.isNotEmpty)
          .toList();
    } on DioException {
      return const [];
    }
  }

  Future<List<SpecialistReportItem>> fetchReports() async {
    try {
      final rows = await _getList('/reports');
      return rows
          .map(SpecialistReportItem.fromMap)
          .where((report) => report.id.isNotEmpty)
          .toList();
    } on DioException {
      return const [];
    }
  }

  Future<List<SpecialistNotificationItem>> fetchNotifications(String userId) async {
    try {
      final rows = await _getList('/users/$userId/notifications');
      return rows
          .map(SpecialistNotificationItem.fromMap)
          .where((item) => item.id.isNotEmpty)
          .toList();
    } on DioException {
      return const [];
    }
  }

  Future<int> fetchUnreadCount(String userId) async {
    try {
      final rows = await _getList('/users/$userId/notifications/unread');
      return rows.length;
    } on DioException {
      return 0;
    }
  }

  Future<String?> markNotificationRead(String notificationId) async {
    try {
      await _dio.patch('/notifications/$notificationId/read');
      return null;
    } on DioException catch (error) {
      return _readError(error);
    }
  }

  Future<String?> markAllNotificationsRead() async {
    try {
      await _dio.patch('/notifications/read-all');
      return null;
    } on DioException catch (error) {
      return _readError(error);
    }
  }

  String _readError(DioException error) {
    final data = error.response?.data;
    if (data is Map) {
      final map = data.map((key, value) => MapEntry(key.toString(), value));
      return ApiResponseParser.readString(map, const ['message', 'error']) ??
          error.message ??
          'Request failed';
    }
    return error.message ?? 'Request failed';
  }
}
