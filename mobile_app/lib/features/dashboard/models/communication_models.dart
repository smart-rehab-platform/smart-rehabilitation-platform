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
    required this.patientId,
    required this.parentId,
    required this.specialistId,
    this.createdAt,
    this.patientName,
    this.parentName,
    this.specialistName,
  });

  final String id;
  final String patientId;
  final String parentId;
  final String specialistId;
  final DateTime? createdAt;
  final String? patientName;
  final String? parentName;
  final String? specialistName;

  factory CommunicationConversation.fromMap(Map<String, dynamic> map) {
    return CommunicationConversation(
      id: ApiResponseParser.readString(map, const ['id', '_id']) ?? '',
      patientId:
          ApiResponseParser.readString(map, const [
            'patient_id',
            'patientId',
          ]) ??
          '',
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
      specialistName: ApiResponseParser.readString(map, const [
        'specialist_name',
        'specialistName',
      ]),
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

  String patientContextLabel() {
    return patientName?.trim().isNotEmpty == true
        ? patientName!.trim()
        : 'Patient';
  }
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
      isRead: map['is_read'] == true || map['isRead'] == true,
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
