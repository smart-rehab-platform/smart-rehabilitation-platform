import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';

import '../../../core/constants/api_constants.dart';
import '../../../core/utils/api_response_parser.dart';
import '../models/parent_ai_chat_models.dart';

class ParentAiChatApiException implements Exception {
  ParentAiChatApiException({
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

class ParentAiChatRepository {
  ParentAiChatRepository(this._dio);

  final Dio _dio;

  static const _basePath = '/ai/chat';

  static const _aiReceiveTimeout = Duration(seconds: 120);
  static const _aiSendTimeout = Duration(seconds: 30);

  Options get _aiOptions => Options(
        receiveTimeout: _aiReceiveTimeout,
        sendTimeout: _aiSendTimeout,
        headers: const {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      );

  String _fullUrl(String path) => '${ApiConstants.baseUrl}$path';

  void _logRequest({
    required String method,
    required String path,
    Map<String, dynamic>? body,
  }) {
    debugPrint('[ParentAiChat] REQUEST $method ${_fullUrl(path)}');
    debugPrint('[ParentAiChat] Authorization: ${_dio.options.headers['Authorization']}');
    if (body != null) {
      debugPrint('[ParentAiChat] Request body: $body');
    }
  }

  void _logResponse(Response<dynamic> response) {
    debugPrint('[ParentAiChat] RESPONSE status: ${response.statusCode}');
    debugPrint('[ParentAiChat] Response JSON: ${response.data}');
  }

  void _logDioError(DioException error) {
    debugPrint('[ParentAiChat] DioException type: ${error.type}');
    debugPrint('[ParentAiChat] DioException message: ${error.message}');
    debugPrint('[ParentAiChat] HTTP status: ${error.response?.statusCode}');
    debugPrint('[ParentAiChat] DioException.response.data: ${error.response?.data}');
  }

  String _extractBackendMessage(dynamic responseData, {String? fallback}) {
    final map = ApiResponseParser.asMap(responseData);
    if (map != null) {
      final message = ApiResponseParser.readString(map, const ['message', 'error']);
      if (message != null && message.isNotEmpty) {
        return message;
      }
    }
    return fallback ?? 'Request failed';
  }

  Never _throwFromDio(DioException error, {required String method, required String path}) {
    _logDioError(error);
    final statusCode = error.response?.statusCode;
    final backendMessage = error.response?.data != null
        ? _extractBackendMessage(
            error.response!.data,
            fallback: error.message ?? 'Request failed',
          )
        : (error.message ?? 'Request failed');

    throw ParentAiChatApiException(
      message: backendMessage,
      statusCode: statusCode,
      responseData: error.response?.data,
      path: path,
      method: method,
    );
  }

  ParentAiChatSendResult _parseSendResult(
    dynamic responseData, {
    required String method,
    required String path,
  }) {
    final map = ApiResponseParser.extractMap(responseData);
    if (map == null) {
      debugPrint('[ParentAiChat] Parse failed: extractMap returned null');
      debugPrint('[ParentAiChat] Raw response JSON: $responseData');
      throw ParentAiChatApiException(
        message: 'Invalid response shape: missing data object',
        responseData: responseData,
        path: path,
        method: method,
      );
    }

    final userMap = ApiResponseParser.asMap(map['user_message'] ?? map['userMessage']);
    final botMap = ApiResponseParser.asMap(map['bot_message'] ?? map['botMessage']);
    if (userMap == null || botMap == null) {
      debugPrint('[ParentAiChat] Parse failed: user_message or bot_message missing');
      debugPrint('[ParentAiChat] Parsed data map: $map');
      throw ParentAiChatApiException(
        message: 'Invalid response shape: missing user_message or bot_message',
        responseData: responseData,
        path: path,
        method: method,
      );
    }

    final conversationMap = ApiResponseParser.asMap(map['conversation']);
    return ParentAiChatSendResult(
      userMessage: ParentAiChatMessage.fromMap(userMap),
      botMessage: ParentAiChatMessage.fromMap(botMap),
      conversation: conversationMap == null
          ? null
          : ParentAiChatConversation.fromMap(conversationMap),
    );
  }

  Future<T> _guard<T>(
    Future<T> Function() action, {
    required String method,
    required String path,
  }) async {
    try {
      return await action();
    } on ParentAiChatApiException {
      rethrow;
    } on DioException catch (error) {
      _throwFromDio(error, method: method, path: path);
    } catch (error) {
      debugPrint('[ParentAiChat] Unexpected error on $method $path: $error');
      throw ParentAiChatApiException(
        message: error.toString(),
        path: path,
        method: method,
      );
    }
  }

  Future<List<ParentAiChatConversation>> fetchConversations() async {
    const path = '$_basePath/conversations';
    return _guard(() async {
      _logRequest(method: 'GET', path: path);
      final response = await _dio.get(path, options: _aiOptions);
      _logResponse(response);
      return ApiResponseParser.extractList(response.data)
          .whereType<Map>()
          .map((item) => item.map((key, value) => MapEntry(key.toString(), value)))
          .map(ParentAiChatConversation.fromMap)
          .where((item) => item.id.isNotEmpty)
          .toList();
    }, method: 'GET', path: path);
  }

  Future<ParentAiChatConversation> createConversation() async {
    const path = '$_basePath/conversations';
    return _guard(() async {
      _logRequest(method: 'POST', path: path, body: const {});
      final response = await _dio.post(path, options: _aiOptions);
      _logResponse(response);
      final map = ApiResponseParser.extractMap(response.data);
      if (map == null) {
        throw ParentAiChatApiException(
          message: 'Invalid conversation response',
          responseData: response.data,
          statusCode: response.statusCode,
          path: path,
          method: 'POST',
        );
      }
      final conversation = ParentAiChatConversation.fromMap(map);
      if (conversation.id.isEmpty) {
        throw ParentAiChatApiException(
          message: 'Invalid conversation response: missing id',
          responseData: response.data,
          statusCode: response.statusCode,
          path: path,
          method: 'POST',
        );
      }
      return conversation;
    }, method: 'POST', path: path);
  }

  Future<List<ParentAiChatMessage>> fetchMessages(String conversationId) async {
    final path = '$_basePath/conversations/$conversationId/messages';
    return _guard(() async {
      _logRequest(method: 'GET', path: path);
      final response = await _dio.get(path, options: _aiOptions);
      _logResponse(response);
      return ApiResponseParser.extractList(response.data)
          .whereType<Map>()
          .map((item) => item.map((key, value) => MapEntry(key.toString(), value)))
          .map(ParentAiChatMessage.fromMap)
          .where((item) => item.content.isNotEmpty)
          .toList();
    }, method: 'GET', path: path);
  }

  Future<ParentAiChatSendResult> sendMessage({
    required String conversationId,
    required String content,
  }) async {
    final path = '$_basePath/conversations/$conversationId/messages';
    // Match Postman: send only { "content": "..." }.
    // patient_id triggers collectPatientContext() which needs ai_progress_notes.
    final body = <String, dynamic>{'content': content.trim()};

    return _guard(() async {
      _logRequest(method: 'POST', path: path, body: body);
      final response = await _dio.post(
        path,
        data: body,
        options: _aiOptions,
      );
      _logResponse(response);
      return _parseSendResult(
        response.data,
        method: 'POST',
        path: path,
      );
    }, method: 'POST', path: path);
  }

  Future<ParentAiChatSendResult> ask({
    required String content,
    String? conversationId,
  }) async {
    const path = '$_basePath/ask';
    final body = <String, dynamic>{
      'content': content.trim(),
    };
    if (conversationId != null && conversationId.trim().isNotEmpty) {
      body['conversation_id'] = conversationId.trim();
    }

    return _guard(() async {
      _logRequest(method: 'POST', path: path, body: body);
      final response = await _dio.post(
        path,
        data: body,
        options: _aiOptions,
      );
      _logResponse(response);
      return _parseSendResult(
        response.data,
        method: 'POST',
        path: path,
      );
    }, method: 'POST', path: path);
  }
}
