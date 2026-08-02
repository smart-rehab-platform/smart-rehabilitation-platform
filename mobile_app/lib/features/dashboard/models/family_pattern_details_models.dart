import '../../../core/utils/api_response_parser.dart';

class FamilyPatternDetails {
  const FamilyPatternDetails({
    required this.patientId,
    this.patternScore = 0,
    this.evidenceLevel = 'LOW',
    this.matchedChildren = 0,
    this.visibleMatchedChildren = 0,
    this.hiddenMatchedChildrenCount = 0,
    this.summaryReason = '',
    this.groups = const [],
    this.disclaimer = '',
  });

  final String patientId;
  final int patternScore;
  final String evidenceLevel;
  final int matchedChildren;
  final int visibleMatchedChildren;
  final int hiddenMatchedChildrenCount;
  final String summaryReason;
  final List<FamilyPatternDetailsGroup> groups;
  final String disclaimer;

  bool get hasVisibleGroups => groups.any((group) => group.children.isNotEmpty);

  factory FamilyPatternDetails.fromMap(Map<String, dynamic> map) {
    final groupsRaw = map['groups'];
    final groups = groupsRaw is List
        ? groupsRaw
              .whereType<Map>()
              .map(
                (item) => FamilyPatternDetailsGroup.fromMap(
                  item.map((key, value) => MapEntry(key.toString(), value)),
                ),
              )
              .toList()
        : const <FamilyPatternDetailsGroup>[];

    return FamilyPatternDetails(
      patientId:
          ApiResponseParser.readString(map, const [
            'patientId',
            'patient_id',
          ]) ??
          '',
      patternScore:
          ApiResponseParser.readInt(map, const [
            'patternScore',
            'pattern_score',
          ]) ??
          0,
      evidenceLevel:
          ApiResponseParser.readString(map, const [
            'evidenceLevel',
            'evidence_level',
          ]) ??
          'LOW',
      matchedChildren:
          ApiResponseParser.readInt(map, const [
            'matchedChildren',
            'matched_children',
          ]) ??
          0,
      visibleMatchedChildren:
          ApiResponseParser.readInt(map, const [
            'visibleMatchedChildren',
            'visible_matched_children',
          ]) ??
          0,
      hiddenMatchedChildrenCount:
          ApiResponseParser.readInt(map, const [
            'hiddenMatchedChildrenCount',
            'hidden_matched_children_count',
          ]) ??
          0,
      summaryReason:
          ApiResponseParser.readString(map, const [
            'summaryReason',
            'summary_reason',
          ]) ??
          '',
      groups: groups,
      disclaimer: ApiResponseParser.readString(map, const ['disclaimer']) ?? '',
    );
  }
}

class FamilyPatternDetailsGroup {
  const FamilyPatternDetailsGroup({
    required this.type,
    required this.label,
    this.condition,
    this.category,
    this.overlappingKeywords = const [],
    this.reason = '',
    this.children = const [],
  });

  final String type;
  final String label;
  final String? condition;
  final String? category;
  final List<String> overlappingKeywords;
  final String reason;
  final List<FamilyPatternMatchedChild> children;

  factory FamilyPatternDetailsGroup.fromMap(Map<String, dynamic> map) {
    final keywordsRaw =
        map['overlappingKeywords'] ?? map['overlapping_keywords'];
    final keywords = keywordsRaw is List
        ? keywordsRaw
              .map((value) => value?.toString().trim() ?? '')
              .where((value) => value.isNotEmpty)
              .toList()
        : const <String>[];

    final childrenRaw = map['children'];
    final children = childrenRaw is List
        ? childrenRaw
              .whereType<Map>()
              .map(
                (item) => FamilyPatternMatchedChild.fromMap(
                  item.map((key, value) => MapEntry(key.toString(), value)),
                ),
              )
              .where((child) => child.patientName.isNotEmpty)
              .toList()
        : const <FamilyPatternMatchedChild>[];

    return FamilyPatternDetailsGroup(
      type: ApiResponseParser.readString(map, const ['type']) ?? 'unknown',
      label: ApiResponseParser.readString(map, const ['label']) ?? 'Pattern',
      condition: ApiResponseParser.readString(map, const ['condition']),
      category: ApiResponseParser.readString(map, const ['category']),
      overlappingKeywords: keywords,
      reason: ApiResponseParser.readString(map, const ['reason']) ?? '',
      children: children,
    );
  }
}

class FamilyPatternMatchedChild {
  const FamilyPatternMatchedChild({
    required this.patientId,
    required this.patientName,
    this.matchedValue,
    this.matchedKeywords = const [],
  });

  final String patientId;
  final String patientName;
  final String? matchedValue;
  final List<String> matchedKeywords;

  factory FamilyPatternMatchedChild.fromMap(Map<String, dynamic> map) {
    final keywordsRaw = map['matchedKeywords'] ?? map['matched_keywords'];
    final keywords = keywordsRaw is List
        ? keywordsRaw
              .map((value) => value?.toString().trim() ?? '')
              .where((value) => value.isNotEmpty)
              .toList()
        : const <String>[];

    return FamilyPatternMatchedChild(
      patientId:
          ApiResponseParser.readString(map, const [
            'patientId',
            'patient_id',
          ]) ??
          '',
      patientName:
          ApiResponseParser.readString(map, const [
            'patientName',
            'patient_name',
          ]) ??
          '',
      matchedValue: ApiResponseParser.readString(map, const [
        'matchedValue',
        'matched_value',
      ]),
      matchedKeywords: keywords,
    );
  }
}
