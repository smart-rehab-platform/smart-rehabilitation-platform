import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile_app/features/dashboard/presentation/parent/parent_extended_localization_utils.dart';
import 'package:mobile_app/l10n/app_localizations.dart';

Future<AppLocalizations> _loadLocalizations(Locale locale) async {
  return lookupAppLocalizations(locale);
}

void main() {
  group('Parent extended screens localization', () {
    late AppLocalizations en;
    late AppLocalizations ar;

    setUpAll(() async {
      en = await _loadLocalizations(const Locale('en'));
      ar = await _loadLocalizations(const Locale('ar'));
    });

    test('screen titles and section labels exist in both locales', () {
      expect(en.parentExerciseChildDetailsTitle, 'Child Details');
      expect(ar.parentExerciseChildDetailsTitle, isNotEmpty);
      expect(en.parentFeedbackTitle, 'Specialist Feedback');
      expect(ar.parentFeedbackTitle, isNotEmpty);
      expect(en.parentExerciseInformation, 'Exercise information');
      expect(ar.parentExerciseYourSubmission, isNotEmpty);
      expect(en.parentMediaAdd, 'Add media');
      expect(ar.parentMediaAdd, isNotEmpty);
    });

    test('child detail and exercise provider errors map at display time', () {
      expect(
        mapParentChildDetailError(
          en,
          'Failed to load child details: Network error',
        ),
        en.parentExerciseChildDetailsLoadFailed('Network error'),
      );
      expect(
        mapParentExerciseSubmitError(
          en,
          'Failed to submit exercise. Please try again.',
        ),
        en.parentExerciseSubmitFailed,
      );
      expect(
        mapParentExerciseSubmitError(
          en,
          'You do not have permission to upload this file.',
        ),
        en.parentExerciseUploadPermissionDenied,
      );
      expect(
        mapParentExerciseSubmitError(en, 'Unknown server error'),
        'Unknown server error',
      );
    });

    test('exercise submission status maps at display time', () {
      expect(
        localizedExerciseSubmissionStatus(en, 'pending'),
        en.statusPending,
      );
      expect(
        localizedExerciseSubmissionStatus(en, 'reviewed'),
        en.statusReviewed,
      );
      expect(
        localizedExerciseSubmissionStatus(en, 'needs_retry'),
        en.statusNeedsRetry,
      );
      expect(
        localizedExerciseSubmissionStatus(en, 'completed'),
        en.statusCompleted,
      );
      expect(
        localizedExerciseSubmissionStatus(ar, 'completed'),
        ar.statusCompleted,
      );
    });

    test('media type labels map at display time', () {
      expect(
        localizedExerciseMediaTypeLabel(en, 'video'),
        en.communicationAttachmentTypeVideo,
      );
      expect(
        localizedExerciseMediaTypeLabel(en, 'audio'),
        en.communicationAttachmentTypeAudio,
      );
      expect(
        localizedExerciseMediaTypeLabel(en, 'image'),
        en.communicationAttachmentTypeImage,
      );
      expect(
        localizedExerciseMediaTypeLabel(en, 'file'),
        en.communicationAttachmentTypeFile,
      );
      expect(
        formatParentExerciseMediaAttachedLabel(en, 'video'),
        en.parentMediaAttached(en.communicationAttachmentTypeVideo),
      );
    });

    test('treatment plan status maps at display time', () {
      expect(
        localizedTreatmentPlanStatus(en, 'active'),
        en.parentFeedbackPlanStatusActive,
      );
      expect(localizedTreatmentPlanStatus(en, 'completed'), en.statusCompleted);
      expect(
        localizedTreatmentPlanStatus(en, 'archived'),
        en.parentFeedbackPlanStatusArchived,
      );
    });

    test('reused keys remain wired for child detail and feedback', () {
      expect(en.entityReports, 'Reports');
      expect(en.navSessions, 'Sessions');
      expect(en.roleSpecialist, 'Specialist');
      expect(en.parentDashboardRetryRequired, 'Retry required');
      expect(en.entityTreatmentPlan, 'Treatment Plan');
      expect(en.commonCancel, 'Cancel');
    });
  });
}
