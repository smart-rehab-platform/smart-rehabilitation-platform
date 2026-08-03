enum SignupRole { parent, specialist }

class SpecialistProfileData {
  const SpecialistProfileData({
    this.specialization = '',
    this.licenseNumber = '',
    this.yearsOfExperience = '',
    this.bio = '',
  });

  final String specialization;
  final String licenseNumber;
  final String yearsOfExperience;
  final String bio;

  SpecialistProfileData copyWith({
    String? specialization,
    String? licenseNumber,
    String? yearsOfExperience,
    String? bio,
  }) {
    return SpecialistProfileData(
      specialization: specialization ?? this.specialization,
      licenseNumber: licenseNumber ?? this.licenseNumber,
      yearsOfExperience: yearsOfExperience ?? this.yearsOfExperience,
      bio: bio ?? this.bio,
    );
  }

  Map<String, dynamic> toApiMap() {
    return {
      'specialization': specialization.trim(),
      'license_number': licenseNumber.trim(),
      'years_of_experience': int.parse(yearsOfExperience.trim()),
      'bio': bio.trim().isEmpty ? null : bio.trim(),
    };
  }
}
