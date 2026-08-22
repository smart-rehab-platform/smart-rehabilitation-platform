import '../../../core/utils/api_response_parser.dart';
import '../utils/session_classification.dart';
import 'specialist_dashboard_models.dart';

class SpecialistPatientItem {
  const SpecialistPatientItem({
    required this.id,
    required this.name,
    this.dateOfBirth,
    this.diagnosis,
    this.profileImageUrl,
  });

  final String id;
  final String name;
  final DateTime? dateOfBirth;
  final String? diagnosis;
  final String? profileImageUrl;

  factory SpecialistPatientItem.fromMap(Map<String, dynamic> map) {
    return SpecialistPatientItem(
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
      diagnosis: ApiResponseParser.readString(map, const [
        'primary_diagnosis',
        'diagnosis',
      ]),
      profileImageUrl: ApiResponseParser.readString(map, const [
        'profile_image_url',
        'profileImageUrl',
        'profile_image',
        'profileImage',
        'image_url',
        'avatarUrl',
        'avatar',
      ]),
    );
  }
}

class SpecialistTreatmentPlanItem {
  const SpecialistTreatmentPlanItem({
    required this.id,
    required this.title,
    required this.patientName,
    this.patientId,
    this.status,
    this.startDate,
    this.endDate,
    this.specialistId,
  });

  final String id;
  final String title;
  final String patientName;
  final String? patientId;
  final String? status;
  final DateTime? startDate;
  final DateTime? endDate;
  final String? specialistId;

  bool get isActive => status?.trim().toLowerCase() == 'active';

  String get statusLabel {
    final raw = status?.trim().toLowerCase();
    return switch (raw) {
      'completed' => 'Completed',
      'archived' => 'Archived',
      'active' => 'Active',
      _ => (status?.trim().isNotEmpty == true)
          ? '${status![0].toUpperCase()}${status!.substring(1)}'
          : 'Active',
    };
  }

  factory SpecialistTreatmentPlanItem.fromMap(Map<String, dynamic> map) {
    return SpecialistTreatmentPlanItem(
      id: ApiResponseParser.readString(map, const ['id', '_id']) ?? '',
      title:
          ApiResponseParser.readString(map, const ['title']) ??
          'Treatment Plan',
      patientName:
          ApiResponseParser.readString(map, const [
            'patient_name',
            'patientName',
          ]) ??
          'Patient',
      patientId: ApiResponseParser.readString(map, const [
        'patient_id',
        'patientId',
      ]),
      status: ApiResponseParser.readString(map, const ['status']),
      startDate: ApiResponseParser.readDate(
        map['start_date'] ?? map['startDate'],
      ),
      endDate: ApiResponseParser.readDate(map['end_date'] ?? map['endDate']),
      specialistId: ApiResponseParser.readString(map, const [
        'specialist_id',
        'specialistId',
      ]),
    );
  }
}

class SpecialistExerciseItem {
  const SpecialistExerciseItem({
    required this.id,
    required this.title,
    this.category,
    this.categoryId,
    this.description,
    this.instructions,
    this.instructionMediaUrl,
    this.language = 'en',
    this.expectedText,
    this.targetWord,
    this.targetPhoneme,
    this.createdBy,
    this.createdByName,
  });

  static const defaultLanguage = 'en';

  final String id;
  final String title;
  final String? category;
  final String? categoryId;
  final String? description;
  final String? instructions;
  final String? instructionMediaUrl;
  final String language;
  final String? expectedText;
  final String? targetWord;
  final String? targetPhoneme;
  final String? createdBy;
  final String? createdByName;

  String get normalizedLanguage =>
      language.trim().toLowerCase() == 'ar' ? 'ar' : defaultLanguage;

  String get languageLabel =>
      normalizedLanguage == 'ar' ? 'Arabic' : 'English';

  /// Short preview for list cards (instructions preferred, then description).
  String? get previewText {
    final instructionsText = instructions?.trim();
    if (instructionsText != null && instructionsText.isNotEmpty) {
      return instructionsText;
    }
    final descriptionText = description?.trim();
    if (descriptionText != null && descriptionText.isNotEmpty) {
      return descriptionText;
    }
    return null;
  }

  bool get hasMedia {
    final url = instructionMediaUrl?.trim();
    return url != null && url.isNotEmpty;
  }

  bool canEditBy({required String? userId, required String? role}) {
    final normalizedRole = role?.trim().toLowerCase();
    if (normalizedRole == 'admin') {
      return true;
    }
    if (normalizedRole != 'specialist') {
      return false;
    }
    final creator = createdBy?.trim();
    final current = userId?.trim();
    return creator != null &&
        creator.isNotEmpty &&
        current != null &&
        current.isNotEmpty &&
        creator == current;
  }

  factory SpecialistExerciseItem.fromMap(Map<String, dynamic> map) {
    return SpecialistExerciseItem(
      id: ApiResponseParser.readString(map, const ['id', '_id']) ?? '',
      title:
          ApiResponseParser.readString(map, const ['title', 'name']) ??
          'Exercise',
      category: ApiResponseParser.readString(map, const [
        'category_name',
        'categoryName',
        'category',
      ]),
      categoryId: ApiResponseParser.readString(map, const [
        'category_id',
        'categoryId',
      ]),
      description: ApiResponseParser.readString(map, const ['description']),
      instructions: ApiResponseParser.readString(map, const ['instructions']),
      instructionMediaUrl: ApiResponseParser.readString(map, const [
        'instruction_media_url',
        'instructionMediaUrl',
      ]),
      language: _parseExerciseLanguage(map),
      expectedText: ApiResponseParser.readString(map, const [
        'expected_text',
        'expectedText',
      ]),
      targetWord: ApiResponseParser.readString(map, const [
        'target_word',
        'targetWord',
      ]),
      targetPhoneme: ApiResponseParser.readString(map, const [
        'target_phoneme',
        'targetPhoneme',
      ]),
      createdBy: ApiResponseParser.readString(map, const [
        'created_by',
        'createdBy',
      ]),
      createdByName: ApiResponseParser.readString(map, const [
        'created_by_name',
        'createdByName',
      ]),
    );
  }
}

class ExerciseCategoryItem {
  const ExerciseCategoryItem({
    required this.id,
    required this.name,
    this.description,
  });

  final String id;
  final String name;
  final String? description;

  factory ExerciseCategoryItem.fromMap(Map<String, dynamic> map) {
    return ExerciseCategoryItem(
      id: ApiResponseParser.readString(map, const ['id', '_id']) ?? '',
      name: ApiResponseParser.readString(map, const ['name', 'title']) ??
          'Category',
      description: ApiResponseParser.readString(map, const ['description']),
    );
  }
}

class UpsertExerciseRequest {
  const UpsertExerciseRequest({
    required this.categoryId,
    required this.title,
    this.description,
    this.instructions,
    this.instructionMediaUrl,
    this.language = SpecialistExerciseItem.defaultLanguage,
    this.expectedText,
    this.targetWord,
    this.targetPhoneme,
    this.clearInstructionMedia = false,
  });

  final String categoryId;
  final String title;
  final String? description;
  final String? instructions;
  final String? instructionMediaUrl;
  final String language;
  final String? expectedText;
  final String? targetWord;
  final String? targetPhoneme;
  final bool clearInstructionMedia;

  String get normalizedLanguage =>
      language.trim().toLowerCase() == 'ar' ? 'ar' : SpecialistExerciseItem.defaultLanguage;

  Map<String, dynamic> toCreateJson() {
    return {
      'category_id': categoryId,
      'title': title.trim(),
      'language': normalizedLanguage,
      if (description != null && description!.trim().isNotEmpty)
        'description': description!.trim(),
      if (instructions != null && instructions!.trim().isNotEmpty)
        'instructions': instructions!.trim(),
      if (instructionMediaUrl != null &&
          instructionMediaUrl!.trim().isNotEmpty)
        'instruction_media_url': instructionMediaUrl!.trim(),
      if (expectedText != null && expectedText!.trim().isNotEmpty)
        'expected_text': expectedText!.trim(),
      if (targetWord != null && targetWord!.trim().isNotEmpty)
        'target_word': targetWord!.trim(),
      if (targetPhoneme != null && targetPhoneme!.trim().isNotEmpty)
        'target_phoneme': targetPhoneme!.trim(),
    };
  }

  Map<String, dynamic> toUpdateJson() {
    return {
      'category_id': categoryId,
      'title': title.trim(),
      'language': normalizedLanguage,
      'description': description?.trim() ?? '',
      'instructions': instructions?.trim() ?? '',
      'instruction_media_url': clearInstructionMedia
          ? ''
          : (instructionMediaUrl?.trim() ?? ''),
      'expected_text': expectedText?.trim() ?? '',
      'target_word': targetWord?.trim() ?? '',
      'target_phoneme': targetPhoneme?.trim() ?? '',
    };
  }
}

String _parseExerciseLanguage(Map<String, dynamic> map) {
  final value = ApiResponseParser.readString(map, const ['language']);
  if (value == null || value.trim().isEmpty) {
    return SpecialistExerciseItem.defaultLanguage;
  }
  return value.trim().toLowerCase() == 'ar' ? 'ar' : SpecialistExerciseItem.defaultLanguage;
}

enum ExerciseAssignmentFrequency {
  daily,
  weekly,
  oneTime;

  String get apiValue => switch (this) {
        ExerciseAssignmentFrequency.daily => 'daily',
        ExerciseAssignmentFrequency.weekly => 'weekly',
        ExerciseAssignmentFrequency.oneTime => 'one_time',
      };

  String get label => switch (this) {
        ExerciseAssignmentFrequency.daily => 'Daily',
        ExerciseAssignmentFrequency.weekly => 'Weekly',
        ExerciseAssignmentFrequency.oneTime => 'One time',
      };
}

class CreateAssignedExerciseRequest {
  const CreateAssignedExerciseRequest({
    required this.exerciseId,
    required this.planId,
    required this.patientId,
    required this.frequency,
    this.startDate,
    this.dueDate,
  });

  final String exerciseId;
  final String planId;
  final String patientId;
  final ExerciseAssignmentFrequency frequency;
  final DateTime? startDate;
  final DateTime? dueDate;

  Map<String, dynamic> toJson() {
    String formatDate(DateTime date) {
      final local = DateTime(date.year, date.month, date.day);
      return '${local.year.toString().padLeft(4, '0')}-'
          '${local.month.toString().padLeft(2, '0')}-'
          '${local.day.toString().padLeft(2, '0')}';
    }

    return {
      'exercise_id': exerciseId,
      'plan_id': planId,
      'patient_id': patientId,
      'frequency': frequency.apiValue,
      if (startDate != null) 'start_date': formatDate(startDate!),
      if (dueDate != null) 'due_date': formatDate(dueDate!),
    };
  }
}

class AssignedExerciseResult {
  const AssignedExerciseResult({
    required this.id,
    required this.exerciseId,
    required this.planId,
    required this.patientId,
    this.frequency,
    this.isActive = true,
  });

  final String id;
  final String exerciseId;
  final String planId;
  final String patientId;
  final String? frequency;
  final bool isActive;

  factory AssignedExerciseResult.fromMap(Map<String, dynamic> map) {
    return AssignedExerciseResult(
      id: ApiResponseParser.readString(map, const ['id', '_id']) ?? '',
      exerciseId: ApiResponseParser.readString(map, const [
            'exercise_id',
            'exerciseId',
          ]) ??
          '',
      planId:
          ApiResponseParser.readString(map, const ['plan_id', 'planId']) ?? '',
      patientId: ApiResponseParser.readString(map, const [
            'patient_id',
            'patientId',
          ]) ??
          '',
      frequency: ApiResponseParser.readString(map, const ['frequency']),
      isActive: map['is_active'] == true ||
          map['isActive'] == true ||
          map['is_active'] == null,
    );
  }
}

class SpecialistReportItem {
  const SpecialistReportItem({
    required this.id,
    required this.title,
    this.patientName,
    this.reportType,
    this.createdAt,
  });

  final String id;
  final String title;
  final String? patientName;
  final String? reportType;
  final DateTime? createdAt;

  factory SpecialistReportItem.fromMap(Map<String, dynamic> map) {
    return SpecialistReportItem(
      id: ApiResponseParser.readString(map, const ['id', '_id']) ?? '',
      title: ApiResponseParser.readString(map, const ['title']) ?? 'Report',
      patientName: ApiResponseParser.readString(map, const [
        'patient_name',
        'patientName',
      ]),
      reportType: ApiResponseParser.readString(map, const [
        'report_type',
        'reportType',
        'type',
      ]),
      createdAt: ApiResponseParser.readDate(
        map['created_at'] ?? map['createdAt'],
      ),
    );
  }
}

class SpecialistNotificationItem {
  const SpecialistNotificationItem({
    required this.id,
    required this.title,
    this.body,
    this.type,
    this.createdAt,
    this.relatedEntityType,
    this.relatedEntityId,
    this.isRead = false,
  });

  final String id;
  final String title;
  final String? body;
  final String? type;
  final DateTime? createdAt;
  final String? relatedEntityType;
  final String? relatedEntityId;
  final bool isRead;

  factory SpecialistNotificationItem.fromMap(Map<String, dynamic> map) {
    return SpecialistNotificationItem(
      id: ApiResponseParser.readString(map, const ['id', '_id']) ?? '',
      title:
          ApiResponseParser.readString(map, const ['title', 'subject']) ??
          'Notification',
      body: ApiResponseParser.readString(map, const ['body', 'message']),
      type: ApiResponseParser.readString(map, const ['type', 'category']),
      createdAt: ApiResponseParser.readDate(
        map['created_at'] ?? map['createdAt'],
      ),
      relatedEntityType: ApiResponseParser.readString(map, const [
        'related_entity_type',
        'relatedEntityType',
      ]),
      relatedEntityId: ApiResponseParser.readString(map, const [
        'related_entity_id',
        'relatedEntityId',
      ]),
      isRead: map['is_read'] == true || map['isRead'] == true,
    );
  }
}

class SpecialistSessionDetail extends SpecialistScheduleItem {
  const SpecialistSessionDetail({
    required this.id,
    required this.patientId,
    required super.timeLabel,
    required super.patientName,
    required super.sessionType,
    this.patientProfileImageUrl,
    this.scheduledAt,
    this.location,
    this.status,
    this.durationMinutes,
    this.cancellationReason,
    this.createdAt,
    this.updatedAt,
  });

  final String id;
  final String patientId;
  final String? patientProfileImageUrl;
  final DateTime? scheduledAt;
  final String? location;
  final String? status;
  final int? durationMinutes;
  final String? cancellationReason;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  factory SpecialistSessionDetail.fromMap(Map<String, dynamic> map) {
    final scheduledAt = ApiResponseParser.readDate(
      map['scheduled_at'] ?? map['scheduledAt'],
    );
    final duration = ApiResponseParser.readInt(map, const [
      'duration_minutes',
      'durationMinutes',
    ]);

    return SpecialistSessionDetail(
      id: ApiResponseParser.readString(map, const ['id', '_id']) ?? '',
      patientId:
          ApiResponseParser.readString(map, const [
            'patient_id',
            'patientId',
          ]) ??
          '',
      timeLabel: SpecialistScheduleItem.fromMap(map).timeLabel,
      patientName:
          ApiResponseParser.readString(map, const [
            'patient_name',
            'patientName',
            'full_name',
          ]) ??
          'Patient',
      sessionType:
          ApiResponseParser.readString(map, const [
            'session_type',
            'sessionType',
            'type',
            'notes',
          ]) ??
          'Therapy Session',
      patientProfileImageUrl: ApiResponseParser.readString(map, const [
        'patient_profile_image_url',
        'patientProfileImageUrl',
        'profile_image_url',
        'profileImageUrl',
      ]),
      scheduledAt: scheduledAt,
      location: ApiResponseParser.readString(map, const [
        'location_or_link',
        'location',
        'locationOrLink',
      ]),
      status: ApiResponseParser.readString(map, const ['status']),
      durationMinutes: duration,
      cancellationReason: ApiResponseParser.readString(map, const [
        'cancellation_reason',
        'cancellationReason',
      ]),
      createdAt: ApiResponseParser.readDate(
        map['created_at'] ?? map['createdAt'],
      ),
      updatedAt: ApiResponseParser.readDate(
        map['updated_at'] ?? map['updatedAt'],
      ),
    );
  }

  DateTime? get endsAt {
    if (scheduledAt == null) {
      return null;
    }
    final minutes = durationMinutes ?? 45;
    return scheduledAt!.add(Duration(minutes: minutes));
  }

  String get endTimeLabel {
    final end = endsAt;
    if (end == null) {
      return '—';
    }
    final hour = end.hour % 12 == 0 ? 12 : end.hour % 12;
    final minute = end.minute.toString().padLeft(2, '0');
    final suffix = end.hour >= 12 ? 'PM' : 'AM';
    return '$hour:$minute $suffix';
  }

  bool get isToday => sessionIsToday(scheduledAt: scheduledAt);

  bool get isUpcoming =>
      sessionIsUpcoming(status: status, scheduledAt: scheduledAt);

  bool get isPast => sessionIsPast(status: status, scheduledAt: scheduledAt);

  bool get isCompleted => status?.toLowerCase() == 'completed';

  bool get isScheduled {
    final normalized = status?.toLowerCase().trim();
    return normalized == null ||
        normalized.isEmpty ||
        normalized == 'scheduled';
  }

  bool get isTerminal =>
      displayStatus == SessionDisplayStatus.completed ||
      displayStatus == SessionDisplayStatus.cancelled ||
      displayStatus == SessionDisplayStatus.noShow;

  bool get canModify => isScheduled && !isTerminal;

  bool get isCancelled {
    final normalized = status?.toLowerCase();
    return normalized == 'cancelled' || normalized == 'no_show';
  }

  /// True when [location] looks like an http(s) meeting link.
  bool get hasOnlineMeetingLink => extractSessionMeetingUrl(location) != null;

  SessionDisplayStatus get displayStatus {
    switch (status?.toLowerCase().trim()) {
      case 'completed':
        return SessionDisplayStatus.completed;
      case 'cancelled':
        return SessionDisplayStatus.cancelled;
      case 'no_show':
        return SessionDisplayStatus.noShow;
      case 'scheduled':
      default:
        return SessionDisplayStatus.scheduled;
    }
  }

  bool matchesFilter(SessionListFilter filter) {
    return switch (filter) {
      SessionListFilter.all => true,
      SessionListFilter.today => isToday,
      SessionListFilter.upcoming => isUpcoming,
      SessionListFilter.past => isPast,
    };
  }

  /// Subtitle for dashboard cards: session type + status + location when available.
  String get displaySubtitle {
    final parts = <String>[
      if (sessionType.isNotEmpty) sessionType,
      if (status != null && status!.isNotEmpty) status!,
      if (location != null && location!.isNotEmpty) location!,
    ];
    return parts.isEmpty ? 'Therapy Session' : parts.join(' • ');
  }
}

/// Parses an http(s) URL from a location/link string, if present.
Uri? extractSessionMeetingUrl(String? locationOrLink) {
  final raw = locationOrLink?.trim();
  if (raw == null || raw.isEmpty) {
    return null;
  }

  final direct = Uri.tryParse(raw);
  if (direct != null &&
      direct.hasScheme &&
      (direct.scheme == 'http' || direct.scheme == 'https')) {
    return direct;
  }

  final match = RegExp(r'https?://[^\s]+', caseSensitive: false).firstMatch(raw);
  if (match != null) {
    return Uri.tryParse(match.group(0)!);
  }

  return null;
}

enum SessionListFilter {
  all,
  today,
  upcoming,
  past;

  String get label => switch (this) {
    SessionListFilter.all => 'All',
    SessionListFilter.today => 'Today',
    SessionListFilter.upcoming => 'Upcoming',
    SessionListFilter.past => 'Past',
  };
}

enum SessionDisplayStatus {
  scheduled,
  completed,
  cancelled,
  noShow;

  String get label => switch (this) {
    SessionDisplayStatus.scheduled => 'Scheduled',
    SessionDisplayStatus.completed => 'Completed',
    SessionDisplayStatus.cancelled => 'Cancelled',
    SessionDisplayStatus.noShow => 'No Show',
  };
}

String formatDashboardDate(DateTime? date) {
  if (date == null) {
    return '—';
  }
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  return '${months[date.month - 1]} ${date.day}, ${date.year}';
}
