import 'package:dio/dio.dart';

import '../../../core/utils/api_response_parser.dart';
import '../models/admin_assignments_models.dart';
import '../models/parent_links_models.dart';

class AdminPatientAssignmentsRepository {
  AdminPatientAssignmentsRepository(this._dio);

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

  Future<List<SpecialistUserOption>> fetchSpecialists() async {
    final rows = await _getList('/users');
    return rows
        .map(SpecialistUserOption.fromUserMap)
        .where((user) => user.userId.isNotEmpty)
        .toList()
      ..sort((a, b) => a.name.toLowerCase().compareTo(b.name.toLowerCase()));
  }

  Future<List<ParentUserOption>> fetchParents() async {
    final rows = await _getList('/users');
    return rows
        .map(ParentUserOption.fromUserMap)
        .where((user) => user.userId.isNotEmpty)
        .toList()
      ..sort((a, b) => a.name.toLowerCase().compareTo(b.name.toLowerCase()));
  }

  Future<List<PatientSpecialistLink>> fetchPatientSpecialists(String patientId) async {
    final rows = await _getList('/patients/$patientId/specialists');
    return rows
        .map(PatientSpecialistLink.fromMap)
        .where((link) => link.specialistId.isNotEmpty)
        .toList();
  }

  Future<List<PatientGuardianLink>> fetchPatientGuardians(String patientId) async {
    final rows = await _getList('/patients/$patientId/guardians');
    return rows
        .map(PatientGuardianLink.fromMap)
        .where((link) => link.parentId.isNotEmpty)
        .toList();
  }

  Future<String?> assignSpecialist({
    required String patientId,
    required String specialistUserId,
    required bool isPrimary,
  }) async {
    try {
      await _dio.post(
        '/patients/$patientId/specialists',
        data: {
          'specialist_id': specialistUserId,
          'is_primary': isPrimary,
        },
      );
      return null;
    } on DioException catch (error) {
      return friendlyAssignmentError(_readError(error));
    } catch (error) {
      return error.toString();
    }
  }

  Future<String?> linkParent({
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
      return friendlyAssignmentError(_readError(error));
    } catch (error) {
      return error.toString();
    }
  }

  /// [guardianId] is the parent user id (`users.id`), matching the backend route.
  Future<String?> unlinkParent({
    required String patientId,
    required String guardianId,
  }) async {
    try {
      await _dio.delete('/patients/$patientId/guardians/$guardianId');
      return null;
    } on DioException catch (error) {
      return friendlyAssignmentError(_readError(error));
    } catch (error) {
      return error.toString();
    }
  }

  /// [specialistId] is the specialist user id (`users.id`).
  Future<String?> unlinkSpecialist({
    required String patientId,
    required String specialistId,
  }) async {
    try {
      await _dio.delete('/patients/$patientId/specialists/$specialistId');
      return null;
    } on DioException catch (error) {
      return friendlyAssignmentError(_readError(error));
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
