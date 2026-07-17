import '../../../core/utils/api_response_parser.dart';

class MatchingSpecialist {
  const MatchingSpecialist({
    required this.id,
    this.fullName,
    this.email,
    this.phone,
    this.profileImageUrl,
    this.specialization,
    this.licenseNumber,
    this.yearsOfExperience,
    this.bio,
    this.activeCasesCount = 0,
    this.currentCaseRequestsCount = 0,
  });

  final String id;
  final String? fullName;
  final String? email;
  final String? phone;
  final String? profileImageUrl;
  final String? specialization;
  final String? licenseNumber;
  final int? yearsOfExperience;
  final String? bio;
  final int activeCasesCount;
  final int currentCaseRequestsCount;

  String get displayName {
    final name = fullName?.trim();
    if (name != null && name.isNotEmpty) {
      return name;
    }
    return 'Specialist';
  }

  factory MatchingSpecialist.fromMap(Map<String, dynamic> map) {
    return MatchingSpecialist(
      id: ApiResponseParser.readString(map, const ['id', '_id']) ?? '',
      fullName: ApiResponseParser.readString(map, const [
        'full_name',
        'fullName',
        'name',
      ]),
      email: ApiResponseParser.readString(map, const ['email']),
      phone: ApiResponseParser.readString(map, const ['phone']),
      profileImageUrl: ApiResponseParser.readString(map, const [
        'profile_image_url',
        'profileImageUrl',
      ]),
      specialization: ApiResponseParser.readString(map, const [
        'specialization',
      ]),
      licenseNumber: ApiResponseParser.readString(map, const [
        'license_number',
        'licenseNumber',
      ]),
      yearsOfExperience: ApiResponseParser.readInt(map, const [
        'years_of_experience',
        'yearsOfExperience',
      ]),
      bio: ApiResponseParser.readString(map, const ['bio']),
      activeCasesCount:
          ApiResponseParser.readInt(map, const [
            'active_cases_count',
            'activeCasesCount',
          ]) ??
          0,
      currentCaseRequestsCount:
          ApiResponseParser.readInt(map, const [
            'current_case_requests_count',
            'currentCaseRequestsCount',
          ]) ??
          0,
    );
  }
}
