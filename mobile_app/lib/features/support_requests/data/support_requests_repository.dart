import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/services/api_client.dart';
import '../../../core/utils/api_response_parser.dart';
import '../models/support_request_models.dart';

class SupportRequestsRepository {
  SupportRequestsRepository(this._dio);

  final Dio _dio;

  Future<SupportRequestItem> createSupportRequest(
    CreateSupportRequestPayload payload,
  ) async {
    final response = await _dio.post('/support-requests', data: payload.toJson());
    final map = ApiResponseParser.extractMap(response.data) ?? const {};
    return SupportRequestItem.fromMap(map);
  }

  Future<List<SupportRequestItem>> fetchMySupportRequests({
    SupportRequestStatus? status,
    SupportRequestCategory? category,
  }) async {
    final response = await _dio.get(
      '/support-requests/my',
      queryParameters: {
        if (status != null) 'status': status.apiValue,
        if (category != null) 'category': category.apiValue,
      },
    );
    final rows = ApiResponseParser.extractList(response.data);
    return rows
        .whereType<Map>()
        .map(
          (item) => SupportRequestItem.fromMap(
            item.map((key, value) => MapEntry(key.toString(), value)),
          ),
        )
        .toList(growable: false);
  }

  Future<SupportRequestItem> fetchMySupportRequestById(String requestId) async {
    final response = await _dio.get('/support-requests/$requestId');
    final map = ApiResponseParser.extractMap(response.data) ?? const {};
    return SupportRequestItem.fromMap(map);
  }

  Future<SupportRequestItem> addSpecialistMessage({
    required String requestId,
    required CreateSupportRequestMessagePayload payload,
  }) async {
    final response = await _dio.post(
      '/support-requests/$requestId/messages',
      data: payload.toJson(),
    );
    final map = ApiResponseParser.extractMap(response.data) ?? const {};
    return SupportRequestItem.fromMap(map);
  }

  Future<AdminSupportRequestsPage> fetchAdminSupportRequests({
    SupportRequestStatus? status,
    SupportRequestCategory? category,
    String? specialistId,
    int page = 1,
    int limit = supportRequestPageLimit,
  }) async {
    final response = await _dio.get(
      '/admin/support-requests',
      queryParameters: {
        if (status != null) 'status': status.apiValue,
        if (category != null) 'category': category.apiValue,
        if (specialistId != null && specialistId.isNotEmpty)
          'specialist_id': specialistId,
        'page': page,
        'limit': limit,
      },
    );
    final map = ApiResponseParser.extractMap(response.data) ?? const {};
    return AdminSupportRequestsPage.fromMap(map);
  }

  Future<SupportRequestItem> fetchAdminSupportRequestById(String requestId) async {
    final response = await _dio.get('/admin/support-requests/$requestId');
    final map = ApiResponseParser.extractMap(response.data) ?? const {};
    return SupportRequestItem.fromMap(map);
  }

  Future<SupportRequestItem> addAdminMessage({
    required String requestId,
    required CreateSupportRequestMessagePayload payload,
  }) async {
    final response = await _dio.post(
      '/admin/support-requests/$requestId/messages',
      data: payload.toJson(),
    );
    final map = ApiResponseParser.extractMap(response.data) ?? const {};
    return SupportRequestItem.fromMap(map);
  }

  Future<SupportRequestItem> updateAdminStatus({
    required String requestId,
    required SupportRequestStatus status,
  }) async {
    final response = await _dio.patch(
      '/admin/support-requests/$requestId/status',
      data: {'status': status.apiValue},
    );
    final map = ApiResponseParser.extractMap(response.data) ?? const {};
    return SupportRequestItem.fromMap(map);
  }

  Future<String> uploadAttachment({
    required List<int> bytes,
    required String filename,
  }) async {
    final response = await _dio.post(
      '/uploads/support-request-attachment',
      data: FormData.fromMap({
        'file': MultipartFile.fromBytes(bytes, filename: filename),
      }),
    );
    final map = ApiResponseParser.extractMap(response.data) ?? const {};
    return ApiResponseParser.readString(map, const ['url']) ?? '';
  }
}

final supportRequestsRepositoryProvider = Provider<SupportRequestsRepository>(
  (ref) => SupportRequestsRepository(ref.watch(dioProvider)),
);
