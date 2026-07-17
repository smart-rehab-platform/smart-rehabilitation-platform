import '../../../core/utils/api_response_parser.dart';

enum ConvertPatientRelationship {
  mother('mother', 'Mother'),
  father('father', 'Father'),
  guardian('guardian', 'Guardian'),
  other('other', 'Other');

  const ConvertPatientRelationship(this.apiValue, this.label);

  final String apiValue;
  final String label;

  static ConvertPatientRelationship? fromApi(String? value) {
    if (value == null || value.trim().isEmpty) {
      return null;
    }
    final normalized = value.trim().toLowerCase();
    for (final item in ConvertPatientRelationship.values) {
      if (item.apiValue == normalized) {
        return item;
      }
    }
    return null;
  }
}

class ConvertToPatientInput {
  const ConvertToPatientInput({
    required this.fullName,
    required this.dateOfBirth,
    required this.gender,
    required this.relationship,
    required this.isPrimaryContact,
    this.profileImageUrl,
  });

  final String fullName;
  final String dateOfBirth;
  final String gender;
  final String relationship;
  final bool isPrimaryContact;
  final String? profileImageUrl;

  Map<String, dynamic> toJson() {
    final payload = <String, dynamic>{
      'full_name': fullName,
      'date_of_birth': dateOfBirth,
      'gender': gender,
      'relationship': relationship,
      'is_primary_contact': isPrimaryContact,
    };
    final image = profileImageUrl?.trim();
    if (image != null && image.isNotEmpty) {
      payload['profile_image_url'] = image;
    }
    return payload;
  }
}

class ConvertedPatientSummary {
  const ConvertedPatientSummary({
    required this.id,
    this.fullName,
    this.dateOfBirth,
    this.gender,
    this.profileImageUrl,
  });

  final String id;
  final String? fullName;
  final String? dateOfBirth;
  final String? gender;
  final String? profileImageUrl;

  factory ConvertedPatientSummary.fromMap(Map<String, dynamic>? map) {
    if (map == null || map.isEmpty) {
      return const ConvertedPatientSummary(id: '');
    }
    return ConvertedPatientSummary(
      id: ApiResponseParser.readString(map, const ['id', '_id']) ?? '',
      fullName: ApiResponseParser.readString(map, const [
        'full_name',
        'fullName',
      ]),
      dateOfBirth: ApiResponseParser.readString(map, const [
        'date_of_birth',
        'dateOfBirth',
      ]),
      gender: ApiResponseParser.readString(map, const ['gender']),
      profileImageUrl: ApiResponseParser.readString(map, const [
        'profile_image_url',
        'profileImageUrl',
      ]),
    );
  }
}

class ConvertPatientResult {
  const ConvertPatientResult({
    required this.message,
    required this.patient,
    this.requestId,
    this.requestStatus,
    this.patientId,
    this.conversationId,
  });

  final String message;
  final ConvertedPatientSummary patient;
  final String? requestId;
  final String? requestStatus;
  final String? patientId;
  final String? conversationId;

  factory ConvertPatientResult.fromEnvelope(Map<String, dynamic> envelope) {
    final dataMap = ApiResponseParser.asMap(envelope['data']) ?? envelope;
    final requestMap = ApiResponseParser.asMap(dataMap['request']);
    final patientMap = ApiResponseParser.asMap(dataMap['patient']);
    final conversationMap = ApiResponseParser.asMap(dataMap['conversation']);

    final patient = ConvertedPatientSummary.fromMap(patientMap);
    final requestPatientId = requestMap == null
        ? null
        : ApiResponseParser.readString(requestMap, const [
            'patient_id',
            'patientId',
          ]);
    final conversationPatientId = conversationMap == null
        ? null
        : ApiResponseParser.readString(conversationMap, const [
            'patient_id',
            'patientId',
          ]);

    return ConvertPatientResult(
      message:
          ApiResponseParser.readString(envelope, const ['message']) ??
          'Case request converted to patient successfully',
      patient: patient,
      requestId: requestMap == null
          ? null
          : ApiResponseParser.readString(requestMap, const ['id', '_id']),
      requestStatus: requestMap == null
          ? null
          : ApiResponseParser.readString(requestMap, const ['status']),
      patientId: patient.id.isNotEmpty
          ? patient.id
          : (requestPatientId ?? conversationPatientId),
      conversationId: conversationMap == null
          ? null
          : ApiResponseParser.readString(conversationMap, const [
              'id',
              '_id',
            ]),
    );
  }
}
