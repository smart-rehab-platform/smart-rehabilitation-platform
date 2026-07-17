import '../../../core/utils/api_response_parser.dart';
import 'case_category_model.dart';
import 'case_intake_request_model.dart';

class CaseIntakeParentSummary {
  const CaseIntakeParentSummary({
    required this.id,
    this.fullName,
    this.email,
    this.phone,
    this.profileImageUrl,
  });

  final String id;
  final String? fullName;
  final String? email;
  final String? phone;
  final String? profileImageUrl;

  factory CaseIntakeParentSummary.fromMap(Map<String, dynamic>? map) {
    if (map == null || map.isEmpty) {
      return const CaseIntakeParentSummary(id: '');
    }

    return CaseIntakeParentSummary(
      id: ApiResponseParser.readString(map, const ['id', '_id']) ?? '',
      fullName: ApiResponseParser.readString(map, const [
        'full_name',
        'fullName',
        'name',
      ]),
      email: ApiResponseParser.readString(map, const ['email']),
      phone: ApiResponseParser.readString(map, const ['phone']),
      profileImageUrl: ApiResponseParser.readString(map, const [
        'profile_image_url',
        'profileImageUrl',
      ]),
    );
  }
}

class AdminCaseInboxItem {
  const AdminCaseInboxItem({
    required this.id,
    required this.childName,
    this.dateOfBirth,
    this.gender,
    this.status,
    this.submittedAt,
    this.assignedAt,
    this.updatedAt,
    this.category,
    this.parent,
    this.assignedSpecialist,
    this.attachmentCount = 0,
  });

  final String id;
  final String childName;
  final DateTime? dateOfBirth;
  final String? gender;
  final CaseIntakeStatus? status;
  final DateTime? submittedAt;
  final DateTime? assignedAt;
  final DateTime? updatedAt;
  final CaseCategory? category;
  final CaseIntakeParentSummary? parent;
  final CaseAssignedSpecialist? assignedSpecialist;
  final int attachmentCount;

  factory AdminCaseInboxItem.fromMap(Map<String, dynamic> map) {
    final categoryMap = ApiResponseParser.asMap(map['category']);
    final parentMap = ApiResponseParser.asMap(map['parent']);
    final specialistMap =
        ApiResponseParser.asMap(map['assigned_specialist']) ??
        ApiResponseParser.asMap(map['assignedSpecialist']);

    return AdminCaseInboxItem(
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
      updatedAt: ApiResponseParser.readDate(
        map['updated_at'] ?? map['updatedAt'],
      ),
      category: categoryMap != null ? CaseCategory.fromMap(categoryMap) : null,
      parent: parentMap != null
          ? CaseIntakeParentSummary.fromMap(parentMap)
          : null,
      assignedSpecialist: specialistMap != null
          ? CaseAssignedSpecialist.fromMap(specialistMap)
          : null,
      attachmentCount:
          ApiResponseParser.readInt(map, const [
            'attachment_count',
            'attachmentCount',
          ]) ??
          0,
    );
  }
}

class AdminInboxPagination {
  const AdminInboxPagination({
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

  factory AdminInboxPagination.fromMap(Map<String, dynamic>? map) {
    if (map == null || map.isEmpty) {
      return const AdminInboxPagination();
    }

    return AdminInboxPagination(
      page: ApiResponseParser.readInt(map, const ['page']) ?? 1,
      limit: ApiResponseParser.readInt(map, const ['limit']) ?? 20,
      total: ApiResponseParser.readInt(map, const ['total']) ?? 0,
      totalPages:
          ApiResponseParser.readInt(map, const ['total_pages', 'totalPages']) ??
          0,
    );
  }
}

class AdminInboxPageResult {
  const AdminInboxPageResult({required this.items, required this.pagination});

  final List<AdminCaseInboxItem> items;
  final AdminInboxPagination pagination;
}

class AdminInboxQuery {
  const AdminInboxQuery({
    this.status,
    this.categoryId,
    this.searchText,
    this.page = 1,
    this.limit = 20,
  });

  final CaseIntakeStatus? status;
  final String? categoryId;
  final String? searchText;
  final int page;
  final int limit;

  /// Maps Flutter filters to backend query params.
  ///
  /// Search uses [child_name] only. Sending the same text as both
  /// [parent_name] and [child_name] would apply AND and over-restrict results.
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

    final search = searchText?.trim();
    if (search != null && search.isNotEmpty) {
      params['child_name'] = search;
    }

    return params;
  }

  AdminInboxQuery copyWith({
    Object? status = _sentinel,
    Object? categoryId = _sentinel,
    Object? searchText = _sentinel,
    int? page,
    int? limit,
  }) {
    return AdminInboxQuery(
      status: identical(status, _sentinel)
          ? this.status
          : status as CaseIntakeStatus?,
      categoryId: identical(categoryId, _sentinel)
          ? this.categoryId
          : categoryId as String?,
      searchText: identical(searchText, _sentinel)
          ? this.searchText
          : searchText as String?,
      page: page ?? this.page,
      limit: limit ?? this.limit,
    );
  }
}

const _sentinel = Object();
