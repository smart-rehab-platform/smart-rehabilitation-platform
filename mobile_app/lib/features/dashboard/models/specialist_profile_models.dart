import '../../../core/utils/api_response_parser.dart';

class SpecialistProfileStats {
  const SpecialistProfileStats({
    required this.activePatients,
    required this.treatmentPlans,
    required this.pendingReviews,
    required this.reports,
  });

  final int activePatients;
  final int treatmentPlans;
  final int pendingReviews;
  final int reports;
}

class SpecialistProfessionalInfo {
  const SpecialistProfessionalInfo({
    this.profileId,
    this.specialization,
    this.licenseNumber,
    this.bio,
    this.yearsOfExperience,
  });

  final String? profileId;
  final String? specialization;
  final String? licenseNumber;
  final String? bio;
  final int? yearsOfExperience;

  factory SpecialistProfessionalInfo.fromMap(Map<String, dynamic> map) {
    final years = ApiResponseParser.readDouble(map, const [
      'years_of_experience',
      'yearsOfExperience',
    ]);

    return SpecialistProfessionalInfo(
      profileId: ApiResponseParser.readString(map, const ['id', '_id']),
      specialization: ApiResponseParser.readString(map, const [
        'specialization',
      ]),
      licenseNumber: ApiResponseParser.readString(map, const [
        'license_number',
        'licenseNumber',
      ]),
      bio: ApiResponseParser.readString(map, const ['bio', 'about']),
      yearsOfExperience: years?.round(),
    );
  }
}

class SpecialistProfileBundle {
  const SpecialistProfileBundle({
    required this.userId,
    required this.fullName,
    required this.email,
    this.phone,
    this.profileImageUrl,
    this.professional,
    required this.stats,
  });

  final String userId;
  final String fullName;
  final String email;
  final String? phone;
  final String? profileImageUrl;
  final SpecialistProfessionalInfo? professional;
  final SpecialistProfileStats stats;

  String? get specialization => professional?.specialization;
}

class UpdateUserProfileInput {
  const UpdateUserProfileInput({
    required this.fullName,
    this.phone,
  });

  final String fullName;
  final String? phone;

  Map<String, dynamic> toJson() => {
        'full_name': fullName,
        if (phone != null) 'phone': phone,
      };
}

class UpdateSpecialistProfessionalInput {
  const UpdateSpecialistProfessionalInput({
    this.specialization,
    this.licenseNumber,
    this.bio,
    this.yearsOfExperience,
  });

  final String? specialization;
  final String? licenseNumber;
  final String? bio;
  final int? yearsOfExperience;

  Map<String, dynamic> toJson() => {
        'specialization': specialization,
        'license_number': licenseNumber,
        'bio': bio,
        'years_of_experience': yearsOfExperience,
      };
}
