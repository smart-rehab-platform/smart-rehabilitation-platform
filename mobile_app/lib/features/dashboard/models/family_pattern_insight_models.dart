import '../../../core/utils/api_response_parser.dart';

class FamilyPatternInsight {
  const FamilyPatternInsight({
    this.hasSiblings = false,
    this.matchedChildren = 0,
    this.patternScore = 0,
    this.evidenceLevel = 'LOW',
    this.summaryReason = '',
    this.patterns = const [],
    this.disclaimer = '',
  });

  final bool hasSiblings;
  final int matchedChildren;
  final int patternScore;
  final String evidenceLevel;
  final String summaryReason;
  final List<FamilyPatternItem> patterns;
  final String disclaimer;

  bool get hasDetectedPatterns => patterns.isNotEmpty;

  factory FamilyPatternInsight.fromMap(Map<String, dynamic> map) {
    final patternsRaw = map['patterns'];
    final patterns = patternsRaw is List
        ? patternsRaw
              .whereType<Map>()
              .map(
                (item) => FamilyPatternItem.fromMap(
                  item.map((key, value) => MapEntry(key.toString(), value)),
                ),
              )
              .toList()
        : const <FamilyPatternItem>[];

    final hasSiblingsRaw = map['hasSiblings'] ?? map['has_siblings'];
    final hasSiblings =
        hasSiblingsRaw == true ||
        hasSiblingsRaw?.toString().toLowerCase() == 'true';

    return FamilyPatternInsight(
      hasSiblings: hasSiblings,
      matchedChildren:
          ApiResponseParser.readInt(map, const [
            'matchedChildren',
            'matched_children',
          ]) ??
          0,
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
      summaryReason:
          ApiResponseParser.readString(map, const [
            'summaryReason',
            'summary_reason',
          ]) ??
          '',
      patterns: patterns,
      disclaimer: ApiResponseParser.readString(map, const ['disclaimer']) ?? '',
    );
  }
}

class FamilyPatternItem {
  const FamilyPatternItem({
    required this.type,
    this.condition,
    this.category,
    this.overlappingKeywords = const [],
    this.weight = 0,
    this.reason = '',
    this.matchedPatients = const [],
  });

  final String type;
  final String? condition;
  final String? category;
  final List<String> overlappingKeywords;
  final int weight;
  final String reason;
  final List<MatchedFamilyPatient> matchedPatients;

  factory FamilyPatternItem.fromMap(Map<String, dynamic> map) {
    final keywordsRaw =
        map['overlappingKeywords'] ?? map['overlapping_keywords'];
    final keywords = keywordsRaw is List
        ? keywordsRaw
              .map((value) => value?.toString().trim() ?? '')
              .where((value) => value.isNotEmpty)
              .toList()
        : const <String>[];

    final matchedRaw = map['matchedPatients'] ?? map['matched_patients'];
    final matchedPatients = matchedRaw is List
        ? matchedRaw
              .whereType<Map>()
              .map(
                (item) => MatchedFamilyPatient.fromMap(
                  item.map((key, value) => MapEntry(key.toString(), value)),
                ),
              )
              .where((patient) => patient.patientId.isNotEmpty)
              .toList()
        : const <MatchedFamilyPatient>[];

    return FamilyPatternItem(
      type: ApiResponseParser.readString(map, const ['type']) ?? 'unknown',
      condition: ApiResponseParser.readString(map, const ['condition']),
      category: ApiResponseParser.readString(map, const ['category']),
      overlappingKeywords: keywords,
      weight: ApiResponseParser.readInt(map, const ['weight']) ?? 0,
      reason: ApiResponseParser.readString(map, const ['reason']) ?? '',
      matchedPatients: matchedPatients,
    );
  }
}

class MatchedFamilyPatient {
  const MatchedFamilyPatient({required this.patientId});

  final String patientId;

  factory MatchedFamilyPatient.fromMap(Map<String, dynamic> map) {
    return MatchedFamilyPatient(
      patientId:
          ApiResponseParser.readString(map, const [
            'patientId',
            'patient_id',
          ]) ??
          '',
    );
  }
}
