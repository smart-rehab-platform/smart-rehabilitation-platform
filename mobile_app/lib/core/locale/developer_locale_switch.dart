import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../constants/dashboard_colors.dart';
import '../../features/dashboard/widgets/dashboard_layout.dart';
import '../../features/dashboard/widgets/dashboard_surface_card.dart';
import 'locale_provider.dart';

/// Temporary developer-only control for Phase 2A locale verification.
/// Replace with the final language settings UI in a later phase.
class DeveloperLocaleSwitch extends ConsumerWidget {
  const DeveloperLocaleSwitch({super.key});

  String _currentLocaleLabel(Locale locale) {
    return locale.languageCode == 'ar' ? 'العربية' : 'English';
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final locale = ref.watch(localeProvider);
    final notifier = ref.read(localeProvider.notifier);
    final theme = Theme.of(context);
    final isArabic = locale.languageCode == 'ar';

    return Padding(
      padding: EdgeInsets.only(bottom: context.dashSpacing * 0.75),
      child: DashboardSurfaceCard(
        tint: DashboardColors.warning,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Developer: Language (temporary)',
              style: theme.textTheme.labelSmall?.copyWith(
                color: DashboardColors.warning,
                fontWeight: FontWeight.w700,
                letterSpacing: 0.3,
              ),
            ),
            SizedBox(height: context.dashSpacing * 0.35),
            Text(
              'Current locale:',
              style: theme.textTheme.bodySmall?.copyWith(
                color: DashboardColors.textMuted,
              ),
            ),
            SizedBox(height: context.dashSpacing * 0.15),
            Text(
              _currentLocaleLabel(locale),
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w800,
                color: DashboardColors.textPrimary,
              ),
            ),
            SizedBox(height: context.dashSpacing * 0.65),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: isArabic
                        ? () => notifier.setLanguageCode('en')
                        : null,
                    child: const Text('English'),
                  ),
                ),
                SizedBox(width: context.dashSpacing * 0.45),
                Expanded(
                  child: OutlinedButton(
                    onPressed: !isArabic
                        ? () => notifier.setLanguageCode('ar')
                        : null,
                    child: const Text('العربية'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
