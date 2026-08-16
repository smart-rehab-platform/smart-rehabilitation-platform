import '../../../core/utils/api_response_parser.dart';

const supportRequestSubjectMinLength = 3;
const supportRequestSubjectMaxLength = 200;
const supportRequestDescriptionMinLength = 20;
const supportRequestDescriptionMaxLength = 2000;
const supportRequestMessageMaxLength = 2000;
const supportRequestAttachmentMaxBytes = 10 * 1024 * 1024;
const supportRequestPageLimit = 20;

enum SupportRequestCategory {
  technicalIssue('technical_issue'),
  patientCaseIssue('patient_case_issue'),
  sessionSchedulingIssue('session_scheduling_issue'),
  accountProfileIssue('account_profile_issue'),
  exerciseContentIssue('exercise_content_issue'),
  other('other');

  const SupportRequestCategory(this.apiValue);
  final String apiValue;

  static SupportRequestCategory? fromApiValue(String? value) {
    if (value == null) return null;
    for (final item in SupportRequestCategory.values) {
      if (item.apiValue == value) return item;
    }
    return null;
  }
}

enum SupportRequestStatus {
  pending('pending'),
  inProgress('in_progress'),
  resolved('resolved');

  const SupportRequestStatus(this.apiValue);
  final String apiValue;

  static SupportRequestStatus? fromApiValue(String? value) {
    if (value == null) return null;
    for (final item in SupportRequestStatus.values) {
      if (item.apiValue == value) return item;
    }
    return null;
  }

  bool get isResolved => this == SupportRequestStatus.resolved;
}

class SupportRequestSpecialistSummary {
  const SupportRequestSpecialistSummary({
    required this.id,
    required this.fullName,
    this.email,
  });

  final String id;
  final String fullName;
  final String? email;

  factory SupportRequestSpecialistSummary.fromMap(Map<String, dynamic>? map) {
    if (map == null) {
      return const SupportRequestSpecialistSummary(id: '', fullName: '');
    }
    return SupportRequestSpecialistSummary(
      id: ApiResponseParser.readString(map, const ['id']) ?? '',
      fullName: ApiResponseParser.readString(map, const [
            'fullName',
            'full_name',
            'name',
          ]) ??
          '',
      email: ApiResponseParser.readString(map, const ['email']),
    );
  }
}

class SupportRequestMessageSender {
  const SupportRequestMessageSender({
    required this.id,
    required this.fullName,
    required this.role,
  });

  final String id;
  final String fullName;
  final String role;

  bool get isAdmin => role.toLowerCase() == 'admin';

  factory SupportRequestMessageSender.fromMap(Map<String, dynamic>? map) {
    if (map == null) {
      return const SupportRequestMessageSender(id: '', fullName: '', role: '');
    }
    return SupportRequestMessageSender(
      id: ApiResponseParser.readString(map, const ['id']) ?? '',
      fullName: ApiResponseParser.readString(map, const [
            'fullName',
            'full_name',
            'name',
          ]) ??
          '',
      role: ApiResponseParser.readString(map, const ['role']) ?? '',
    );
  }
}

class SupportRequestMessage {
  const SupportRequestMessage({
    required this.id,
    required this.supportRequestId,
    required this.senderId,
    required this.content,
    required this.createdAt,
    this.attachmentUrl,
    this.sender = const SupportRequestMessageSender(
      id: '',
      fullName: '',
      role: '',
    ),
  });

  final String id;
  final String supportRequestId;
  final String senderId;
  final String content;
  final String? attachmentUrl;
  final DateTime? createdAt;
  final SupportRequestMessageSender sender;

  factory SupportRequestMessage.fromMap(Map<String, dynamic> map) {
    final senderMap = map['sender'];
    return SupportRequestMessage(
      id: ApiResponseParser.readString(map, const ['id']) ?? '',
      supportRequestId: ApiResponseParser.readString(map, const [
            'support_request_id',
            'supportRequestId',
          ]) ??
          '',
      senderId: ApiResponseParser.readString(map, const [
            'sender_id',
            'senderId',
          ]) ??
          '',
      content: ApiResponseParser.readString(map, const ['content']) ?? '',
      attachmentUrl: ApiResponseParser.readString(map, const [
        'attachment_url',
        'attachmentUrl',
      ]),
      createdAt: ApiResponseParser.readDate(
        map['created_at'] ?? map['createdAt'],
      ),
      sender: SupportRequestMessageSender.fromMap(
        senderMap is Map
            ? senderMap.map((key, value) => MapEntry(key.toString(), value))
            : null,
      ),
    );
  }
}

class SupportRequestItem {
  const SupportRequestItem({
    required this.id,
    required this.category,
    required this.subject,
    required this.status,
    required this.createdAt,
    this.specialistId,
    this.lastMessageAt,
    this.resolvedAt,
    this.specialist = const SupportRequestSpecialistSummary(id: '', fullName: ''),
    this.messages = const [],
  });

  final String id;
  final String? specialistId;
  final SupportRequestCategory category;
  final String subject;
  final SupportRequestStatus status;
  final DateTime? lastMessageAt;
  final DateTime? resolvedAt;
  final DateTime? createdAt;
  final SupportRequestSpecialistSummary specialist;
  final List<SupportRequestMessage> messages;

  bool get isResolved => status.isResolved;

  factory SupportRequestItem.fromMap(Map<String, dynamic> map) {
    final messagesRaw = map['messages'];
    final messages = messagesRaw is List
        ? messagesRaw
            .whereType<Map>()
            .map(
              (item) => SupportRequestMessage.fromMap(
                item.map((key, value) => MapEntry(key.toString(), value)),
              ),
            )
            .toList(growable: false)
        : const <SupportRequestMessage>[];

    final specialistMap = map['specialist'];
    return SupportRequestItem(
      id: ApiResponseParser.readString(map, const ['id']) ?? '',
      specialistId: ApiResponseParser.readString(map, const [
        'specialist_id',
        'specialistId',
      ]),
      category: SupportRequestCategory.fromApiValue(
            ApiResponseParser.readString(map, const ['category']),
          ) ??
          SupportRequestCategory.other,
      subject: ApiResponseParser.readString(map, const ['subject']) ?? '',
      status: SupportRequestStatus.fromApiValue(
            ApiResponseParser.readString(map, const ['status']),
          ) ??
          SupportRequestStatus.pending,
      lastMessageAt: ApiResponseParser.readDate(
        map['last_message_at'] ?? map['lastMessageAt'],
      ),
      resolvedAt: ApiResponseParser.readDate(
        map['resolved_at'] ?? map['resolvedAt'],
      ),
      createdAt: ApiResponseParser.readDate(
        map['created_at'] ?? map['createdAt'],
      ),
      specialist: SupportRequestSpecialistSummary.fromMap(
        specialistMap is Map
            ? specialistMap.map((key, value) => MapEntry(key.toString(), value))
            : null,
      ),
      messages: messages,
    );
  }
}

class SupportRequestPagination {
  const SupportRequestPagination({
    this.page = 1,
    this.limit = supportRequestPageLimit,
    this.total = 0,
    this.totalPages = 0,
  });

  final int page;
  final int limit;
  final int total;
  final int totalPages;

  bool get hasNextPage => page < totalPages;

  factory SupportRequestPagination.fromMap(Map<String, dynamic>? map) {
    if (map == null) {
      return const SupportRequestPagination();
    }
    final page = ApiResponseParser.readInt(map, const ['page']) ?? 1;
    final limit =
        ApiResponseParser.readInt(map, const ['limit']) ?? supportRequestPageLimit;
    final total = ApiResponseParser.readInt(map, const ['total']) ?? 0;
    final totalPages = ApiResponseParser.readInt(map, const [
          'totalPages',
          'total_pages',
        ]) ??
        (limit > 0 ? (total / limit).ceil() : 0);
    return SupportRequestPagination(
      page: page,
      limit: limit,
      total: total,
      totalPages: totalPages,
    );
  }
}

class AdminSupportRequestsPage {
  const AdminSupportRequestsPage({
    this.items = const [],
    this.pagination = const SupportRequestPagination(),
  });

  final List<SupportRequestItem> items;
  final SupportRequestPagination pagination;

  factory AdminSupportRequestsPage.fromMap(Map<String, dynamic> map) {
    final itemsRaw = map['items'] ?? map['data'];
    final items = itemsRaw is List
        ? itemsRaw
            .whereType<Map>()
            .map(
              (item) => SupportRequestItem.fromMap(
                item.map((key, value) => MapEntry(key.toString(), value)),
              ),
            )
            .toList(growable: false)
        : const <SupportRequestItem>[];

    final paginationMap = map['pagination'];
    return AdminSupportRequestsPage(
      items: items,
      pagination: SupportRequestPagination.fromMap(
        paginationMap is Map
            ? paginationMap.map((key, value) => MapEntry(key.toString(), value))
            : null,
      ),
    );
  }
}

class CreateSupportRequestPayload {
  const CreateSupportRequestPayload({
    required this.category,
    required this.subject,
    required this.description,
    this.attachmentUrl,
  });

  final SupportRequestCategory category;
  final String subject;
  final String description;
  final String? attachmentUrl;

  Map<String, dynamic> toJson() => {
        'category': category.apiValue,
        'subject': subject.trim(),
        'description': description.trim(),
        if (attachmentUrl != null && attachmentUrl!.trim().isNotEmpty)
          'attachment_url': attachmentUrl!.trim(),
      };
}

class CreateSupportRequestMessagePayload {
  const CreateSupportRequestMessagePayload({
    this.content = '',
    this.attachmentUrl,
  });

  final String content;
  final String? attachmentUrl;

  Map<String, dynamic> toJson() => {
        'content': content.trim(),
        if (attachmentUrl != null && attachmentUrl!.trim().isNotEmpty)
          'attachment_url': attachmentUrl!.trim(),
      };
}
