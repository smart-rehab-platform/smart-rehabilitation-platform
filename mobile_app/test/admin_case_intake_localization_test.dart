import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile_app/features/case_intake/models/case_intake_request_model.dart';
import 'package:mobile_app/features/case_intake/presentation/admin_case_intake_localization_utils.dart';
import 'package:mobile_app/l10n/app_localizations.dart';

Future<AppLocalizations> _loadLocalizations(Locale locale) async {
  return lookupAppLocalizations(locale);
}

void main() {
  group('Admin case intake localization', () {
    late AppLocalizations en;
    late AppLocalizations ar;

    setUpAll(() async {
      en = await _loadLocalizations(const Locale('en'));
      ar = await _loadLocalizations(const Locale('ar'));
    });

    test('admin case intake screen titles exist in both locales', () {
      expect(en.navCaseRequests, 'Case Requests');
      expect(ar.navCaseRequests, isNotEmpty);
      expect(en.parentCaseRequestDetailsTitle, 'Request Details');
      expect(en.adminMatchingChooseSpecialist, 'Choose Specialist');
      expect(ar.adminCaseRequestDetailsRejectedTitle, isNotEmpty);
    });

    test('status and timeline labels map at display time', () {
      expect(
        localizedCaseIntakeStatusLabel(en, CaseIntakeStatus.underAssessment),
        en.caseIntakeStatusUnderAssessment,
      );
      expect(
        adminCaseTimelineStepLabel(en, 'submitted'),
        en.parentCaseRequestDetailsProgressStepSubmitted,
      );
      expect(
        adminCaseTimelineStepLabel(ar, 'converted'),
        ar.specialistCaseRequestDetailsTimelineConverted,
      );
    });

    test('provider and assignment error strings map at display time', () {
      expect(
        mapAdminCaseInboxError(
          en,
          'Failed to load case requests: Network error',
        ),
        en.parentCaseRequestsLoadFailed('Network error'),
      );
      expect(
        mapAdminCaseRequestDetailError(en, 'Case request not found.'),
        en.parentCaseRequestDetailsNotFound,
      );
      expect(
        mapAdminMatchingSpecialistsError(
          en,
          'Failed to load matching specialists: timeout',
        ),
        en.adminCaseAssignmentLoadFailed('timeout'),
      );
      expect(
        mapAdminMatchingSpecialistsAssignError(
          en,
          'Assignment already in progress.',
        ),
        en.adminCaseAssignmentInProgress,
      );
      expect(
        mapAdminMatchingSpecialistsAssignError(
          en,
          'only pending case requests can be assigned',
        ),
        en.adminCaseAssignmentOnlyPending,
      );
    });

    test('matching specialist metric helpers localize', () {
      expect(
        formatAdminMatchingSpecialistYears(en, null),
        en.adminMatchingSpecialistsYearsUnknown,
      );
      expect(formatAdminMatchingSpecialistYears(en, 1), '1 Year');
      expect(formatAdminMatchingSpecialistYears(en, 5), '5 Years');
      expect(
        formatAdminMatchingSpecialistActivePatients(en, 1),
        en.adminMatchingSpecialistsOneActivePatient,
      );
      expect(
        formatAdminMatchingSpecialistCurrentRequests(ar, 3),
        ar.adminMatchingSpecialistsCurrentRequests(3),
      );
      expect(
        localizedSpecialistCaseAttachmentCountLabel(en, 2),
        en.specialistCaseRequestsAttachmentCount(2),
      );
    });
  });
}
