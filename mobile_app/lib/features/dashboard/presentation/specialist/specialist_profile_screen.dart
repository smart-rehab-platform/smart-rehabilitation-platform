import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/dashboard_colors.dart';
import '../../../../core/locale/language_selector.dart';
import '../../../../core/routes/app_routes.dart';
import '../../../../l10n/app_localizations.dart';
import '../../models/specialist_profile_models.dart';
import '../../providers/specialist_profile_provider.dart';
import '../../widgets/dashboard_layout.dart';
import '../../widgets/dashboard_profile_field.dart';
import '../../widgets/parent_dashboard_cards.dart';
import '../../widgets/shared_profile_card.dart';
import '../../widgets/specialist_navigation.dart';
import '../../widgets/specialist_page_scaffold.dart';
import 'specialist_scoped_localization_utils.dart';

class SpecialistProfileScreen extends ConsumerStatefulWidget {
  const SpecialistProfileScreen({super.key});

  @override
  ConsumerState<SpecialistProfileScreen> createState() =>
      _SpecialistProfileScreenState();
}

class _SpecialistProfileScreenState
    extends ConsumerState<SpecialistProfileScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(specialistProfileProvider.notifier).initialize();
    });
  }

  List<DashboardProfileFieldEntry> _profileFields(
    SpecialistProfileBundle bundle,
    AppLocalizations l10n,
  ) {
    final professional = bundle.professional;
    final fields = <DashboardProfileFieldEntry>[
      DashboardProfileFieldEntry(
        label: l10n.fieldFullName,
        value: bundle.fullName,
      ),
      DashboardProfileFieldEntry(label: l10n.fieldEmail, value: bundle.email),
      DashboardProfileFieldEntry(
        label: l10n.fieldRole,
        value: l10n.roleSpecialist,
      ),
    ];

    appendOptionalProfileField(fields, l10n.fieldPhone, bundle.phone);
    appendOptionalProfileField(
      fields,
      l10n.fieldSpecialization,
      bundle.specialization ?? professional?.specialization,
    );
    appendOptionalProfileField(
      fields,
      l10n.fieldLicenseNumber,
      professional?.licenseNumber,
    );

    final years = professional?.yearsOfExperience;
    if (years != null) {
      fields.add(
        DashboardProfileFieldEntry(
          label: l10n.fieldYearsOfExperience,
          value: '$years',
        ),
      );
    }

    appendOptionalProfileField(
      fields,
      l10n.fieldBio,
      professional?.bio,
      multiline: true,
    );

    return fields;
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(specialistProfileProvider);
    final bundle = state.bundle;
    final l10n = AppLocalizations.of(context)!;

    Widget body;
    if (state.isLoading) {
      body = Center(
        child: DashboardLoadingCard(message: l10n.parentProfileLoading),
      );
    } else if (state.errorMessage != null && bundle == null) {
      body = Padding(
        padding: context.dashPadding,
        child: DashboardErrorCard(
          message: mapSpecialistProfileError(l10n, state.errorMessage!),
          onRetry: () => ref.read(specialistProfileProvider.notifier).refresh(),
        ),
      );
    } else if (bundle == null) {
      body = Padding(
        padding: context.dashPadding,
        child: DashboardEmptyCard(message: l10n.parentProfileNotAvailable),
      );
    } else {
      body = RefreshIndicator(
        onRefresh: () => ref.read(specialistProfileProvider.notifier).refresh(),
        color: DashboardColors.brandCyan,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: context.dashPadding,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const LanguageSelector(
                presentation: LanguageSelectorPresentation.settingsTile,
              ),
              SharedProfileCard(
                initials: bundle.fullName,
                initialsFallback: 'SP',
                imageUrl: bundle.profileImageUrl,
                fields: _profileFields(bundle, l10n),
                presenceUserId: bundle.userId,
                editProfileLabel: l10n.parentProfileEditProfile,
                logoutLabel: l10n.commonLogout,
                onEditPressed: () =>
                    context.push(AppRoutes.specialistEditProfile),
                onLogout: () => SpecialistNavigation.logout(context, ref),
              ),
            ],
          ),
        ),
      );
    }

    return SpecialistPageScaffold(
      title: l10n.navProfile,
      showBackButton: true,
      body: body,
    );
  }
}
