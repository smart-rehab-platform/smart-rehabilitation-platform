import 'package:dio/dio.dart';

import '../../../core/utils/api_response_parser.dart';

class AdminPreviousSession {
  const AdminPreviousSession({required this.id, this.scheduledAt, this.status});

  final String id;
  final DateTime? scheduledAt;
  final String? status;

  factory AdminPreviousSession.fromMap(Map<String, dynamic>? map) {
    if (map == null) {
      return const AdminPreviousSession(id: '');
    }

    return AdminPreviousSession(
      id: ApiResponseParser.readString(map, const ['id']) ?? '',
      scheduledAt: ApiResponseParser.readDate(
        map['scheduled_at'] ?? map['scheduledAt'],
      ),
      status: ApiResponseParser.readString(map, const ['status']),
    );
  }
}

class AdminPatientRecord {
  const AdminPatientRecord({
    required this.id,
    required this.fullName,
    this.gender,
    this.condition,
    this.profileImageUrl,
    this.previousSession,
  });

  final String id;
  final String fullName;
  final String? gender;
  final String? condition;
  final String? profileImageUrl;
  final AdminPreviousSession? previousSession;

  factory AdminPatientRecord.fromMap(Map<String, dynamic> map) {
    final previousRaw = ApiResponseParser.extractMap(map['previous_session']);

    return AdminPatientRecord(
      id: ApiResponseParser.readString(map, const ['id']) ?? '',
      fullName:
          ApiResponseParser.readString(map, const ['full_name', 'fullName']) ??
          'Patient',
      gender: ApiResponseParser.readString(map, const ['gender']),
      condition: ApiResponseParser.readString(map, const [
        'condition',
        'diagnosis_title',
        'diagnosisTitle',
      ]),
      profileImageUrl: ApiResponseParser.readString(map, const [
        'profile_image_url',
        'profileImageUrl',
        'child_image_url',
        'childImageUrl',
      ]),
      previousSession: previousRaw != null && previousRaw['id'] != null
          ? AdminPreviousSession.fromMap(previousRaw)
          : null,
    );
  }
}

class AdminSessionRecord {
  const AdminSessionRecord({
    required this.id,
    required this.patientName,
    required this.specialistName,
    this.scheduledAt,
    this.durationMinutes,
    this.locationOrLink,
    this.status,
    this.cancellationReason,
  });

  final String id;
  final String patientName;
  final String specialistName;
  final DateTime? scheduledAt;
  final int? durationMinutes;
  final String? locationOrLink;
  final String? status;
  final String? cancellationReason;

  factory AdminSessionRecord.fromMap(Map<String, dynamic> map) {
    return AdminSessionRecord(
      id: ApiResponseParser.readString(map, const ['id']) ?? '',
      patientName:
          ApiResponseParser.readString(map, const [
            'patient_name',
            'patientName',
          ]) ??
          'Patient',
      specialistName:
          ApiResponseParser.readString(map, const [
            'specialist_name',
            'specialistName',
          ]) ??
          'Specialist',
      scheduledAt: ApiResponseParser.readDate(
        map['scheduled_at'] ?? map['scheduledAt'],
      ),
      durationMinutes: ApiResponseParser.readInt(map, const [
        'duration_minutes',
        'durationMinutes',
      ]),
      locationOrLink: ApiResponseParser.readString(map, const [
        'location_or_link',
        'locationOrLink',
      ]),
      status: ApiResponseParser.readString(map, const ['status']),
      cancellationReason: ApiResponseParser.readString(map, const [
        'cancellation_reason',
        'cancellationReason',
      ]),
    );
  }
}

class AdminAiCenterData {
  const AdminAiCenterData({
    this.speechTotal = 0,
    this.speechAverageScore = 0,
    this.recommendationsTotal = 0,
    this.reportsTotal = 0,
    this.latestSpeech = const [],
    this.latestRecommendations = const [],
    this.latestReports = const [],
    this.patientsNeedingAttention = const [],
    this.usageStatistics = const {},
  });

  final int speechTotal;
  final double speechAverageScore;
  final int recommendationsTotal;
  final int reportsTotal;
  final List<Map<String, dynamic>> latestSpeech;
  final List<Map<String, dynamic>> latestRecommendations;
  final List<Map<String, dynamic>> latestReports;
  final List<Map<String, dynamic>> patientsNeedingAttention;
  final Map<String, dynamic> usageStatistics;

  factory AdminAiCenterData.fromMap(Map<String, dynamic> map) {
    final speech = ApiResponseParser.extractMap(map['speech']) ?? {};
    final recommendations =
        ApiResponseParser.extractMap(map['recommendations']) ?? {};
    final reports = ApiResponseParser.extractMap(map['reports']) ?? {};

    return AdminAiCenterData(
      speechTotal: ApiResponseParser.readInt(speech, const ['total']) ?? 0,
      speechAverageScore: _readDouble(
        speech['average_score'] ?? speech['averageScore'],
      ),
      recommendationsTotal:
          ApiResponseParser.readInt(recommendations, const ['total']) ?? 0,
      reportsTotal: ApiResponseParser.readInt(reports, const ['total']) ?? 0,
      latestSpeech: _mapList(speech['latest']),
      latestRecommendations: _mapList(recommendations['latest']),
      latestReports: _mapList(reports['latest']),
      patientsNeedingAttention: _mapList(map['patients_needing_attention']),
      usageStatistics:
          ApiResponseParser.extractMap(map['usage_statistics']) ?? {},
    );
  }

  static double _readDouble(Object? value) {
    if (value is num) {
      return value.toDouble();
    }
    if (value is String) {
      return double.tryParse(value) ?? 0;
    }
    return 0;
  }

  static List<Map<String, dynamic>> _mapList(Object? value) {
    if (value is! List) {
      return const [];
    }

    return value
        .whereType<Map>()
        .map((item) => item.map((key, val) => MapEntry(key.toString(), val)))
        .toList();
  }
}

class AdminAuditLogRecord {
  const AdminAuditLogRecord({
    required this.id,
    required this.action,
    this.userName,
    this.userEmail,
    this.entityName,
    this.entityId,
    this.createdAt,
  });

  final String id;
  final String action;
  final String? userName;
  final String? userEmail;
  final String? entityName;
  final String? entityId;
  final DateTime? createdAt;

  factory AdminAuditLogRecord.fromMap(Map<String, dynamic> map) {
    return AdminAuditLogRecord(
      id: ApiResponseParser.readString(map, const ['id']) ?? '',
      action: ApiResponseParser.readString(map, const ['action']) ?? 'action',
      userName: ApiResponseParser.readString(map, const [
        'user_name',
        'userName',
        'full_name',
      ]),
      userEmail: ApiResponseParser.readString(map, const [
        'user_email',
        'userEmail',
        'email',
      ]),
      entityName: ApiResponseParser.readString(map, const [
        'entity_name',
        'entityName',
      ]),
      entityId: ApiResponseParser.readString(map, const [
        'entity_id',
        'entityId',
      ]),
      createdAt: ApiResponseParser.readDate(
        map['created_at'] ?? map['createdAt'],
      ),
    );
  }
}

class AdminFeaturesRepository {
  AdminFeaturesRepository(this._dio);

  final Dio _dio;

  Future<List<AdminPatientRecord>> fetchPatients() async {
    final response = await _dio.get('/dashboard/admin/patients');
    return ApiResponseParser.extractList(response.data)
        .whereType<Map>()
        .map(
          (item) => item.map((key, value) => MapEntry(key.toString(), value)),
        )
        .map(AdminPatientRecord.fromMap)
        .toList();
  }

  Future<List<AdminSessionRecord>> fetchSessions() async {
    final response = await _dio.get('/sessions');
    return ApiResponseParser.extractList(response.data)
        .whereType<Map>()
        .map(
          (item) => item.map((key, value) => MapEntry(key.toString(), value)),
        )
        .map(AdminSessionRecord.fromMap)
        .toList();
  }

  Future<AdminSessionRecord> updateSession({
    required String id,
    DateTime? scheduledAt,
    int? durationMinutes,
    String? locationOrLink,
    String? status,
    String? cancellationReason,
  }) async {
    final response = await _dio.put(
      '/sessions/$id',
      data: {
        if (scheduledAt != null) 'scheduled_at': scheduledAt.toIso8601String(),
        if (durationMinutes != null) 'duration_minutes': durationMinutes,
        if (locationOrLink != null) 'location_or_link': locationOrLink,
        if (status != null) 'status': status,
        if (cancellationReason != null)
          'cancellation_reason': cancellationReason,
      },
    );

    final map = ApiResponseParser.extractMap(response.data) ?? {};
    final sessionMap = ApiResponseParser.extractMap(map['data']) ?? map;
    return AdminSessionRecord.fromMap(sessionMap);
  }

  Future<AdminSessionRecord> completeSession(String id) async {
    final response = await _dio.patch('/sessions/$id/complete');
    final map = ApiResponseParser.extractMap(response.data) ?? {};
    final sessionMap = ApiResponseParser.extractMap(map['data']) ?? map;
    return AdminSessionRecord.fromMap(sessionMap);
  }

  Future<AdminSessionRecord> cancelSession(String id, {String? reason}) async {
    final response = await _dio.patch(
      '/sessions/$id/cancel',
      data: {if (reason != null) 'cancellation_reason': reason},
    );
    final map = ApiResponseParser.extractMap(response.data) ?? {};
    final sessionMap = ApiResponseParser.extractMap(map['data']) ?? map;
    return AdminSessionRecord.fromMap(sessionMap);
  }

  Future<AdminSessionRecord> markNoShow(String id) async {
    final response = await _dio.patch('/sessions/$id/no-show');
    final map = ApiResponseParser.extractMap(response.data) ?? {};
    final sessionMap = ApiResponseParser.extractMap(map['data']) ?? map;
    return AdminSessionRecord.fromMap(sessionMap);
  }

  Future<AdminAiCenterData> fetchAiCenter() async {
    final response = await _dio.get('/dashboard/admin/ai-center');
    final map = ApiResponseParser.extractMap(response.data) ?? {};
    final dataMap = ApiResponseParser.extractMap(map['data']) ?? map;
    return AdminAiCenterData.fromMap(dataMap);
  }

  Future<List<AdminAuditLogRecord>> fetchAuditLogs({
    String? userId,
    String? action,
    String? entityName,
    String? dateFrom,
    String? dateTo,
  }) async {
    final response = await _dio.get(
      '/audit-logs',
      queryParameters: {
        if (userId != null && userId.isNotEmpty) 'user_id': userId,
        if (action != null && action.isNotEmpty) 'action': action,
        if (entityName != null && entityName.isNotEmpty)
          'entity_name': entityName,
        if (dateFrom != null && dateFrom.isNotEmpty) 'date_from': dateFrom,
        if (dateTo != null && dateTo.isNotEmpty) 'date_to': dateTo,
      },
    );

    return ApiResponseParser.extractList(response.data)
        .whereType<Map>()
        .map(
          (item) => item.map((key, value) => MapEntry(key.toString(), value)),
        )
        .map(AdminAuditLogRecord.fromMap)
        .toList();
  }

  String readErrorMessage(DioException error) {
    final data = error.response?.data;
    if (data is Map) {
      final normalized = data.map(
        (key, value) => MapEntry(key.toString(), value),
      );
      final message = ApiResponseParser.readString(normalized, const [
        'message',
        'error',
      ]);
      if (message != null) {
        return message;
      }
    }
    return error.message ?? 'Request failed.';
  }
}
