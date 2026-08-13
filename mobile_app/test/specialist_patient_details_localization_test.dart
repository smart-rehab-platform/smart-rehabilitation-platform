import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile_app/features/dashboard/presentation/specialist/specialist_patient_details_localization_utils.dart';
import 'package:mobile_app/l10n/app_localizations.dart';

Future<AppLocalizations> _loadLocalizations(Locale locale) async {
  return lookupAppLocalizations(locale);
}

void main() {
  group('Specialist patient details localization', () {
    late AppLocalizations en;
    late AppLocalizations ar;

    setUpAll(() async {
      en = await _loadLocalizations(const Locale('en'));
      ar = await _loadLocalizations(const Locale('ar'));
    });

    test('section and action labels exist in both locales', () {
      expect(en.specialistPatientDetailsTitle, 'Patient Details');
      expect(ar.specialistPatientDetailsTitle, 'تفاصيل المريض');
      expect(en.specialistReviewExercises, 'Review Exercises');
      expect(ar.specialistReviewExercises, 'مراجعة التمارين');
      expect(en.specialistFamilyPatternInsightTitle, 'Family Pattern Insight');
      expect(ar.specialistFamilyPatternInsightTitle, 'رؤية الأنماط العائلية');
    });

    test('internal status and enum codes map at display time', () {
      expect(localizedTreatmentPlanStatus(en, 'active'), en.statusActive);
      expect(localizedTreatmentPlanStatus(ar, 'completed'), ar.statusCompleted);
      expect(localizedExerciseStatusLabel(en, 'Inactive'), en.statusInactive);
      expect(localizedReviewStatus(en, 'Reviewed'), en.statusReviewed);
      expect(localizedReviewStatus(ar, 'Needs retry'), ar.statusNeedsRetry);
      expect(localizedMediaTypeLabel(en, 'Audio'), en.mediaTypeAudio);
      expect(localizedGoalTerm(en, 'short_term'), en.goalTermShortTerm);
      expect(localizedGoalTerm(ar, 'long_term'), ar.goalTermLongTerm);
      expect(
        localizedFamilyPatternEvidenceLabel(en, 'HIGH'),
        en.specialistFamilyPatternEvidenceHigh,
      );
      expect(
        localizedFamilyPatternType(en, 'shared_diagnosis'),
        en.specialistFamilyPatternSharedDiagnosis,
      );
    });

    test('provider error strings map without changing provider messages', () {
      expect(
        mapSpecialistPatientDetailsError(
          en,
          'Failed to load patient details: Network error',
        ),
        en.specialistPatientDetailsLoadFailed('Network error'),
      );
      expect(
        mapSpecialistPatientDetailsSaveNoteError(en, 'Failed to save note'),
        en.specialistPatientDetailsSaveNoteFailedGeneric,
      );
      expect(
        mapSpecialistPatientDetailsSaveNoteError(
          en,
          'Failed to save note: Timeout',
        ),
        en.specialistPatientDetailsSaveNoteFailed('Timeout'),
      );
    });

    test('dynamic backend values pass through unchanged', () {
      expect(
        localizedTreatmentPlanStatus(en, 'custom_status'),
        'Custom_status',
      );
      expect(localizedMediaTypeLabel(en, 'Document'), 'Document');
      expect(localizedGoalTerm(en, 'custom_term'), 'custom_term');
      expect(
        localizedFamilyPatternType(en, 'unknown_pattern'),
        'Repeated Characteristic',
      );
    });

    test('family pattern matched children labels pluralize correctly', () {
      expect(
        localizedFamilyPatternMatchedChildrenLabel(en, 1),
        en.specialistFamilyPatternMatchedChildrenOne(1),
      );
      expect(
        localizedFamilyPatternMatchedChildrenLabel(en, 3),
        en.specialistFamilyPatternMatchedChildrenMany(3),
      );
      expect(
        localizedFamilyPatternHiddenMatchesNotice(en, 1),
        en.specialistFamilyPatternHiddenMatchesOne,
      );
      expect(
        localizedFamilyPatternHiddenMatchesNotice(en, 2),
        en.specialistFamilyPatternHiddenMatchesMany(2),
      );
    });
  });
}
