import 'specialist_patient_details_models.dart';

enum GoalTerm {
  shortTerm,
  longTerm;

  String get apiValue => switch (this) {
        GoalTerm.shortTerm => 'short_term',
        GoalTerm.longTerm => 'long_term',
      };

  String get label => switch (this) {
        GoalTerm.shortTerm => 'Short-term',
        GoalTerm.longTerm => 'Long-term',
      };

  static GoalTerm fromApi(String value) => switch (value.toLowerCase()) {
        'long_term' => GoalTerm.longTerm,
        _ => GoalTerm.shortTerm,
      };
}

class CreateGoalInput {
  const CreateGoalInput({
    required this.term,
    required this.title,
    this.description,
    this.targetDate,
    this.targetValue,
  });

  final GoalTerm term;
  final String title;
  final String? description;
  final DateTime? targetDate;
  final double? targetValue;

  Map<String, dynamic> toJson() => {
        'term': term.apiValue,
        'title': title,
        if (description != null && description!.trim().isNotEmpty)
          'description': description!.trim(),
        if (targetDate != null) 'target_date': _formatDate(targetDate!),
        if (targetValue != null) 'target_value': targetValue,
      };

  static String _formatDate(DateTime date) {
    final y = date.year.toString().padLeft(4, '0');
    final m = date.month.toString().padLeft(2, '0');
    final d = date.day.toString().padLeft(2, '0');
    return '$y-$m-$d';
  }
}

class UpdateGoalInput {
  const UpdateGoalInput({
    required this.title,
    this.targetDate,
    this.targetValue,
    this.isAchieved,
  });

  final String title;
  final DateTime? targetDate;
  final double? targetValue;
  final bool? isAchieved;

  Map<String, dynamic> toJson() => {
        'title': title,
        if (targetDate != null) 'target_date': CreateGoalInput._formatDate(targetDate!),
        if (targetValue != null) 'target_value': targetValue,
        if (isAchieved != null) 'is_achieved': isAchieved,
      };
}

class CreateGoalProgressInput {
  const CreateGoalProgressInput({
    required this.completionPercentage,
    this.notes,
  });

  final double completionPercentage;
  final String? notes;

  Map<String, dynamic> toJson() => {
        'completion_percentage': completionPercentage,
        if (notes != null && notes!.trim().isNotEmpty) 'notes': notes!.trim(),
      };
}

class SpecialistGoalsBundle {
  const SpecialistGoalsBundle({
    required this.patientId,
    required this.patientName,
    this.patientProfileImageUrl,
    required this.planId,
    required this.planTitle,
    required this.goals,
  });

  final String patientId;
  final String patientName;
  final String? patientProfileImageUrl;
  final String planId;
  final String planTitle;
  final List<PatientGoalItem> goals;
}
