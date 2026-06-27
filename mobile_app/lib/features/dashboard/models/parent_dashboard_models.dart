import '../../../core/utils/api_response_parser.dart';

class ParentChild {
  const ParentChild({
    required this.id,
    required this.name,
    this.progressPercent,
  });

  final String id;
  final String name;
  final double? progressPercent;

  factory ParentChild.fromMap(Map<String, dynamic> map) {
    return ParentChild(
      id: ApiResponseParser.readString(map, const ['id', '_id']) ?? '',
      name: ApiResponseParser.readString(map, const [
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
      childrenCount: ApiResponseParser.readInt(map, const [
            'children_count',
            'childrenCount',
          ]) ??
          0,
      todaysTasksCount: ApiResponseParser.readInt(map, const [
            'todays_tasks_count',
            'todayTasksCount',
            'tasks_count',
          ]) ??
          0,
      upcomingSessionsCount: ApiResponseParser.readInt(map, const [
            'upcoming_sessions_count',
            'upcomingSessionsCount',
          ]) ??
          0,
      latestReportLabel: ApiResponseParser.readString(map, const [
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
  });

  final String id;
  final String title;
  final String? dueTime;
  final String? status;
  final bool isCompleted;

  factory ParentDailyTask.fromMap(Map<String, dynamic> map) {
    return ParentDailyTask(
      id: ApiResponseParser.readString(map, const ['id', '_id']) ?? '',
      title: ApiResponseParser.readString(map, const [
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
      isCompleted: ApiResponseParser.readString(map, const ['status'])
              ?.toLowerCase() ==
          'completed',
    );
  }
}

class ParentReportItem {
  const ParentReportItem({
    required this.id,
    required this.title,
    this.summary,
    this.date,
  });

  final String id;
  final String title;
  final String? summary;
  final DateTime? date;

  factory ParentReportItem.fromMap(Map<String, dynamic> map) {
    return ParentReportItem(
      id: ApiResponseParser.readString(map, const ['id', '_id']) ?? '',
      title: ApiResponseParser.readString(map, const [
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
    );
  }
}

class ParentAiInsight {
  const ParentAiInsight({
    required this.message,
    this.type,
  });

  final String message;
  final String? type;

  factory ParentAiInsight.fromRecommendation(Map<String, dynamic> map) {
    final details = ApiResponseParser.asMap(map['details']) ?? {};
    final childName = ApiResponseParser.readString(map, const ['patient_name']);
    final reason = ApiResponseParser.readString(details, const ['reason', 'suggestion']);
    final type = ApiResponseParser.readString(map, const ['type']);

    var message = reason ??
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
  });

  final String specialistName;
  final String message;
  final String? exerciseTitle;
  final DateTime? reviewedAt;

  factory ParentSpecialistFeedback.fromMap(Map<String, dynamic> map) {
    return ParentSpecialistFeedback(
      specialistName: ApiResponseParser.readString(map, const [
            'specialist_name',
            'specialistName',
          ]) ??
          'Specialist',
      message: ApiResponseParser.readString(map, const [
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

enum ParentNextActionType {
  startExercise,
  reviewFeedback,
  viewReport,
}

class ParentNextAction {
  const ParentNextAction({
    required this.label,
    required this.type,
  });

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
  });

  final String id;
  final String assignedExerciseId;
  final DateTime? submittedAt;

  factory ParentSubmissionItem.fromMap(Map<String, dynamic> map) {
    return ParentSubmissionItem(
      id: ApiResponseParser.readString(map, const ['id', '_id']) ?? '',
      assignedExerciseId: ApiResponseParser.readString(map, const [
            'assigned_exercise_id',
            'assignedExerciseId',
          ]) ??
          '',
      submittedAt: ApiResponseParser.readDate(
        map['submitted_at'] ?? map['submittedAt'],
      ),
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
  });

  final String id;
  final String title;
  final String? message;
  final DateTime? createdAt;
  final String? type;

  factory ParentNotificationItem.fromMap(Map<String, dynamic> map) {
    return ParentNotificationItem(
      id: ApiResponseParser.readString(map, const ['id', '_id']) ?? '',
      title: ApiResponseParser.readString(map, const ['title', 'subject']) ??
          'Notification',
      message: ApiResponseParser.readString(map, const ['message', 'body']),
      createdAt: ApiResponseParser.readDate(
        map['created_at'] ?? map['createdAt'],
      ),
      type: ApiResponseParser.readString(map, const ['type', 'category']),
    );
  }
}
