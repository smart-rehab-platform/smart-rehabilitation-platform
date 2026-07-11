import '../../../core/utils/api_response_parser.dart';

class ParentAiChatConversation {
  const ParentAiChatConversation({
    required this.id,
    this.startedAt,
    this.messageCount,
    this.lastMessageAt,
    this.lastMessagePreview,
  });

  final String id;
  final DateTime? startedAt;
  final int? messageCount;
  final DateTime? lastMessageAt;
  final String? lastMessagePreview;

  factory ParentAiChatConversation.fromMap(Map<String, dynamic> map) {
    return ParentAiChatConversation(
      id: ApiResponseParser.readString(map, const ['id', '_id']) ?? '',
      startedAt: ApiResponseParser.readDate(
        map['started_at'] ?? map['startedAt'],
      ),
      messageCount: ApiResponseParser.readInt(map, const [
        'message_count',
        'messageCount',
      ]),
      lastMessageAt: ApiResponseParser.readDate(
        map['last_message_at'] ?? map['lastMessageAt'],
      ),
      lastMessagePreview: ApiResponseParser.readString(map, const [
        'last_message_preview',
        'lastMessagePreview',
      ]),
    );
  }
}

class ParentAiChatMessage {
  const ParentAiChatMessage({
    required this.id,
    required this.conversationId,
    required this.sender,
    required this.content,
    this.createdAt,
    this.isPending = false,
    this.hasFailed = false,
  });

  final String id;
  final String conversationId;
  final String sender;
  final String content;
  final DateTime? createdAt;
  final bool isPending;
  final bool hasFailed;

  bool get isUser => sender == 'user';
  bool get isBot => sender == 'bot';

  ParentAiChatMessage copyWith({
    String? id,
    String? conversationId,
    String? sender,
    String? content,
    DateTime? createdAt,
    bool? isPending,
    bool? hasFailed,
  }) {
    return ParentAiChatMessage(
      id: id ?? this.id,
      conversationId: conversationId ?? this.conversationId,
      sender: sender ?? this.sender,
      content: content ?? this.content,
      createdAt: createdAt ?? this.createdAt,
      isPending: isPending ?? this.isPending,
      hasFailed: hasFailed ?? this.hasFailed,
    );
  }

  factory ParentAiChatMessage.fromMap(Map<String, dynamic> map) {
    return ParentAiChatMessage(
      id: ApiResponseParser.readString(map, const ['id', '_id']) ?? '',
      conversationId: ApiResponseParser.readString(map, const [
            'conversation_id',
            'conversationId',
          ]) ??
          '',
      sender: ApiResponseParser.readString(map, const ['sender']) ?? 'bot',
      content: ApiResponseParser.readString(map, const ['content']) ?? '',
      createdAt: ApiResponseParser.readDate(
        map['created_at'] ?? map['createdAt'],
      ),
    );
  }
}

class ParentAiChatSendResult {
  const ParentAiChatSendResult({
    required this.userMessage,
    required this.botMessage,
    this.conversation,
  });

  final ParentAiChatMessage userMessage;
  final ParentAiChatMessage botMessage;
  final ParentAiChatConversation? conversation;
}
