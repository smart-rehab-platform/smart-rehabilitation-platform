import 'package:dio/dio.dart';

import '../../../core/utils/api_response_parser.dart';
import '../models/specialist_dashboard_models.dart';
import '../models/specialist_feature_models.dart';
import '../models/specialist_profile_models.dart';

/// Specialist profile API access.
///
/// Endpoints:
/// - GET /auth/me
/// - GET /specialists (filtered client-side by user_id)
/// - GET /specialists/:userId/patients
/// - GET /specialists/:userId/pending-reviews
/// - GET /treatment-plans (filtered by specialist_id)
/// - GET /reports
/// - PUT /users/profile/me
/// - PUT /specialists/:profileId/profile
/// - POST /specialists/profile
class SpecialistProfileRepository {
  SpecialistProfileRepository(this._dio);

  final Dio _dio;

  Future<List<Map<String, dynamic>>> _getList(String path) async {
    final response = await _dio.get(path);
    return ApiResponseParser.extractList(response.data)
        .whereType<Map>()
        .map((item) => item.map((key, value) => MapEntry(key.toString(), value)))
        .toList();
  }

  Future<Map<String, dynamic>?> _getMap(String path) async {
    try {
      final response = await _dio.get(path);
      return ApiResponseParser.extractMap(response.data);
    } on DioException catch (error) {
      if (error.response?.statusCode == 404) {
        return null;
      }
      rethrow;
    }
  }

  Future<SpecialistProfileBundle> fetchProfileBundle(String userId) async {
    final meMap = await _getMap('/auth/me');
    if (meMap == null) {
      throw Exception('Unable to load profile');
    }

    final fullName = ApiResponseParser.readString(meMap, const [
          'full_name',
          'fullName',
          'name',
        ]) ??
        '';
    final email = ApiResponseParser.readString(meMap, const ['email']) ?? '';
    final phone = ApiResponseParser.readString(meMap, const [
      'phone',
      'phoneNumber',
      'mobile',
    ]);
    final profileImageUrl = ApiResponseParser.readString(meMap, const [
      'profile_image_url',
      'profileImageUrl',
      'profile_image',
      'profileImage',
      'avatar',
      'avatarUrl',
    ]);

    final professional = await _fetchProfessionalInfo(userId);
    final stats = await _fetchStats(userId);

    return SpecialistProfileBundle(
      userId: userId,
      fullName: fullName,
      email: email,
      phone: phone,
      profileImageUrl: profileImageUrl,
      professional: professional,
      stats: stats,
    );
  }

  Future<SpecialistProfessionalInfo?> _fetchProfessionalInfo(
    String userId,
  ) async {
    final rows = await _getList('/specialists');
    for (final row in rows) {
      final rowUserId = ApiResponseParser.readString(row, const [
        'user_id',
        'userId',
      ]);
      if (rowUserId == userId) {
        return SpecialistProfessionalInfo.fromMap(row);
      }
    }
    return null;
  }

  Future<SpecialistProfileStats> _fetchStats(String userId) async {
    final patientsRows = await _getList('/specialists/$userId/patients');
    final pendingRows = await _getList('/specialists/$userId/pending-reviews');
    final planRows = await _getList('/treatment-plans');
    final reportRows = await _getList('/reports');

    final patients = patientsRows
        .map(SpecialistPatientItem.fromMap)
        .where((patient) => patient.id.isNotEmpty)
        .length;

    final pendingReviews =
        pendingRows.map(SpecialistPendingReview.fromMap).length;

    final treatmentPlans = planRows
        .map(SpecialistTreatmentPlanItem.fromMap)
        .where((plan) => plan.specialistId == userId)
        .length;

    final reports = reportRows
        .map(SpecialistReportItem.fromMap)
        .where((report) => report.id.isNotEmpty)
        .length;

    return SpecialistProfileStats(
      activePatients: patients,
      treatmentPlans: treatmentPlans,
      pendingReviews: pendingReviews,
      reports: reports,
    );
  }

  Future<void> updateMyUserProfile(UpdateUserProfileInput input) async {
    await _dio.put('/users/profile/me', data: input.toJson());
  }

  Future<SpecialistProfessionalInfo> updateSpecialistProfile(
    String profileId,
    UpdateSpecialistProfessionalInput input,
  ) async {
    final response = await _dio.put(
      '/specialists/$profileId/profile',
      data: input.toJson(),
    );
    final map = ApiResponseParser.extractMap(response.data);
    if (map == null) {
      throw Exception('Invalid specialist profile response');
    }
    return SpecialistProfessionalInfo.fromMap(map);
  }

  Future<SpecialistProfessionalInfo> createSpecialistProfile(
    UpdateSpecialistProfessionalInput input,
  ) async {
    final response = await _dio.post(
      '/specialists/profile',
      data: input.toJson(),
    );
    final map = ApiResponseParser.extractMap(response.data);
    if (map == null) {
      throw Exception('Invalid specialist profile response');
    }
    return SpecialistProfessionalInfo.fromMap(map);
  }
}
