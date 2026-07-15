import '../../../core/utils/api_response_parser.dart';

bool? _readBool(Map<String, dynamic> map, List<String> keys) {
  for (final key in keys) {
    final value = map[key];
    if (value is bool) {
      return value;
    }
    if (value == 1 || value == 'true' || value == '1') {
      return true;
    }
    if (value == 0 || value == 'false' || value == '0') {
      return false;
    }
  }
  return null;
}

class CaseCategory {
  const CaseCategory({
    required this.id,
    required this.name,
    this.description,
    this.isActive = true,
  });

  final String id;
  final String name;
  final String? description;
  final bool isActive;

  factory CaseCategory.fromMap(Map<String, dynamic> map) {
    return CaseCategory(
      id: ApiResponseParser.readString(map, const ['id', '_id']) ?? '',
      name: ApiResponseParser.readString(map, const ['name']) ?? '',
      description: ApiResponseParser.readString(map, const ['description']),
      isActive: _readBool(map, const ['is_active', 'isActive']) ?? true,
    );
  }
}
