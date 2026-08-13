import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile_app/features/dashboard/presentation/specialist/specialist_treatment_plans_goals_localization_utils.dart';
import 'package:mobile_app/features/dashboard/models/specialist_edit_treatment_plan_models.dart';
import 'package:mobile_app/features/dashboard/models/specialist_goals_models.dart';
import 'package:mobile_app/l10n/app_localizations.dart';

Future<AppLocalizations> _loadLocalizations(Locale locale) async {
  return lookupAppLocalizations(locale);
}

void main() {
  group('Specialist treatment plans and goals localization', () {
    late AppLocalizations en;
    late AppLocalizations ar;

    setUpAll(() async {
      en = await _loadLocalizations(const Locale('en'));
      ar = await _loadLocalizations(const Locale('ar'));
    });

    test('screen titles exist in both locales', () {
      expect(en.specialistCreateTreatmentPlan, 'Create Treatment Plan');
      expect(ar.specialistCreateTreatmentPlan, 'إنشاء خطة علاج');
      expect(en.specialistEditTreatmentPlan, 'Edit Treatment Plan');
      expect(ar.specialistManageGoals, 'إدارة الأهداف');
    });

    test('plan and goal status enums map at display time', () {
      expect(
        localizedTreatmentPlanStatusEnum(en, TreatmentPlanStatus.active),
        en.statusActive,
      );
      expect(
        localizedTreatmentPlanStatusEnum(ar, TreatmentPlanStatus.archived),
        ar.statusArchived,
      );
      expect(
        localizedGoalTermEnum(en, GoalTerm.shortTerm),
        en.goalTermShortTerm,
      );
      expect(localizedGoalTermEnum(ar, GoalTerm.longTerm), ar.goalTermLongTerm);
    });

    test('provider validation and error strings map at display time', () {
      expect(
        mapSpecialistTreatmentPlanValidation(en, 'Plan title is required'),
        en.specialistTreatmentPlanTitleRequired,
      );
      expect(
        mapSpecialistCreateTreatmentPlanError(
          en,
          'Failed to create treatment plan. Please try again.',
        ),
        en.specialistTreatmentPlanCreateFailed,
      );
      expect(
        mapSpecialistEditTreatmentPlanLoadError(
          en,
          'Failed to load treatment plan: timeout',
        ),
        en.specialistTreatmentPlanLoadFailed('timeout'),
      );
      expect(
        mapSpecialistGoalsValidation(en, 'Goal title is required'),
        en.specialistGoalsTitleRequired,
      );
      expect(
        mapSpecialistGoalsActionError(
          en,
          'Failed to update goal: Network error',
        ),
        en.specialistGoalsUpdateFailed('Network error'),
      );
    });

    test('unknown backend values pass through unchanged', () {
      expect(
        mapSpecialistTreatmentPlanValidation(en, 'custom validation'),
        'custom validation',
      );
      expect(
        mapSpecialistGoalsActionError(en, 'Server rejected request'),
        'Server rejected request',
      );
    });
  });
}
