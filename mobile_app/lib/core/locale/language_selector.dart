import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import '../constants/app_colors.dart';
import '../constants/dashboard_colors.dart';
import '../../features/dashboard/widgets/dashboard_layout.dart';
import '../../features/dashboard/widgets/dashboard_surface_card.dart';
import 'locale_provider.dart';

enum LanguageSelectorPresentation { authCompact, settingsTile }

class _LanguageOption {
  const _LanguageOption({required this.code, required this.label});

  final String code;
  final String label;
}

const _languageOptions = <_LanguageOption>[
  _LanguageOption(code: 'en', label: 'English'),
  _LanguageOption(code: 'ar', label: 'العربية'),
];

String languageLabelForLocale(Locale locale) {
  return locale.languageCode == 'ar' ? 'العربية' : 'English';
}

class LanguageSelector extends ConsumerWidget {
  const LanguageSelector({
    super.key,
    this.presentation = LanguageSelectorPresentation.authCompact,
  });

  final LanguageSelectorPresentation presentation;

  Future<void> _selectLanguage(WidgetRef ref, String languageCode) {
    return ref.read(localeProvider.notifier).setLanguageCode(languageCode);
  }

  List<PopupMenuEntry<String>> _buildMenuItems(Locale locale) {
    return _languageOptions
        .map(
          (option) => PopupMenuItem<String>(
            value: option.code,
            child: Row(
              children: [
                SizedBox(
                  width: 22,
                  child: locale.languageCode == option.code
                      ? const Icon(Icons.check_rounded, size: 16)
                      : null,
                ),
                Text(option.label),
              ],
            ),
          ),
        )
        .toList();
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final locale = ref.watch(localeProvider);
    final currentLabel = languageLabelForLocale(locale);

    if (presentation == LanguageSelectorPresentation.settingsTile) {
      return Padding(
        padding: EdgeInsets.only(bottom: context.dashSpacing * 0.5),
        child: DashboardSurfaceCard(
          child: PopupMenuButton<String>(
            tooltip: 'Language',
            onSelected: (code) => _selectLanguage(ref, code),
            itemBuilder: (context) => _buildMenuItems(locale),
            child: Row(
              children: [
                const Icon(
                  Icons.language_rounded,
                  color: DashboardColors.brandCyan,
                ),
                SizedBox(width: context.dashSpacing * 0.65),
                Expanded(
                  child: Text(
                    'Language',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
                Text(
                  currentLabel,
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: DashboardColors.textMuted,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(width: 4),
                const Icon(
                  Icons.expand_more_rounded,
                  color: DashboardColors.textMuted,
                ),
              ],
            ),
          ),
        ),
      );
    }

    return PopupMenuButton<String>(
      tooltip: 'Language',
      offset: const Offset(0, 42),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      color: AppColors.darkBlue.withValues(alpha: 0.96),
      onSelected: (code) => _selectLanguage(ref, code),
      itemBuilder: (context) => _buildMenuItems(locale),
      child: Container(
        height: 34,
        padding: const EdgeInsets.symmetric(horizontal: 10),
        decoration: BoxDecoration(
          color: AppColors.darkBlue.withValues(alpha: 0.88),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: AppColors.authBorder.withValues(alpha: 0.55),
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.language_rounded,
              size: 15,
              color: AppColors.lightBlue.withValues(alpha: 0.92),
            ),
            const SizedBox(width: 6),
            Text(
              currentLabel,
              style: GoogleFonts.inter(
                fontSize: 11.5,
                fontWeight: FontWeight.w600,
                color: AppColors.lightBlue,
              ),
            ),
            Icon(
              Icons.expand_more_rounded,
              size: 16,
              color: AppColors.lightBlue.withValues(alpha: 0.72),
            ),
          ],
        ),
      ),
    );
  }
}
