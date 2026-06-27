import 'package:dio/dio.dart';

import '../../../core/utils/api_response_parser.dart';
import '../models/specialist_dashboard_models.dart';
import '../models/specialist_feature_models.dart';
import 'specialist_dashboard_debug.dart';

/// Aggregated specialist dashboard payload from existing backend endpoints.
class SpecialistDashboardBundle {
  const SpecialistDashboardBundle({
    required this.overview,
    required this.patients,
    required this.pendingReviews,
    required this.todaySessions,
    required this.treatmentPlans,
    required this.progress,
  });

  final SpecialistOverviewData overview;
  final List<SpecialistPatientItem> patients;
  final List<SpecialistPendingReview> pendingReviews;
  final List<SpecialistSessionDetail> todaySessions;
  final List<SpecialistTreatmentPlanItem> treatmentPlans;
  final List<SpecialistPatientProgress> progress;
}

class SpecialistDashboardRepository {
  SpecialistDashboardRepository(this._dio);

  final Dio _dio;

  Future<Map<String, dynamic>?> _getMap(String path) async {
    try {
      final response = await _dio.get(path);
      return ApiResponseParser.extractMap(response.data);
    } on DioException catch (error) {
      SpecialistDashboardDebugLog.warning('GET $path failed: ${error.response?.statusCode}');
      return null;
    }
  }

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
      return const [];
    }
  }

  /// Loads all specialist dashboard sections from the correct backend sources.
  Future<SpecialistDashboardBundle> fetchDashboardBundle(String specialistUserId) async {
    SpecialistDashboardDebugLog.loadStart(specialistUserId);

    final patients = await _fetchAssignedPatients(specialistUserId);
    final patientIds = patients.map((patient) => patient.id).toSet();
    final patientNames = {
      for (final patient in patients) patient.id: patient.name,
    };

    final pendingReviews = await _fetchPendingReviews(specialistUserId);
    final allSessions = await _fetchSessions(specialistUserId);
    final todaySessions = allSessions.where((session) => session.isToday).toList();
    final treatmentPlans = await _fetchTreatmentPlans(specialistUserId);
    final progress = await _fetchProgressForPatients(patientIds, patientNames);

    final overview = SpecialistOverviewData(
      activeCases: patients.length,
      pendingReviews: pendingReviews.length,
      upcomingSessions: todaySessions.length,
      treatmentPlans: treatmentPlans.length,
    );

    // Prefer computed counts; merge backend overview only as secondary validation.
    final backendOverview = SpecialistOverviewData.fromMap(
      await _getMap('/dashboard/specialist/overview'),
    );
    if (backendOverview.activeCases > 0 && overview.activeCases == 0) {
      SpecialistDashboardDebugLog.warning(
        'Backend reports ${backendOverview.activeCases} active cases but '
        'GET /specialists/$specialistUserId/patients returned 0. '
        'Check patient_specialists links.',
      );
    }

    SpecialistDashboardDebugLog.counts(
      activeCases: overview.activeCases,
      pendingReviews: overview.pendingReviews,
      todaySessions: overview.upcomingSessions,
      treatmentPlans: overview.treatmentPlans,
      progress: progress.length,
    );

    return SpecialistDashboardBundle(
      overview: overview,
      patients: patients,
      pendingReviews: pendingReviews,
      todaySessions: todaySessions,
      treatmentPlans: treatmentPlans,
      progress: progress,
    );
  }

  /// GET /specialists/:id/patients — patient_specialists relationship only.
  Future<List<SpecialistPatientItem>> _fetchAssignedPatients(String specialistUserId) async {
    final rows = await _getList('/specialists/$specialistUserId/patients');
    return rows
        .map(SpecialistPatientItem.fromMap)
        .where((patient) => patient.id.isNotEmpty)
        .toList();
  }

  /// GET /specialists/:id/pending-reviews — pending submissions for assigned patients.
  Future<List<SpecialistPendingReview>> _fetchPendingReviews(String specialistUserId) async {
    final rows = await _getList('/specialists/$specialistUserId/pending-reviews');
    return rows.map(SpecialistPendingReview.fromMap).toList();
  }

  /// GET /specialists/:id/sessions — all specialist sessions (today filter applied by caller).
  Future<List<SpecialistSessionDetail>> _fetchSessions(String specialistUserId) async {
    final rows = await _getList('/specialists/$specialistUserId/sessions');
    if (rows.isEmpty) {
      // Fallback only when specialist route returns nothing — dashboard route lacks patient names.
      final fallbackRows = await _getList('/dashboard/specialist/upcoming-sessions');
      return fallbackRows.map(SpecialistSessionDetail.fromMap).toList();
    }
    return rows.map(SpecialistSessionDetail.fromMap).toList();
  }

  /// GET /treatment-plans filtered by specialist_id.
  Future<List<SpecialistTreatmentPlanItem>> _fetchTreatmentPlans(
    String specialistUserId,
  ) async {
    final rows = await _getList('/treatment-plans');
    return rows
        .map(SpecialistTreatmentPlanItem.fromMap)
        .where((plan) => plan.specialistId == specialistUserId)
        .toList();
  }

  /// GET /progress-snapshots filtered to assigned patients with resolved names.
  Future<List<SpecialistPatientProgress>> _fetchProgressForPatients(
    Set<String> patientIds,
    Map<String, String> patientNames,
  ) async {
    if (patientIds.isEmpty) {
      SpecialistDashboardDebugLog.endpoint('progress-snapshots', 0, note: 'no assigned patients');
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

      final item = SpecialistPatientProgress.fromSnapshot(
        row,
        patientName: patientNames[patientId],
      );
      latestByPatient[patientId] = item;
    }

    return latestByPatient.values.take(5).toList();
  }

  // Legacy methods kept for compatibility with list screens / provider refresh patterns.
  Future<SpecialistOverviewData> fetchOverview(String specialistUserId) async {
    final bundle = await fetchDashboardBundle(specialistUserId);
    return bundle.overview;
  }

  Future<List<SpecialistPendingReview>> fetchPendingReviews(String specialistUserId) async {
    return _fetchPendingReviews(specialistUserId);
  }

  Future<List<SpecialistScheduleItem>> fetchUpcomingSessions(String specialistUserId) async {
    final sessions = await _fetchSessions(specialistUserId);
    return sessions
        .where((session) => session.isToday)
        .map(
          (session) => SpecialistScheduleItem(
            timeLabel: session.timeLabel,
            patientName: session.patientName,
            sessionType: session.displaySubtitle,
          ),
        )
        .take(5)
        .toList();
  }

  Future<List<SpecialistPatientProgress>> fetchRecentProgress(String specialistUserId) async {
    final patients = await _fetchAssignedPatients(specialistUserId);
    final patientIds = patients.map((patient) => patient.id).toSet();
    final patientNames = {
      for (final patient in patients) patient.id: patient.name,
    };
    return _fetchProgressForPatients(patientIds, patientNames);
  }
}
