import '../../../core/utils/api_response_parser.dart';
import 'specialist_patient_details_models.dart';

class EditTreatmentPlanBundle {
  const EditTreatmentPlanBundle({
    required this.patientId,
    required this.patientName,
    required this.plan,
    required this.goals,
  });

  final String patientId;
  final String patientName;
  final EditableTreatmentPlan plan;
  final List<PatientGoalItem> goals;
}

class EditableTreatmentPlan {
  const EditableTreatmentPlan({
    required this.id,
    required this.title,
    required this.status,
    this.startDate,
    this.endDate,
  });

  final String id;
  final String title;
  final TreatmentPlanStatus status;
  final DateTime? startDate;
  final DateTime? endDate;

  factory EditableTreatmentPlan.fromMap(Map<String, dynamic> map) {
    final rawStatus =
        ApiResponseParser.readString(map, const ['status']) ?? 'active';

    return EditableTreatmentPlan(
      id: ApiResponseParser.readString(map, const ['id', '_id']) ?? '',
      title: ApiResponseParser.readString(map, const ['title']) ??
          'Treatment Plan',
      status: TreatmentPlanStatus.fromApi(rawStatus),
      startDate: ApiResponseParser.readDate(
        map['start_date'] ?? map['startDate'],
      ),
      endDate: ApiResponseParser.readDate(
        map['end_date'] ?? map['endDate'],
      ),
    );
  }
}

enum TreatmentPlanStatus {
  active,
  completed,
  archived;

  String get apiValue => name;

  String get label => switch (this) {
        TreatmentPlanStatus.active => 'Active',
        TreatmentPlanStatus.completed => 'Completed',
        TreatmentPlanStatus.archived => 'Archived',
      };

  static TreatmentPlanStatus fromApi(String value) {
    return switch (value.toLowerCase()) {
      'completed' => TreatmentPlanStatus.completed,
      'archived' => TreatmentPlanStatus.archived,
      _ => TreatmentPlanStatus.active,
    };
  }
}

class UpdateTreatmentPlanInput {
  const UpdateTreatmentPlanInput({
    required this.title,
    required this.status,
    required this.startDate,
    this.endDate,
    this.changeSummary = 'Updated via specialist mobile app',
  });

  final String title;
  final TreatmentPlanStatus status;
  final DateTime startDate;
  final DateTime? endDate;
  final String changeSummary;

  Map<String, dynamic> toJson() => {
        'title': title,
        'status': status.apiValue,
        'start_date': _formatDate(startDate),
        if (endDate != null) 'end_date': _formatDate(endDate!),
        'change_summary': changeSummary,
      };

  static String _formatDate(DateTime date) {
    final y = date.year.toString().padLeft(4, '0');
    final m = date.month.toString().padLeft(2, '0');
    final d = date.day.toString().padLeft(2, '0');
    return '$y-$m-$d';
  }
}
