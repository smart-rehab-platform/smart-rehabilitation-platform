import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile_app/features/dashboard/models/parent_dashboard_models.dart';
import 'package:mobile_app/features/dashboard/models/session_requests_models.dart';
import 'package:mobile_app/features/dashboard/presentation/parent/parent_sessions_localization_utils.dart';
import 'package:mobile_app/l10n/app_localizations.dart';

Future<AppLocalizations> _loadLocalizations(Locale locale) async {
  return lookupAppLocalizations(locale);
}

void main() {
  group('Parent sessions localization', () {
    late AppLocalizations en;
    late AppLocalizations ar;

    setUpAll(() async {
      en = await _loadLocalizations(const Locale('en'));
      ar = await _loadLocalizations(const Locale('ar'));
    });

    test('parent sessions screen titles exist in both locales', () {
      expect(en.navSessions, 'Sessions');
      expect(ar.navSessions, isNotEmpty);
      expect(en.parentSessionsDetailsTitle, 'Session Details');
      expect(ar.parentSessionRequestTitle, isNotEmpty);
    });

    test('session status and location labels map at display time', () {
      expect(
        localizedParentSessionStatusLabel(en, 'completed'),
        en.statusCompleted,
      );
      expect(localizedParentSessionStatusLabel(en, 'no_show'), en.statusMissed);
      expect(
        localizedParentSessionStatusLabel(ar, 'in_progress'),
        ar.statusInProgress,
      );
      final session = ParentSessionItem(
        id: '1',
        patientId: 'p1',
        patientName: 'Child',
        scheduledAt: DateTime(2026, 1, 1),
        locationOrLink: 'https://meet.google.com/abc',
      );
      expect(
        localizedParentSessionLocationLabel(en, session),
        en.parentSessionsOnlineGoogleMeet,
      );
    });

    test('provider and request error strings map at display time', () {
      expect(
        mapParentSessionsError(en, 'Failed to load sessions: Network error'),
        en.parentSessionsLoadFailed('Network error'),
      );
      expect(
        mapParentSessionRequestsError(
          en,
          'Please sign in to view session requests.',
        ),
        en.parentSessionRequestSignInRequired,
      );
      expect(
        mapParentSessionRequestSubmitError(
          en,
          'Failed to submit session request: timeout',
        ),
        en.parentSessionRequestSubmitFailed('timeout'),
      );
      expect(
        localizedParentSessionRequestValidationError(
          en,
          'Please select a child.',
        ),
        en.parentSessionRequestSelectChild,
      );
    });

    test('session request reason and preferred time helpers localize', () {
      expect(
        localizedSessionRequestReasonValue(
          en,
          SessionRequestReason.consultation,
        ),
        en.specialistSessionRequestConsultation,
      );
      expect(
        localizedPreferredTimePeriod(en, PreferredTimePeriod.evening),
        en.specialistSessionRequestPreferredTimeEvening,
      );
      expect(
        localizedSessionRequestStatus(en, SessionRequestStatus.approved),
        en.statusApproved,
      );
    });
  });
}
