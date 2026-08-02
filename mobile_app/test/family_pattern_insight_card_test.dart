import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile_app/features/dashboard/models/family_pattern_insight_models.dart';
import 'package:mobile_app/features/dashboard/presentation/specialist/family_pattern_insight_card.dart';

void main() {
  testWidgets('renders full HIGH insight without exposing patient IDs', (
    tester,
  ) async {
    const insight = FamilyPatternInsight(
      hasSiblings: true,
      matchedChildren: 1,
      patternScore: 95,
      evidenceLevel: 'HIGH',
      summaryReason:
          'Multiple children linked to the same parent account share a confirmed diagnosis, the same case category, and similar observed difficulties.',
      patterns: [
        FamilyPatternItem(
          type: 'shared_diagnosis',
          condition: 'Speech and Language Delay',
          weight: 60,
        ),
        FamilyPatternItem(
          type: 'shared_case_category',
          category: 'Speech and Language Therapy',
          weight: 20,
        ),
        FamilyPatternItem(
          type: 'shared_difficulties',
          overlappingKeywords: ['speech', 'articulation'],
          weight: 15,
        ),
      ],
      disclaimer:
          'This feature identifies repeated characteristics among children linked to the same parent account. It does not diagnose hereditary or genetic conditions.',
    );

    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: SingleChildScrollView(
            child: SizedBox(
              width: 360,
              child: FamilyPatternInsightCard(insight: insight),
            ),
          ),
        ),
      ),
    );

    expect(find.text('Family Pattern Insight'), findsOneWidget);
    expect(find.text('Clinical Summary'), findsOneWidget);
    expect(find.text('High Evidence'), findsOneWidget);
    expect(find.text('95 / 100'), findsOneWidget);
    expect(
      find.text('High confidence based on available records.'),
      findsOneWidget,
    );
    expect(find.text('1 Child Matched'), findsOneWidget);
    expect(find.text('Shared Diagnosis'), findsOneWidget);
    expect(find.text('Shared Case Category'), findsOneWidget);
    expect(find.text('Observed Difficulties'), findsOneWidget);
    expect(
      find.textContaining('hereditary or genetic conditions'),
      findsNothing,
    );
    expect(find.textContaining('de000002'), findsNothing);
    expect(find.textContaining('patientId'), findsNothing);
    expect(tester.takeException(), isNull);
  });

  testWidgets('hides card when no siblings exist', (tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: Scaffold(
          body: FamilyPatternInsightCard(
            insight: FamilyPatternInsight(hasSiblings: false),
          ),
        ),
      ),
    );

    expect(find.text('Family Pattern Insight'), findsNothing);
  });

  testWidgets('shows neutral card when siblings exist without patterns', (
    tester,
  ) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: Scaffold(
          body: FamilyPatternInsightCard(
            insight: FamilyPatternInsight(
              hasSiblings: true,
              summaryReason:
                  'No repeated clinical characteristics were detected in the available records.',
            ),
          ),
        ),
      ),
    );

    expect(find.text('Family Pattern Insight'), findsOneWidget);
    expect(find.text('Clinical Summary'), findsOneWidget);
    expect(find.text('95 / 100'), findsNothing);
    expect(
      find.text(
        'No repeated clinical characteristics were detected in the available records.',
      ),
      findsOneWidget,
    );
  });

  testWidgets('expands when more than three findings exist', (tester) async {
    const insight = FamilyPatternInsight(
      hasSiblings: true,
      matchedChildren: 2,
      patternScore: 100,
      evidenceLevel: 'HIGH',
      summaryReason: 'Summary text.',
      patterns: [
        FamilyPatternItem(type: 'shared_diagnosis', condition: 'A'),
        FamilyPatternItem(type: 'shared_case_category', category: 'B'),
        FamilyPatternItem(
          type: 'shared_difficulties',
          overlappingKeywords: ['one', 'two'],
        ),
        FamilyPatternItem(
          type: 'previous_diagnosis_similarity',
          overlappingKeywords: ['prior', 'speech'],
        ),
      ],
    );

    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: SingleChildScrollView(
            child: SizedBox(
              width: 360,
              child: FamilyPatternInsightCard(insight: insight),
            ),
          ),
        ),
      ),
    );

    expect(find.text('Previous Diagnosis'), findsNothing);
    expect(find.text('View all findings'), findsOneWidget);

    await tester.ensureVisible(find.text('View all findings'));
    await tester.tap(find.text('View all findings'));
    await tester.pumpAndSettle();

    expect(find.text('Previous Diagnosis'), findsOneWidget);
    expect(find.text('Show fewer findings'), findsOneWidget);
    expect(tester.takeException(), isNull);
  });
}
