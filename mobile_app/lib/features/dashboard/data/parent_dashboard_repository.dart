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

    // Fallback: derive children from dashboard progress endpoint.
    final progressRows = await _safeGetList('/dashboard/parent/children-progress');
    final unique = <String, ParentChild>{};
    for (final row in progressRows) {
      final child = ParentChild.fromMap(row);
      if (child.id.isNotEmpty) {
        unique[child.id] = child;
      }
    }
    return unique.values.toList();
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

  Future<int> fetchUnreadNotificationCount(String userId) async {
    final rows = await _safeGetList('/users/$userId/notifications/unread');
    return rows.length;
  }

  Future<List<ParentNotificationItem>> fetchNotifications(String userId) async {
    final rows = await _safeGetList('/users/$userId/notifications');
    return rows.map(ParentNotificationItem.fromMap).toList();
  }
}
