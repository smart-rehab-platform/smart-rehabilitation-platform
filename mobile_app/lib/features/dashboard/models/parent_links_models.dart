import '../../../core/utils/api_response_parser.dart';

class PatientOption {
  const PatientOption({
    required this.id,
    required this.name,
    this.dateOfBirth,
    this.gender,
  });

  final String id;
  final String name;
  final DateTime? dateOfBirth;
  final String? gender;

  int? get age {
    if (dateOfBirth == null) {
      return null;
    }
    final now = DateTime.now();
    var years = now.year - dateOfBirth!.year;
    if (now.month < dateOfBirth!.month ||
        (now.month == dateOfBirth!.month && now.day < dateOfBirth!.day)) {
      years--;
    }
    return years >= 0 ? years : null;
  }

  String? get subtitle {
    final parts = <String>[];
    if (age != null) {
      parts.add('$age yrs');
    }
    if (gender != null && gender!.trim().isNotEmpty) {
      parts.add(gender!.trim());
    }
    return parts.isEmpty ? null : parts.join(' • ');
  }

  factory PatientOption.fromMap(Map<String, dynamic> map) {
    return PatientOption(
      id: ApiResponseParser.readString(map, const ['id', '_id']) ?? '',
      name:
          ApiResponseParser.readString(map, const [
            'full_name',
            'fullName',
            'name',
          ]) ??
          'Patient',
      dateOfBirth: ApiResponseParser.readDate(
        map['date_of_birth'] ?? map['dateOfBirth'],
      ),
      gender: ApiResponseParser.readString(map, const ['gender']),
    );
  }
}

class ParentUserOption {
  const ParentUserOption({
    required this.userId,
    required this.name,
    this.email,
  });

  final String userId;
  final String name;
  final String? email;

  factory ParentUserOption.fromMap(Map<String, dynamic> map) {
    final nestedUser = ApiResponseParser.asMap(map['user']);

    // Guardian linking requires the parent USER id, not the profile id.
    final userId =
        ApiResponseParser.readString(map, const ['user_id', 'userId']) ??
        (nestedUser != null
            ? ApiResponseParser.readString(nestedUser, const [
                'id',
                '_id',
                'userId',
              ])
            : null);

    final nameSource = nestedUser ?? map;
    final emailSource = nestedUser ?? map;

    return ParentUserOption(
      userId: userId ?? '',
      name:
          ApiResponseParser.readString(nameSource, const [
            'full_name',
            'fullName',
            'name',
          ]) ??
          'Parent',
      email: ApiResponseParser.readString(emailSource, const ['email']),
    );
  }

  factory ParentUserOption.fromUserMap(Map<String, dynamic> map) {
    final role = ApiResponseParser.readString(map, const ['role', 'userRole']);
    if (role != null && role.toLowerCase() != 'parent') {
      return const ParentUserOption(userId: '', name: '');
    }

    return ParentUserOption(
      userId:
          ApiResponseParser.readString(map, const ['id', '_id', 'userId']) ??
          '',
      name:
          ApiResponseParser.readString(map, const [
            'full_name',
            'fullName',
            'name',
          ]) ??
          'Parent',
      email: ApiResponseParser.readString(map, const ['email']),
    );
  }
}

class PatientGuardianLink {
  const PatientGuardianLink({
    required this.parentId,
    required this.parentName,
    required this.relationship,
    required this.isPrimaryContact,
    this.email,
  });

  final String parentId;
  final String parentName;
  final String relationship;
  final bool isPrimaryContact;
  final String? email;

  factory PatientGuardianLink.fromMap(Map<String, dynamic> map) {
    return PatientGuardianLink(
      parentId:
          ApiResponseParser.readString(map, const ['parent_id', 'parentId']) ??
          '',
      parentName:
          ApiResponseParser.readString(map, const [
            'full_name',
            'fullName',
            'name',
          ]) ??
          'Parent',
      relationship:
          ApiResponseParser.readString(map, const ['relationship']) ??
          'guardian',
      isPrimaryContact:
          map['is_primary_contact'] == true || map['isPrimaryContact'] == true,
      email: ApiResponseParser.readString(map, const ['email']),
    );
  }
}

const parentRelationshipOptions = ['mother', 'father', 'guardian', 'other'];
