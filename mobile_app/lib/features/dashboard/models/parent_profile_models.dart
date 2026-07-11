import '../../../core/utils/api_response_parser.dart';

class ParentProfileBundle {
  const ParentProfileBundle({
    required this.userId,
    required this.fullName,
    required this.email,
    this.phone,
    this.profileImageUrl,
    this.profileId,
    this.address,
    this.relationshipNotes,
  });

  final String userId;
  final String fullName;
  final String email;
  final String? phone;
  final String? profileImageUrl;
  final String? profileId;
  final String? address;
  final String? relationshipNotes;
}

class ParentProfileRecord {
  const ParentProfileRecord({
    this.profileId,
    this.address,
    this.relationshipNotes,
  });

  final String? profileId;
  final String? address;
  final String? relationshipNotes;

  factory ParentProfileRecord.fromMap(Map<String, dynamic> map) {
    return ParentProfileRecord(
      profileId: ApiResponseParser.readString(map, const ['id', '_id']),
      address: ApiResponseParser.readString(map, const ['address']),
      relationshipNotes: ApiResponseParser.readString(map, const [
        'relationship_notes',
        'relationshipNotes',
      ]),
    );
  }
}

class UpdateParentProfileInput {
  const UpdateParentProfileInput({
    this.address,
    this.relationshipNotes,
  });

  final String? address;
  final String? relationshipNotes;

  Map<String, dynamic> toJson() => {
        'address': address,
        'relationship_notes': relationshipNotes,
      };
}
