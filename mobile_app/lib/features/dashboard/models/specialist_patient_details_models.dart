import '../../../core/utils/api_response_parser.dart';

class SpecialistPatientDetailsBundle {
  const SpecialistPatientDetailsBundle({
    required this.patient,
    required this.diagnosis,
    required this.overallProgress,
    required this.stats,
    required this.treatmentPlan,
    required this.goals,
    required this.assignedExercises,
    required this.recentSubmissions,
    required this.notes,
  });

  final PatientProfile patient;
  final String? diagnosis;
  final double overallProgress;
  final PatientQuickStats stats;
  final PatientTreatmentPlan? treatmentPlan;
  final List<PatientGoalItem> goals;
  final List<PatientAssignedExerciseItem> assignedExercises;
  final List<PatientSubmissionItem> recentSubmissions;
  final List<PatientSpecialistNote> notes;
}

class PatientProfile {
  const PatientProfile({
    required this.id,
    required this.fullName,
    this.dateOfBirth,
    this.gender,
    this.profileImageUrl,
  });

  final String id;
  final String fullName;
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
    return years;
  }

  factory PatientProfile.fromMap(Map<String, dynamic> map) {
    return PatientProfile(
      id: ApiResponseParser.readString(map, const ['id', '_id']) ?? '',
      fullName: ApiResponseParser.readString(map, const [
            'full_name',
            'fullName',
            'name',
          ]) ??
          'Patient',
      dateOfBirth: ApiResponseParser.readDate(
        map['date_of_birth'] ?? map['dateOfBirth'],
      ),
      gender: ApiResponseParser.readString(map, const ['gender']),
      profileImageUrl: ApiResponseParser.readString(map, const [
        'profile_image_url',
        'profileImageUrl',
      ]),
    );
  }
}

class PatientQuickStats {
  const PatientQuickStats({
    this.activeGoals = 0,
    this.assignedExercises = 0,
    this.pendingReviews = 0,
    this.reports = 0,
  });

  final int activeGoals;
  final int assignedExercises;
  final int pendingReviews;
  final int reports;
}

class PatientTreatmentPlan {
  const PatientTreatmentPlan({
    required this.id,
    required this.title,
    required this.status,
    this.startDate,
    this.endDate,
  });

  final String id;
  final String title;
  final String status;
  final DateTime? startDate;
  final DateTime? endDate;

  bool get isActive => status.trim().toLowerCase() == 'active';

  factory PatientTreatmentPlan.fromMap(Map<String, dynamic> map) {
    return PatientTreatmentPlan(
      id: ApiResponseParser.readString(map, const ['id', '_id']) ?? '',
      title: ApiResponseParser.readString(map, const ['title']) ??
          'Treatment Plan',
      status: ApiResponseParser.readString(map, const ['status']) ?? 'active',
      startDate: ApiResponseParser.readDate(
        map['start_date'] ?? map['startDate'],
      ),
      endDate: ApiResponseParser.readDate(
        map['end_date'] ?? map['endDate'],
      ),
    );
  }
}

class PatientGoalItem {
  const PatientGoalItem({
    required this.id,
    required this.title,
    required this.term,
    required this.completionPercentage,
    this.isAchieved = false,
    this.description,
    this.targetValue,
    this.targetDate,
  });

  final String id;
  final String title;
  final String term;
  final double completionPercentage;
  final bool isAchieved;
  final String? description;
  final double? targetValue;
  final DateTime? targetDate;

  String get termLabel => switch (term.toLowerCase()) {
        'short_term' => 'Short-term',
        'long_term' => 'Long-term',
        _ => term,
      };

  factory PatientGoalItem.fromMap(
    Map<String, dynamic> map, {
    double completionPercentage = 0,
  }) {
    return PatientGoalItem(
      id: ApiResponseParser.readString(map, const ['id', '_id']) ?? '',
      title: ApiResponseParser.readString(map, const ['title']) ?? 'Goal',
      term: ApiResponseParser.readString(map, const ['term']) ?? 'short_term',
      isAchieved: map['is_achieved'] == true || map['isAchieved'] == true,
      completionPercentage: completionPercentage,
      description: ApiResponseParser.readString(map, const ['description']),
      targetValue: ApiResponseParser.readDouble(map, const [
        'target_value',
        'targetValue',
      ]),
      targetDate: ApiResponseParser.readDate(
        map['target_date'] ?? map['targetDate'],
      ),
    );
  }
}

class PatientAssignedExerciseItem {
  const PatientAssignedExerciseItem({
    required this.id,
    required this.exerciseTitle,
    this.exerciseId,
    this.category,
    this.description,
    this.instructions,
    this.instructionMediaUrl,
    this.frequency,
    this.startDate,
    this.createdAt,
    required this.statusLabel,
    this.dueDate,
  });

  final String id;
  final String exerciseTitle;
  final String? exerciseId;
  final String? category;
  final String? description;
  final String? instructions;
  final String? instructionMediaUrl;
  final String? frequency;
  final DateTime? startDate;
  final DateTime? createdAt;
  final String statusLabel;
  final DateTime? dueDate;

  bool get hasInstructionMedia {
    final url = instructionMediaUrl?.trim();
    return url != null && url.isNotEmpty;
  }

  factory PatientAssignedExerciseItem.fromMap(Map<String, dynamic> map) {
    final isActive = map['is_active'] == true || map['isActive'] == true;

    return PatientAssignedExerciseItem(
      id: ApiResponseParser.readString(map, const ['id', '_id']) ?? '',
      exerciseTitle: ApiResponseParser.readString(map, const [
            'exercise_title',
            'exerciseTitle',
            'title',
          ]) ??
          'Exercise',
      exerciseId: ApiResponseParser.readString(map, const [
        'exercise_id',
        'exerciseId',
      ]),
      category: ApiResponseParser.readString(map, const [
        'category_name',
        'categoryName',
        'category',
      ]),
      description: ApiResponseParser.readString(map, const [
        'description',
        'exercise_description',
        'exerciseDescription',
      ]),
      instructions: ApiResponseParser.readString(map, const ['instructions']),
      instructionMediaUrl: ApiResponseParser.readString(map, const [
        'instruction_media_url',
        'instructionMediaUrl',
      ]),
      frequency: ApiResponseParser.readString(map, const ['frequency']),
      startDate: ApiResponseParser.readDate(
        map['start_date'] ?? map['startDate'],
      ),
      createdAt: ApiResponseParser.readDate(
        map['created_at'] ?? map['createdAt'],
      ),
      statusLabel: isActive ? 'Active' : 'Inactive',
      dueDate: ApiResponseParser.readDate(
        map['due_date'] ?? map['dueDate'],
      ),
    );
  }
}

class PatientSubmissionItem {
  const PatientSubmissionItem({
    required this.id,
    required this.exerciseTitle,
    required this.mediaTypeLabel,
    this.submittedAt,
    required this.reviewStatus,
  });

  final String id;
  final String exerciseTitle;
  final String mediaTypeLabel;
  final DateTime? submittedAt;
  final String reviewStatus;

  factory PatientSubmissionItem.fromMap(
    Map<String, dynamic> map, {
    String mediaTypeLabel = '—',
  }) {
    final status = ApiResponseParser.readString(map, const ['status']) ?? 'pending';

    return PatientSubmissionItem(
      id: ApiResponseParser.readString(map, const ['id', '_id']) ?? '',
      exerciseTitle: ApiResponseParser.readString(map, const [
            'exercise_title',
            'exerciseTitle',
            'title',
          ]) ??
          'Exercise',
      mediaTypeLabel: mediaTypeLabel,
      submittedAt: ApiResponseParser.readDate(
        map['submitted_at'] ?? map['submittedAt'],
      ),
      reviewStatus: _formatReviewStatus(status),
    );
  }

  static String _formatReviewStatus(String status) {
    return switch (status.toLowerCase()) {
      'reviewed' => 'Reviewed',
      'needs_retry' => 'Needs retry',
      _ => 'Pending',
    };
  }

  static String mediaTypeFromRaw(String? raw) {
    if (raw == null || raw.isEmpty) {
      return '—';
    }
    return switch (raw.toLowerCase()) {
      'audio' => 'Audio',
      'video' => 'Video',
      'image' => 'Image',
      _ => raw,
    };
  }
}

class PatientSpecialistNote {
  const PatientSpecialistNote({
    required this.id,
    required this.note,
    required this.specialistName,
    required this.createdAt,
  });

  final String id;
  final String note;
  final String specialistName;
  final DateTime? createdAt;

  factory PatientSpecialistNote.fromMap(Map<String, dynamic> map) {
    return PatientSpecialistNote(
      id: ApiResponseParser.readString(map, const ['id', '_id']) ?? '',
      note: ApiResponseParser.readString(map, const ['note']) ?? '',
      specialistName: ApiResponseParser.readString(map, const [
            'specialist_name',
            'specialistName',
          ]) ??
          'Specialist',
      createdAt: ApiResponseParser.readDate(
        map['created_at'] ?? map['createdAt'],
      ),
    );
  }
}

class PatientDiagnosisItem {
  const PatientDiagnosisItem({required this.title});

  final String title;

  factory PatientDiagnosisItem.fromMap(Map<String, dynamic> map) {
    return PatientDiagnosisItem(
      title: ApiResponseParser.readString(map, const [
            'diagnosis_title',
            'diagnosisTitle',
            'title',
          ]) ??
          '—',
    );
  }
}
