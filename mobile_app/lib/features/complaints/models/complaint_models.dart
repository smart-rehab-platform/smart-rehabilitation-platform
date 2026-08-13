import '../../../core/utils/api_response_parser.dart';

enum ComplaintCategory {
  specialistNotResponding('specialist_not_responding'),
  poorFollowUp('poor_follow_up'),
  repeatedSessionCancellations('repeated_session_cancellations'),
  delayedExerciseFeedback('delayed_exercise_feedback'),
  inappropriateCommunication('inappropriate_communication'),
  other('other');

  const ComplaintCategory(this.apiValue);
  final String apiValue;

  static ComplaintCategory? fromApiValue(String? value) {
    if (value == null) return null;
    for (final item in ComplaintCategory.values) {
      if (item.apiValue == value) return item;
    }
    return null;
  }
}

enum ComplaintStatus {
  pending('pending'),
  underReview('under_review'),
  resolved('resolved'),
  rejected('rejected');

  const ComplaintStatus(this.apiValue);
  final String apiValue;

  static ComplaintStatus? fromApiValue(String? value) {
    if (value == null) return null;
    for (final item in ComplaintStatus.values) {
      if (item.apiValue == value) return item;
    }
    return null;
  }
}

class ComplaintPersonSummary {
  const ComplaintPersonSummary({required this.id, required this.fullName});

  final String id;
  final String fullName;

  factory ComplaintPersonSummary.fromMap(Map<String, dynamic>? map) {
    if (map == null) {
      return const ComplaintPersonSummary(id: '', fullName: '');
    }
    return ComplaintPersonSummary(
      id: ApiResponseParser.readString(map, const ['id']) ?? '',
      fullName: ApiResponseParser.readString(map, const [
            'fullName',
            'full_name',
            'name',
          ]) ??
          '',
    );
  }
}

class ComplaintItem {
  const ComplaintItem({
    required this.id,
    required this.category,
    required this.status,
    required this.description,
    required this.createdAt,
    this.attachmentUrl,
    this.parentResponse,
    this.reviewedAt,
    this.resolvedAt,
    this.parent = const ComplaintPersonSummary(id: '', fullName: ''),
    this.patient = const ComplaintPersonSummary(id: '', fullName: ''),
    this.specialist = const ComplaintPersonSummary(id: '', fullName: ''),
    this.reviewer,
    this.adminNotes,
  });

  final String id;
  final ComplaintCategory category;
  final ComplaintStatus status;
  final String description;
  final String? attachmentUrl;
  final String? parentResponse;
  final String? adminNotes;
  final DateTime? reviewedAt;
  final DateTime? resolvedAt;
  final DateTime? createdAt;
  final ComplaintPersonSummary parent;
  final ComplaintPersonSummary patient;
  final ComplaintPersonSummary specialist;
  final ComplaintPersonSummary? reviewer;

  factory ComplaintItem.fromMap(Map<String, dynamic> map) {
    return ComplaintItem(
      id: ApiResponseParser.readString(map, const ['id']) ?? '',
      category: ComplaintCategory.fromApiValue(
            ApiResponseParser.readString(map, const ['category']),
          ) ??
          ComplaintCategory.other,
      status: ComplaintStatus.fromApiValue(
            ApiResponseParser.readString(map, const ['status']),
          ) ??
          ComplaintStatus.pending,
      description: ApiResponseParser.readString(map, const ['description']) ?? '',
      attachmentUrl: ApiResponseParser.readString(map, const [
        'attachment_url',
        'attachmentUrl',
      ]),
      parentResponse: ApiResponseParser.readString(map, const [
        'parent_response',
        'parentResponse',
      ]),
      adminNotes: ApiResponseParser.readString(map, const [
        'admin_notes',
        'adminNotes',
      ]),
      reviewedAt: ApiResponseParser.readDate(
        map['reviewed_at'] ?? map['reviewedAt'],
      ),
      resolvedAt: ApiResponseParser.readDate(
        map['resolved_at'] ?? map['resolvedAt'],
      ),
      createdAt: ApiResponseParser.readDate(
        map['created_at'] ?? map['createdAt'],
      ),
      parent: ComplaintPersonSummary.fromMap(
        map['parent'] as Map<String, dynamic>?,
      ),
      patient: ComplaintPersonSummary.fromMap(
        map['patient'] as Map<String, dynamic>?,
      ),
      specialist: ComplaintPersonSummary.fromMap(
        map['specialist'] as Map<String, dynamic>?,
      ),
      reviewer: map['reviewer'] == null
          ? null
          : ComplaintPersonSummary.fromMap(
              map['reviewer'] as Map<String, dynamic>?,
            ),
    );
  }
}

class ComplaintPagination {
  const ComplaintPagination({
    this.page = 1,
    this.limit = 20,
    this.total = 0,
    this.totalPages = 0,
  });

  final int page;
  final int limit;
  final int total;
  final int totalPages;

  bool get hasNextPage => page < totalPages;

  factory ComplaintPagination.fromMap(Map<String, dynamic>? map) {
    if (map == null) return const ComplaintPagination();
    return ComplaintPagination(
      page: ApiResponseParser.readInt(map, const ['page']) ?? 1,
      limit: ApiResponseParser.readInt(map, const ['limit']) ?? 20,
      total: ApiResponseParser.readInt(map, const ['total']) ?? 0,
      totalPages: ApiResponseParser.readInt(map, const [
            'totalPages',
            'total_pages',
          ]) ??
          0,
    );
  }
}

class AdminComplaintsPage {
  const AdminComplaintsPage({
    required this.items,
    required this.pagination,
  });

  final List<ComplaintItem> items;
  final ComplaintPagination pagination;

  factory AdminComplaintsPage.fromMap(Map<String, dynamic> map) {
    final rawItems = map['items'] as List? ?? const [];
    return AdminComplaintsPage(
      items: rawItems
          .whereType<Map>()
          .map(
            (item) => ComplaintItem.fromMap(
              item.map((key, value) => MapEntry(key.toString(), value)),
            ),
          )
          .toList(growable: false),
      pagination: ComplaintPagination.fromMap(
        map['pagination'] as Map<String, dynamic>?,
      ),
    );
  }
}

class CreateComplaintPayload {
  const CreateComplaintPayload({
    required this.patientId,
    required this.specialistId,
    required this.category,
    required this.description,
    this.attachmentUrl,
  });

  final String patientId;
  final String specialistId;
  final ComplaintCategory category;
  final String description;
  final String? attachmentUrl;

  Map<String, dynamic> toJson() => {
    'patient_id': patientId,
    'specialist_id': specialistId,
    'category': category.apiValue,
    'description': description.trim(),
    if (attachmentUrl != null && attachmentUrl!.isNotEmpty)
      'attachment_url': attachmentUrl,
  };
}
