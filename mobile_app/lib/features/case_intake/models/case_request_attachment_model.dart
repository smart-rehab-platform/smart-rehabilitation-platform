import '../../../core/utils/api_response_parser.dart';

class CaseRequestAttachment {
  const CaseRequestAttachment({
    required this.id,
    required this.fileUrl,
    this.fileType,
    this.originalName,
    this.createdAt,
  });

  final String id;
  final String fileUrl;
  final String? fileType;
  final String? originalName;
  final DateTime? createdAt;

  String get displayName {
    if (originalName != null && originalName!.trim().isNotEmpty) {
      return originalName!.trim();
    }
    return 'Attachment';
  }

  bool get isImage => (fileType ?? '').startsWith('image/');
  bool get isAudio => (fileType ?? '').startsWith('audio/');
  bool get isVideo => (fileType ?? '').startsWith('video/');
  bool get isPdf => fileType == 'application/pdf';

  factory CaseRequestAttachment.fromMap(Map<String, dynamic> map) {
    return CaseRequestAttachment(
      id: ApiResponseParser.readString(map, const ['id', '_id']) ?? '',
      fileUrl:
          ApiResponseParser.readString(map, const ['file_url', 'fileUrl']) ??
          '',
      fileType: ApiResponseParser.readString(map, const [
        'file_type',
        'fileType',
        'mime_type',
        'mimeType',
      ]),
      originalName: ApiResponseParser.readString(map, const [
        'original_name',
        'originalName',
        'filename',
      ]),
      createdAt: ApiResponseParser.readDate(
        map['created_at'] ?? map['createdAt'],
      ),
    );
  }
}
