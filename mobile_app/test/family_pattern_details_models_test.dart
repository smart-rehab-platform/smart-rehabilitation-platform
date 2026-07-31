import 'package:flutter_test/flutter_test.dart';
import 'package:mobile_app/features/dashboard/models/family_pattern_details_models.dart';

void main() {
  test('parses full details response', () {
    final details = FamilyPatternDetails.fromMap({
      'patientId': '11111111-1111-4111-8111-111111111111',
      'patternScore': 100,
      'evidenceLevel': 'HIGH',
      'matchedChildren': 2,
      'visibleMatchedChildren': 2,
      'hiddenMatchedChildrenCount': 0,
      'summaryReason': 'Summary text.',
      'groups': [
        {
          'type': 'shared_diagnosis',
          'label': 'Shared Diagnosis',
          'condition': 'Speech and Language Delay',
          'reason': 'Reason text.',
          'children': [
            {
              'patientId': '22222222-2222-4222-8222-222222222222',
              'patientName': 'Layla Al-Rashid',
              'matchedValue': 'Delayed Speech',
            },
          ],
        },
        {
          'type': 'shared_difficulties',
          'label': 'Observed Difficulties',
          'overlappingKeywords': ['speech', 'articulation'],
          'children': [
            {
              'patientId': '22222222-2222-4222-8222-222222222222',
              'patientName': 'Layla Al-Rashid',
              'matchedKeywords': ['speech', 'articulation'],
            },
          ],
        },
      ],
      'disclaimer': 'Disclaimer text.',
    });

    expect(details.patientId, '11111111-1111-4111-8111-111111111111');
    expect(details.patternScore, 100);
    expect(details.evidenceLevel, 'HIGH');
    expect(details.groups.length, 2);
    expect(details.groups.first.children.first.patientName, 'Layla Al-Rashid');
    expect(details.hasVisibleGroups, isTrue);
  });

  test('handles missing optional fields safely', () {
    final details = FamilyPatternDetails.fromMap({
      'patient_id': '11111111-1111-4111-8111-111111111111',
      'groups': [
        {
          'type': 'shared_case_category',
          'label': 'Shared Case Category',
          'children': [
            {
              'patient_id': '22222222-2222-4222-8222-222222222222',
              'patient_name': 'Ahmad Hassan',
            },
          ],
        },
      ],
    });

    expect(details.patternScore, 0);
    expect(details.evidenceLevel, 'LOW');
    expect(details.hiddenMatchedChildrenCount, 0);
    expect(details.groups.first.category, isNull);
    expect(details.groups.first.children.first.matchedValue, isNull);
    expect(details.groups.first.children.first.matchedKeywords, isEmpty);
  });

  test('supports unknown pattern type and Arabic names', () {
    final details = FamilyPatternDetails.fromMap({
      'patientId': '11111111-1111-4111-8111-111111111111',
      'groups': [
        {
          'type': 'future_unknown_rule',
          'label': 'Repeated Characteristic',
          'overlappingKeywords': ['تأخر', 'نطق'],
          'children': [
            {
              'patientId': '22222222-2222-4222-8222-222222222222',
              'patientName': 'ليلى الرashid',
              'matchedKeywords': ['تأخر', 'نطق'],
            },
          ],
        },
      ],
    });

    expect(details.groups.first.type, 'future_unknown_rule');
    expect(details.groups.first.overlappingKeywords, ['تأخر', 'نطق']);
    expect(details.groups.first.children.first.patientName, 'ليلى الرashid');
  });
}
