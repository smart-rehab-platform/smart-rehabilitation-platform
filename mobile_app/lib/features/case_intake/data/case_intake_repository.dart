import 'package:dio/dio.dart';

import '../../../core/utils/api_response_parser.dart';
import '../../dashboard/models/communication_models.dart';
import '../models/admin_case_inbox_models.dart';
import '../models/admin_case_request_detail_model.dart';
import '../models/assign_specialist_result_model.dart';
import '../models/case_category_model.dart';
import '../models/case_intake_request_model.dart';
import '../models/case_request_attachment_model.dart';
import '../models/matching_specialist_model.dart';
import '../models/specialist_assigned_case_models.dart';
import '../models/specialist_case_request_detail_model.dart';

class CaseIntakeApiException implements Exception {
  CaseIntakeApiException({required this.message, this.statusCode});

  final String message;
  final int? statusCode;

  @override
  String toString() => message;
}

class CaseIntakeRepository {
  CaseIntakeRepository(this._dio);

  final Dio _dio;

  static const _categoriesPath = '/case-categories';
  static const _requestsPath = '/case-intake-requests';
  static const _uploadPath = '/uploads/message-attachment';
  static const _childImageUploadPath = '/uploads/child-image';

  String _extractMessage(dynamic responseData, {String? fallback}) {
    final map = ApiResponseParser.asMap(responseData);
    if (map != null) {
      final message = ApiResponseParser.readString(map, const [
        'message',
        'error',
      ]);
      if (message != null && message.isNotEmpty) {
        return message;
      }
    }
    return fallback ?? 'Request failed';
  }

  Never _throwFromDio(DioException error, {String? fallback}) {
    throw CaseIntakeApiException(
      message: error.response?.data != null
          ? _extractMessage(
              error.response!.data,
              fallback: error.message ?? fallback ?? 'Request failed',
            )
          : (error.message ?? fallback ?? 'Request failed'),
      statusCode: error.response?.statusCode,
    );
  }

  Future<List<CaseCategory>> fetchActiveCategories() async {
    try {
      final response = await _dio.get(_categoriesPath);
      return ApiResponseParser.extractList(response.data)
          .whereType<Map>()
          .map(
            (item) => item.map((key, value) => MapEntry(key.toString(), value)),
          )
          .map(CaseCategory.fromMap)
          .where((category) => category.id.isNotEmpty && category.isActive)
          .toList();
    } on DioException catch (error) {
      _throwFromDio(error, fallback: 'Failed to load case categories');
    }
  }

  Future<AdminInboxPageResult> fetchAdminInbox(AdminInboxQuery query) async {
    try {
      final response = await _dio.get(
        '$_requestsPath/admin/inbox',
        queryParameters: query.toQueryParameters(),
      );
      final envelope = ApiResponseParser.asMap(response.data);
      if (envelope == null) {
        throw CaseIntakeApiException(message: 'Invalid admin inbox response');
      }

      final items = ApiResponseParser.extractList(response.data)
          .whereType<Map>()
          .map(
            (item) => item.map((key, value) => MapEntry(key.toString(), value)),
          )
          .map(AdminCaseInboxItem.fromMap)
          .where((item) => item.id.isNotEmpty)
          .toList();

      final paginationMap = ApiResponseParser.asMap(envelope['pagination']);
      final pagination = AdminInboxPagination.fromMap(paginationMap);

      return AdminInboxPageResult(items: items, pagination: pagination);
    } on CaseIntakeApiException {
      rethrow;
    } on DioException catch (error) {
      _throwFromDio(error, fallback: 'Failed to load admin case inbox');
    }
  }

  Future<AdminCaseRequestDetail> fetchAdminRequestById(String requestId) async {
    try {
      final response = await _dio.get('$_requestsPath/admin/$requestId');
      final map = ApiResponseParser.extractMap(response.data);
      if (map == null || map.isEmpty) {
        throw CaseIntakeApiException(
          message: 'Invalid admin case request response',
        );
      }
      final detail = AdminCaseRequestDetail.fromMap(map);
      if (detail.request.id.isEmpty) {
        throw CaseIntakeApiException(
          message: 'Invalid admin case request response',
        );
      }
      return detail;
    } on CaseIntakeApiException {
      rethrow;
    } on DioException catch (error) {
      _throwFromDio(error, fallback: 'Failed to load admin case request');
    }
  }

  Future<List<MatchingSpecialist>> fetchMatchingSpecialists(
    String requestId,
  ) async {
    try {
      final response = await _dio.get(
        '$_requestsPath/admin/$requestId/matching-specialists',
      );
      return ApiResponseParser.extractList(response.data)
          .whereType<Map>()
          .map(
            (item) => item.map((key, value) => MapEntry(key.toString(), value)),
          )
          .map(MatchingSpecialist.fromMap)
          .where((specialist) => specialist.id.isNotEmpty)
          .toList();
    } on CaseIntakeApiException {
      rethrow;
    } on DioException catch (error) {
      _throwFromDio(error, fallback: 'Failed to load matching specialists');
    }
  }

  Future<AssignSpecialistResult> assignSpecialist({
    required String requestId,
    required String specialistId,
  }) async {
    try {
      final response = await _dio.patch(
        '$_requestsPath/admin/$requestId/assign',
        data: {'specialist_id': specialistId},
      );
      final envelope = ApiResponseParser.asMap(response.data);
      if (envelope == null) {
        throw CaseIntakeApiException(
          message: 'Invalid assign specialist response',
        );
      }
      return AssignSpecialistResult.fromEnvelope(envelope);
    } on CaseIntakeApiException {
      rethrow;
    } on DioException catch (error) {
      _throwFromDio(error, fallback: 'Failed to assign specialist');
    }
  }

  Future<SpecialistAssignedPageResult> fetchSpecialistAssigned(
    SpecialistAssignedQuery query,
  ) async {
    try {
      final response = await _dio.get(
        '$_requestsPath/specialist/assigned',
        queryParameters: query.toQueryParameters(),
      );
      final envelope = ApiResponseParser.asMap(response.data);
      if (envelope == null) {
        throw CaseIntakeApiException(
          message: 'Invalid specialist assigned cases response',
        );
      }

      final items = ApiResponseParser.extractList(response.data)
          .whereType<Map>()
          .map(
            (item) => item.map((key, value) => MapEntry(key.toString(), value)),
          )
          .map(SpecialistAssignedCaseItem.fromMap)
          .where((item) => item.id.isNotEmpty)
          .toList();

      final paginationMap = ApiResponseParser.asMap(envelope['pagination']);
      final pagination = SpecialistAssignedPagination.fromMap(paginationMap);

      return SpecialistAssignedPageResult(items: items, pagination: pagination);
    } on CaseIntakeApiException {
      rethrow;
    } on DioException catch (error) {
      _throwFromDio(
        error,
        fallback: 'Failed to load specialist assigned cases',
      );
    }
  }

  Future<SpecialistCaseRequestDetail> fetchSpecialistRequestById(
    String requestId,
  ) async {
    try {
      final response = await _dio.get('$_requestsPath/specialist/$requestId');
      final map = ApiResponseParser.extractMap(response.data);
      if (map == null || map.isEmpty) {
        throw CaseIntakeApiException(
          message: 'Invalid specialist case request response',
        );
      }
      final detail = SpecialistCaseRequestDetail.fromMap(map);
      if (detail.request.id.isEmpty) {
        throw CaseIntakeApiException(
          message: 'Invalid specialist case request response',
        );
      }
      return detail;
    } on CaseIntakeApiException {
      rethrow;
    } on DioException catch (error) {
      _throwFromDio(error, fallback: 'Failed to load specialist case request');
    }
  }

  Future<SpecialistCaseRequestDetail> startAssessment(String requestId) async {
    try {
      final response = await _dio.patch(
        '$_requestsPath/specialist/$requestId/start-assessment',
      );
      final map = ApiResponseParser.extractMap(response.data);
      if (map == null || map.isEmpty) {
        throw CaseIntakeApiException(
          message: 'Invalid start assessment response',
        );
      }
      final detail = SpecialistCaseRequestDetail.fromMap(map);
      if (detail.request.id.isEmpty) {
        throw CaseIntakeApiException(
          message: 'Invalid start assessment response',
        );
      }
      return detail;
    } on CaseIntakeApiException {
      rethrow;
    } on DioException catch (error) {
      _throwFromDio(error, fallback: 'Failed to start assessment');
    }
  }

  Future<SpecialistCaseRequestDetail> updateAssessmentNotes({
    required String requestId,
    required String assessmentNotes,
  }) async {
    try {
      final response = await _dio.patch(
        '$_requestsPath/specialist/$requestId/assessment-notes',
        data: {'assessment_notes': assessmentNotes},
      );
      final map = ApiResponseParser.extractMap(response.data);
      if (map == null || map.isEmpty) {
        throw CaseIntakeApiException(
          message: 'Invalid assessment notes response',
        );
      }
      final detail = SpecialistCaseRequestDetail.fromMap(map);
      if (detail.request.id.isEmpty) {
        throw CaseIntakeApiException(
          message: 'Invalid assessment notes response',
        );
      }
      return detail;
    } on CaseIntakeApiException {
      rethrow;
    } on DioException catch (error) {
      _throwFromDio(error, fallback: 'Failed to update assessment notes');
    }
  }

  Future<SpecialistCaseRequestDetail> acceptCaseRequest(
    String requestId,
  ) async {
    try {
      final response = await _dio.patch(
        '$_requestsPath/specialist/$requestId/accept',
      );
      final map = ApiResponseParser.extractMap(response.data);
      if (map == null || map.isEmpty) {
        throw CaseIntakeApiException(
          message: 'Invalid accept case request response',
        );
      }
      final detail = SpecialistCaseRequestDetail.fromMap(map);
      if (detail.request.id.isEmpty) {
        throw CaseIntakeApiException(
          message: 'Invalid accept case request response',
        );
      }
      return detail;
    } on CaseIntakeApiException {
      rethrow;
    } on DioException catch (error) {
      _throwFromDio(error, fallback: 'Failed to accept case request');
    }
  }

  Future<SpecialistCaseRequestDetail> rejectCaseRequest({
    required String requestId,
    required String reason,
  }) async {
    try {
      final response = await _dio.patch(
        '$_requestsPath/specialist/$requestId/reject',
        data: {'reason': reason},
      );
      final map = ApiResponseParser.extractMap(response.data);
      if (map == null || map.isEmpty) {
        throw CaseIntakeApiException(
          message: 'Invalid reject case request response',
        );
      }
      final detail = SpecialistCaseRequestDetail.fromMap(map);
      if (detail.request.id.isEmpty) {
        throw CaseIntakeApiException(
          message: 'Invalid reject case request response',
        );
      }
      return detail;
    } on CaseIntakeApiException {
      rethrow;
    } on DioException catch (error) {
      _throwFromDio(error, fallback: 'Failed to reject case request');
    }
  }

  Future<List<CaseIntakeRequest>> fetchMyRequests() async {
    try {
      final response = await _dio.get('$_requestsPath/mine');
      return ApiResponseParser.extractList(response.data)
          .whereType<Map>()
          .map(
            (item) => item.map((key, value) => MapEntry(key.toString(), value)),
          )
          .map(CaseIntakeRequest.fromMap)
          .where((request) => request.id.isNotEmpty)
          .toList();
    } on DioException catch (error) {
      _throwFromDio(error, fallback: 'Failed to load case requests');
    }
  }

  Future<CaseIntakeRequest> fetchRequestById(String id) async {
    try {
      final response = await _dio.get('$_requestsPath/$id');
      final map = ApiResponseParser.extractMap(response.data);
      if (map == null || map.isEmpty) {
        throw CaseIntakeApiException(message: 'Invalid case request response');
      }
      return CaseIntakeRequest.fromMap(map);
    } on CaseIntakeApiException {
      rethrow;
    } on DioException catch (error) {
      _throwFromDio(error, fallback: 'Failed to load case request');
    }
  }

  Future<CaseIntakeRequest> createRequest(CaseIntakeRequestInput input) async {
    try {
      final response = await _dio.post(_requestsPath, data: input.toJson());
      final map = ApiResponseParser.extractMap(response.data);
      if (map == null || map.isEmpty) {
        throw CaseIntakeApiException(
          message: 'Invalid create request response',
        );
      }
      return CaseIntakeRequest.fromMap(map);
    } on CaseIntakeApiException {
      rethrow;
    } on DioException catch (error) {
      _throwFromDio(error, fallback: 'Failed to submit case request');
    }
  }

  Future<CaseIntakeRequest> updateRequest(
    String id,
    CaseIntakeRequestInput input,
  ) async {
    try {
      final response = await _dio.patch(
        '$_requestsPath/$id',
        data: input.toJson(),
      );
      final map = ApiResponseParser.extractMap(response.data);
      if (map == null || map.isEmpty) {
        throw CaseIntakeApiException(
          message: 'Invalid update request response',
        );
      }
      return CaseIntakeRequest.fromMap(map);
    } on CaseIntakeApiException {
      rethrow;
    } on DioException catch (error) {
      _throwFromDio(error, fallback: 'Failed to update case request');
    }
  }

  Future<UploadedMessageAttachment> uploadChildImage({
    required List<int> bytes,
    required String filename,
    void Function(int sent, int total)? onProgress,
  }) async {
    try {
      final response = await _dio.post(
        _childImageUploadPath,
        data: FormData.fromMap({
          'image': MultipartFile.fromBytes(bytes, filename: filename),
        }),
        onSendProgress: onProgress,
      );
      final map = ApiResponseParser.extractMap(response.data);
      if (map == null) {
        throw CaseIntakeApiException(message: 'Invalid child image upload response');
      }
      final uploaded = UploadedMessageAttachment.fromMap(map);
      if (uploaded.url.isEmpty) {
        throw CaseIntakeApiException(
          message: 'Invalid child image upload response: missing file URL',
        );
      }
      return uploaded;
    } on CaseIntakeApiException {
      rethrow;
    } on DioException catch (error) {
      _throwFromDio(error, fallback: 'Failed to upload child image');
    }
  }

  Future<UploadedMessageAttachment> uploadAttachmentFile({
    required List<int> bytes,
    required String filename,
    void Function(int sent, int total)? onProgress,
  }) async {
    try {
      final response = await _dio.post(
        _uploadPath,
        data: FormData.fromMap({
          'file': MultipartFile.fromBytes(bytes, filename: filename),
        }),
        onSendProgress: onProgress,
      );
      final map = ApiResponseParser.extractMap(response.data);
      if (map == null) {
        throw CaseIntakeApiException(message: 'Invalid upload response');
      }
      final uploaded = UploadedMessageAttachment.fromMap(map);
      if (uploaded.url.isEmpty) {
        throw CaseIntakeApiException(
          message: 'Invalid upload response: missing file URL',
        );
      }
      return uploaded;
    } on CaseIntakeApiException {
      rethrow;
    } on DioException catch (error) {
      _throwFromDio(error, fallback: 'Failed to upload file');
    }
  }

  Future<CaseRequestAttachment> bindAttachment({
    required String requestId,
    required String fileUrl,
    required String fileType,
    required String originalName,
  }) async {
    try {
      final response = await _dio.post(
        '$_requestsPath/$requestId/attachments',
        data: {
          'file_url': fileUrl,
          'file_type': fileType,
          'original_name': originalName,
        },
      );
      final map = ApiResponseParser.extractMap(response.data);
      if (map == null || map.isEmpty) {
        throw CaseIntakeApiException(message: 'Invalid attachment response');
      }
      return CaseRequestAttachment.fromMap(map);
    } on CaseIntakeApiException {
      rethrow;
    } on DioException catch (error) {
      _throwFromDio(error, fallback: 'Failed to attach file');
    }
  }

  Future<void> deleteAttachment({
    required String requestId,
    required String attachmentId,
  }) async {
    try {
      await _dio.delete('$_requestsPath/$requestId/attachments/$attachmentId');
    } on DioException catch (error) {
      _throwFromDio(error, fallback: 'Failed to delete attachment');
    }
  }
}
