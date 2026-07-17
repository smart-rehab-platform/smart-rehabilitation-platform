import '../../../core/utils/api_response_parser.dart';
import 'admin_case_inbox_models.dart';
import 'case_intake_request_model.dart';

class AdminCaseRequestDetail {
  const AdminCaseRequestDetail({
    required this.request,
    this.parent,
    this.assessmentNotes,
    this.reviewedByAdminId,
  });

  final CaseIntakeRequest request;
  final CaseIntakeParentSummary? parent;
  final String? assessmentNotes;
  final String? reviewedByAdminId;

  factory AdminCaseRequestDetail.fromMap(Map<String, dynamic> map) {
    final parentMap = ApiResponseParser.asMap(map['parent']);
    final assessmentNotes = ApiResponseParser.readString(map, const [
      'assessment_notes',
      'assessmentNotes',
    ]);
    final reviewedByAdminId = ApiResponseParser.readString(map, const [
      'reviewed_by_admin_id',
      'reviewedByAdminId',
    ]);

    return AdminCaseRequestDetail(
      request: CaseIntakeRequest.fromMap(map),
      parent: parentMap != null
          ? CaseIntakeParentSummary.fromMap(parentMap)
          : null,
      assessmentNotes: assessmentNotes?.trim().isNotEmpty == true
          ? assessmentNotes!.trim()
          : null,
      reviewedByAdminId: reviewedByAdminId?.trim().isNotEmpty == true
          ? reviewedByAdminId!.trim()
          : null,
    );
  }
}
