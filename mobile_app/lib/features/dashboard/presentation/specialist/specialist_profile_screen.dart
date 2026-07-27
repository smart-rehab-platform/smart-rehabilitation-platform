import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/dashboard_colors.dart';
import '../../../../core/routes/app_routes.dart';
import '../../models/specialist_profile_models.dart';
import '../../providers/specialist_profile_provider.dart';
import '../../widgets/dashboard_layout.dart';
import '../../widgets/dashboard_profile_field.dart';
import '../../widgets/parent_dashboard_cards.dart';
import '../../widgets/shared_profile_card.dart';
import '../../widgets/specialist_navigation.dart';
import '../../widgets/specialist_page_scaffold.dart';

class SpecialistProfileScreen extends ConsumerStatefulWidget {
  const SpecialistProfileScreen({super.key});

  @override
  ConsumerState<SpecialistProfileScreen> createState() =>
      _SpecialistProfileScreenState();
}

class _SpecialistProfileScreenState extends ConsumerState<SpecialistProfileScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(specialistProfileProvider.notifier).initialize();
    });
  }

  List<DashboardProfileFieldEntry> _profileFields(SpecialistProfileBundle bundle) {
    final professional = bundle.professional;
    final fields = buildRequiredProfileFields(
      fullName: bundle.fullName,
      email: bundle.email,
      role: 'specialist',
    );

    appendOptionalProfileField(fields, 'Phone', bundle.phone);
    appendOptionalProfileField(
      fields,
      'Specialization',
      bundle.specialization ?? professional?.specialization,
    );
    appendOptionalProfileField(
      fields,
      'License Number',
      professional?.licenseNumber,
    );

    final years = professional?.yearsOfExperience;
    if (years != null) {
      fields.add(
        DashboardProfileFieldEntry(
          label: 'Years of Experience',
          value: '$years',
        ),
      );
    }

    appendOptionalProfileField(
      fields,
      'Bio',
      professional?.bio,
      multiline: true,
    );

    return fields;
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(specialistProfileProvider);
    final bundle = state.bundle;

    Widget body;
    if (state.isLoading) {
      body = const Center(child: DashboardLoadingCard());
    } else if (state.errorMessage != null && bundle == null) {
      body = Padding(
        padding: context.dashPadding,
        child: DashboardErrorCard(
          message: state.errorMessage!,
          onRetry: () => ref.read(specialistProfileProvider.notifier).refresh(),
        ),
      );
    } else if (bundle == null) {
      body = Padding(
        padding: context.dashPadding,
        child: const DashboardEmptyCard(message: 'Profile not available.'),
      );
    } else {
      body = RefreshIndicator(
        onRefresh: () => ref.read(specialistProfileProvider.notifier).refresh(),
        color: DashboardColors.brandCyan,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: context.dashPadding,
          child: SharedProfileCard(
            initials: bundle.fullName,
            initialsFallback: 'SP',
            imageUrl: bundle.profileImageUrl,
            fields: _profileFields(bundle),
            presenceUserId: bundle.userId,
            onEditPressed: () => context.push(AppRoutes.specialistEditProfile),
            onLogout: () => SpecialistNavigation.logout(context, ref),
          ),
        ),
      );
    }

    return SpecialistPageScaffold(
      title: 'Profile',
      showBackButton: true,
      body: body,
    );
  }
}
