import '../../../core/utils/api_response_parser.dart';

enum SessionRequestReason {
  regularFollowUp('regular_follow_up', 'Regular Follow-up'),
  replacementCancelled('replacement_cancelled', 'Replacement (Cancelled Session)'),
  replacementMissed('replacement_missed', 'Replacement (Missed Session)'),
  additionalSession('additional_session', 'Additional Session'),
  consultation('consultation', 'Consultation'),
  other('other', 'Other');

  const SessionRequestReason(this.apiValue, this.label);

  final String apiValue;
  final String label;

  static SessionRequestReason? fromApi(String? value) {
    if (value == null) {
      return null;
    }
    for (final reason in SessionRequestReason.values) {
      if (reason.apiValue == value) {
        return reason;
      }
    }
    return null;
  }
}

enum PreferredTimePeriod {
  morning('morning', 'Morning'),
  afternoon('afternoon', 'Afternoon'),
  evening('evening', 'Evening'),
  flexible('flexible', 'Flexible');

  const PreferredTimePeriod(this.apiValue, this.label);

  final String apiValue;
  final String label;

  static PreferredTimePeriod? fromApi(String? value) {
    if (value == null) {
      return null;
    }
    for (final period in PreferredTimePeriod.values) {
      if (period.apiValue == value) {
        return period;
      }
    }
    return null;
  }
}

enum SessionRequestStatus {
  pending('pending', 'Pending'),
  approved('approved', 'Approved'),
  rejected('rejected', 'Rejected');

  const SessionRequestStatus(this.apiValue, this.label);

  final String apiValue;
  final String label;

  static SessionRequestStatus? fromApi(String? value) {
    if (value == null) {
      return null;
    }
    for (final status in SessionRequestStatus.values) {
      if (status.apiValue == value) {
        return status;
      }
    }
    return null;
  }
}

class SessionRequestApprovedSession {
  const SessionRequestApprovedSession({
    this.scheduledAt,
    this.durationMinutes,
    this.locationOrLink,
  });

  final DateTime? scheduledAt;
  final int? durationMinutes;
  final String? locationOrLink;

  factory SessionRequestApprovedSession.fromMap(Map<String, dynamic> map) {
    return SessionRequestApprovedSession(
      scheduledAt: ApiResponseParser.readDate(
        map['scheduled_at'] ?? map['scheduledAt'],
      ),
      durationMinutes: ApiResponseParser.readInt(map, const [
        'duration_minutes',
        'durationMinutes',
      ]),
      locationOrLink: ApiResponseParser.readString(map, const [
        'location_or_link',
        'locationOrLink',
      ]),
    );
  }
}

class SessionRequestItem {
  const SessionRequestItem({
    required this.id,
    required this.patientId,
    required this.parentId,
    required this.specialistId,
    required this.reason,
    this.reasonOtherText,
    this.preferredDate,
    this.preferredTimePeriod,
    this.notes,
    this.status,
    this.rejectionReason,
    this.approvedSessionId,
    this.reviewedAt,
    this.createdAt,
    this.updatedAt,
    this.patientName,
    this.parentName,
    this.specialistName,
    this.approvedSession,
  });

  final String id;
  final String patientId;
  final String parentId;
  final String specialistId;
  final SessionRequestReason? reason;
  final String? reasonOtherText;
  final DateTime? preferredDate;
  final PreferredTimePeriod? preferredTimePeriod;
  final String? notes;
  final SessionRequestStatus? status;
  final String? rejectionReason;
  final String? approvedSessionId;
  final DateTime? reviewedAt;
  final DateTime? createdAt;
  final DateTime? updatedAt;
  final String? patientName;
  final String? parentName;
  final String? specialistName;
  final SessionRequestApprovedSession? approvedSession;

  String get reasonLabel {
    if (reason == SessionRequestReason.other &&
        reasonOtherText != null &&
        reasonOtherText!.trim().isNotEmpty) {
      return reasonOtherText!.trim();
    }
    return reason?.label ?? 'Session request';
  }

  SessionRequestItem copyWith({
    SessionRequestApprovedSession? approvedSession,
  }) {
    return SessionRequestItem(
      id: id,
      patientId: patientId,
      parentId: parentId,
      specialistId: specialistId,
      reason: reason,
      reasonOtherText: reasonOtherText,
      preferredDate: preferredDate,
      preferredTimePeriod: preferredTimePeriod,
      notes: notes,
      status: status,
      rejectionReason: rejectionReason,
      approvedSessionId: approvedSessionId,
      reviewedAt: reviewedAt,
      createdAt: createdAt,
      updatedAt: updatedAt,
      patientName: patientName,
      parentName: parentName,
      specialistName: specialistName,
      approvedSession: approvedSession ?? this.approvedSession,
    );
  }

  factory SessionRequestItem.fromMap(Map<String, dynamic> map) {
    final preferredDateRaw = map['preferred_date'] ?? map['preferredDate'];

    return SessionRequestItem(
      id: ApiResponseParser.readString(map, const ['id', '_id']) ?? '',
      patientId: ApiResponseParser.readString(map, const [
            'patient_id',
            'patientId',
          ]) ??
          '',
      parentId: ApiResponseParser.readString(map, const [
            'parent_id',
            'parentId',
          ]) ??
          '',
      specialistId: ApiResponseParser.readString(map, const [
            'specialist_id',
            'specialistId',
          ]) ??
          '',
      reason: SessionRequestReason.fromApi(
        ApiResponseParser.readString(map, const ['reason']),
      ),
      reasonOtherText: ApiResponseParser.readString(map, const [
        'reason_other_text',
        'reasonOtherText',
      ]),
      preferredDate: preferredDateRaw is String
          ? ApiResponseParser.readDate('${preferredDateRaw}T00:00:00.000Z')
          : ApiResponseParser.readDate(preferredDateRaw),
      preferredTimePeriod: PreferredTimePeriod.fromApi(
        ApiResponseParser.readString(map, const [
          'preferred_time_period',
          'preferredTimePeriod',
        ]),
      ),
      notes: ApiResponseParser.readString(map, const ['notes']),
      status: SessionRequestStatus.fromApi(
        ApiResponseParser.readString(map, const ['status']),
      ),
      rejectionReason: ApiResponseParser.readString(map, const [
        'rejection_reason',
        'rejectionReason',
      ]),
      approvedSessionId: ApiResponseParser.readString(map, const [
        'approved_session_id',
        'approvedSessionId',
      ]),
      reviewedAt: ApiResponseParser.readDate(
        map['reviewed_at'] ?? map['reviewedAt'],
      ),
      createdAt: ApiResponseParser.readDate(
        map['created_at'] ?? map['createdAt'],
      ),
      updatedAt: ApiResponseParser.readDate(
        map['updated_at'] ?? map['updatedAt'],
      ),
      patientName: ApiResponseParser.readString(map, const [
        'patient_name',
        'patientName',
      ]),
      parentName: ApiResponseParser.readString(map, const [
        'parent_name',
        'parentName',
      ]),
      specialistName: ApiResponseParser.readString(map, const [
        'specialist_name',
        'specialistName',
      ]),
    );
  }
}

class CreateSessionRequestInput {
  const CreateSessionRequestInput({
    required this.patientId,
    required this.specialistId,
    required this.reason,
    this.reasonOtherText,
    required this.preferredDate,
    required this.preferredTimePeriod,
    this.notes,
  });

  final String patientId;
  final String specialistId;
  final SessionRequestReason reason;
  final String? reasonOtherText;
  final DateTime preferredDate;
  final PreferredTimePeriod preferredTimePeriod;
  final String? notes;

  Map<String, dynamic> toJson() {
    return {
      'patient_id': patientId,
      'specialist_id': specialistId,
      'reason': reason.apiValue,
      'reason_other_text': reason == SessionRequestReason.other
          ? reasonOtherText?.trim()
          : null,
      'preferred_date':
          '${preferredDate.year.toString().padLeft(4, '0')}-${preferredDate.month.toString().padLeft(2, '0')}-${preferredDate.day.toString().padLeft(2, '0')}',
      'preferred_time_period': preferredTimePeriod.apiValue,
      if (notes != null && notes!.trim().isNotEmpty) 'notes': notes!.trim(),
    };
  }
}

class ApproveSessionRequestInput {
  const ApproveSessionRequestInput({
    required this.scheduledAt,
    this.durationMinutes = 45,
    this.locationOrLink,
  });

  final DateTime scheduledAt;
  final int durationMinutes;
  final String? locationOrLink;

  Map<String, dynamic> toJson() {
    return {
      'scheduled_at': scheduledAt.toUtc().toIso8601String(),
      'duration_minutes': durationMinutes,
      if (locationOrLink != null && locationOrLink!.trim().isNotEmpty)
        'location_or_link': locationOrLink!.trim(),
    };
  }
}

class RejectSessionRequestInput {
  const RejectSessionRequestInput({required this.rejectionReason});

  final String rejectionReason;

  Map<String, dynamic> toJson() {
    return {'rejection_reason': rejectionReason.trim()};
  }
}

class ApproveSessionRequestResult {
  const ApproveSessionRequestResult({
    required this.request,
    required this.session,
  });

  final SessionRequestItem request;
  final SessionRequestApprovedSession session;

  factory ApproveSessionRequestResult.fromMap(Map<String, dynamic> map) {
    final requestMap = ApiResponseParser.asMap(map['request']) ?? map;
    final sessionMap = ApiResponseParser.asMap(map['session']) ?? const {};

    return ApproveSessionRequestResult(
      request: SessionRequestItem.fromMap(requestMap),
      session: SessionRequestApprovedSession.fromMap(sessionMap),
    );
  }
}
