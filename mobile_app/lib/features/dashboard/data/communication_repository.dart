import 'package:dio/dio.dart';

import '../../../core/utils/api_response_parser.dart';
import '../models/communication_models.dart';

class CommunicationApiException implements Exception {
  CommunicationApiException({
    required this.message,
    this.statusCode,
    this.responseData,
    this.path,
    this.method,
  });

  final String message;
  final int? statusCode;
  final dynamic responseData;
  final String? path;
  final String? method;

  @override
  String toString() => message;
}

class CommunicationRepository {
  CommunicationRepository(this._dio);

  final Dio _dio;

  String _extractBackendMessage(dynamic responseData, {String? fallback}) {
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

  Never _throwFromDio(
    DioException error, {
    required String method,
    required String path,
  }) {
    final statusCode = error.response?.statusCode;
    final backendMessage = error.response?.data != null
        ? _extractBackendMessage(
            error.response!.data,
            fallback: error.message ?? 'Request failed',
          )
        : (error.message ?? 'Request failed');

    throw CommunicationApiException(
      message: backendMessage,
      statusCode: statusCode,
      responseData: error.response?.data,
      path: path,
      method: method,
    );
  }

  Future<T> _guard<T>(
    Future<T> Function() action, {
    required String method,
    required String path,
  }) async {
    try {
      return await action();
    } on CommunicationApiException {
      rethrow;
    } on DioException catch (error) {
      _throwFromDio(error, method: method, path: path);
    } catch (error) {
      throw CommunicationApiException(
        message: error.toString(),
        path: path,
        method: method,
      );
    }
  }

  Future<List<CommunicationConversation>> fetchUserConversations(
    String userId,
  ) async {
    final path = '/users/$userId/conversations';
    return _guard(
      () async {
        final response = await _dio.get(path);
        return ApiResponseParser.extractList(response.data)
            .whereType<Map>()
            .map(
              (item) =>
                  item.map((key, value) => MapEntry(key.toString(), value)),
            )
            .map(CommunicationConversation.fromMap)
            .where((conversation) => conversation.id.isNotEmpty)
            .toList();
      },
      method: 'GET',
      path: path,
    );
  }

  Future<CommunicationConversation> fetchConversation(
    String conversationId,
  ) async {
    final path = '/conversations/$conversationId';
    return _guard(
      () async {
        final response = await _dio.get(path);
        final map = ApiResponseParser.extractMap(response.data);
        if (map == null) {
          throw CommunicationApiException(
            message: 'Invalid conversation response',
            responseData: response.data,
            statusCode: response.statusCode,
            path: path,
            method: 'GET',
          );
        }
        final conversation = CommunicationConversation.fromMap(map);
        if (conversation.id.isEmpty) {
          throw CommunicationApiException(
            message: 'Invalid conversation response: missing id',
            responseData: response.data,
            statusCode: response.statusCode,
            path: path,
            method: 'GET',
          );
        }
        return conversation;
      },
      method: 'GET',
      path: path,
    );
  }

  Future<CommunicationConversation> createConversation({
    required String patientId,
    required String parentId,
    required String specialistId,
  }) async {
    const path = '/conversations';
    final body = <String, dynamic>{
      'patient_id': patientId,
      'parent_id': parentId,
      'specialist_id': specialistId,
    };

    return _guard(
      () async {
        final response = await _dio.post(path, data: body);
        final map = ApiResponseParser.extractMap(response.data);
        if (map == null) {
          throw CommunicationApiException(
            message: 'Invalid conversation response',
            responseData: response.data,
            statusCode: response.statusCode,
            path: path,
            method: 'POST',
          );
        }
        final conversation = CommunicationConversation.fromMap(map);
        if (conversation.id.isEmpty) {
          throw CommunicationApiException(
            message: 'Invalid conversation response: missing id',
            responseData: response.data,
            statusCode: response.statusCode,
            path: path,
            method: 'POST',
          );
        }
        return conversation;
      },
      method: 'POST',
      path: path,
    );
  }

  Future<List<CommunicationMessage>> fetchMessages(
    String conversationId,
  ) async {
    final path = '/conversations/$conversationId/messages';
    return _guard(
      () async {
        final response = await _dio.get(path);
        return ApiResponseParser.extractList(response.data)
            .whereType<Map>()
            .map(
              (item) =>
                  item.map((key, value) => MapEntry(key.toString(), value)),
            )
            .map(CommunicationMessage.fromMap)
            .where(
              (message) => message.id.isNotEmpty && message.hasDisplayableBody,
            )
            .toList();
      },
      method: 'GET',
      path: path,
    );
  }

  Future<CommunicationMessage> sendMessage({
    required String conversationId,
    required String content,
  }) async {
    final path = '/conversations/$conversationId/messages';
    final body = <String, dynamic>{'content': content.trim()};

    return _guard(
      () async {
        final response = await _dio.post(path, data: body);
        final map = ApiResponseParser.extractMap(response.data);
        if (map == null) {
          throw CommunicationApiException(
            message: 'Invalid message response',
            responseData: response.data,
            statusCode: response.statusCode,
            path: path,
            method: 'POST',
          );
        }
        final message = CommunicationMessage.fromMap(map);
        if (message.id.isEmpty) {
          throw CommunicationApiException(
            message: 'Invalid message response: missing id',
            responseData: response.data,
            statusCode: response.statusCode,
            path: path,
            method: 'POST',
          );
        }
        return message;
      },
      method: 'POST',
      path: path,
    );
  }

  Future<void> markMessageRead(String messageId) async {
    final path = '/messages/$messageId/read';
    await _guard(
      () async {
        await _dio.patch(path);
      },
      method: 'PATCH',
      path: path,
    );
  }

  Future<void> markConversationMessagesRead(String conversationId) async {
    final path = '/conversations/$conversationId/messages/read';
    await _guard(
      () async {
        await _dio.patch(path);
      },
      method: 'PATCH',
      path: path,
    );
  }

  Future<UploadedMessageAttachment> uploadMessageAttachment({
    required List<int> bytes,
    required String filename,
    void Function(int sent, int total)? onProgress,
  }) async {
    const path = '/uploads/message-attachment';

    return _guard(
      () async {
        final response = await _dio.post(
          path,
          data: FormData.fromMap({
            'file': MultipartFile.fromBytes(bytes, filename: filename),
          }),
          onSendProgress: onProgress,
        );
        final map = ApiResponseParser.extractMap(response.data);
        if (map == null) {
          throw CommunicationApiException(
            message: 'Invalid upload response',
            responseData: response.data,
            statusCode: response.statusCode,
            path: path,
            method: 'POST',
          );
        }
        final uploaded = UploadedMessageAttachment.fromMap(map);
        if (uploaded.url.isEmpty) {
          throw CommunicationApiException(
            message: 'Invalid upload response: missing file URL',
            responseData: response.data,
            statusCode: response.statusCode,
            path: path,
            method: 'POST',
          );
        }
        return uploaded;
      },
      method: 'POST',
      path: path,
    );
  }

  Future<CommunicationMessage> sendAttachmentMessage({
    required String conversationId,
    required String fileUrl,
    required String fileType,
    String? caption,
  }) async {
    final path = '/conversations/$conversationId/attachments';
    final body = <String, dynamic>{'file_url': fileUrl, 'file_type': fileType};
    final trimmedCaption = caption?.trim();
    if (trimmedCaption != null && trimmedCaption.isNotEmpty) {
      body['content'] = trimmedCaption;
    }

    return _guard(
      () async {
        final response = await _dio.post(path, data: body);
        final map = ApiResponseParser.extractMap(response.data);
        if (map == null) {
          throw CommunicationApiException(
            message: 'Invalid attachment message response',
            responseData: response.data,
            statusCode: response.statusCode,
            path: path,
            method: 'POST',
          );
        }
        final message = CommunicationMessage.fromMap(map);
        if (message.id.isEmpty) {
          throw CommunicationApiException(
            message: 'Invalid attachment message response: missing id',
            responseData: response.data,
            statusCode: response.statusCode,
            path: path,
            method: 'POST',
          );
        }
        return message;
      },
      method: 'POST',
      path: path,
    );
  }
}
