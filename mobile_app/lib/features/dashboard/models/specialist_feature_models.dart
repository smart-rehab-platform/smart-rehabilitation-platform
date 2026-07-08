import '../../../core/utils/api_response_parser.dart';
import 'specialist_dashboard_models.dart';

class SpecialistPatientItem {
  const SpecialistPatientItem({
    required this.id,
    required this.name,
    this.dateOfBirth,
    this.diagnosis,
  });

  final String id;
  final String name;
  final DateTime? dateOfBirth;
  final String? diagnosis;

  factory SpecialistPatientItem.fromMap(Map<String, dynamic> map) {
    return SpecialistPatientItem(
      id: ApiResponseParser.readString(map, const ['id', '_id']) ?? '',
      name: ApiResponseParser.readString(map, const [
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
    );
  }
}

class SpecialistTreatmentPlanItem {
  const SpecialistTreatmentPlanItem({
    required this.id,
    required this.title,
    required this.patientName,
    this.status,
    this.startDate,
    this.endDate,
    this.specialistId,
  });

  final String id;
  final String title;
  final String patientName;
  final String? status;
  final DateTime? startDate;
  final DateTime? endDate;
  final String? specialistId;

  factory SpecialistTreatmentPlanItem.fromMap(Map<String, dynamic> map) {
    return SpecialistTreatmentPlanItem(
      id: ApiResponseParser.readString(map, const ['id', '_id']) ?? '',
      title: ApiResponseParser.readString(map, const ['title']) ?? 'Treatment Plan',
      patientName: ApiResponseParser.readString(map, const [
            'patient_name',
            'patientName',
          ]) ??
          'Patient',
      status: ApiResponseParser.readString(map, const ['status']),
      startDate: ApiResponseParser.readDate(map['start_date'] ?? map['startDate']),
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
    this.instructions,
  });

  final String id;
  final String title;
  final String? category;
  final String? instructions;

  factory SpecialistExerciseItem.fromMap(Map<String, dynamic> map) {
    return SpecialistExerciseItem(
      id: ApiResponseParser.readString(map, const ['id', '_id']) ?? '',
      title: ApiResponseParser.readString(map, const ['title', 'name']) ??
          'Exercise',
      category: ApiResponseParser.readString(map, const [
        'category_name',
        'categoryName',
        'category',
      ]),
      instructions: ApiResponseParser.readString(map, const [
        'instructions',
        'description',
      ]),
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
    this.isRead = false,
  });

  final String id;
  final String title;
  final String? body;
  final String? type;
  final DateTime? createdAt;
  final bool isRead;

  factory SpecialistNotificationItem.fromMap(Map<String, dynamic> map) {
    return SpecialistNotificationItem(
      id: ApiResponseParser.readString(map, const ['id', '_id']) ?? '',
      title: ApiResponseParser.readString(map, const ['title', 'subject']) ??
          'Notification',
      body: ApiResponseParser.readString(map, const ['body', 'message']),
      type: ApiResponseParser.readString(map, const ['type', 'category']),
      createdAt: ApiResponseParser.readDate(
        map['created_at'] ?? map['createdAt'],
      ),
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
    this.scheduledAt,
    this.location,
    this.status,
  });

  final String id;
  final String patientId;
  final DateTime? scheduledAt;
  final String? location;
  final String? status;

  factory SpecialistSessionDetail.fromMap(Map<String, dynamic> map) {
    final scheduledAt = ApiResponseParser.readDate(
      map['scheduled_at'] ?? map['scheduledAt'],
    );

    return SpecialistSessionDetail(
      id: ApiResponseParser.readString(map, const ['id', '_id']) ?? '',
      patientId: ApiResponseParser.readString(map, const [
            'patient_id',
            'patientId',
          ]) ??
          '',
      timeLabel: SpecialistScheduleItem.fromMap(map).timeLabel,
      patientName: ApiResponseParser.readString(map, const [
            'patient_name',
            'patientName',
            'full_name',
          ]) ??
          'Patient',
      sessionType: ApiResponseParser.readString(map, const [
            'session_type',
            'sessionType',
            'type',
            'notes',
          ]) ??
          'Therapy Session',
      scheduledAt: scheduledAt,
      location: ApiResponseParser.readString(map, const [
        'location_or_link',
        'location',
        'locationOrLink',
      ]),
      status: ApiResponseParser.readString(map, const ['status']),
    );
  }

  bool get isToday {
    if (scheduledAt == null) {
      return false;
    }
    final now = DateTime.now();
    return scheduledAt!.year == now.year &&
        scheduledAt!.month == now.month &&
        scheduledAt!.day == now.day;
  }

  bool get isUpcoming {
    if (scheduledAt == null) {
      return false;
    }
    final normalized = status?.toLowerCase();
    if (normalized == 'completed' ||
        normalized == 'cancelled' ||
        normalized == 'no_show') {
      return false;
    }
    return scheduledAt!.isAfter(DateTime.now()) && !isToday;
  }

  bool get isCompleted => status?.toLowerCase() == 'completed';

  bool get isCancelled {
    final normalized = status?.toLowerCase();
    return normalized == 'cancelled' || normalized == 'no_show';
  }

  SessionDisplayStatus get displayStatus {
    if (isCancelled) {
      return SessionDisplayStatus.cancelled;
    }
    if (isCompleted) {
      return SessionDisplayStatus.completed;
    }
    if (isToday) {
      return SessionDisplayStatus.today;
    }
    return SessionDisplayStatus.upcoming;
  }

  bool matchesFilter(SessionListFilter filter) {
    return switch (filter) {
      SessionListFilter.all => true,
      SessionListFilter.today => isToday,
      SessionListFilter.upcoming => isUpcoming,
      SessionListFilter.completed => isCompleted,
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

enum SessionListFilter {
  all,
  today,
  upcoming,
  completed;

  String get label => switch (this) {
        SessionListFilter.all => 'All',
        SessionListFilter.today => 'Today',
        SessionListFilter.upcoming => 'Upcoming',
        SessionListFilter.completed => 'Completed',
      };
}

enum SessionDisplayStatus {
  today,
  upcoming,
  completed,
  cancelled;

  String get label => switch (this) {
        SessionDisplayStatus.today => 'Today',
        SessionDisplayStatus.upcoming => 'Upcoming',
        SessionDisplayStatus.completed => 'Completed',
        SessionDisplayStatus.cancelled => 'Cancelled',
      };
}

String formatDashboardDate(DateTime? date) {
  if (date == null) {
    return '—';
  }
  return '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}';
}
