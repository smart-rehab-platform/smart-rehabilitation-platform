import 'package:dio/dio.dart';

import '../../../core/utils/api_response_parser.dart';
import '../models/parent_links_models.dart';

class ParentLinksRepository {
  ParentLinksRepository(this._dio);

  final Dio _dio;

  Future<List<Map<String, dynamic>>> _getList(String path) async {
    try {
      final response = await _dio.get(path);
      return ApiResponseParser.extractList(response.data)
          .whereType<Map>()
          .map(
            (item) => item.map((key, value) => MapEntry(key.toString(), value)),
          )
          .toList();
    } on DioException {
      return const [];
    }
  }

  Future<List<PatientOption>> fetchPatients() async {
    final rows = await _getList('/patients');
    return rows
        .map(PatientOption.fromMap)
        .where((patient) => patient.id.isNotEmpty)
        .toList();
  }

  Future<List<PatientOption>> fetchAssignedPatients(
    String specialistUserId,
  ) async {
    try {
      final response = await _dio.get(
        '/specialists/$specialistUserId/patients',
      );
      final rows = ApiResponseParser.extractList(response.data)
          .whereType<Map>()
          .map(
            (item) => item.map((key, value) => MapEntry(key.toString(), value)),
          )
          .toList();
      return rows
          .map(PatientOption.fromMap)
          .where((patient) => patient.id.isNotEmpty)
          .toList()
        ..sort((a, b) => a.name.toLowerCase().compareTo(b.name.toLowerCase()));
    } on DioException catch (error) {
      throw Exception(_readError(error));
    }
  }

  /// Uses GET /parents (available to specialists). Falls back to GET /users for admins.
  Future<List<ParentUserOption>> fetchParentUsers({
    bool tryUsersEndpoint = false,
  }) async {
    final parents = await _getList('/parents');
    final fromParents = _dedupeParents(
      parents
          .map(ParentUserOption.fromMap)
          .where((parent) => parent.userId.isNotEmpty),
    );

    if (fromParents.isNotEmpty) {
      return fromParents;
    }

    if (!tryUsersEndpoint) {
      return const [];
    }

    final users = await _getList('/users');
    return _dedupeParents(
      users
          .map(ParentUserOption.fromUserMap)
          .where((parent) => parent.userId.isNotEmpty),
    );
  }

  List<ParentUserOption> _dedupeParents(Iterable<ParentUserOption> parents) {
    final unique = <String, ParentUserOption>{};
    for (final parent in parents) {
      unique[parent.userId] = parent;
    }
    return unique.values.toList()
      ..sort((a, b) => a.name.toLowerCase().compareTo(b.name.toLowerCase()));
  }

  Future<List<PatientGuardianLink>> fetchGuardians(String patientId) async {
    final rows = await _getList('/patients/$patientId/guardians');
    return rows
        .map(PatientGuardianLink.fromMap)
        .where((guardian) => guardian.parentId.isNotEmpty)
        .toList();
  }

  Future<String?> linkGuardian({
    required String patientId,
    required String parentUserId,
    required String relationship,
    required bool isPrimaryContact,
  }) async {
    try {
      await _dio.post(
        '/patients/$patientId/guardians',
        data: {
          'parent_id': parentUserId,
          'relationship': relationship,
          'is_primary_contact': isPrimaryContact,
        },
      );
      return null;
    } on DioException catch (error) {
      return _readError(error);
    } catch (error) {
      return error.toString();
    }
  }

  /// [parentUserId] must be the parent **user** id (`users.id`), matching the
  /// backend route param `guardianId` (deleted via `parent_id` column).
  Future<String?> unlinkGuardian({
    required String patientId,
    required String parentUserId,
  }) async {
    try {
      await _dio.delete('/patients/$patientId/guardians/$parentUserId');
      return null;
    } on DioException catch (error) {
      return _readError(error);
    } catch (error) {
      return error.toString();
    }
  }

  String _readError(DioException error) {
    final statusCode = error.response?.statusCode;
    final data = error.response?.data;
    if (data is Map) {
      final map = data.map((key, value) => MapEntry(key.toString(), value));
      final message = ApiResponseParser.readString(map, const [
        'message',
        'error',
      ]);
      if (message != null && message.isNotEmpty) {
        if (statusCode == 403) {
          return 'You are not authorized to manage links for this patient.';
        }
        if (statusCode == 409 ||
            message.toLowerCase().contains('duplicate') ||
            message.toLowerCase().contains('already')) {
          return 'This parent is already linked to the patient.';
        }
        return message;
      }
    }
    if (statusCode == 403) {
      return 'You are not authorized to manage links for this patient.';
    }
    if (error.type == DioExceptionType.connectionTimeout ||
        error.type == DioExceptionType.receiveTimeout ||
        error.type == DioExceptionType.sendTimeout) {
      return 'Network timeout. Please try again.';
    }
    return error.message ?? 'Request failed';
  }
}
