import '../../../core/utils/api_response_parser.dart';
import 'admin_case_inbox_models.dart';
import 'case_intake_request_model.dart';

class AssignSpecialistConversationSummary {
  const AssignSpecialistConversationSummary({
    required this.id,
    this.caseRequestId,
    this.patientId,
  });

  final String id;
  final String? caseRequestId;
  final String? patientId;

  factory AssignSpecialistConversationSummary.fromMap(
    Map<String, dynamic>? map,
  ) {
    if (map == null || map.isEmpty) {
      return const AssignSpecialistConversationSummary(id: '');
    }

    return AssignSpecialistConversationSummary(
      id: ApiResponseParser.readString(map, const ['id', '_id']) ?? '',
      caseRequestId: ApiResponseParser.readString(map, const [
        'case_request_id',
        'caseRequestId',
      ]),
      patientId: ApiResponseParser.readString(map, const [
        'patient_id',
        'patientId',
      ]),
    );
  }
}

class AssignSpecialistResult {
  const AssignSpecialistResult({
    required this.message,
    this.requestSummary,
    this.assignedSpecialist,
    this.conversation,
  });

  final String message;
  final AdminCaseInboxItem? requestSummary;
  final CaseAssignedSpecialist? assignedSpecialist;
  final AssignSpecialistConversationSummary? conversation;

  factory AssignSpecialistResult.fromEnvelope(Map<String, dynamic> envelope) {
    final dataMap = ApiResponseParser.asMap(envelope['data']) ?? envelope;
    final requestMap = ApiResponseParser.asMap(dataMap['request']);
    final specialistMap =
        ApiResponseParser.asMap(dataMap['assigned_specialist']) ??
        ApiResponseParser.asMap(dataMap['assignedSpecialist']);
    final conversationMap = ApiResponseParser.asMap(dataMap['conversation']);

    final message =
        ApiResponseParser.readString(envelope, const ['message']) ??
        'Specialist assigned successfully';

    final conversation = conversationMap != null
        ? AssignSpecialistConversationSummary.fromMap(conversationMap)
        : null;

    return AssignSpecialistResult(
      message: message,
      requestSummary: requestMap != null
          ? AdminCaseInboxItem.fromMap(requestMap)
          : null,
      assignedSpecialist: specialistMap != null
          ? CaseAssignedSpecialist.fromMap(specialistMap)
          : null,
      conversation: conversation != null && conversation.id.isNotEmpty
          ? conversation
          : null,
    );
  }
}
