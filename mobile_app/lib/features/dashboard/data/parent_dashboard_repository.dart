import 'package:dio/dio.dart';

import '../../../core/utils/api_response_parser.dart';
import '../models/parent_dashboard_models.dart';

/// Parent dashboard API access layer. Uses existing Dio client and auth token.
class ParentDashboardRepository {
  ParentDashboardRepository(this._dio);

  final Dio _dio;

  Future<Map<String, dynamic>?> _safeGetMap(String path) async {
    try {
      final response = await _dio.get(path);
      return ApiResponseParser.extractMap(response.data);
    } on DioException {
      return null;
    } catch (_) {
      return null;
    }
  }

  Future<List<Map<String, dynamic>>> _safeGetList(String path) async {
    try {
      final response = await _dio.get(path);
      return ApiResponseParser.extractList(response.data)
          .whereType<Map>()
          .map((item) => item.map((key, value) => MapEntry(key.toString(), value)))
          .toList();
    } on DioException {
      return const [];
    } catch (_) {
      return const [];
    }
  }

  Future<ParentOverviewData> fetchOverview() async {
    final map = await _safeGetMap('/dashboard/parent/overview');
    return ParentOverviewData.fromMap(map);
  }

  /// Backend route: GET /parents/:id/patients (children linked to parent user id).
  Future<List<ParentChild>> fetchChildren(String parentUserId) async {
    final patients = await _safeGetList('/parents/$parentUserId/patients');
    if (patients.isNotEmpty) {
      return patients.map(ParentChild.fromMap).where((c) => c.id.isNotEmpty).toList();
    }
    return const [];
  }

  Future<List<ParentChild>> fetchChildrenProgress() async {
    final rows = await _safeGetList('/dashboard/parent/children-progress');
    final unique = <String, ParentChild>{};
    for (final row in rows) {
      final child = ParentChild.fromMap(row);
      if (child.id.isNotEmpty) {
        unique[child.id] = child;
      }
    }
    return unique.values.toList();
  }

  Future<List<ParentDailyTask>> fetchDailyTasks(String patientId) async {
    final rows = await _safeGetList('/patients/$patientId/daily-tasks');
    return rows.map(ParentDailyTask.fromMap).toList();
  }

  Future<List<ParentDailyTask>> fetchWeeklyTasks(String patientId) async {
    final rows = await _safeGetList('/patients/$patientId/weekly-tasks');
    return rows.map(ParentDailyTask.fromMap).toList();
  }

  Future<List<ParentAssignedExercise>> fetchAssignedExercises(String patientId) async {
    final rows = await _safeGetList('/patients/$patientId/assigned-exercises');
    return rows.map(ParentAssignedExercise.fromMap).toList();
  }

  Future<List<ParentDailyTask>> fetchParentTasks() async {
    final rows = await _safeGetList('/dashboard/parent/tasks');
    return rows.map(ParentDailyTask.fromMap).toList();
  }

  Future<List<ParentSessionItem>> fetchParentSessions(String parentUserId) async {
    final rows = await _safeGetList('/parents/$parentUserId/sessions');
    return rows.map(ParentSessionItem.fromMap).toList();
  }

  Future<List<ParentSubmissionItem>> fetchSubmissions(String patientId) async {
    final rows = await _safeGetList('/patients/$patientId/submissions');
    return rows.map(ParentSubmissionItem.fromMap).toList();
  }

  Future<List<ParentReportItem>> fetchPatientReports(String patientId) async {
    final rows = await _safeGetList('/patients/$patientId/reports');
    return rows.map(ParentReportItem.fromMap).toList();
  }

  Future<List<ParentReportItem>> fetchParentReports() async {
    final rows = await _safeGetList('/dashboard/parent/reports');
    return rows.map(ParentReportItem.fromMap).toList();
  }

  Future<ParentAiInsight?> fetchAiInsight(String patientId, String childName) async {
    final rows = await _safeGetList('/ai/recommendations/patient/$patientId');
    if (rows.isEmpty) {
      return null;
    }
    final insight = ParentAiInsight.fromRecommendation(rows.first);
    if (!insight.message.contains(childName) && childName.isNotEmpty) {
      return ParentAiInsight(
        message: '$childName is improving steadily. ${
            insight.message.split(':').last.trim()}',
        type: insight.type,
      );
    }
    return insight;
  }

  Future<ParentSpecialistFeedback?> fetchLatestFeedback(String patientId) async {
    final rows = await _safeGetList('/patients/$patientId/reviews');
    if (rows.isEmpty) {
      return null;
    }
    return ParentSpecialistFeedback.fromMap(rows.first);
  }

  Future<ParentSpeechSummary?> fetchSpeechSummary(String patientId) async {
    final analyses = await _safeGetList('/speech-analyses/patients/$patientId');
    if (analyses.isNotEmpty) {
      final latest = ParentSpeechSummary.fromAnalysis(analyses.first);
      if (latest.overallScore != null) {
        return latest;
      }
    }

    final progressMap = await _safeGetMap('/speech-analyses/patients/$patientId/progress');
    if (progressMap != null) {
      return ParentSpeechSummary.fromAnalysis(progressMap);
    }
    return null;
  }

  Future<double?> fetchImprovementPercentage(String patientId) async {
    final map = await _safeGetMap('/patients/$patientId/improvement-percentage');
    if (map == null) {
      return null;
    }
    return ApiResponseParser.readDouble(map, const [
      'improvement_percentage',
      'improvementPercentage',
      'percentage',
    ]);
  }

  Future<List<Map<String, dynamic>>> fetchWeeklyProgress(String patientId) async {
    return _safeGetList('/patients/$patientId/progress/weekly');
  }

  Future<List<ParentProgressSnapshot>> fetchProgress(String patientId) async {
    final rows = await _safeGetList('/patients/$patientId/progress');
    return rows.map(ParentProgressSnapshot.fromMap).toList();
  }

  Future<List<ParentProgressSnapshot>> fetchDailyProgress(String patientId) async {
    final rows = await _safeGetList('/patients/$patientId/progress/daily');
    return rows.map(ParentProgressSnapshot.fromMap).toList();
  }

  Future<List<ParentProgressSnapshot>> fetchMonthlyProgress(String patientId) async {
    final rows = await _safeGetList('/patients/$patientId/progress/monthly');
    return rows.map(ParentProgressSnapshot.fromMap).toList();
  }

  Future<ParentPerformanceMetrics> fetchPerformanceMetrics(String patientId) async {
    final map = await _safeGetMap('/patients/$patientId/performance-metrics');
    return ParentPerformanceMetrics.fromMap(map);
  }

  static const Set<String> _validJourneyPeriods = {'weekly', 'monthly', 'full'};

  static bool isValidJourneyPeriod(String period) {
    return _validJourneyPeriods.contains(period.trim().toLowerCase());
  }

  static String normalizeJourneyPeriod(String period) {
    final normalized = period.trim().toLowerCase();
    return _validJourneyPeriods.contains(normalized) ? normalized : 'weekly';
  }

  Future<ParentTreatmentJourney> fetchTreatmentJourney(
    String patientId, {
    String period = 'weekly',
  }) async {
    final normalizedPeriod = normalizeJourneyPeriod(period);

    try {
      final response = await _dio.get(
        '/patients/$patientId/treatment-journey',
        queryParameters: {'period': normalizedPeriod},
      );
      final map = ApiResponseParser.extractMap(response.data);
      if (map == null || map.isEmpty) {
        throw Exception('Invalid treatment journey response');
      }
      return ParentTreatmentJourney.fromMap(map);
    } on DioException catch (error) {
      throw Exception(friendlyTreatmentJourneyError(error));
    }
  }

  /// Concise errors for treatment journey fetch failures.
  static String friendlyTreatmentJourneyError(DioException error) {
    final status = error.response?.statusCode;
    final data = error.response?.data;
    String? apiMessage;
    if (data is Map) {
      final map = data.map((key, value) => MapEntry(key.toString(), value));
      apiMessage =
          ApiResponseParser.readString(map, const ['message', 'error']);
    }

    if (status == 401) {
      return 'Please sign in to view treatment journey progress.';
    }
    if (status == 403) {
      return 'You do not have access to this child\'s treatment journey.';
    }
    if (status == 404) {
      return 'Treatment journey data was not found for this child.';
    }
    if (apiMessage != null &&
        apiMessage.trim().isNotEmpty &&
        !apiMessage.contains('DioException')) {
      return apiMessage.trim();
    }
    if (error.type == DioExceptionType.connectionTimeout ||
        error.type == DioExceptionType.receiveTimeout ||
        error.type == DioExceptionType.sendTimeout ||
        error.type == DioExceptionType.connectionError) {
      return 'Failed to load treatment journey. Please try again.';
    }
    return 'Failed to load treatment journey. Please try again.';
  }

  Future<List<ParentSpecialistFeedback>> fetchReviews(String patientId) async {
    final rows = await _safeGetList('/patients/$patientId/reviews');
    return rows
        .map((row) => ParentSpecialistFeedback.fromMap(row, patientId: patientId))
        .toList();
  }

  Future<ParentSpecialistFeedback?> fetchSubmissionReview(String submissionId) async {
    final map = await _safeGetMap('/exercise-submissions/$submissionId/review');
    if (map == null || map.isEmpty) {
      return null;
    }
    return ParentSpecialistFeedback.fromMap(map);
  }

  Future<String> createExerciseSubmission({
    required String assignedExerciseId,
    String? parentNotes,
  }) async {
    final response = await _dio.post(
      '/exercise-submissions',
      data: {
        'assigned_exercise_id': assignedExerciseId,
        if (parentNotes != null && parentNotes.trim().isNotEmpty)
          'parent_notes': parentNotes.trim(),
      },
    );
    final map = ApiResponseParser.extractMap(response.data);
    final id = ApiResponseParser.readString(map ?? {}, const ['id', '_id']);
    if (id == null || id.isEmpty) {
      throw Exception('Invalid submission response');
    }
    return id;
  }

  Future<String> uploadExerciseMediaFile(List<int> bytes, String filename) async {
    try {
      final response = await _dio.post(
        '/uploads/exercise-submission-media',
        data: FormData.fromMap({
          'file': MultipartFile.fromBytes(bytes, filename: filename),
        }),
      );
      final map = ApiResponseParser.extractMap(response.data);
      final url = ApiResponseParser.readString(map ?? {}, const [
        'url',
        'file_url',
      ]);
      if (url == null || url.isEmpty) {
        throw Exception('Failed to upload media. Please try again.');
      }
      return url;
    } on DioException catch (error) {
      throw Exception(friendlyExerciseSubmissionUploadError(error));
    }
  }

  /// Concise parent-facing upload errors (no DioException internals).
  static String friendlyExerciseSubmissionUploadError(DioException error) {
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
      return 'Please sign in to upload this file.';
    }
    if (status == 403) {
      return 'You do not have permission to upload this file.';
    }
    if (status == 413 ||
        lowerApi.contains('too large') ||
        lowerApi.contains('maximum allowed size')) {
      return 'The selected file is too large.';
    }
    if (status == 400 || status == 415) {
      if (lowerApi.contains('unsupported') ||
          lowerApi.contains('type') ||
          lowerApi.contains('allowed')) {
        return 'This file type is not supported.';
      }
      if (apiMessage != null &&
          apiMessage.trim().isNotEmpty &&
          !apiMessage.contains('DioException') &&
          !apiMessage.contains('validateStatus')) {
        return apiMessage.trim();
      }
      return 'This file type is not supported.';
    }
    if (error.type == DioExceptionType.connectionTimeout ||
        error.type == DioExceptionType.receiveTimeout ||
        error.type == DioExceptionType.sendTimeout ||
        error.type == DioExceptionType.connectionError) {
      return 'Failed to upload media. Please try again.';
    }
    return 'Failed to upload media. Please try again.';
  }

  Future<void> attachSubmissionMedia({
    required String submissionId,
    required String mediaType,
    required String fileUrl,
    int? durationSeconds,
  }) async {
    await _dio.post(
      '/exercise-submissions/$submissionId/media',
      data: {
        'media_type': mediaType,
        'file_url': fileUrl,
        if (durationSeconds != null) 'duration_seconds': durationSeconds,
      },
    );
  }

  Future<int> fetchUnreadNotificationCount(String userId) async {
    final rows = await _safeGetList('/users/$userId/notifications/unread');
    return rows.length;
  }

  Future<List<ParentNotificationItem>> fetchNotifications(String userId) async {
    final rows = await _safeGetList('/users/$userId/notifications');
    return rows.map(ParentNotificationItem.fromMap).toList();
  }

  Future<String?> markNotificationRead(String notificationId) async {
    try {
      await _dio.patch('/notifications/$notificationId/read');
      return null;
    } on DioException catch (error) {
      return _readPatchError(error);
    }
  }

  Future<String?> markAllNotificationsRead() async {
    try {
      await _dio.patch('/notifications/read-all');
      return null;
    } on DioException catch (error) {
      return _readPatchError(error);
    }
  }

  String _readPatchError(DioException error) {
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
