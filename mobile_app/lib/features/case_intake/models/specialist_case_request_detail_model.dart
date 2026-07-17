import '../../../core/utils/api_response_parser.dart';
import 'admin_case_inbox_models.dart';
import 'case_intake_request_model.dart';

class SpecialistCaseRequestDetail {
  const SpecialistCaseRequestDetail({
    required this.request,
    this.parent,
    this.assessmentNotes,
  });

  final CaseIntakeRequest request;
  final CaseIntakeParentSummary? parent;
  final String? assessmentNotes;

  factory SpecialistCaseRequestDetail.fromMap(Map<String, dynamic> map) {
    final parentMap = ApiResponseParser.asMap(map['parent']);
    final assessmentNotes = ApiResponseParser.readString(map, const [
      'assessment_notes',
      'assessmentNotes',
    ]);

    return SpecialistCaseRequestDetail(
      request: CaseIntakeRequest.fromMap(map),
      parent: parentMap != null
          ? CaseIntakeParentSummary.fromMap(parentMap)
          : null,
      assessmentNotes: assessmentNotes?.trim().isNotEmpty == true
          ? assessmentNotes!.trim()
          : null,
    );
  }
}
