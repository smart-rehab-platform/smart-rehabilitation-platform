import 'package:path/path.dart' as p;

import '../../../core/constants/api_constants.dart';
import '../../../core/utils/api_response_parser.dart';

class CommunicationAttachment {
  const CommunicationAttachment({
    required this.id,
    required this.messageId,
    required this.fileUrl,
    this.fileType,
    this.createdAt,
  });

  final String id;
  final String messageId;
  final String fileUrl;
  final String? fileType;
  final DateTime? createdAt;

  String? get resolvedUrl => ApiConstants.resolveMediaUrl(fileUrl);

  String get displayName {
    final url = fileUrl.trim();
    if (url.isEmpty) {
      return 'Attachment';
    }
    return p.basename(url);
  }

  bool get isImage => _matchesCategory(
    const ['image/'],
    const ['.jpg', '.jpeg', '.png', '.webp'],
  );

  bool get isAudio => _matchesCategory(
    const ['audio/'],
    const ['.mp3', '.m4a', '.wav', '.aac'],
  );

  bool get isVideo =>
      _matchesCategory(const ['video/'], const ['.mp4', '.mov']);

  bool get isPdf =>
      _normalizedMime == 'application/pdf' ||
      displayName.toLowerCase().endsWith('.pdf');

  bool get isGenericFile => !isImage && !isAudio && !isVideo && !isPdf;

  String? get _normalizedMime => fileType?.trim().toLowerCase();

  bool _matchesCategory(List<String> mimePrefixes, List<String> extensions) {
    final mime = _normalizedMime;
    if (mime != null && mime.isNotEmpty) {
      for (final prefix in mimePrefixes) {
        if (mime.startsWith(prefix)) {
          return true;
        }
      }
    }

    final lowerName = displayName.toLowerCase();
    return extensions.any(lowerName.endsWith);
  }

  factory CommunicationAttachment.fromMap(Map<String, dynamic> map) {
    return CommunicationAttachment(
      id: ApiResponseParser.readString(map, const ['id', '_id']) ?? '',
      messageId:
          ApiResponseParser.readString(map, const [
            'message_id',
            'messageId',
          ]) ??
          '',
      fileUrl:
          ApiResponseParser.readString(map, const [
            'file_url',
            'fileUrl',
            'url',
          ]) ??
          '',
      fileType: ApiResponseParser.readString(map, const [
        'file_type',
        'fileType',
        'mimetype',
      ]),
      createdAt: ApiResponseParser.readDate(
        map['created_at'] ?? map['createdAt'],
      ),
    );
  }
}

class UploadedMessageAttachment {
  const UploadedMessageAttachment({
    required this.url,
    required this.mimeType,
    this.filename,
    this.size,
  });

  final String url;
  final String mimeType;
  final String? filename;
  final int? size;

  factory UploadedMessageAttachment.fromMap(Map<String, dynamic> map) {
    return UploadedMessageAttachment(
      url: ApiResponseParser.readString(map, const ['url', 'file_url']) ?? '',
      mimeType:
          ApiResponseParser.readString(map, const [
            'mimetype',
            'mime_type',
            'file_type',
            'fileType',
          ]) ??
          '',
      filename: ApiResponseParser.readString(map, const [
        'filename',
        'originalname',
      ]),
      size: ApiResponseParser.readInt(map, const ['size']),
    );
  }
}

class CommunicationConversation {
  const CommunicationConversation({
    required this.id,
    this.patientId,
    required this.parentId,
    required this.specialistId,
    this.createdAt,
    this.patientName,
    this.parentName,
    this.parentProfileImageUrl,
    this.specialistName,
    this.specialistProfileImageUrl,
    this.caseRequestId,
    this.caseRequestChildName,
    this.lastMessageContent,
    this.lastMessageAt,
    this.lastMessageHasAttachments = false,
    this.unreadCount = 0,
  });

  final String id;
  final String? patientId;
  final String parentId;
  final String specialistId;
  final DateTime? createdAt;
  final String? patientName;
  final String? parentName;
  final String? parentProfileImageUrl;
  final String? specialistName;
  final String? specialistProfileImageUrl;
  final String? caseRequestId;
  final String? caseRequestChildName;
  final String? lastMessageContent;
  final DateTime? lastMessageAt;
  final bool lastMessageHasAttachments;
  final int unreadCount;

  bool get hasUnread => unreadCount > 0;

  DateTime? get activityAt => lastMessageAt ?? createdAt;

  factory CommunicationConversation.fromMap(Map<String, dynamic> map) {
    return CommunicationConversation(
      id: ApiResponseParser.readString(map, const ['id', '_id']) ?? '',
      patientId: ApiResponseParser.readString(map, const [
        'patient_id',
        'patientId',
      ]),
      parentId:
          ApiResponseParser.readString(map, const ['parent_id', 'parentId']) ??
          '',
      specialistId:
          ApiResponseParser.readString(map, const [
            'specialist_id',
            'specialistId',
          ]) ??
          '',
      createdAt: ApiResponseParser.readDate(
        map['created_at'] ?? map['createdAt'],
      ),
      patientName: ApiResponseParser.readString(map, const [
        'patient_name',
        'patientName',
      ]),
      parentName: ApiResponseParser.readString(map, const [
        'parent_name',
        'parentName',
      ]),
      parentProfileImageUrl: ApiResponseParser.readString(map, const [
        'parent_profile_image_url',
        'parentProfileImageUrl',
      ]),
      specialistName: ApiResponseParser.readString(map, const [
        'specialist_name',
        'specialistName',
      ]),
      specialistProfileImageUrl: ApiResponseParser.readString(map, const [
        'specialist_profile_image_url',
        'specialistProfileImageUrl',
      ]),
      caseRequestId: ApiResponseParser.readString(map, const [
        'case_request_id',
        'caseRequestId',
      ]),
      caseRequestChildName: ApiResponseParser.readString(map, const [
        'case_request_child_name',
        'caseRequestChildName',
        'child_name',
        'childName',
      ]),
      lastMessageContent: ApiResponseParser.readString(map, const [
        'last_message_content',
        'lastMessageContent',
      ]),
      lastMessageAt: ApiResponseParser.readDate(
        map['last_message_at'] ?? map['lastMessageAt'],
      ),
      lastMessageHasAttachments: _readBool(
        map['last_message_has_attachments'] ?? map['lastMessageHasAttachments'],
      ),
      unreadCount: _normalizeUnreadCount(
        ApiResponseParser.readInt(map, const ['unread_count', 'unreadCount']),
      ),
    );
  }

  String otherParticipantName(String? authenticatedRole) {
    final role = authenticatedRole?.toLowerCase();
    if (role == 'parent') {
      return specialistName?.trim().isNotEmpty == true
          ? specialistName!.trim()
          : 'Specialist';
    }
    if (role == 'specialist') {
      return parentName?.trim().isNotEmpty == true
          ? parentName!.trim()
          : 'Parent';
    }
    return 'Participant';
  }

  String otherParticipantId(String? authenticatedRole) {
    final role = authenticatedRole?.toLowerCase();
    if (role == 'parent') {
      return specialistId;
    }
    if (role == 'specialist') {
      return parentId;
    }
    return '';
  }

  String? otherParticipantProfileImageUrl(String? authenticatedRole) {
    final role = authenticatedRole?.toLowerCase();
    if (role == 'parent') {
      return specialistProfileImageUrl;
    }
    if (role == 'specialist') {
      return parentProfileImageUrl;
    }
    return null;
  }

  String patientContextLabel() {
    final caseChild = caseRequestChildName?.trim();
    if (caseChild != null &&
        caseChild.isNotEmpty &&
        (patientId == null || patientId!.isEmpty)) {
      return caseChild;
    }

    return patientName?.trim().isNotEmpty == true
        ? patientName!.trim()
        : 'Patient';
  }

  String? patientDisplayName() {
    final caseChild = caseRequestChildName?.trim();
    if (caseChild != null &&
        caseChild.isNotEmpty &&
        (patientId == null || patientId!.isEmpty)) {
      return caseChild;
    }

    final patient = patientName?.trim();
    if (patient != null && patient.isNotEmpty) {
      return patient;
    }

    return null;
  }

  String? conversationSubtitle() {
    final caseChild = caseRequestChildName?.trim();
    if (caseChild != null &&
        caseChild.isNotEmpty &&
        (patientId == null || patientId!.isEmpty)) {
      return 'Regarding $caseChild';
    }

    final patient = patientName?.trim();
    if (patient != null && patient.isNotEmpty) {
      return 'Patient: $patient';
    }

    return null;
  }
}

bool _readBool(dynamic value) {
  if (value == true || value == 1) {
    return true;
  }
  if (value is String) {
    final normalized = value.trim().toLowerCase();
    return normalized == 'true' || normalized == '1' || normalized == 't';
  }
  return false;
}

int _normalizeUnreadCount(int? value) {
  if (value == null || value <= 0) {
    return 0;
  }
  return value;
}

class CommunicationMessage {
  const CommunicationMessage({
    required this.id,
    required this.conversationId,
    required this.senderId,
    required this.content,
    this.isRead = false,
    this.sentAt,
    this.senderName,
    this.senderRole,
    this.attachments = const [],
  });

  final String id;
  final String conversationId;
  final String senderId;
  final String content;
  final bool isRead;
  final DateTime? sentAt;
  final String? senderName;
  final String? senderRole;
  final List<CommunicationAttachment> attachments;

  bool get hasAttachments => attachments.isNotEmpty;

  bool get hasDisplayableBody =>
      content.trim().isNotEmpty || attachments.isNotEmpty;

  bool isFromAuthenticatedUser(String? authenticatedUserId) {
    if (authenticatedUserId == null || authenticatedUserId.isEmpty) {
      return false;
    }
    return senderId == authenticatedUserId;
  }

  bool isIncomingFor(String? authenticatedUserId) {
    return !isFromAuthenticatedUser(authenticatedUserId);
  }

  factory CommunicationMessage.fromMap(Map<String, dynamic> map) {
    return CommunicationMessage(
      id: ApiResponseParser.readString(map, const ['id', '_id']) ?? '',
      conversationId:
          ApiResponseParser.readString(map, const [
            'conversation_id',
            'conversationId',
          ]) ??
          '',
      senderId:
          ApiResponseParser.readString(map, const ['sender_id', 'senderId']) ??
          '',
      content: ApiResponseParser.readString(map, const ['content']) ?? '',
      isRead: parseMessageIsRead(map['is_read'] ?? map['isRead']),
      sentAt: ApiResponseParser.readDate(
        map['sent_at'] ??
            map['sentAt'] ??
            map['created_at'] ??
            map['createdAt'],
      ),
      senderName: ApiResponseParser.readString(map, const [
        'sender_name',
        'senderName',
      ]),
      senderRole: ApiResponseParser.readString(map, const [
        'sender_role',
        'senderRole',
      ]),
      attachments: _parseAttachments(map['attachments']),
    );
  }

  static List<CommunicationAttachment> _parseAttachments(dynamic value) {
    if (value is! List) {
      return const [];
    }

    return value
        .whereType<Map>()
        .map((item) => item.map((key, val) => MapEntry(key.toString(), val)))
        .map(CommunicationAttachment.fromMap)
        .where((attachment) => attachment.id.isNotEmpty)
        .toList();
  }

  CommunicationMessage copyWith({
    bool? isRead,
    String? senderName,
    String? senderRole,
    String? content,
    List<CommunicationAttachment>? attachments,
  }) {
    return CommunicationMessage(
      id: id,
      conversationId: conversationId,
      senderId: senderId,
      content: content ?? this.content,
      isRead: isRead ?? this.isRead,
      sentAt: sentAt,
      senderName: senderName ?? this.senderName,
      senderRole: senderRole ?? this.senderRole,
      attachments: attachments ?? this.attachments,
    );
  }
}

bool parseMessageIsRead(dynamic value) {
  if (value == true || value == 1) {
    return true;
  }
  if (value is String) {
    final normalized = value.trim().toLowerCase();
    return normalized == 'true' || normalized == '1' || normalized == 't';
  }
  return false;
}

String? latestReadOutgoingMessageId({
  required List<CommunicationMessage> messages,
  required String? authenticatedUserId,
}) {
  if (authenticatedUserId == null ||
      authenticatedUserId.isEmpty ||
      messages.isEmpty) {
    return null;
  }

  final ordered = [...messages]
    ..sort((a, b) {
      final aTime = a.sentAt ?? DateTime.fromMillisecondsSinceEpoch(0);
      final bTime = b.sentAt ?? DateTime.fromMillisecondsSinceEpoch(0);
      return aTime.compareTo(bTime);
    });
  final lastMessage = ordered.last;

  if (lastMessage.isFromAuthenticatedUser(authenticatedUserId) &&
      lastMessage.isRead) {
    return lastMessage.id;
  }

  return null;
}

/// Optional navigation payload for opening a chat with a prefilled draft message.
class CommunicationChatRouteArgs {
  const CommunicationChatRouteArgs({
    this.conversation,
    this.initialDraftMessage,
  });

  final CommunicationConversation? conversation;
  final String? initialDraftMessage;
}
