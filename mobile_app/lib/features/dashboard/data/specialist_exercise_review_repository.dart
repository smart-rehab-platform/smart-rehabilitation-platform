import 'package:dio/dio.dart';

import '../../../core/utils/api_response_parser.dart';
import '../models/specialist_exercise_review_models.dart';

/// Exercise review API access.
///
/// Endpoints:
/// - GET  /exercise-submissions/:id
/// - GET  /exercise-submissions/:id/media
/// - GET  /exercise-submissions/:id/review
/// - POST /exercise-submissions/:id/review
/// - PUT  /exercise-reviews/:id
class SpecialistExerciseReviewRepository {
  SpecialistExerciseReviewRepository(this._dio);

  final Dio _dio;

  Future<List<Map<String, dynamic>>> _getList(String path) async {
    final response = await _dio.get(path);
    return ApiResponseParser.extractList(response.data)
        .whereType<Map>()
        .map((item) => item.map((key, value) => MapEntry(key.toString(), value)))
        .toList();
  }

  Future<Map<String, dynamic>?> _getMap(String path) async {
    try {
      final response = await _dio.get(path);
      return ApiResponseParser.extractMap(response.data);
    } on DioException catch (error) {
      if (error.response?.statusCode == 404) {
        return null;
      }
      rethrow;
    }
  }

  Future<ExerciseReviewBundle> fetchReviewBundle(String submissionId) async {
    final results = await Future.wait([
      _getMap('/exercise-submissions/$submissionId'),
      _getList('/exercise-submissions/$submissionId/media'),
      _getMap('/exercise-submissions/$submissionId/review'),
    ]);

    final submissionMap = results[0] as Map<String, dynamic>?;
    if (submissionMap == null) {
      throw Exception('Submission not found');
    }

    var submission = ExerciseSubmissionDetail.fromMap(submissionMap);
    if (submission.patientId.isNotEmpty &&
        (submission.patientName == 'Patient' || submission.patientName.isEmpty)) {
      final patientMap = await _getMap('/patients/${submission.patientId}');
      final patientName = ApiResponseParser.readString(patientMap ?? {}, const [
        'full_name',
        'fullName',
        'name',
      ]);
      if (patientName != null && patientName.isNotEmpty) {
        submission = ExerciseSubmissionDetail(
          id: submission.id,
          patientId: submission.patientId,
          patientName: patientName,
          exerciseTitle: submission.exerciseTitle,
          status: submission.status,
          submittedAt: submission.submittedAt,
          parentNotes: submission.parentNotes,
        );
      }
    }

    final media = (results[1] as List<Map<String, dynamic>>)
        .map(SubmissionMediaItem.fromMap)
        .where((item) => item.fileUrl.isNotEmpty)
        .toList();

    final reviewMap = results[2] as Map<String, dynamic>?;

    return ExerciseReviewBundle(
      submission: ExerciseSubmissionDetail.fromMap(submissionMap),
      media: media,
      existingReview:
          reviewMap != null ? ExerciseReviewRecord.fromMap(reviewMap) : null,
    );
  }

  Future<ExerciseReviewRecord> createReview(
    String submissionId,
    SubmitExerciseReviewInput input,
  ) async {
    final response = await _dio.post(
      '/exercise-submissions/$submissionId/review',
      data: input.toJson(),
    );
    final map = ApiResponseParser.extractMap(response.data);
    if (map == null) {
      throw Exception('Invalid review response');
    }
    return ExerciseReviewRecord.fromMap(map);
  }

  Future<ExerciseReviewRecord> updateReview(
    String reviewId,
    SubmitExerciseReviewInput input,
  ) async {
    final response = await _dio.put(
      '/exercise-reviews/$reviewId',
      data: {
        'performance_rating': input.starRating * 2.0,
        'feedback': input.feedback,
        'requires_retry': input.decision == ReviewDecision.needsRetry,
      },
    );
    final map = ApiResponseParser.extractMap(response.data);
    if (map == null) {
      throw Exception('Invalid review response');
    }
    return ExerciseReviewRecord.fromMap(map);
  }
}
