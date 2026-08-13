import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile_app/features/case_intake/models/case_intake_request_model.dart';
import 'package:mobile_app/features/dashboard/presentation/admin/admin_scoped_localization_utils.dart';
import 'package:mobile_app/l10n/app_localizations.dart';

Future<AppLocalizations> _loadLocalizations(Locale locale) async {
  return lookupAppLocalizations(locale);
}

void main() {
  group('Admin top-level localization', () {
    late AppLocalizations en;
    late AppLocalizations ar;

    setUpAll(() async {
      en = await _loadLocalizations(const Locale('en'));
      ar = await _loadLocalizations(const Locale('ar'));
    });

    test('dashboard and navigation labels exist in both locales', () {
      expect(en.navUsers, 'Users');
      expect(ar.navUsers, 'المستخدمون');
      expect(en.adminDashboardSystemAnalytics, 'System Analytics');
      expect(ar.adminDashboardSystemAnalytics, 'تحليلات النظام');
      expect(en.adminSystemActivity, 'System Activity');
      expect(ar.adminSystemActivity, 'نشاط النظام');
      expect(en.navAiCenter, 'AI Center');
      expect(ar.navAiCenter, 'مركز الذكاء الاصطناعي');
    });

    test('week selector labels localize without changing offsets', () {
      expect(localizedSystemActivityPresetLabel(en, 0), en.dateThisWeek);
      expect(localizedSystemActivityPresetLabel(ar, 1), ar.dateLastWeek);
      expect(
        localizedSystemActivityPeriodLabel(en, weekOffset: 4),
        en.adminSystemActivityLastMonth,
      );
      expect(
        localizedSystemActivityPeriodLabel(ar, weekOffset: 3),
        ar.adminSystemActivityWeeksAgo(3),
      );
    });

    test('internal session and role codes map to localized labels', () {
      expect(localizedAdminSessionStatus(en, 'completed'), en.statusCompleted);
      expect(localizedAdminSessionStatus(ar, 'no_show'), ar.statusNoShow);
      expect(localizedAdminRole(en, 'admin'), en.roleAdmin);
      expect(localizedAdminRole(ar, 'specialist'), ar.roleSpecialist);
      expect(localizedAdminGender(en, 'male'), en.fieldGenderMale);
      expect(localizedAdminGender(ar, 'female'), ar.fieldGenderFemale);
    });

    test('case intake status codes map without altering API values', () {
      expect(
        localizedAdminCaseIntakeStatus(en, CaseIntakeStatus.assigned),
        en.statusAssigned,
      );
      expect(
        localizedAdminCaseIntakeStatus(ar, CaseIntakeStatus.convertedToPatient),
        ar.adminCaseRequestsConvertedToPatient,
      );
      expect(
        CaseIntakeStatus.convertedToPatient.apiValue,
        'converted_to_patient',
      );
    });

    test('provider error strings map at display time only', () {
      expect(
        mapAdminDashboardError(
          en,
          'Please sign in as an admin to view this dashboard.',
        ),
        en.adminDashboardSignInRequired,
      );
      expect(
        mapAdminUsersError(en, 'Failed to load users: Network error'),
        en.adminUsersLoadFailed('Network error'),
      );
    });

    test('dynamic backend values pass through unchanged', () {
      expect(localizedAdminRole(en, 'custom_role'), 'custom_role');
      expect(localizedAdminSessionStatus(en, 'custom_status'), 'custom status');
      expect(localizedAdminAiStatus(en, 'draft'), 'draft');
    });
  });
}
