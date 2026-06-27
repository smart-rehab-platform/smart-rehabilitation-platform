import '../../../core/utils/api_response_parser.dart';

class SpecialistOverviewData {
  const SpecialistOverviewData({
    this.activeCases = 0,
    this.pendingReviews = 0,
    this.upcomingSessions = 0,
    this.treatmentPlans = 0,
  });

  final int activeCases;
  final int pendingReviews;
  final int upcomingSessions;
  final int treatmentPlans;

  factory SpecialistOverviewData.fromMap(Map<String, dynamic>? map) {
    if (map == null) {
      return const SpecialistOverviewData();
    }

    return SpecialistOverviewData(
      activeCases: ApiResponseParser.readInt(map, const [
            'active_cases',
            'activeCases',
          ]) ??
          0,
      pendingReviews: ApiResponseParser.readInt(map, const [
            'pending_reviews',
            'pendingReviews',
          ]) ??
          0,
      upcomingSessions: ApiResponseParser.readInt(map, const [
            'upcoming_sessions',
            'upcomingSessions',
          ]) ??
          0,
      treatmentPlans: ApiResponseParser.readInt(map, const [
            'treatment_plans',
            'treatmentPlans',
          ]) ??
          0,
    );
  }
}

class SpecialistPendingReview {
  const SpecialistPendingReview({
    required this.patientName,
    required this.exerciseTitle,
    this.submittedAt,
    this.priority = 'Medium',
  });

  final String patientName;
  final String exerciseTitle;
  final DateTime? submittedAt;
  final String priority;

  factory SpecialistPendingReview.fromMap(Map<String, dynamic> map) {
    return SpecialistPendingReview(
      patientName: ApiResponseParser.readString(map, const [
            'patient_name',
            'patientName',
            'full_name',
          ]) ??
          'Patient',
      exerciseTitle: ApiResponseParser.readString(map, const [
            'exercise_title',
            'exerciseTitle',
            'title',
          ]) ??
          'Exercise review',
      submittedAt: ApiResponseParser.readDate(
        map['submitted_at'] ?? map['submittedAt'],
      ),
      priority: _derivePriority(map),
    );
  }

  static String _derivePriority(Map<String, dynamic> map) {
    final status = ApiResponseParser.readString(map, const ['status']) ?? '';
    if (status.toLowerCase().contains('urgent')) {
      return 'High';
    }
    return 'Medium';
  }
}

class SpecialistScheduleItem {
  const SpecialistScheduleItem({
    required this.timeLabel,
    required this.patientName,
    required this.sessionType,
  });

  final String timeLabel;
  final String patientName;
  final String sessionType;

  factory SpecialistScheduleItem.fromMap(Map<String, dynamic> map) {
    final scheduledAt = ApiResponseParser.readDate(
      map['scheduled_at'] ?? map['scheduledAt'],
    );

    return SpecialistScheduleItem(
      timeLabel: _formatTime(scheduledAt),
      patientName: ApiResponseParser.readString(map, const [
            'patient_name',
            'patientName',
            'full_name',
          ]) ??
          ApiResponseParser.readString(map, const ['title']) ??
          'Patient',
      sessionType: ApiResponseParser.readString(map, const [
            'session_type',
            'sessionType',
            'type',
            'notes',
          ]) ??
          'Therapy Session',
    );
  }

  static String _formatTime(DateTime? value) {
    if (value == null) {
      return '--:--';
    }
    final hour = value.hour % 12 == 0 ? 12 : value.hour % 12;
    final minute = value.minute.toString().padLeft(2, '0');
    final suffix = value.hour >= 12 ? 'PM' : 'AM';
    return '$hour:$minute $suffix';
  }
}

class SpecialistPatientProgress {
  const SpecialistPatientProgress({
    required this.name,
    required this.progress,
  });

  final String name;
  final double progress;

  factory SpecialistPatientProgress.fromSnapshot(
    Map<String, dynamic> map, {
    String? patientName,
  }) {
    final improvement = ApiResponseParser.readDouble(map, const [
          'improvement_percentage',
          'improvementPercentage',
        ]) ??
        ApiResponseParser.readDouble(map, const [
          'average_performance',
          'averagePerformance',
        ]) ??
        0;

    return SpecialistPatientProgress(
      name: patientName ??
          ApiResponseParser.readString(map, const [
            'patient_name',
            'full_name',
            'fullName',
          ]) ??
          'Patient',
      progress: improvement > 1 ? improvement / 100 : improvement,
    );
  }
}
