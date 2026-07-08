import '../../../core/utils/api_response_parser.dart';

enum ReviewDecision { approved, needsRetry }

class ExerciseReviewBundle {
  const ExerciseReviewBundle({
    required this.submission,
    required this.media,
    this.existingReview,
  });

  final ExerciseSubmissionDetail submission;
  final List<SubmissionMediaItem> media;
  final ExerciseReviewRecord? existingReview;
}

class ExerciseSubmissionDetail {
  const ExerciseSubmissionDetail({
    required this.id,
    required this.patientId,
    required this.patientName,
    required this.exerciseTitle,
    required this.status,
    this.submittedAt,
    this.parentNotes,
  });

  final String id;
  final String patientId;
  final String patientName;
  final String exerciseTitle;
  final String status;
  final DateTime? submittedAt;
  final String? parentNotes;

  String get statusLabel => switch (status.toLowerCase()) {
        'reviewed' => 'Reviewed',
        'needs_retry' => 'Needs retry',
        _ => 'Pending',
      };

  factory ExerciseSubmissionDetail.fromMap(Map<String, dynamic> map) {
    return ExerciseSubmissionDetail(
      id: ApiResponseParser.readString(map, const ['id', '_id']) ?? '',
      patientId: ApiResponseParser.readString(map, const [
            'patient_id',
            'patientId',
          ]) ??
          '',
      patientName: ApiResponseParser.readString(map, const [
            'patient_name',
            'patientName',
          ]) ??
          'Patient',
      exerciseTitle: ApiResponseParser.readString(map, const [
            'exercise_title',
            'exerciseTitle',
            'title',
          ]) ??
          'Exercise',
      status: ApiResponseParser.readString(map, const ['status']) ?? 'pending',
      submittedAt: ApiResponseParser.readDate(
        map['submitted_at'] ?? map['submittedAt'],
      ),
      parentNotes: ApiResponseParser.readString(map, const [
        'parent_notes',
        'parentNotes',
      ]),
    );
  }
}

class SubmissionMediaItem {
  const SubmissionMediaItem({
    required this.id,
    required this.mediaType,
    required this.fileUrl,
    this.durationSeconds,
    this.createdAt,
  });

  final String id;
  final String mediaType;
  final String fileUrl;
  final int? durationSeconds;
  final DateTime? createdAt;

  String get mediaTypeLabel => switch (mediaType.toLowerCase()) {
        'audio' => 'Audio',
        'video' => 'Video',
        'image' => 'Image',
        _ => mediaType,
      };

  String get fileName {
    final uri = Uri.tryParse(fileUrl);
    if (uri != null && uri.pathSegments.isNotEmpty) {
      return uri.pathSegments.last;
    }
    final parts = fileUrl.split('/');
    return parts.isNotEmpty ? parts.last : fileUrl;
  }

  factory SubmissionMediaItem.fromMap(Map<String, dynamic> map) {
    return SubmissionMediaItem(
      id: ApiResponseParser.readString(map, const ['id', '_id']) ?? '',
      mediaType: ApiResponseParser.readString(map, const [
            'media_type',
            'mediaType',
          ]) ??
          'image',
      fileUrl: ApiResponseParser.readString(map, const [
            'file_url',
            'fileUrl',
          ]) ??
          '',
      durationSeconds: ApiResponseParser.readInt(map, const [
        'duration_seconds',
        'durationSeconds',
      ]),
      createdAt: ApiResponseParser.readDate(
        map['created_at'] ?? map['createdAt'],
      ),
    );
  }
}

class ExerciseReviewRecord {
  const ExerciseReviewRecord({
    required this.id,
    required this.submissionId,
    required this.performanceRating,
    this.feedback,
    required this.requiresRetry,
    this.reviewedAt,
  });

  final String id;
  final String submissionId;
  final double performanceRating;
  final String? feedback;
  final bool requiresRetry;
  final DateTime? reviewedAt;

  int get starRating {
    final stars = (performanceRating / 2).round();
    return stars.clamp(1, 5);
  }

  ReviewDecision get decision =>
      requiresRetry ? ReviewDecision.needsRetry : ReviewDecision.approved;

  factory ExerciseReviewRecord.fromMap(Map<String, dynamic> map) {
    return ExerciseReviewRecord(
      id: ApiResponseParser.readString(map, const ['id', '_id']) ?? '',
      submissionId: ApiResponseParser.readString(map, const [
            'submission_id',
            'submissionId',
          ]) ??
          '',
      performanceRating: ApiResponseParser.readDouble(map, const [
            'performance_rating',
            'performanceRating',
          ]) ??
          0,
      feedback: ApiResponseParser.readString(map, const ['feedback']),
      requiresRetry:
          map['requires_retry'] == true || map['requiresRetry'] == true,
      reviewedAt: ApiResponseParser.readDate(
        map['reviewed_at'] ?? map['reviewedAt'],
      ),
    );
  }
}

class SubmitExerciseReviewInput {
  const SubmitExerciseReviewInput({
    required this.specialistId,
    required this.starRating,
    required this.feedback,
    required this.decision,
  });

  final String specialistId;
  final int starRating;
  final String feedback;
  final ReviewDecision decision;

  Map<String, dynamic> toJson() => {
        'specialist_id': specialistId,
        'performance_rating': starRating * 2.0,
        'feedback': feedback,
        'requires_retry': decision == ReviewDecision.needsRetry,
      };
}
