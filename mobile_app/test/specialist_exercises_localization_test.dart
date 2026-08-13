import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile_app/features/dashboard/models/specialist_feature_models.dart';
import 'package:mobile_app/features/dashboard/presentation/specialist/specialist_exercises_localization_utils.dart';
import 'package:mobile_app/features/dashboard/presentation/specialist/specialist_patient_details_localization_utils.dart';
import 'package:mobile_app/l10n/app_localizations.dart';

Future<AppLocalizations> _loadLocalizations(Locale locale) async {
  return lookupAppLocalizations(locale);
}

void main() {
  group('Specialist exercises localization', () {
    late AppLocalizations en;
    late AppLocalizations ar;

    setUpAll(() async {
      en = await _loadLocalizations(const Locale('en'));
      ar = await _loadLocalizations(const Locale('ar'));
    });

    test('screen titles exist in both locales', () {
      expect(en.specialistExerciseDetailsTitle, 'Exercise Details');
      expect(ar.specialistExerciseDetailsTitle, 'تفاصيل التمرين');
      expect(en.specialistAssignExercise, 'Assign Exercise');
      expect(ar.specialistAssignedExerciseTitle, 'التمرين المعيّن');
    });

    test('exercise assignment frequency enums map at display time', () {
      expect(
        localizedExerciseAssignmentFrequency(
          en,
          ExerciseAssignmentFrequency.daily,
        ),
        en.exerciseFrequencyDaily,
      );
      expect(
        localizedExerciseAssignmentFrequency(
          ar,
          ExerciseAssignmentFrequency.oneTime,
        ),
        ar.exerciseFrequencyOneTime,
      );
      expect(
        localizedExerciseAssignmentFrequencyValue(en, 'weekly'),
        en.exerciseFrequencyWeekly,
      );
      expect(
        localizedExerciseAssignmentFrequencyValue(ar, 'monthly'),
        ar.exerciseFrequencyMonthly,
      );
    });

    test('provider and validation error strings map at display time', () {
      expect(
        mapSpecialistExerciseDetailError(en, 'Exercise not found.'),
        en.specialistExerciseNotFound,
      );
      expect(
        mapSpecialistExerciseUpsertCategoriesError(
          en,
          'Failed to load categories. Please retry.',
        ),
        en.specialistExerciseCategoriesLoadFailed,
      );
      expect(
        mapSpecialistAssignExerciseError(
          en,
          'Due date cannot be before the start date.',
        ),
        en.specialistTreatmentPlanEndDateBeforeStart,
      );
      expect(
        mapSpecialistAssignedExerciseError(
          en,
          'Failed to load assigned exercise.',
        ),
        en.specialistAssignedExerciseLoadFailed,
      );
    });

    test('exercise status and language labels map at display time', () {
      expect(localizedExerciseStatusLabel(en, 'Active'), en.statusActive);
      expect(localizedExerciseStatusLabel(ar, 'inactive'), ar.statusInactive);
      expect(localizedExerciseLanguageLabel(en, 'English'), en.languageEnglish);
      expect(localizedExerciseLanguageLabel(ar, 'Arabic'), ar.languageArabic);
    });

    test('unknown backend values pass through unchanged', () {
      expect(
        mapSpecialistExerciseDetailError(en, 'custom backend error'),
        'custom backend error',
      );
      expect(localizedExerciseAssignmentFrequencyValue(en, 'custom'), 'custom');
      expect(localizedExerciseLanguageLabel(en, 'French'), 'French');
    });
  });
}
