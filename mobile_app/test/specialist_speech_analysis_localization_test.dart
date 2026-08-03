import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile_app/features/dashboard/presentation/specialist/specialist_speech_analysis_localization_utils.dart';
import 'package:mobile_app/l10n/app_localizations.dart';

Future<AppLocalizations> _loadLocalizations(Locale locale) async {
  return lookupAppLocalizations(locale);
}

void main() {
  group('Specialist speech analysis localization', () {
    late AppLocalizations en;
    late AppLocalizations ar;

    setUpAll(() async {
      en = await _loadLocalizations(const Locale('en'));
      ar = await _loadLocalizations(const Locale('ar'));
    });

    test('screen titles exist in both locales', () {
      expect(en.clinicalSpeechAnalysis, 'Speech Analysis');
      expect(ar.clinicalSpeechAnalysis, 'تحليل النطق');
      expect(en.specialistSpeechAnalysisRunTitle, 'Run Speech Analysis');
      expect(ar.specialistSpeechAnalysisLatestSummary, 'ملخص أحدث تحليل');
    });

    test('analysis status and trend enums map at display time', () {
      expect(localizedSpeechAnalysisStatus(en, 'pending'), en.statusPending);
      expect(
        localizedSpeechAnalysisStatus(ar, 'completed'),
        ar.statusCompleted,
      );
      expect(localizedSpeechAnalysisStatus(en, 'failed'), en.statusFailed);
      expect(
        localizedSpeechAnalysisTrend(en, 'improvement'),
        en.clinicalTrendImproving,
      );
      expect(
        localizedSpeechAnalysisTrend(ar, 'regression'),
        ar.specialistSpeechAnalysisTrendDeclining,
      );
      expect(
        localizedSpeechAnalysisTrend(en, 'stable'),
        en.clinicalTrendStable,
      );
    });

    test('provider and repository error strings map at display time', () {
      expect(
        mapSpecialistSpeechAnalysisError(
          en,
          'No submission selected for speech analysis.',
        ),
        en.specialistSpeechAnalysisNoSubmissionSelected,
      );
      expect(
        mapSpecialistSpeechAnalysisError(en, 'Please sign in to continue.'),
        en.messageSignInRequired,
      );
      expect(
        mapSpecialistSpeechAnalysisError(
          en,
          'Speech analysis could not be completed. Please try again.',
        ),
        en.specialistSpeechAnalysisAnalyzeFailed,
      );
      expect(
        mapSpecialistSpeechAnalysisSuccessMessage(
          en,
          'Speech analysis completed successfully.',
        ),
        en.specialistSpeechAnalysisCompletedSuccess,
      );
    });

    test('language and recording source labels map at display time', () {
      expect(
        localizedSpeechAnalysisLanguage(en, 'English'),
        en.languageEnglish,
      );
      expect(localizedSpeechAnalysisLanguage(ar, 'Arabic'), ar.languageArabic);
      expect(
        localizedSpeechAnalysisStatus(en, 'uploaded'),
        en.specialistSpeechAnalysisSourceUploaded,
      );
      expect(
        localizedSpeechAnalysisStatus(ar, 'recorded'),
        ar.specialistSpeechAnalysisSourceRecorded,
      );
    });

    test('unknown backend values pass through unchanged', () {
      expect(
        mapSpecialistSpeechAnalysisError(en, 'custom backend error'),
        'custom backend error',
      );
      expect(localizedSpeechAnalysisTrend(en, 'custom'), 'custom');
      expect(localizedSpeechAnalysisLanguage(en, 'French'), 'French');
    });
  });
}
