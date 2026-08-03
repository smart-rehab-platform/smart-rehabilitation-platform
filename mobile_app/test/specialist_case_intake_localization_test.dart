import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile_app/features/case_intake/models/case_intake_request_model.dart';
import 'package:mobile_app/features/case_intake/presentation/specialist_case_intake_localization_utils.dart';
import 'package:mobile_app/features/dashboard/models/session_requests_models.dart';
import 'package:mobile_app/l10n/app_localizations.dart';

Future<AppLocalizations> _loadLocalizations(Locale locale) async {
  return lookupAppLocalizations(locale);
}

void main() {
  group('Specialist case intake localization', () {
    late AppLocalizations en;
    late AppLocalizations ar;

    setUpAll(() async {
      en = await _loadLocalizations(const Locale('en'));
      ar = await _loadLocalizations(const Locale('ar'));
    });

    test('specialist case intake screen titles exist in both locales', () {
      expect(en.navAssignedCaseRequests, 'Assigned Case Requests');
      expect(ar.navAssignedCaseRequests, isNotEmpty);
      expect(en.specialistCaseRequestDetailsTitle, 'Case Request');
      expect(ar.specialistCaseAssessmentStartTitle, 'بدء التقييم');
    });

    test('status and filter labels map at display time', () {
      expect(
        localizedCaseIntakeStatusLabel(en, CaseIntakeStatus.underAssessment),
        en.caseIntakeStatusUnderAssessment,
      );
      expect(
        localizedSpecialistCaseIntakeStatusFilterLabel(en, null),
        en.adminCaseRequestsAllStatuses,
      );
      expect(
        localizedSpecialistCaseIntakeStatusFilterLabel(
          en,
          CaseIntakeStatus.convertedToPatient,
        ),
        en.adminCaseRequestsConvertedToPatient,
      );
      expect(
        specialistCaseTimelineStepLabel(ar, 'converted'),
        ar.specialistCaseRequestDetailsTimelineConverted,
      );
    });

    test('provider and action error strings map at display time', () {
      expect(
        mapSpecialistAssignedCasesError(
          en,
          'Failed to load assigned case requests: Network error',
        ),
        en.specialistCaseRequestsLoadFailed('Network error'),
      );
      expect(
        mapSpecialistCaseRequestDetailError(en, 'Case request not found.'),
        en.parentCaseRequestDetailsNotFound,
      );
      expect(
        mapSpecialistCaseRequestActionError(
          en,
          'Only assigned case requests can start assessment',
        ),
        en.specialistCaseAssessmentOnlyAssignedCanStart,
      );
      expect(
        mapSpecialistCaseAssessmentNotesValidation(
          en,
          'Assessment notes are required.',
          maxLength: 10000,
        ),
        en.specialistCaseAssessmentNotesRequired,
      );
    });

    test('age, attachment count, and contact period helpers localize', () {
      expect(
        localizedSpecialistCaseAttachmentCountLabel(en, 1),
        en.specialistCaseRequestsOneAttachment,
      );
      expect(
        localizedSpecialistCaseAttachmentCountLabel(ar, 3),
        ar.specialistCaseRequestsAttachmentCount(3),
      );
      expect(
        localizedCaseIntakePreferredContactPeriod(
          en,
          PreferredTimePeriod.flexible,
        ),
        en.specialistSessionRequestPreferredTimeFlexible,
      );
      expect(
        formatSpecialistCaseIntakeAge(en, DateTime(2020, 1, 1)),
        isNotEmpty,
      );
    });
  });
}
