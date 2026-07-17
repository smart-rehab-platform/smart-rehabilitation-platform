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

  Future<SpecialistExerciseItem?> fetchExerciseById(String exerciseId) async {
    try {
      final response = await _dio.get('/exercises/$exerciseId');
      final map = ApiResponseParser.extractMap(response.data);
      if (map == null) {
        return null;
      }
      final item = SpecialistExerciseItem.fromMap(map);
      return item.id.isEmpty ? null : item;
    } on DioException catch (error) {
      if (error.response?.statusCode == 404) {
        return null;
      }
      rethrow;
    }
  }

  Future<List<ExerciseCategoryItem>> fetchExerciseCategories() async {
    final rows = await _getList('/exercise-categories');
    return rows
        .map(ExerciseCategoryItem.fromMap)
        .where((item) => item.id.isNotEmpty)
        .toList();
  }

  Future<String> uploadExerciseInstructionMedia({
    required List<int> bytes,
    required String filename,
    void Function(int sent, int total)? onSendProgress,
  }) async {
    try {
      final response = await _dio.post(
        '/uploads/exercise-media',
        data: FormData.fromMap({
          'file': MultipartFile.fromBytes(bytes, filename: filename),
        }),
        onSendProgress: onSendProgress,
      );
      final map = ApiResponseParser.extractMap(response.data);
      final url = ApiResponseParser.readString(map ?? {}, const [
        'url',
        'file_url',
        'fileUrl',
      ]);
      if (url == null || url.isEmpty) {
        throw Exception('Invalid upload response: missing file URL');
      }
      return url;
    } on DioException catch (error) {
      throw Exception(_readExerciseError(error, fallback: 'Failed to upload media.'));
    }
  }

  Future<SpecialistExerciseItem> createExercise(
    UpsertExerciseRequest request,
  ) async {
    try {
      final response = await _dio.post(
        '/exercises',
        data: request.toCreateJson(),
      );
      final map = ApiResponseParser.extractMap(response.data);
      if (map == null) {
        throw Exception('Exercise create returned no data');
      }
      return SpecialistExerciseItem.fromMap(map);
    } on DioException catch (error) {
      throw Exception(
        _readExerciseError(error, fallback: 'Failed to create exercise.'),
      );
    }
  }

  Future<SpecialistExerciseItem> updateExercise({
    required String exerciseId,
    required UpsertExerciseRequest request,
  }) async {
    try {
      final response = await _dio.put(
        '/exercises/$exerciseId',
        data: request.toUpdateJson(),
      );
      final map = ApiResponseParser.extractMap(response.data);
      if (map == null) {
        throw Exception('Exercise update returned no data');
      }
      return SpecialistExerciseItem.fromMap(map);
    } on DioException catch (error) {
      throw Exception(
        _readExerciseError(error, fallback: 'Failed to update exercise.'),
      );
    }
  }

  String _readExerciseError(
    DioException error, {
    required String fallback,
  }) {
    final status = error.response?.statusCode;
    final data = error.response?.data;
    String? message;
    if (data is Map) {
      final map = data.map((key, value) => MapEntry(key.toString(), value));
      message = ApiResponseParser.readString(map, const ['message', 'error']);
    }
    if (message != null && message.trim().isNotEmpty) {
      return message.trim();
    }
    if (status == 401) {
      return 'Please sign in to continue.';
    }
    if (status == 403) {
      return 'You do not have permission to perform this action.';
    }
    if (status == 404) {
      return 'Exercise or category was not found.';
    }
    if (status == 409) {
      return 'This exercise cannot be changed because it is in use.';
    }
    if (status == 413) {
      return 'File is too large. Maximum allowed size is 50 MB.';
    }
    return fallback;
  }

  Future<AssignedExerciseResult> createAssignedExercise(
    CreateAssignedExerciseRequest request,
  ) async {
    try {
      final response = await _dio.post(
        '/assigned-exercises',
        data: request.toJson(),
      );
      final envelope = ApiResponseParser.asMap(response.data);
      final data = envelope != null
          ? ApiResponseParser.asMap(envelope['data'])
          : ApiResponseParser.extractMap(response.data);
      if (data == null) {
        throw Exception('Assignment returned no data');
      }
      return AssignedExerciseResult.fromMap(data);
    } on DioException catch (error) {
      throw Exception(_readAssignedExerciseError(error));
    }
  }

  String _readAssignedExerciseError(DioException error) {
    final status = error.response?.statusCode;
    final data = error.response?.data;
    String? message;
    if (data is Map) {
      final map = data.map((key, value) => MapEntry(key.toString(), value));
      message = ApiResponseParser.readString(map, const ['message', 'error']);
    }

    if (status == 400) {
      return message?.trim().isNotEmpty == true
          ? message!.trim()
          : 'Invalid assignment details. Check exercise, plan, and dates.';
    }
    if (status == 403) {
      return 'You do not have permission to assign this exercise.';
    }
    if (status == 404) {
      return message?.trim().isNotEmpty == true
          ? message!.trim()
          : 'Exercise, patient, or treatment plan was not found.';
    }
    if (status == 409) {
      return message?.trim().isNotEmpty == true
          ? message!.trim()
          : 'This exercise may already be assigned.';
    }
    if (message != null && message.trim().isNotEmpty) {
      return message.trim();
    }
    return 'Failed to assign exercise. Please try again.';
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
