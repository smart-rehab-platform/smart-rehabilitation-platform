import '../../../core/utils/api_response_parser.dart';

class ParentChild {
  const ParentChild({
    required this.id,
    required this.name,
    this.progressPercent,
    this.dateOfBirth,
    this.gender,
    this.profileImageUrl,
  });

  final String id;
  final String name;
  final double? progressPercent;
  final DateTime? dateOfBirth;
  final String? gender;
  final String? profileImageUrl;

  int? get age {
    if (dateOfBirth == null) {
      return null;
    }
    final now = DateTime.now();
    var years = now.year - dateOfBirth!.year;
    if (now.month < dateOfBirth!.month ||
        (now.month == dateOfBirth!.month && now.day < dateOfBirth!.day)) {
      years--;
    }
    return years >= 0 ? years : null;
  }

  factory ParentChild.fromMap(Map<String, dynamic> map) {
    return ParentChild(
      id: ApiResponseParser.readString(map, const ['id', '_id']) ?? '',
      name:
          ApiResponseParser.readString(map, const [
            'full_name',
            'fullName',
            'name',
          ]) ??
          'Child',
      progressPercent: ApiResponseParser.readDouble(map, const [
        'improvement_percentage',
        'improvementPercentage',
        'progress',
      ]),
      dateOfBirth: ApiResponseParser.readDate(
        map['date_of_birth'] ?? map['dateOfBirth'] ?? map['dob'],
      ),
      gender: ApiResponseParser.readString(map, const ['gender']),
      profileImageUrl: ApiResponseParser.readString(map, const [
        'profile_image_url',
        'profileImageUrl',
        'profile_image',
        'profileImage',
      ]),
    );
  }

  ParentChild copyWith({
    String? name,
    double? progressPercent,
    DateTime? dateOfBirth,
    String? gender,
    String? profileImageUrl,
  }) {
    return ParentChild(
      id: id,
      name: name ?? this.name,
      progressPercent: progressPercent ?? this.progressPercent,
      dateOfBirth: dateOfBirth ?? this.dateOfBirth,
      gender: gender ?? this.gender,
      profileImageUrl: profileImageUrl ?? this.profileImageUrl,
    );
  }
}

class ParentOverviewData {
  const ParentOverviewData({
    this.childrenCount = 0,
    this.todaysTasksCount = 0,
    this.upcomingSessionsCount = 0,
    this.latestReportLabel = 'No report yet',
  });

  final int childrenCount;
  final int todaysTasksCount;
  final int upcomingSessionsCount;
  final String latestReportLabel;

  factory ParentOverviewData.fromMap(Map<String, dynamic>? map) {
    if (map == null) {
      return const ParentOverviewData();
    }

    return ParentOverviewData(
      childrenCount:
          ApiResponseParser.readInt(map, const [
            'children_count',
            'childrenCount',
          ]) ??
          0,
      todaysTasksCount:
          ApiResponseParser.readInt(map, const [
            'todays_tasks_count',
            'todayTasksCount',
            'tasks_count',
          ]) ??
          0,
      upcomingSessionsCount:
          ApiResponseParser.readInt(map, const [
            'upcoming_sessions_count',
            'upcomingSessionsCount',
          ]) ??
          0,
      latestReportLabel:
          ApiResponseParser.readString(map, const [
            'latest_report',
            'latestReport',
            'latest_report_title',
          ]) ??
          'No report yet',
    );
  }
}

class ParentDailyTask {
  const ParentDailyTask({
    required this.id,
    required this.title,
    this.dueTime,
    this.status,
    this.isCompleted = false,
    this.instructions,
    this.frequency,
    this.dueDate,
    this.exerciseId,
    this.instructionMediaUrl,
  });

  final String id;
  final String title;
  final String? dueTime;
  final String? status;
  final bool isCompleted;
  final String? instructions;
  final String? frequency;
  final DateTime? dueDate;
  final String? exerciseId;
  final String? instructionMediaUrl;

  factory ParentDailyTask.fromMap(Map<String, dynamic> map) {
    final dueDate = ApiResponseParser.readDate(
      map['due_date'] ?? map['dueDate'],
    );
    return ParentDailyTask(
      id: ApiResponseParser.readString(map, const ['id', '_id']) ?? '',
      title:
          ApiResponseParser.readString(map, const [
            'exercise_title',
            'title',
            'name',
          ]) ??
          'Exercise',
      dueTime: ApiResponseParser.readString(map, const [
        'due_time',
        'dueTime',
        'scheduled_time',
        'due_date',
      ]),
      status: ApiResponseParser.readString(map, const ['status']),
      isCompleted:
          ApiResponseParser.readString(map, const ['status'])?.toLowerCase() ==
          'completed',
      instructions: ApiResponseParser.readString(map, const [
        'instructions',
        'description',
      ]),
      frequency: ApiResponseParser.readString(map, const ['frequency']),
      dueDate: dueDate,
      exerciseId: ApiResponseParser.readString(map, const [
        'exercise_id',
        'exerciseId',
      ]),
      instructionMediaUrl: ApiResponseParser.readString(map, const [
        'instruction_media_url',
        'instructionMediaUrl',
      ]),
    );
  }
}

class ParentReportItem {
  const ParentReportItem({
    required this.id,
    required this.title,
    this.summary,
    this.date,
    this.reportType,
    this.pdfUrl,
    this.patientName,
  });

  final String id;
  final String title;
  final String? summary;
  final DateTime? date;
  final String? reportType;
  final String? pdfUrl;
  final String? patientName;

  factory ParentReportItem.fromMap(Map<String, dynamic> map) {
    return ParentReportItem(
      id: ApiResponseParser.readString(map, const ['id', '_id']) ?? '',
      title:
          ApiResponseParser.readString(map, const [
            'title',
            'report_title',
            'name',
          ]) ??
          'Report',
      summary: ApiResponseParser.readString(map, const [
        'summary',
        'description',
        'content',
      ]),
      date: ApiResponseParser.readDate(
        map['created_at'] ?? map['createdAt'] ?? map['date'],
      ),
      reportType: ApiResponseParser.readString(map, const [
        'report_type',
        'reportType',
        'type',
      ]),
      pdfUrl: ApiResponseParser.readString(map, const ['pdf_url', 'pdfUrl']),
      patientName: ApiResponseParser.readString(map, const [
        'patient_name',
        'patientName',
      ]),
    );
  }
}

class ParentAiInsight {
  const ParentAiInsight({required this.message, this.type});

  final String message;
  final String? type;

  factory ParentAiInsight.fromRecommendation(Map<String, dynamic> map) {
    final details = ApiResponseParser.asMap(map['details']) ?? {};
    final childName = ApiResponseParser.readString(map, const ['patient_name']);
    final reason = ApiResponseParser.readString(details, const [
      'reason',
      'suggestion',
    ]);
    final type = ApiResponseParser.readString(map, const ['type']);

    var message =
        reason ??
        'Keep practicing today\'s assigned exercises for steady improvement.';

    if (childName != null && childName.isNotEmpty) {
      message = '$childName: $message';
    }

    return ParentAiInsight(message: message, type: type);
  }
}

class ParentSpecialistFeedback {
  const ParentSpecialistFeedback({
    required this.specialistName,
    required this.message,
    this.exerciseTitle,
    this.reviewedAt,
    this.rating,
    this.requiresRetry = false,
    this.submissionId,
  });

  final String specialistName;
  final String message;
  final String? exerciseTitle;
  final DateTime? reviewedAt;
  final int? rating;
  final bool requiresRetry;
  final String? submissionId;

  factory ParentSpecialistFeedback.fromMap(Map<String, dynamic> map) {
    return ParentSpecialistFeedback(
      specialistName:
          ApiResponseParser.readString(map, const [
            'specialist_name',
            'specialistName',
          ]) ??
          'Specialist',
      message:
          ApiResponseParser.readString(map, const [
            'feedback',
            'comments',
            'review_notes',
            'notes',
          ]) ??
          'Review available for the latest exercise submission.',
      exerciseTitle: ApiResponseParser.readString(map, const [
        'exercise_title',
        'exerciseTitle',
      ]),
      reviewedAt: ApiResponseParser.readDate(
        map['reviewed_at'] ?? map['reviewedAt'],
      ),
      rating: ApiResponseParser.readInt(map, const [
        'performance_rating',
        'performanceRating',
        'rating',
      ]),
      requiresRetry:
          map['requires_retry'] == true || map['requiresRetry'] == true,
      submissionId: ApiResponseParser.readString(map, const [
        'submission_id',
        'submissionId',
      ]),
    );
  }
}

class ParentSpeechSummary {
  const ParentSpeechSummary({
    this.pronunciationScore,
    this.fluencyScore,
    this.overallScore,
    this.deltaFromPrevious,
  });

  final double? pronunciationScore;
  final double? fluencyScore;
  final double? overallScore;
  final double? deltaFromPrevious;

  factory ParentSpeechSummary.fromAnalysis(Map<String, dynamic> map) {
    return ParentSpeechSummary(
      pronunciationScore: ApiResponseParser.readDouble(map, const [
        'pronunciation_score',
        'pronunciationScore',
      ]),
      fluencyScore: ApiResponseParser.readDouble(map, const [
        'fluency_score',
        'fluencyScore',
      ]),
      overallScore: ApiResponseParser.readDouble(map, const [
        'overall_score',
        'overallScore',
      ]),
      deltaFromPrevious: ApiResponseParser.readDouble(map, const [
        'improvement',
        'delta',
        'change',
      ]),
    );
  }
}

class ParentAttentionAlert {
  const ParentAttentionAlert({
    required this.message,
    this.severity = 'warning',
  });

  final String message;
  final String severity;
}

enum ParentNextActionType { startExercise, reviewFeedback, viewReport }

class ParentNextAction {
  const ParentNextAction({required this.label, required this.type});

  final String label;
  final ParentNextActionType type;
}

class ParentStreakInfo {
  const ParentStreakInfo({
    required this.completedToday,
    required this.totalToday,
    required this.streakDays,
  });

  final int completedToday;
  final int totalToday;
  final int streakDays;

  double get completionRatio =>
      totalToday == 0 ? 0 : completedToday / totalToday;
}

class ParentSubmissionItem {
  const ParentSubmissionItem({
    required this.id,
    required this.assignedExerciseId,
    this.submittedAt,
    this.status,
  });

  final String id;
  final String assignedExerciseId;
  final DateTime? submittedAt;
  final String? status;

  factory ParentSubmissionItem.fromMap(Map<String, dynamic> map) {
    return ParentSubmissionItem(
      id: ApiResponseParser.readString(map, const ['id', '_id']) ?? '',
      assignedExerciseId:
          ApiResponseParser.readString(map, const [
            'assigned_exercise_id',
            'assignedExerciseId',
          ]) ??
          '',
      submittedAt: ApiResponseParser.readDate(
        map['submitted_at'] ?? map['submittedAt'],
      ),
      status: ApiResponseParser.readString(map, const ['status']),
    );
  }
}

class ParentSessionItem {
  const ParentSessionItem({
    required this.id,
    required this.patientName,
    this.patientId,
    this.scheduledAt,
    this.status,
    this.specialistName,
    this.locationOrLink,
    this.durationMinutes,
  });

  final String id;
  final String patientName;
  final String? patientId;
  final DateTime? scheduledAt;
  final String? status;
  final String? specialistName;
  final String? locationOrLink;
  final int? durationMinutes;

  bool get isUpcoming {
    final normalized = status?.toLowerCase();
    if (normalized == 'cancelled' || normalized == 'completed') {
      return false;
    }
    if (scheduledAt == null) {
      return normalized == 'scheduled';
    }
    return scheduledAt!.isAfter(DateTime.now());
  }

  factory ParentSessionItem.fromMap(Map<String, dynamic> map) {
    return ParentSessionItem(
      id: ApiResponseParser.readString(map, const ['id', '_id']) ?? '',
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
      scheduledAt: ApiResponseParser.readDate(
        map['scheduled_at'] ?? map['scheduledAt'],
      ),
      status: ApiResponseParser.readString(map, const ['status']),
      specialistName: ApiResponseParser.readString(map, const [
        'specialist_name',
        'specialistName',
      ]),
      locationOrLink: ApiResponseParser.readString(map, const [
        'location_or_link',
        'locationOrLink',
      ]),
      durationMinutes: ApiResponseParser.readInt(map, const [
        'duration_minutes',
        'durationMinutes',
      ]),
    );
  }
}

class ParentAssignedExercise {
  const ParentAssignedExercise({
    required this.id,
    required this.title,
    this.instructions,
    this.frequency,
    this.dueDate,
    this.startDate,
    this.isActive = true,
    this.status,
    this.instructionMediaUrl,
  });

  final String id;
  final String title;
  final String? instructions;
  final String? frequency;
  final DateTime? dueDate;
  final DateTime? startDate;
  final bool isActive;
  final String? status;
  final String? instructionMediaUrl;

  factory ParentAssignedExercise.fromMap(Map<String, dynamic> map) {
    return ParentAssignedExercise(
      id: ApiResponseParser.readString(map, const ['id', '_id']) ?? '',
      title:
          ApiResponseParser.readString(map, const [
            'exercise_title',
            'title',
            'name',
          ]) ??
          'Exercise',
      instructions: ApiResponseParser.readString(map, const [
        'instructions',
        'description',
      ]),
      frequency: ApiResponseParser.readString(map, const ['frequency']),
      dueDate: ApiResponseParser.readDate(map['due_date'] ?? map['dueDate']),
      startDate: ApiResponseParser.readDate(
        map['start_date'] ?? map['startDate'],
      ),
      isActive: map['is_active'] != false && map['isActive'] != false,
      status: ApiResponseParser.readString(map, const ['status']),
      instructionMediaUrl: ApiResponseParser.readString(map, const [
        'instruction_media_url',
        'instructionMediaUrl',
      ]),
    );
  }
}

class ParentProgressSnapshot {
  const ParentProgressSnapshot({
    required this.period,
    this.periodStart,
    this.periodEnd,
    this.exercisesCompleted,
    this.averagePerformance,
    this.improvementPercentage,
  });

  final String period;
  final DateTime? periodStart;
  final DateTime? periodEnd;
  final int? exercisesCompleted;
  final double? averagePerformance;
  final double? improvementPercentage;

  factory ParentProgressSnapshot.fromMap(Map<String, dynamic> map) {
    return ParentProgressSnapshot(
      period: ApiResponseParser.readString(map, const ['period']) ?? 'weekly',
      periodStart: ApiResponseParser.readDate(
        map['period_start'] ?? map['periodStart'],
      ),
      periodEnd: ApiResponseParser.readDate(
        map['period_end'] ?? map['periodEnd'],
      ),
      exercisesCompleted: ApiResponseParser.readInt(map, const [
        'exercises_completed',
        'exercisesCompleted',
      ]),
      averagePerformance: ApiResponseParser.readDouble(map, const [
        'average_performance',
        'averagePerformance',
      ]),
      improvementPercentage: ApiResponseParser.readDouble(map, const [
        'improvement_percentage',
        'improvementPercentage',
      ]),
    );
  }
}

class ParentPerformanceMetrics {
  const ParentPerformanceMetrics({
    this.totalExercisesCompleted,
    this.averagePerformance,
    this.averageImprovement,
  });

  final int? totalExercisesCompleted;
  final double? averagePerformance;
  final double? averageImprovement;

  factory ParentPerformanceMetrics.fromMap(Map<String, dynamic>? map) {
    if (map == null) {
      return const ParentPerformanceMetrics();
    }
    return ParentPerformanceMetrics(
      totalExercisesCompleted: ApiResponseParser.readInt(map, const [
        'total_exercises_completed',
        'totalExercisesCompleted',
      ]),
      averagePerformance: ApiResponseParser.readDouble(map, const [
        'average_performance',
        'averagePerformance',
      ]),
      averageImprovement: ApiResponseParser.readDouble(map, const [
        'average_improvement',
        'averageImprovement',
      ]),
    );
  }
}

class ParentNotificationItem {
  const ParentNotificationItem({
    required this.id,
    required this.title,
    this.message,
    this.createdAt,
    this.type,
    this.relatedEntityType,
    this.relatedEntityId,
    this.isRead = false,
  });

  final String id;
  final String title;
  final String? message;
  final DateTime? createdAt;
  final String? type;
  final String? relatedEntityType;
  final String? relatedEntityId;
  final bool isRead;

  factory ParentNotificationItem.fromMap(Map<String, dynamic> map) {
    return ParentNotificationItem(
      id: ApiResponseParser.readString(map, const ['id', '_id']) ?? '',
      title:
          ApiResponseParser.readString(map, const ['title', 'subject']) ??
          'Notification',
      message: ApiResponseParser.readString(map, const ['message', 'body']),
      createdAt: ApiResponseParser.readDate(
        map['created_at'] ?? map['createdAt'],
      ),
      type: ApiResponseParser.readString(map, const ['type', 'category']),
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
