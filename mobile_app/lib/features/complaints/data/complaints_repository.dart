import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/services/api_client.dart';
import '../../../core/utils/api_response_parser.dart';
import '../../dashboard/data/session_requests_repository.dart';
import '../../dashboard/models/admin_assignments_models.dart';
import '../../dashboard/providers/session_requests_provider.dart';
import '../models/complaint_models.dart';

class ComplaintsRepository {
  ComplaintsRepository(this._dio, this._sessionRequestsRepository);

  final Dio _dio;
  final SessionRequestsRepository _sessionRequestsRepository;

  Future<ComplaintItem> createComplaint(CreateComplaintPayload payload) async {
    final response = await _dio.post('/complaints', data: payload.toJson());
    final map = ApiResponseParser.extractMap(response.data) ?? const {};
    return ComplaintItem.fromMap(map);
  }

  Future<List<ComplaintItem>> fetchMyComplaints() async {
    final response = await _dio.get('/complaints/my');
    final rows = ApiResponseParser.extractList(response.data);
    return rows
        .whereType<Map>()
        .map(
          (item) => ComplaintItem.fromMap(
            item.map((key, value) => MapEntry(key.toString(), value)),
          ),
        )
        .toList(growable: false);
  }

  Future<ComplaintItem> fetchMyComplaintById(String complaintId) async {
    final response = await _dio.get('/complaints/$complaintId');
    final map = ApiResponseParser.extractMap(response.data) ?? const {};
    return ComplaintItem.fromMap(map);
  }

  Future<AdminComplaintsPage> fetchAdminComplaints({
    ComplaintStatus? status,
    String? specialistId,
    ComplaintCategory? category,
    DateTime? from,
    DateTime? to,
    int page = 1,
    int limit = 20,
  }) async {
    final response = await _dio.get(
      '/admin/complaints',
      queryParameters: {
        if (status != null) 'status': status.apiValue,
        if (specialistId != null && specialistId.isNotEmpty)
          'specialist_id': specialistId,
        if (category != null) 'category': category.apiValue,
        if (from != null) 'from': from.toIso8601String(),
        if (to != null) 'to': to.toIso8601String(),
        'page': page,
        'limit': limit,
      },
    );
    final map = ApiResponseParser.extractMap(response.data) ?? const {};
    return AdminComplaintsPage.fromMap(map);
  }

  Future<ComplaintItem> fetchAdminComplaintById(String complaintId) async {
    final response = await _dio.get('/admin/complaints/$complaintId');
    final map = ApiResponseParser.extractMap(response.data) ?? const {};
    return ComplaintItem.fromMap(map);
  }

  Future<ComplaintItem> startReview(String complaintId) async {
    final response = await _dio.patch('/admin/complaints/$complaintId/start-review');
    final map = ApiResponseParser.extractMap(response.data) ?? const {};
    return ComplaintItem.fromMap(map);
  }

  Future<ComplaintItem> resolveComplaint({
    required String complaintId,
    required String adminNotes,
    String? parentResponse,
  }) async {
    final response = await _dio.patch(
      '/admin/complaints/$complaintId/resolve',
      data: {
        'admin_notes': adminNotes.trim(),
        if (parentResponse != null && parentResponse.trim().isNotEmpty)
          'parent_response': parentResponse.trim(),
      },
    );
    final map = ApiResponseParser.extractMap(response.data) ?? const {};
    final complaintMap = map['complaint'] as Map<String, dynamic>? ?? map;
    return ComplaintItem.fromMap(
      complaintMap.map((key, value) => MapEntry(key.toString(), value)),
    );
  }

  Future<ComplaintItem> rejectComplaint({
    required String complaintId,
    required String adminNotes,
    String? parentResponse,
  }) async {
    final response = await _dio.patch(
      '/admin/complaints/$complaintId/reject',
      data: {
        'admin_notes': adminNotes.trim(),
        if (parentResponse != null && parentResponse.trim().isNotEmpty)
          'parent_response': parentResponse.trim(),
      },
    );
    final map = ApiResponseParser.extractMap(response.data) ?? const {};
    return ComplaintItem.fromMap(map);
  }

  Future<String> uploadAttachment({
    required List<int> bytes,
    required String filename,
  }) async {
    final response = await _dio.post(
      '/uploads/complaint-attachment',
      data: FormData.fromMap({
        'file': MultipartFile.fromBytes(bytes, filename: filename),
      }),
    );
    final map = ApiResponseParser.extractMap(response.data) ?? const {};
    return ApiResponseParser.readString(map, const ['url']) ?? '';
  }

  Future<List<PatientSpecialistLink>> fetchSpecialistsForPatient(
    String patientId,
  ) {
    return _sessionRequestsRepository.fetchPatientSpecialists(patientId);
  }
}

final complaintsRepositoryProvider = Provider<ComplaintsRepository>((ref) {
  return ComplaintsRepository(
    ref.watch(dioProvider),
    ref.watch(sessionRequestsRepositoryProvider),
  );
});
