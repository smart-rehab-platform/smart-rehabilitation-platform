import 'package:dio/dio.dart';

import '../../../core/utils/api_response_parser.dart';
import '../../dashboard/models/communication_models.dart';
import '../models/case_category_model.dart';
import '../models/case_intake_request_model.dart';
import '../models/case_request_attachment_model.dart';

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
