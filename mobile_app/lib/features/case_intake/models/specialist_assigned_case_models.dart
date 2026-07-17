import '../../../core/utils/api_response_parser.dart';
import 'admin_case_inbox_models.dart';
import 'case_category_model.dart';
import 'case_intake_request_model.dart';

class SpecialistAssignedCaseItem {
  const SpecialistAssignedCaseItem({
    required this.id,
    required this.childName,
    this.dateOfBirth,
    this.gender,
    this.status,
    this.submittedAt,
    this.assignedAt,
    this.acceptedAt,
    this.convertedAt,
    this.updatedAt,
    this.category,
    this.parent,
    this.attachmentCount = 0,
    this.conversationId,
    this.patientId,
  });

  final String id;
  final String childName;
  final DateTime? dateOfBirth;
  final String? gender;
  final CaseIntakeStatus? status;
  final DateTime? submittedAt;
  final DateTime? assignedAt;
  final DateTime? acceptedAt;
  final DateTime? convertedAt;
  final DateTime? updatedAt;
  final CaseCategory? category;
  final CaseIntakeParentSummary? parent;
  final int attachmentCount;
  final String? conversationId;
  final String? patientId;

  bool get hasConversation =>
      conversationId != null && conversationId!.trim().isNotEmpty;

  factory SpecialistAssignedCaseItem.fromMap(Map<String, dynamic> map) {
    final categoryMap = ApiResponseParser.asMap(map['category']);
    final parentMap = ApiResponseParser.asMap(map['parent']);

    return SpecialistAssignedCaseItem(
      id: ApiResponseParser.readString(map, const ['id', '_id']) ?? '',
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
      status: CaseIntakeStatus.fromApi(
        ApiResponseParser.readString(map, const ['status']),
      ),
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
      updatedAt: ApiResponseParser.readDate(
        map['updated_at'] ?? map['updatedAt'],
      ),
      category: categoryMap != null ? CaseCategory.fromMap(categoryMap) : null,
      parent: parentMap != null
          ? CaseIntakeParentSummary.fromMap(parentMap)
          : null,
      attachmentCount:
          ApiResponseParser.readInt(map, const [
            'attachment_count',
            'attachmentCount',
          ]) ??
          0,
      conversationId: ApiResponseParser.readString(map, const [
        'conversation_id',
        'conversationId',
      ]),
      patientId: ApiResponseParser.readString(map, const [
        'patient_id',
        'patientId',
      ]),
    );
  }
}

class SpecialistAssignedPagination {
  const SpecialistAssignedPagination({
    this.page = 1,
    this.limit = 20,
    this.total = 0,
    this.totalPages = 0,
  });

  final int page;
  final int limit;
  final int total;
  final int totalPages;

  bool get hasNextPage => totalPages > 0 && page < totalPages;

  factory SpecialistAssignedPagination.fromMap(Map<String, dynamic>? map) {
    if (map == null || map.isEmpty) {
      return const SpecialistAssignedPagination();
    }

    return SpecialistAssignedPagination(
      page: ApiResponseParser.readInt(map, const ['page']) ?? 1,
      limit: ApiResponseParser.readInt(map, const ['limit']) ?? 20,
      total: ApiResponseParser.readInt(map, const ['total']) ?? 0,
      totalPages:
          ApiResponseParser.readInt(map, const ['total_pages', 'totalPages']) ??
          0,
    );
  }
}

class SpecialistAssignedPageResult {
  const SpecialistAssignedPageResult({
    required this.items,
    required this.pagination,
  });

  final List<SpecialistAssignedCaseItem> items;
  final SpecialistAssignedPagination pagination;
}

class SpecialistAssignedQuery {
  const SpecialistAssignedQuery({
    this.status,
    this.categoryId,
    this.childName,
    this.page = 1,
    this.limit = 20,
  });

  final CaseIntakeStatus? status;
  final String? categoryId;
  final String? childName;
  final int page;
  final int limit;

  /// Maps Flutter filters to backend query params.
  ///
  /// Search uses [child_name] only. Do not send [parent_name].
  Map<String, dynamic> toQueryParameters() {
    final params = <String, dynamic>{
      'page': page < 1 ? 1 : page,
      'limit': limit.clamp(1, 100),
    };

    final statusValue = status?.apiValue;
    if (statusValue != null && statusValue.isNotEmpty) {
      params['status'] = statusValue;
    }

    final category = categoryId?.trim();
    if (category != null && category.isNotEmpty) {
      params['category_id'] = category;
    }

    final child = childName?.trim();
    if (child != null && child.isNotEmpty) {
      params['child_name'] = child;
    }

    return params;
  }
}
