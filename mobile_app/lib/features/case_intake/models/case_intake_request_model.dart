import '../../../core/utils/api_response_parser.dart';
import '../../dashboard/models/session_requests_models.dart';
import 'case_category_model.dart';
import 'case_request_attachment_model.dart';

bool? _readBool(Map<String, dynamic> map, List<String> keys) {
  for (final key in keys) {
    final value = map[key];
    if (value is bool) {
      return value;
    }
    if (value == 1 || value == 'true' || value == '1') {
      return true;
    }
    if (value == 0 || value == 'false' || value == '0') {
      return false;
    }
  }
  return null;
}

enum CaseIntakeGender {
  male('male', 'Male'),
  female('female', 'Female'),
  other('other', 'Other');

  const CaseIntakeGender(this.apiValue, this.label);

  final String apiValue;
  final String label;

  static CaseIntakeGender? fromApi(String? value) {
    if (value == null || value.trim().isEmpty) {
      return null;
    }
    final normalized = value.trim().toLowerCase();
    for (final gender in CaseIntakeGender.values) {
      if (gender.apiValue == normalized) {
        return gender;
      }
    }
    return null;
  }
}

enum CaseIntakeStatus {
  pending('pending'),
  assigned('assigned'),
  underAssessment('under_assessment'),
  accepted('accepted'),
  rejected('rejected'),
  convertedToPatient('converted_to_patient');

  const CaseIntakeStatus(this.apiValue);

  final String apiValue;

  static CaseIntakeStatus? fromApi(String? value) {
    if (value == null || value.trim().isEmpty) {
      return null;
    }
    for (final status in CaseIntakeStatus.values) {
      if (status.apiValue == value) {
        return status;
      }
    }
    return null;
  }

  String get displayLabel => switch (this) {
    CaseIntakeStatus.pending => 'Pending Review',
    CaseIntakeStatus.assigned => 'Specialist Assigned',
    CaseIntakeStatus.underAssessment => 'Under Assessment',
    CaseIntakeStatus.accepted => 'Accepted',
    CaseIntakeStatus.rejected => 'Rejected',
    CaseIntakeStatus.convertedToPatient => 'Profile Created',
  };

  String get subtitle => switch (this) {
    CaseIntakeStatus.pending => 'Your request is waiting for admin review.',
    CaseIntakeStatus.assigned =>
      'A specialist has been assigned and will begin reviewing the case.',
    CaseIntakeStatus.underAssessment =>
      'The assigned specialist is assessing the case.',
    CaseIntakeStatus.accepted =>
      'The specialist accepted the case. A patient profile may be created soon.',
    CaseIntakeStatus.rejected =>
      'This request was not accepted. See the reason below.',
    CaseIntakeStatus.convertedToPatient =>
      'The child profile is active and ready for follow-up.',
  };

  bool get isTerminal =>
      this == CaseIntakeStatus.rejected ||
      this == CaseIntakeStatus.convertedToPatient;

  bool get isActive =>
      !isTerminal || this == CaseIntakeStatus.convertedToPatient;

  bool get canEdit => this == CaseIntakeStatus.pending;

  bool get canEditAttachments => this == CaseIntakeStatus.pending;

  bool get conversationAvailable =>
      this != CaseIntakeStatus.pending && this != CaseIntakeStatus.rejected;

  int progressStepIndex({DateTime? assignedAt}) {
    switch (this) {
      case CaseIntakeStatus.pending:
        return 1;
      case CaseIntakeStatus.assigned:
        return 2;
      case CaseIntakeStatus.underAssessment:
        return 3;
      case CaseIntakeStatus.accepted:
        return 4;
      case CaseIntakeStatus.convertedToPatient:
        return 5;
      case CaseIntakeStatus.rejected:
        return assignedAt != null ? 3 : 1;
    }
  }
}

class CaseAssignedSpecialist {
  const CaseAssignedSpecialist({
    required this.id,
    this.fullName,
    this.profileImageUrl,
    this.specialization,
  });

  final String id;
  final String? fullName;
  final String? profileImageUrl;
  final String? specialization;

  factory CaseAssignedSpecialist.fromMap(Map<String, dynamic>? map) {
    if (map == null || map.isEmpty) {
      return const CaseAssignedSpecialist(id: '');
    }

    return CaseAssignedSpecialist(
      id: ApiResponseParser.readString(map, const ['id', '_id']) ?? '',
      fullName: ApiResponseParser.readString(map, const [
        'full_name',
        'fullName',
        'name',
      ]),
      profileImageUrl: ApiResponseParser.readString(map, const [
        'profile_image_url',
        'profileImageUrl',
      ]),
      specialization: ApiResponseParser.readString(map, const [
        'specialization',
      ]),
    );
  }
}

class CaseIntakeRequest {
  const CaseIntakeRequest({
    required this.id,
    required this.parentId,
    required this.childName,
    this.dateOfBirth,
    this.gender,
    this.categoryId,
    this.caseDescription,
    this.observedDifficulties,
    this.hasPreviousDiagnosis = false,
    this.previousDiagnosisDetails,
    this.isCurrentlyReceivingTreatment = false,
    this.currentTreatmentDetails,
    this.preferredContactPeriod,
    this.status,
    this.assignedSpecialistId,
    this.patientId,
    this.rejectionReason,
    this.submittedAt,
    this.assignedAt,
    this.acceptedAt,
    this.convertedAt,
    this.createdAt,
    this.updatedAt,
    this.attachmentCount = 0,
    this.category,
    this.assignedSpecialist,
    this.attachments = const [],
    this.conversationId,
  });

  final String id;
  final String parentId;
  final String childName;
  final DateTime? dateOfBirth;
  final String? gender;
  final String? categoryId;
  final String? caseDescription;
  final String? observedDifficulties;
  final bool hasPreviousDiagnosis;
  final String? previousDiagnosisDetails;
  final bool isCurrentlyReceivingTreatment;
  final String? currentTreatmentDetails;
  final PreferredTimePeriod? preferredContactPeriod;
  final CaseIntakeStatus? status;
  final String? assignedSpecialistId;
  final String? patientId;
  final String? rejectionReason;
  final DateTime? submittedAt;
  final DateTime? assignedAt;
  final DateTime? acceptedAt;
  final DateTime? convertedAt;
  final DateTime? createdAt;
  final DateTime? updatedAt;
  final int attachmentCount;
  final CaseCategory? category;
  final CaseAssignedSpecialist? assignedSpecialist;
  final List<CaseRequestAttachment> attachments;
  final String? conversationId;

  bool get canEdit => status?.canEdit ?? false;

  bool get canEditAttachments => status?.canEditAttachments ?? false;

  bool get showsConversationAction {
    if (conversationId != null && conversationId!.isNotEmpty) {
      return true;
    }
    return (status?.conversationAvailable ?? false) &&
        assignedSpecialistId != null &&
        assignedSpecialistId!.isNotEmpty;
  }

  factory CaseIntakeRequest.fromMap(Map<String, dynamic> map) {
    final categoryMap = ApiResponseParser.asMap(map['category']);
    final specialistMap =
        ApiResponseParser.asMap(map['assigned_specialist']) ??
        ApiResponseParser.asMap(map['assignedSpecialist']);
    // Attachments arrive as a raw JSON array on the request object.
    // Do not use extractList() here — it expects a { data: [...] } envelope
    // and returns [] when given a List directly.
    final attachmentsField = map['attachments'];
    final attachmentsRaw = attachmentsField is List
        ? List<dynamic>.from(attachmentsField)
        : const <dynamic>[];

    return CaseIntakeRequest(
      id: ApiResponseParser.readString(map, const ['id', '_id']) ?? '',
      parentId:
          ApiResponseParser.readString(map, const ['parent_id', 'parentId']) ??
          '',
      childName:
          ApiResponseParser.readString(map, const [
            'child_name',
            'childName',
          ]) ??
          '',
      dateOfBirth: ApiResponseParser.readDate(
        map['date_of_birth'] ?? map['dateOfBirth'],
      ),
      gender: ApiResponseParser.readString(map, const ['gender']),
      categoryId: ApiResponseParser.readString(map, const [
        'category_id',
        'categoryId',
      ]),
      caseDescription: ApiResponseParser.readString(map, const [
        'case_description',
        'caseDescription',
      ]),
      observedDifficulties: ApiResponseParser.readString(map, const [
        'observed_difficulties',
        'observedDifficulties',
      ]),
      hasPreviousDiagnosis:
          _readBool(map, const [
            'has_previous_diagnosis',
            'hasPreviousDiagnosis',
          ]) ??
          false,
      previousDiagnosisDetails: ApiResponseParser.readString(map, const [
        'previous_diagnosis_details',
        'previousDiagnosisDetails',
      ]),
      isCurrentlyReceivingTreatment:
          _readBool(map, const [
            'is_currently_receiving_treatment',
            'isCurrentlyReceivingTreatment',
          ]) ??
          false,
      currentTreatmentDetails: ApiResponseParser.readString(map, const [
        'current_treatment_details',
        'currentTreatmentDetails',
      ]),
      preferredContactPeriod: PreferredTimePeriod.fromApi(
        ApiResponseParser.readString(map, const [
          'preferred_contact_period',
          'preferredContactPeriod',
        ]),
      ),
      status: CaseIntakeStatus.fromApi(
        ApiResponseParser.readString(map, const ['status']),
      ),
      assignedSpecialistId: ApiResponseParser.readString(map, const [
        'assigned_specialist_id',
        'assignedSpecialistId',
      ]),
      patientId: ApiResponseParser.readString(map, const [
        'patient_id',
        'patientId',
      ]),
      rejectionReason: ApiResponseParser.readString(map, const [
        'rejection_reason',
        'rejectionReason',
      ]),
      submittedAt: ApiResponseParser.readDate(
        map['submitted_at'] ?? map['submittedAt'],
      ),
      assignedAt: ApiResponseParser.readDate(
        map['assigned_at'] ?? map['assignedAt'],
      ),
      acceptedAt: ApiResponseParser.readDate(
        map['accepted_at'] ?? map['acceptedAt'],
      ),
      convertedAt: ApiResponseParser.readDate(
        map['converted_at'] ?? map['convertedAt'],
      ),
      createdAt: ApiResponseParser.readDate(
        map['created_at'] ?? map['createdAt'],
      ),
      updatedAt: ApiResponseParser.readDate(
        map['updated_at'] ?? map['updatedAt'],
      ),
      attachmentCount:
          ApiResponseParser.readInt(map, const [
            'attachment_count',
            'attachmentCount',
          ]) ??
          0,
      category: categoryMap != null ? CaseCategory.fromMap(categoryMap) : null,
      assignedSpecialist: specialistMap != null
          ? CaseAssignedSpecialist.fromMap(specialistMap)
          : null,
      attachments: attachmentsRaw
          .whereType<Map>()
          .map(
            (item) => item.map((key, value) => MapEntry(key.toString(), value)),
          )
          .map((item) => CaseRequestAttachment.fromMap(item))
          .where((attachment) => attachment.id.isNotEmpty)
          .toList(),
      conversationId: ApiResponseParser.readString(map, const [
        'conversation_id',
        'conversationId',
      ]),
    );
  }

  CaseIntakeRequest copyWith({
    List<CaseRequestAttachment>? attachments,
    int? attachmentCount,
    String? conversationId,
  }) {
    return CaseIntakeRequest(
      id: id,
      parentId: parentId,
      childName: childName,
      dateOfBirth: dateOfBirth,
      gender: gender,
      categoryId: categoryId,
      caseDescription: caseDescription,
      observedDifficulties: observedDifficulties,
      hasPreviousDiagnosis: hasPreviousDiagnosis,
      previousDiagnosisDetails: previousDiagnosisDetails,
      isCurrentlyReceivingTreatment: isCurrentlyReceivingTreatment,
      currentTreatmentDetails: currentTreatmentDetails,
      preferredContactPeriod: preferredContactPeriod,
      status: status,
      assignedSpecialistId: assignedSpecialistId,
      patientId: patientId,
      rejectionReason: rejectionReason,
      submittedAt: submittedAt,
      assignedAt: assignedAt,
      acceptedAt: acceptedAt,
      convertedAt: convertedAt,
      createdAt: createdAt,
      updatedAt: updatedAt,
      attachmentCount: attachmentCount ?? this.attachmentCount,
      category: category,
      assignedSpecialist: assignedSpecialist,
      attachments: attachments ?? this.attachments,
      conversationId: conversationId ?? this.conversationId,
    );
  }
}

class CaseIntakeRequestInput {
  const CaseIntakeRequestInput({
    required this.childName,
    required this.dateOfBirth,
    this.gender,
    required this.categoryId,
    required this.caseDescription,
    this.observedDifficulties,
    required this.hasPreviousDiagnosis,
    this.previousDiagnosisDetails,
    required this.isCurrentlyReceivingTreatment,
    this.currentTreatmentDetails,
    required this.preferredContactPeriod,
  });

  final String childName;
  final String dateOfBirth;
  final String? gender;
  final String categoryId;
  final String caseDescription;
  final String? observedDifficulties;
  final bool hasPreviousDiagnosis;
  final String? previousDiagnosisDetails;
  final bool isCurrentlyReceivingTreatment;
  final String? currentTreatmentDetails;
  final PreferredTimePeriod preferredContactPeriod;

  Map<String, dynamic> toJson() {
    return {
      'child_name': childName.trim(),
      'date_of_birth': dateOfBirth,
      if (gender != null && gender!.trim().isNotEmpty) 'gender': gender!.trim(),
      'category_id': categoryId,
      'case_description': caseDescription.trim(),
      if (observedDifficulties != null &&
          observedDifficulties!.trim().isNotEmpty)
        'observed_difficulties': observedDifficulties!.trim(),
      'has_previous_diagnosis': hasPreviousDiagnosis,
      if (hasPreviousDiagnosis &&
          previousDiagnosisDetails != null &&
          previousDiagnosisDetails!.trim().isNotEmpty)
        'previous_diagnosis_details': previousDiagnosisDetails!.trim(),
      'is_currently_receiving_treatment': isCurrentlyReceivingTreatment,
      if (isCurrentlyReceivingTreatment &&
          currentTreatmentDetails != null &&
          currentTreatmentDetails!.trim().isNotEmpty)
        'current_treatment_details': currentTreatmentDetails!.trim(),
      'preferred_contact_period': preferredContactPeriod.apiValue,
    };
  }
}
