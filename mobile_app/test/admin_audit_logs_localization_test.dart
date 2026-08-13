import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile_app/features/dashboard/presentation/admin/admin_audit_localization_utils.dart';
import 'package:mobile_app/features/dashboard/presentation/admin/admin_scoped_localization_utils.dart';
import 'package:mobile_app/l10n/app_localizations.dart';

Future<AppLocalizations> _loadLocalizations(Locale locale) async {
  return lookupAppLocalizations(locale);
}

void main() {
  group('Admin audit logs localization', () {
    late AppLocalizations en;
    late AppLocalizations ar;

    setUpAll(() async {
      en = await _loadLocalizations(const Locale('en'));
      ar = await _loadLocalizations(const Locale('ar'));
    });

    test('audit logs screen labels exist in both locales', () {
      expect(en.navAuditLogs, 'Audit Logs');
      expect(ar.navAuditLogs, isNotEmpty);
      expect(en.adminAuditAllActions, 'All actions');
      expect(en.adminAuditAllEntities, 'All entities');
      expect(ar.adminAuditNoLogs, isNotEmpty);
    });

    test('provider error strings map at display time', () {
      expect(
        mapAdminAuditLogsError(en, 'Failed to load audit logs: Network error'),
        en.adminAuditLoadFailed('Network error'),
      );
      expect(
        mapAdminAuditLogsError(en, 'Unexpected failure'),
        'Unexpected failure',
      );
    });

    test('known audit actions localize and unknown pass through', () {
      expect(
        localizedAuditActionTitle(en, 'session_complete'),
        en.auditActionSessionComplete,
      );
      expect(localizedAuditActionTitle(en, 'login'), en.auditActionLogin);
      expect(localizedAuditActionTitle(en, 'create'), en.auditActionCreate);
      expect(
        localizedAuditActionTitle(en, 'custom_backend_action'),
        'custom_backend_action',
      );
      expect(
        localizedAuditActionTitle(ar, 'case_intake_request_accept'),
        ar.auditActionCaseIntakeRequestAccept,
      );
    });

    test('known audit entities localize and unknown pass through', () {
      expect(localizedAuditEntityLabel(en, 'patient'), en.entityPatient);
      expect(
        localizedAuditEntityLabel(en, 'case_request'),
        en.entityCaseRequest,
      );
      expect(
        localizedAuditEntityLabel(en, 'assigned_exercise'),
        en.auditEntityAssignedExercise,
      );
      expect(
        localizedAuditEntityLabel(en, 'custom_entity_type'),
        'custom_entity_type',
      );
      expect(localizedAuditEntityLabel(en, null), en.adminAuditSystemEntity);
    });

    test('action badge labels map by category', () {
      expect(
        localizedAuditActionBadgeLabel(
          en,
          AuditActionCategory.create,
          'patient_create',
        ),
        en.auditActionCreate,
      );
      expect(
        localizedAuditActionBadgeLabel(en, AuditActionCategory.login, 'logout'),
        en.auditActionLogout,
      );
      expect(
        localizedAuditActionBadgeLabel(
          en,
          AuditActionCategory.other,
          'unknown',
        ),
        en.auditActionActivity,
      );
    });

    test('card static labels exist in both locales', () {
      expect(en.adminAuditUnknownDate, 'Unknown date');
      expect(en.adminAuditReferenceId, 'Reference ID');
      expect(en.adminAuditSystemUser, 'System');
      expect(en.commonDetails, 'Details');
      expect(ar.adminAuditReferenceId, isNotEmpty);
    });
  });
}
