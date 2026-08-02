import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile_app/features/dashboard/data/specialist_patient_details_repository.dart';
import 'package:mobile_app/features/dashboard/models/family_pattern_details_models.dart';
import 'package:mobile_app/features/dashboard/models/family_pattern_insight_models.dart';
import 'package:mobile_app/features/dashboard/presentation/specialist/family_pattern_details_sheet.dart';
import 'package:mobile_app/features/dashboard/presentation/specialist/family_pattern_insight_card.dart';

class _FakeRepository extends SpecialistPatientDetailsRepository {
  _FakeRepository(this._details) : super(Dio());

  final FamilyPatternDetails _details;

  @override
  Future<FamilyPatternDetails> fetchFamilyPatternDetails(
    String patientId,
  ) async {
    return _details;
  }
}

class _FailingRepository extends SpecialistPatientDetailsRepository {
  _FailingRepository() : super(Dio());

  @override
  Future<FamilyPatternDetails> fetchFamilyPatternDetails(
    String patientId,
  ) async {
    throw Exception('Network error');
  }
}

const _highInsight = FamilyPatternInsight(
  hasSiblings: true,
  matchedChildren: 2,
  patternScore: 95,
  evidenceLevel: 'HIGH',
  summaryReason: 'Summary.',
  patterns: [
    FamilyPatternItem(type: 'shared_diagnosis', condition: 'Speech Delay'),
  ],
);

const _details = FamilyPatternDetails(
  patientId: '11111111-1111-4111-8111-111111111111',
  patternScore: 95,
  evidenceLevel: 'HIGH',
  matchedChildren: 2,
  visibleMatchedChildren: 1,
  hiddenMatchedChildrenCount: 1,
  summaryReason: 'Summary.',
  groups: [
    FamilyPatternDetailsGroup(
      type: 'shared_diagnosis',
      label: 'Shared Diagnosis',
      condition: 'Speech and Language Delay',
      children: [
        FamilyPatternMatchedChild(
          patientId: '22222222-2222-4222-8222-222222222222',
          patientName: 'Layla Al-Rashid',
          matchedValue: 'Delayed Speech',
        ),
      ],
    ),
    FamilyPatternDetailsGroup(
      type: 'shared_difficulties',
      label: 'Observed Difficulties',
      overlappingKeywords: ['speech', 'articulation'],
      children: [
        FamilyPatternMatchedChild(
          patientId: '22222222-2222-4222-8222-222222222222',
          patientName: 'Layla Al-Rashid',
          matchedKeywords: ['speech', 'articulation'],
        ),
      ],
    ),
  ],
  disclaimer:
      'This feature identifies repeated characteristics among children linked to the same parent account. It does not diagnose hereditary or genetic conditions.',
);

void main() {
  testWidgets('review button hidden with zero matches', (tester) async {
    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: SizedBox(
            width: 360,
            child: FamilyPatternInsightCard(
              insight: const FamilyPatternInsight(
                hasSiblings: true,
                matchedChildren: 0,
                patterns: [],
              ),
              onReviewMatchedChildren: () {},
            ),
          ),
        ),
      ),
    );

    expect(find.text('Review Matched Children'), findsNothing);
  });

  testWidgets('review button shown with matches', (tester) async {
    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: SingleChildScrollView(
            child: SizedBox(
              width: 360,
              child: FamilyPatternInsightCard(
                insight: _highInsight,
                onReviewMatchedChildren: () {},
              ),
            ),
          ),
        ),
      ),
    );

    expect(find.text('Review Matched Children'), findsOneWidget);
    expect(find.text('2 Children Matched'), findsOneWidget);
    expect(find.text('Matched at least one detected pattern.'), findsOneWidget);
    expect(tester.takeException(), isNull);
  });

  testWidgets('bottom sheet groups children and hides IDs', (tester) async {
    var noteDraft = '';
    var messageDraft = '';
    var sessionDraft = '';

    await tester.pumpWidget(
      MaterialApp(
        home: Builder(
          builder: (context) {
            return Scaffold(
              body: Center(
                child: ElevatedButton(
                  onPressed: () {
                    showFamilyPatternDetailsSheet(
                      context: context,
                      patientId: _details.patientId,
                      insight: _highInsight,
                      repository: _FakeRepository(_details),
                      onAddClinicalNote: (draft) async {
                        noteDraft = draft;
                      },
                      onContactParent: (draft) async {
                        messageDraft = draft;
                      },
                      onScheduleFollowUp: (draft) async {
                        sessionDraft = draft;
                      },
                    );
                  },
                  child: const Text('Open'),
                ),
              ),
            );
          },
        ),
      ),
    );

    await tester.tap(find.text('Open'));
    await tester.pumpAndSettle();

    expect(find.text('Family Pattern Details'), findsOneWidget);
    expect(find.text('Shared Diagnosis'), findsOneWidget);
    expect(find.text('Layla Al-Rashid'), findsNWidgets(2));
    expect(find.textContaining('22222222'), findsNothing);
    expect(
      find.textContaining('not shown because you are not assigned'),
      findsOneWidget,
    );

    await tester.scrollUntilVisible(
      find.text('Add Clinical Note'),
      120,
      scrollable: find.byType(Scrollable).last,
    );
    await tester.pumpAndSettle();
    await tester.tap(find.text('Add Clinical Note'));
    await tester.pumpAndSettle();
    expect(noteDraft, isNotEmpty);
    expect(noteDraft.contains('hereditary'), isFalse);

    await tester.scrollUntilVisible(
      find.text('Contact Parent'),
      120,
      scrollable: find.byType(Scrollable).last,
    );
    await tester.tap(find.text('Contact Parent'));
    await tester.pumpAndSettle();
    expect(messageDraft, isNotEmpty);
    expect(messageDraft.contains('hereditary or genetic diagnosis'), isTrue);

    await tester.scrollUntilVisible(
      find.text('Schedule Follow-up'),
      120,
      scrollable: find.byType(Scrollable).last,
    );
    await tester.tap(find.text('Schedule Follow-up'));
    await tester.pumpAndSettle();
    expect(sessionDraft, isNotEmpty);

    expect(tester.takeException(), isNull);
  });

  testWidgets('details endpoint failure shows retry', (tester) async {
    await tester.pumpWidget(
      MaterialApp(
        home: Builder(
          builder: (context) {
            return Scaffold(
              body: Center(
                child: ElevatedButton(
                  onPressed: () {
                    showFamilyPatternDetailsSheet(
                      context: context,
                      patientId: _details.patientId,
                      insight: _highInsight,
                      repository: _FailingRepository(),
                      onAddClinicalNote: (_) async {},
                      onContactParent: (_) async {},
                      onScheduleFollowUp: (_) async {},
                    );
                  },
                  child: const Text('Open'),
                ),
              ),
            );
          },
        ),
      ),
    );

    await tester.tap(find.text('Open'));
    await tester.pumpAndSettle();

    expect(find.text('Retry'), findsOneWidget);
    expect(
      find.text('Unable to load matched children details.'),
      findsOneWidget,
    );
  });

  testWidgets('no overflow at narrow width', (tester) async {
    await tester.pumpWidget(
      MaterialApp(
        home: Builder(
          builder: (context) {
            return Scaffold(
              body: SizedBox(
                width: 360,
                child: Center(
                  child: ElevatedButton(
                    onPressed: () {
                      showFamilyPatternDetailsSheet(
                        context: context,
                        patientId: _details.patientId,
                        insight: _highInsight,
                        repository: _FakeRepository(_details),
                        onAddClinicalNote: (_) async {},
                        onContactParent: (_) async {},
                        onScheduleFollowUp: (_) async {},
                      );
                    },
                    child: const Text('Open'),
                  ),
                ),
              ),
            );
          },
        ),
      ),
    );

    await tester.tap(find.text('Open'));
    await tester.pumpAndSettle();
    expect(tester.takeException(), isNull);
  });
}
