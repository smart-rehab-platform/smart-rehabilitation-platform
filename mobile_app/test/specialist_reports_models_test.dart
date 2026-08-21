import 'package:flutter_test/flutter_test.dart';
import 'package:mobile_app/features/dashboard/models/specialist_reports_models.dart';

void main() {
  group('SpecialistReportDetail.fromAiMap', () {
    test('maps generated_by_name to specialistName', () {
      final detail = SpecialistReportDetail.fromAiMap({
        'id': 'ai-1',
        'patient_id': 'patient-1',
        'type': 'monthly',
        'generated_at': '2026-08-20T10:00:00.000Z',
        'generated_by_name': 'Dr. Samir Hassan',
      });

      expect(detail.specialistName, 'Dr. Samir Hassan');
      expect(detail.isAiReport, isTrue);
    });
  });

  group('SpecialistReportListItem.fromAiMap', () {
    test('maps generated_by_name to specialistName', () {
      final item = SpecialistReportListItem.fromAiMap({
        'id': 'ai-1',
        'patient_id': 'patient-1',
        'type': 'weekly',
        'generated_by_name': 'Dr. Samir Hassan',
      });

      expect(item.specialistName, 'Dr. Samir Hassan');
    });
  });
}
