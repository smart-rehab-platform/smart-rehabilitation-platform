import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile_app/features/case_intake/models/case_intake_request_model.dart';
import 'package:mobile_app/features/case_intake/presentation/parent_case_intake_localization_utils.dart';
import 'package:mobile_app/features/dashboard/models/session_requests_models.dart';
import 'package:mobile_app/l10n/app_localizations.dart';

Future<AppLocalizations> _loadLocalizations(Locale locale) async {
  return lookupAppLocalizations(locale);
}

void main() {
  group('Parent case intake localization', () {
    late AppLocalizations en;
    late AppLocalizations ar;

    setUpAll(() async {
      en = await _loadLocalizations(const Locale('en'));
      ar = await _loadLocalizations(const Locale('ar'));
    });

    test('parent case intake screen titles exist in both locales', () {
      expect(en.parentCaseRequestDetailsTitle, 'Request Details');
      expect(ar.parentCaseRequestDetailsTitle, 'تفاصيل الطلب');
      expect(en.parentCaseRequestFormNewTitle, 'New Case Request');
      expect(ar.parentCaseRequestFormNewTitle, 'طلب حالة جديد');
      expect(en.parentCaseRequestsEmptyTitle, isNotEmpty);
      expect(ar.parentCaseRequestsListDisclaimer, isNotEmpty);
    });

    test('case intake status enums map at display time', () {
      expect(
        localizedCaseIntakeStatusLabel(en, CaseIntakeStatus.pending),
        en.caseIntakeStatusPending,
      );
      expect(
        localizedCaseIntakeStatusLabel(ar, CaseIntakeStatus.assigned),
        ar.caseIntakeStatusAssigned,
      );
      expect(
        localizedCaseIntakeStatusSubtitle(en, CaseIntakeStatus.rejected),
        en.caseIntakeStatusRejectedSubtitle,
      );
      expect(
        localizedCaseIntakeStatusSubtitle(
          ar,
          CaseIntakeStatus.convertedToPatient,
        ),
        ar.caseIntakeStatusConvertedToPatientSubtitle,
      );
    });

    test('gender, boolean, and contact period map at display time', () {
      expect(
        localizedCaseIntakeGender(en, CaseIntakeGender.male),
        en.fieldGenderMale,
      );
      expect(
        localizedCaseIntakeGenderFromApi(ar, 'female'),
        ar.fieldGenderFemale,
      );
      expect(localizedCaseIntakeGenderFromApi(en, 'unknown'), 'unknown');
      expect(localizedBooleanYesNo(en, true), en.commonYes);
      expect(localizedBooleanYesNo(ar, false), ar.commonNo);
      expect(
        localizedCaseIntakePreferredContactPeriod(
          en,
          PreferredTimePeriod.evening,
        ),
        en.specialistSessionRequestPreferredTimeEvening,
      );
    });

    test('provider and validation error strings map at display time', () {
      expect(
        mapParentCaseIntakeProviderError(
          en,
          'Please sign in to view case requests.',
        ),
        en.parentCaseRequestsSignInRequired,
      );
      expect(
        mapParentCaseIntakeProviderError(
          en,
          'Failed to load case requests: Network error',
        ),
        en.parentCaseRequestsLoadFailed('Network error'),
      );
      expect(
        mapParentCaseIntakeFormLoadError(
          en,
          'Only pending requests can be edited.',
        ),
        en.parentCaseRequestFormOnlyPendingEditable,
      );
      expect(
        mapParentCaseIntakeValidationMessage(
          en,
          'Child name is required.',
          childNameMax: 150,
          textMax: 5000,
        ),
        en.parentCaseRequestFormValidationChildNameRequired,
      );
      expect(
        mapParentCaseIntakeValidationMessage(
          ar,
          'Case description must not exceed 5000 characters.',
          childNameMax: 150,
          textMax: 5000,
        ),
        ar.parentCaseRequestFormValidationDescriptionMax(5000),
      );
    });

    test('form and progress step labels are localized lists', () {
      expect(parentCaseRequestFormStepLabels(en).length, 6);
      expect(
        parentCaseRequestFormStepLabels(ar).first,
        ar.parentCaseRequestFormStepChild,
      );
      expect(parentCaseRequestProgressStepLabels(en).length, 6);
      expect(
        parentCaseRequestProgressStepLabels(ar).last,
        ar.parentCaseRequestDetailsProgressStepPatientProfileCreated,
      );
    });
  });
}
