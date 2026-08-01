import 'package:flutter_test/flutter_test.dart';
import 'package:mobile_app/features/dashboard/models/family_pattern_insight_models.dart';

void main() {
  group('FamilyPatternInsight.fromMap', () {
    test('parses complete response', () {
      final insight = FamilyPatternInsight.fromMap({
        'hasSiblings': true,
        'matchedChildren': 1,
        'patternScore': 95,
        'evidenceLevel': 'HIGH',
        'summaryReason':
            'Multiple children linked to the same parent account share a confirmed diagnosis, the same case category, and similar observed difficulties.',
        'patterns': [
          {
            'type': 'shared_diagnosis',
            'condition': 'Speech and Language Delay',
            'weight': 60,
            'reason':
                'Multiple linked children share the same or an equivalent confirmed diagnosis.',
            'matchedPatients': [
              {'patientId': 'uuid-1'},
            ],
          },
        ],
        'disclaimer':
            'This feature identifies repeated characteristics among children linked to the same parent account. It does not diagnose hereditary or genetic conditions.',
      });

      expect(insight.hasSiblings, isTrue);
      expect(insight.matchedChildren, 1);
      expect(insight.patternScore, 95);
      expect(insight.evidenceLevel, 'HIGH');
      expect(insight.patterns, hasLength(1));
      expect(insight.patterns.first.condition, 'Speech and Language Delay');
      expect(insight.patterns.first.matchedPatients.first.patientId, 'uuid-1');
      expect(
        insight.patterns.first.matchedPatients.first.patientId.isNotEmpty,
        isTrue,
      );
    });

    test('parses no siblings response', () {
      final insight = FamilyPatternInsight.fromMap({
        'hasSiblings': false,
        'matchedChildren': 0,
        'patternScore': 0,
        'evidenceLevel': 'LOW',
        'summaryReason':
            'No other patients are linked to the same parent account.',
        'patterns': [],
        'disclaimer': 'Disclaimer text',
      });

      expect(insight.hasSiblings, isFalse);
      expect(insight.patterns, isEmpty);
      expect(insight.patternScore, 0);
    });

    test('parses siblings with no patterns', () {
      final insight = FamilyPatternInsight.fromMap({
        'hasSiblings': true,
        'matchedChildren': 0,
        'patternScore': 0,
        'evidenceLevel': 'LOW',
        'summaryReason':
            'No repeated clinical characteristics were detected in the available records.',
        'patterns': [],
      });

      expect(insight.hasSiblings, isTrue);
      expect(insight.hasDetectedPatterns, isFalse);
      expect(insight.matchedChildren, 0);
    });

    test('handles unknown pattern type safely', () {
      final insight = FamilyPatternInsight.fromMap({
        'hasSiblings': true,
        'patterns': [
          {
            'type': 'future_pattern_type',
            'weight': 5,
            'reason': 'Future reason',
          },
        ],
      });

      expect(insight.patterns.single.type, 'future_pattern_type');
      expect(insight.patterns.single.weight, 5);
    });

    test('defaults missing optional fields', () {
      final insight = FamilyPatternInsight.fromMap({});

      expect(insight.hasSiblings, isFalse);
      expect(insight.matchedChildren, 0);
      expect(insight.patternScore, 0);
      expect(insight.evidenceLevel, 'LOW');
      expect(insight.summaryReason, isEmpty);
      expect(insight.patterns, isEmpty);
      expect(insight.disclaimer, isEmpty);
    });

    test('does not expect patient names in matched patients', () {
      final item = FamilyPatternItem.fromMap({
        'type': 'shared_diagnosis',
        'matchedPatients': [
          {'patientId': 'uuid-1', 'patientName': 'Sibling Name'},
        ],
      });

      expect(item.matchedPatients.single.patientId, 'uuid-1');
      expect(item.matchedPatients.single, isA<MatchedFamilyPatient>());
    });

    test('preserves Arabic keywords', () {
      final item = FamilyPatternItem.fromMap({
        'type': 'shared_difficulties',
        'overlappingKeywords': ['تأخر', 'نطق', 'لغوية'],
      });

      expect(item.overlappingKeywords, ['تأخر', 'نطق', 'لغوية']);
    });
  });
}
