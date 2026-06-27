import '../../../core/utils/api_response_parser.dart';

class SpecialistUserOption {
  const SpecialistUserOption({
    required this.userId,
    required this.name,
    this.email,
  });

  final String userId;
  final String name;
  final String? email;

  factory SpecialistUserOption.fromUserMap(Map<String, dynamic> map) {
    final role = ApiResponseParser.readString(map, const ['role', 'userRole']);
    if (role != null && role.toLowerCase() != 'specialist') {
      return const SpecialistUserOption(userId: '', name: '');
    }

    return SpecialistUserOption(
      userId: ApiResponseParser.readString(map, const ['id', '_id', 'userId']) ?? '',
      name: ApiResponseParser.readString(map, const [
            'full_name',
            'fullName',
            'name',
          ]) ??
          'Specialist',
      email: ApiResponseParser.readString(map, const ['email']),
    );
  }
}

class PatientSpecialistLink {
  const PatientSpecialistLink({
    required this.specialistId,
    required this.specialistName,
    required this.isPrimary,
    this.email,
  });

  final String specialistId;
  final String specialistName;
  final bool isPrimary;
  final String? email;

  factory PatientSpecialistLink.fromMap(Map<String, dynamic> map) {
    return PatientSpecialistLink(
      specialistId: ApiResponseParser.readString(map, const [
            'specialist_id',
            'specialistId',
          ]) ??
          '',
      specialistName: ApiResponseParser.readString(map, const [
            'full_name',
            'fullName',
            'name',
          ]) ??
          'Specialist',
      isPrimary: map['is_primary'] == true || map['isPrimary'] == true,
      email: ApiResponseParser.readString(map, const ['email']),
    );
  }
}

String friendlyAssignmentError(String? raw) {
  if (raw == null || raw.isEmpty) {
    return 'Request failed. Please try again.';
  }
  final lower = raw.toLowerCase();
  if (lower.contains('duplicate') ||
      lower.contains('unique') ||
      lower.contains('already') ||
      lower.contains('violates unique')) {
    return 'This patient is already linked to this user.';
  }
  return raw;
}
