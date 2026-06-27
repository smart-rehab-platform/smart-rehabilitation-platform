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
          .map((item) => item.map((key, value) => MapEntry(key.toString(), value)))
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

  /// Uses GET /parents (available to specialists). Falls back to GET /users for admins.
  Future<List<ParentUserOption>> fetchParentUsers({bool tryUsersEndpoint = false}) async {
    final parents = await _getList('/parents');
    final fromParents = _dedupeParents(
      parents.map(ParentUserOption.fromMap).where((parent) => parent.userId.isNotEmpty),
    );

    if (fromParents.isNotEmpty) {
      return fromParents;
    }

    if (!tryUsersEndpoint) {
      return const [];
    }

    final users = await _getList('/users');
    return _dedupeParents(
      users.map(ParentUserOption.fromUserMap).where((parent) => parent.userId.isNotEmpty),
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

  String _readError(DioException error) {
    final data = error.response?.data;
    if (data is Map) {
      final map = data.map((key, value) => MapEntry(key.toString(), value));
      return ApiResponseParser.readString(map, const ['message', 'error']) ??
          error.message ??
          'Request failed';
    }
    return error.message ?? 'Request failed';
  }
}
