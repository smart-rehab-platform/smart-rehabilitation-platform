import 'package:mobile_app/l10n/app_localizations.dart';

const specialistDiagnosisOptionOther = '__other__';

class SpecialistDiagnosisOption {
  const SpecialistDiagnosisOption({
    required this.id,
    required this.titleEn,
  });

  final String id;
  final String titleEn;
}

/// Frontend-managed common clinical diagnosis titles.
///
/// [case_categories] are intake/service categories, not confirmed diagnoses,
/// so they are not used as this selector source.
const kPredefinedDiagnosisOptions = <SpecialistDiagnosisOption>[
  SpecialistDiagnosisOption(id: 'speechDelay', titleEn: 'Speech Delay'),
  SpecialistDiagnosisOption(
    id: 'speechLanguageDelay',
    titleEn: 'Speech and Language Delay',
  ),
  SpecialistDiagnosisOption(id: 'languageDelay', titleEn: 'Language Delay'),
  SpecialistDiagnosisOption(
    id: 'articulationDisorder',
    titleEn: 'Articulation Disorder',
  ),
  SpecialistDiagnosisOption(id: 'fluencyDisorder', titleEn: 'Fluency Disorder'),
  SpecialistDiagnosisOption(id: 'voiceDisorder', titleEn: 'Voice Disorder'),
  SpecialistDiagnosisOption(
    id: 'autismSpectrumDisorder',
    titleEn: 'Autism Spectrum Disorder',
  ),
  SpecialistDiagnosisOption(
    id: 'developmentalDelay',
    titleEn: 'Developmental Delay',
  ),
  SpecialistDiagnosisOption(
    id: 'learningDifficulty',
    titleEn: 'Learning Difficulty',
  ),
  SpecialistDiagnosisOption(id: 'motorDelay', titleEn: 'Motor Delay'),
  SpecialistDiagnosisOption(id: 'adhd', titleEn: 'ADHD'),
];

String normalizeDiagnosisTitle(String? value) {
  return (value ?? '').trim().toLowerCase();
}

String diagnosisOptionLabel(AppLocalizations l10n, String optionId) {
  if (optionId == specialistDiagnosisOptionOther) {
    return l10n.specialistPatientDetailsDiagnosisOptionOther;
  }

  return switch (optionId) {
    'speechDelay' => l10n.specialistDiagnosisOptionSpeechDelay,
    'speechLanguageDelay' => l10n.specialistDiagnosisOptionSpeechLanguageDelay,
    'languageDelay' => l10n.specialistDiagnosisOptionLanguageDelay,
    'articulationDisorder' => l10n.specialistDiagnosisOptionArticulationDisorder,
    'fluencyDisorder' => l10n.specialistDiagnosisOptionFluencyDisorder,
    'voiceDisorder' => l10n.specialistDiagnosisOptionVoiceDisorder,
    'autismSpectrumDisorder' =>
      l10n.specialistDiagnosisOptionAutismSpectrumDisorder,
    'developmentalDelay' => l10n.specialistDiagnosisOptionDevelopmentalDelay,
    'learningDifficulty' => l10n.specialistDiagnosisOptionLearningDifficulty,
    'motorDelay' => l10n.specialistDiagnosisOptionMotorDelay,
    'adhd' => l10n.specialistDiagnosisOptionAdhd,
    _ => optionId,
  };
}

String predefinedDiagnosisTitleEn(String optionId) {
  for (final option in kPredefinedDiagnosisOptions) {
    if (option.id == optionId) {
      return option.titleEn;
    }
  }
  return '';
}

String resolveEffectiveDiagnosisTitle({
  required String? selectedOptionId,
  required String customTitle,
}) {
  if (selectedOptionId == null || selectedOptionId.isEmpty) {
    return '';
  }
  if (selectedOptionId == specialistDiagnosisOptionOther) {
    return customTitle.trim();
  }
  return predefinedDiagnosisTitleEn(selectedOptionId);
}

String? findMatchingPredefinedOptionId(String? diagnosisTitle, AppLocalizations l10n) {
  final normalized = normalizeDiagnosisTitle(diagnosisTitle);
  if (normalized.isEmpty) {
    return null;
  }

  for (final option in kPredefinedDiagnosisOptions) {
    if (normalizeDiagnosisTitle(option.titleEn) == normalized) {
      return option.id;
    }
    if (normalizeDiagnosisTitle(diagnosisOptionLabel(l10n, option.id)) ==
        normalized) {
      return option.id;
    }
  }

  return null;
}

({String selectedOptionId, String customTitle}) resolveDiagnosisSelectorState(
  AppLocalizations l10n,
  String? currentDiagnosisTitle,
) {
  final trimmedTitle = currentDiagnosisTitle?.trim() ?? '';
  if (trimmedTitle.isEmpty) {
    return (selectedOptionId: '', customTitle: '');
  }

  final matchedOptionId = findMatchingPredefinedOptionId(trimmedTitle, l10n);
  if (matchedOptionId != null) {
    return (selectedOptionId: matchedOptionId, customTitle: '');
  }

  return (
    selectedOptionId: specialistDiagnosisOptionOther,
    customTitle: trimmedTitle,
  );
}

bool isDiagnosisSelectionUnchanged({
  required String? currentDiagnosisTitle,
  required String? selectedOptionId,
  required String customTitle,
  required String description,
  required String initialDescription,
  required DateTime diagnosedAt,
  required DateTime initialDiagnosedAt,
}) {
  if (currentDiagnosisTitle == null || currentDiagnosisTitle.trim().isEmpty) {
    return false;
  }

  final effectiveTitle = resolveEffectiveDiagnosisTitle(
    selectedOptionId: selectedOptionId,
    customTitle: customTitle,
  );

  return effectiveTitle.trim() == currentDiagnosisTitle.trim() &&
      description.trim() == initialDescription.trim() &&
      diagnosedAt.year == initialDiagnosedAt.year &&
      diagnosedAt.month == initialDiagnosedAt.month &&
      diagnosedAt.day == initialDiagnosedAt.day;
}

String? validateDiagnosisSelection(
  AppLocalizations l10n, {
  required String? selectedOptionId,
  required String customTitle,
}) {
  if (selectedOptionId == null || selectedOptionId.isEmpty) {
    return l10n.specialistPatientDetailsDiagnosisSelectRequired;
  }
  if (selectedOptionId == specialistDiagnosisOptionOther &&
      customTitle.trim().isEmpty) {
    return l10n.specialistPatientDetailsOtherDiagnosisRequired;
  }
  final effectiveTitle = resolveEffectiveDiagnosisTitle(
    selectedOptionId: selectedOptionId,
    customTitle: customTitle,
  );
  if (effectiveTitle.trim().isEmpty) {
    return l10n.specialistPatientDetailsOtherDiagnosisRequired;
  }
  return null;
}
