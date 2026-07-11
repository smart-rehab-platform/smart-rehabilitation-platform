import 'package:dio/dio.dart';

import '../../../core/utils/api_response_parser.dart';
import '../models/admin_assignments_models.dart';
import '../models/session_requests_models.dart';

class SessionRequestsApiException implements Exception {
  SessionRequestsApiException({
    required this.message,
    this.statusCode,
  });

  final String message;
  final int? statusCode;

  @override
  String toString() => message;
}

class SessionRequestsRepository {
  SessionRequestsRepository(this._dio);

  final Dio _dio;

  static const _basePath = '/session-requests';

  String _extractMessage(dynamic responseData, {String? fallback}) {
    final map = ApiResponseParser.asMap(responseData);
    if (map != null) {
      final message = ApiResponseParser.readString(map, const ['message', 'error']);
      if (message != null && message.isNotEmpty) {
        return message;
      }
    }
    return fallback ?? 'Request failed';
  }

  Future<List<SessionRequestItem>> fetchMySessionRequests({
    SessionRequestStatus? status,
  }) async {
    return _fetchSessionRequests('$_basePath/mine', status: status);
  }

  Future<List<SessionRequestItem>> fetchInboxSessionRequests({
    SessionRequestStatus? status,
  }) async {
    return _fetchSessionRequests('$_basePath/inbox', status: status);
  }

  Future<List<SessionRequestItem>> _fetchSessionRequests(
    String path, {
    SessionRequestStatus? status,
  }) async {
    try {
      final response = await _dio.get(
        path,
        queryParameters: status != null ? {'status': status.apiValue} : null,
      );
      return ApiResponseParser.extractList(response.data)
          .whereType<Map>()
          .map((item) => item.map((key, value) => MapEntry(key.toString(), value)))
          .map(SessionRequestItem.fromMap)
          .where((request) => request.id.isNotEmpty)
          .toList();
    } on DioException catch (error) {
      throw SessionRequestsApiException(
        message: error.response?.data != null
            ? _extractMessage(
                error.response!.data,
                fallback: error.message ?? 'Request failed',
              )
            : (error.message ?? 'Request failed'),
        statusCode: error.response?.statusCode,
      );
    }
  }

  Future<List<SessionRequestItem>> enrichWithApprovedSessions(
    List<SessionRequestItem> requests,
  ) async {
    return Future.wait(
      requests.map((request) async {
        if (request.status == SessionRequestStatus.approved &&
            request.approvedSessionId != null &&
            request.approvedSessionId!.isNotEmpty) {
          final session = await fetchApprovedSessionDetails(
            request.approvedSessionId!,
          );
          if (session != null) {
            return request.copyWith(approvedSession: session);
          }
        }
        return request;
      }),
    );
  }

  Future<ApproveSessionRequestResult> approveSessionRequest(
    String requestId,
    ApproveSessionRequestInput input,
  ) async {
    try {
      final response = await _dio.patch(
        '$_basePath/$requestId/approve',
        data: input.toJson(),
      );
      final map = ApiResponseParser.extractMap(response.data);
      if (map == null) {
        throw SessionRequestsApiException(
          message: 'Invalid approve session request response',
        );
      }
      return ApproveSessionRequestResult.fromMap(map);
    } on SessionRequestsApiException {
      rethrow;
    } on DioException catch (error) {
      throw SessionRequestsApiException(
        message: error.response?.data != null
            ? _extractMessage(
                error.response!.data,
                fallback: error.message ?? 'Request failed',
              )
            : (error.message ?? 'Request failed'),
        statusCode: error.response?.statusCode,
      );
    }
  }

  Future<SessionRequestItem> rejectSessionRequest(
    String requestId,
    RejectSessionRequestInput input,
  ) async {
    try {
      final response = await _dio.patch(
        '$_basePath/$requestId/reject',
        data: input.toJson(),
      );
      final map = ApiResponseParser.extractMap(response.data);
      if (map == null) {
        throw SessionRequestsApiException(
          message: 'Invalid reject session request response',
        );
      }
      return SessionRequestItem.fromMap(map);
    } on SessionRequestsApiException {
      rethrow;
    } on DioException catch (error) {
      throw SessionRequestsApiException(
        message: error.response?.data != null
            ? _extractMessage(
                error.response!.data,
                fallback: error.message ?? 'Request failed',
              )
            : (error.message ?? 'Request failed'),
        statusCode: error.response?.statusCode,
      );
    }
  }

  Future<SessionRequestItem> submitSessionRequest(
    CreateSessionRequestInput input,
  ) async {
    try {
      final response = await _dio.post(
        _basePath,
        data: input.toJson(),
      );
      final map = ApiResponseParser.extractMap(response.data);
      if (map == null) {
        throw SessionRequestsApiException(message: 'Invalid session request response');
      }
      return SessionRequestItem.fromMap(map);
    } on SessionRequestsApiException {
      rethrow;
    } on DioException catch (error) {
      throw SessionRequestsApiException(
        message: error.response?.data != null
            ? _extractMessage(
                error.response!.data,
                fallback: error.message ?? 'Request failed',
              )
            : (error.message ?? 'Request failed'),
        statusCode: error.response?.statusCode,
      );
    }
  }

  Future<List<PatientSpecialistLink>> fetchPatientSpecialists(
    String patientId,
  ) async {
    try {
      final response = await _dio.get('/patients/$patientId/specialists');
      return ApiResponseParser.extractList(response.data)
          .whereType<Map>()
          .map((item) => item.map((key, value) => MapEntry(key.toString(), value)))
          .map(PatientSpecialistLink.fromMap)
          .where((link) => link.specialistId.isNotEmpty)
          .toList();
    } on DioException {
      return const [];
    } catch (_) {
      return const [];
    }
  }

  Future<SessionRequestApprovedSession?> fetchApprovedSessionDetails(
    String sessionId,
  ) async {
    try {
      final response = await _dio.get('/sessions/$sessionId');
      final map = ApiResponseParser.extractMap(response.data);
      if (map == null || map.isEmpty) {
        return null;
      }
      return SessionRequestApprovedSession.fromMap(map);
    } on DioException {
      return null;
    } catch (_) {
      return null;
    }
  }
}
