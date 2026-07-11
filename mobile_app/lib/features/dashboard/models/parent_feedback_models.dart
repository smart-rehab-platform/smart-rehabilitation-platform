import '../../../core/utils/api_response_parser.dart';

class ParentTreatmentPlan {
  const ParentTreatmentPlan({
    required this.id,
    required this.title,
    this.status,
    this.patientId,
    this.specialistId,
    this.specialistName,
    this.startDate,
    this.endDate,
    this.updatedAt,
  });

  final String id;
  final String title;
  final String? status;
  final String? patientId;
  final String? specialistId;
  final String? specialistName;
  final DateTime? startDate;
  final DateTime? endDate;
  final DateTime? updatedAt;

  bool get isCompleted => status?.toLowerCase() == 'completed';

  factory ParentTreatmentPlan.fromMap(Map<String, dynamic> map) {
    return ParentTreatmentPlan(
      id: ApiResponseParser.readString(map, const ['id', '_id']) ?? '',
      title: ApiResponseParser.readString(map, const ['title']) ?? 'Treatment Plan',
      status: ApiResponseParser.readString(map, const ['status']),
      patientId: ApiResponseParser.readString(map, const [
        'patient_id',
        'patientId',
      ]),
      specialistId: ApiResponseParser.readString(map, const [
        'specialist_id',
        'specialistId',
      ]),
      specialistName: ApiResponseParser.readString(map, const [
        'specialist_name',
        'specialistName',
      ]),
      startDate: ApiResponseParser.readDate(map['start_date'] ?? map['startDate']),
      endDate: ApiResponseParser.readDate(map['end_date'] ?? map['endDate']),
      updatedAt: ApiResponseParser.readDate(map['updated_at'] ?? map['updatedAt']),
    );
  }
}

class ParentSpecialistFeedbackCheck {
  const ParentSpecialistFeedbackCheck({required this.hasFeedback});

  final bool hasFeedback;

  factory ParentSpecialistFeedbackCheck.fromMap(Map<String, dynamic> map) {
    final raw = map['hasFeedback'] ?? map['has_feedback'];
    final hasFeedback = raw is bool
        ? raw
        : raw?.toString().toLowerCase() == 'true';
    return ParentSpecialistFeedbackCheck(hasFeedback: hasFeedback);
  }
}

class ParentSpecialistFeedbackSubmission {
  const ParentSpecialistFeedbackSubmission({
    required this.id,
    required this.rating,
    this.comment,
    this.createdAt,
  });

  final String id;
  final int rating;
  final String? comment;
  final DateTime? createdAt;

  factory ParentSpecialistFeedbackSubmission.fromMap(Map<String, dynamic> map) {
    return ParentSpecialistFeedbackSubmission(
      id: ApiResponseParser.readString(map, const ['id', '_id']) ?? '',
      rating: ApiResponseParser.readInt(map, const ['rating']) ?? 0,
      comment: ApiResponseParser.readString(map, const ['comment']),
      createdAt: ApiResponseParser.readDate(map['created_at'] ?? map['createdAt']),
    );
  }
}
