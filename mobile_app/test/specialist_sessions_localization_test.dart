import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile_app/features/dashboard/models/session_requests_models.dart';
import 'package:mobile_app/features/dashboard/models/specialist_feature_models.dart';
import 'package:mobile_app/features/dashboard/presentation/specialist/specialist_scoped_localization_utils.dart';
import 'package:mobile_app/features/dashboard/presentation/specialist/specialist_sessions_localization_utils.dart';
import 'package:mobile_app/l10n/app_localizations.dart';

Future<AppLocalizations> _loadLocalizations(Locale locale) async {
  return lookupAppLocalizations(locale);
}

void main() {
  group('Specialist sessions localization', () {
    late AppLocalizations en;
    late AppLocalizations ar;

    setUpAll(() async {
      en = await _loadLocalizations(const Locale('en'));
      ar = await _loadLocalizations(const Locale('ar'));
    });

    test('session screen titles exist in both locales', () {
      expect(en.specialistSessionDetailsTitle, 'Session Details');
      expect(ar.specialistSessionDetailsTitle, 'تفاصيل الجلسة');
      expect(en.specialistScheduleSession, isNotEmpty);
      expect(ar.specialistSessionEditTitle, 'تعديل الجلسة');
    });

    test('session status and type enums map at display time', () {
      expect(localizedSessionStatusValue(en, 'scheduled'), en.statusScheduled);
      expect(localizedSessionStatusValue(ar, 'completed'), ar.statusCompleted);
      expect(localizedSessionStatusValue(en, 'missed'), en.statusNoShow);
      expect(
        localizedSessionStatusValue(en, 'in_progress'),
        en.statusInProgress,
      );
      expect(localizedSessionTypeLabel(en, 'online'), en.clinicalSessionOnline);
      expect(
        localizedSessionTypeLabel(ar, 'consultation'),
        ar.specialistSessionRequestConsultation,
      );
      expect(
        localizedPreferredTimePeriod(en, PreferredTimePeriod.morning),
        en.specialistSessionRequestPreferredTimeMorning,
      );
      expect(
        localizedSessionDisplayStatus(en, SessionDisplayStatus.cancelled),
        en.statusCancelled,
      );
    });

    test('repository and provider error strings map at display time', () {
      expect(
        mapSpecialistSessionDetailError(en, 'Failed to load session details.'),
        en.specialistSessionLoadFailed,
      );
      expect(
        mapSpecialistSessionDetailError(en, 'Please sign in to continue.'),
        en.messageSignInRequired,
      );
      expect(
        mapSpecialistSessionActionError(en, 'Failed to cancel session.'),
        en.specialistSessionCancelFailed,
      );
      expect(
        mapSpecialistSessionRequestActionError(
          en,
          'Failed to approve session request: Network error',
        ),
        en.specialistSessionRequestApproveFailed('Network error'),
      );
      expect(
        localizedSessionLockedMessage(en, SessionDisplayStatus.completed),
        en.specialistSessionLockedCannotEdit(en.statusCompleted),
      );
    });

    test('duration helpers format localized values', () {
      expect(formatSessionDurationValue(en, 45), '45 min');
      expect(formatSessionDurationValue(ar, 30), '30 د');
      expect(
        en.specialistSessionCalendarTileMeta('9:00 AM', 45, 'Online'),
        '9:00 AM • 45 min • Online',
      );
    });

    test('unknown backend values pass through unchanged', () {
      expect(
        mapSpecialistSessionDetailError(en, 'custom backend error'),
        'custom backend error',
      );
      expect(localizedSessionStatusValue(en, 'custom_status'), 'custom_status');
      expect(
        localizedSessionTypeLabel(en, 'Therapy Session'),
        'Therapy Session',
      );
      expect(
        mapSpecialistSessionRequestActionError(en, 'custom request error'),
        'custom request error',
      );
    });
  });
}
