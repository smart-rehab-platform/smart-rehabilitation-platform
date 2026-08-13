import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile_app/features/dashboard/models/specialist_exercise_review_models.dart';
import 'package:mobile_app/features/dashboard/presentation/specialist/specialist_exercise_review_localization_utils.dart';
import 'package:mobile_app/features/dashboard/presentation/specialist/specialist_patient_details_localization_utils.dart';
import 'package:mobile_app/l10n/app_localizations.dart';

Future<AppLocalizations> _loadLocalizations(Locale locale) async {
  return lookupAppLocalizations(locale);
}

void main() {
  group('Specialist exercise review localization', () {
    late AppLocalizations en;
    late AppLocalizations ar;

    setUpAll(() async {
      en = await _loadLocalizations(const Locale('en'));
      ar = await _loadLocalizations(const Locale('ar'));
    });

    test('screen titles exist in both locales', () {
      expect(en.specialistReviewExerciseTitle, 'Review Exercise');
      expect(ar.specialistReviewExerciseTitle, 'مراجعة التمرين');
      expect(en.navPendingReviews, 'Pending Reviews');
      expect(ar.navPendingReviews, 'بانتظار المراجعة');
    });

    test('review decision and submission status enums map at display time', () {
      expect(
        localizedReviewDecision(en, ReviewDecision.approved),
        en.statusApproved,
      );
      expect(
        localizedReviewDecision(ar, ReviewDecision.needsRetry),
        ar.statusNeedsRetry,
      );
      expect(localizedSubmissionStatus(en, 'reviewed'), en.statusReviewed);
      expect(localizedSubmissionStatus(ar, 'needs_retry'), ar.statusNeedsRetry);
      expect(localizedReviewStatus(en, 'Needs retry'), en.statusNeedsRetry);
    });

    test('provider error strings map at display time', () {
      expect(
        mapSpecialistExerciseReviewError(en, 'Submission not found.'),
        en.specialistReviewSubmissionNotFound,
      );
      expect(
        mapSpecialistExerciseReviewError(
          en,
          'Please sign in to submit a review.',
        ),
        en.specialistReviewSignInRequired,
      );
      expect(
        mapSpecialistExerciseReviewError(
          en,
          'Failed to load submission: timeout',
        ),
        en.specialistReviewLoadFailed('timeout'),
      );
      expect(
        mapSpecialistExerciseReviewError(
          en,
          'Failed to submit review: Network error',
        ),
        en.specialistReviewSubmitFailed('Network error'),
      );
    });

    test('media type and priority labels map at display time', () {
      expect(localizedSubmissionMediaTypeLabel(en, 'Audio'), en.mediaTypeAudio);
      expect(localizedSubmissionMediaTypeLabel(ar, 'video'), ar.mediaTypeVideo);
      expect(localizedPendingReviewPriority(en, 'High'), en.priorityHigh);
      expect(localizedPendingReviewPriority(ar, 'Medium'), ar.priorityMedium);
    });

    test('unknown backend values pass through unchanged', () {
      expect(
        mapSpecialistExerciseReviewError(en, 'custom backend error'),
        'custom backend error',
      );
      expect(localizedSubmissionStatus(en, 'custom'), 'custom');
      expect(localizedPendingReviewPriority(en, 'Low'), 'Low');
    });
  });
}
