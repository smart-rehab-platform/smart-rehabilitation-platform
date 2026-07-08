import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/dashboard_colors.dart';
import '../../../../core/routes/app_routes.dart';
import '../../providers/specialist_profile_provider.dart';
import '../../widgets/dashboard_components.dart';
import '../../widgets/dashboard_layout.dart';
import '../../widgets/parent_dashboard_cards.dart';
import '../../widgets/specialist_navigation.dart';
import '../../widgets/specialist_page_scaffold.dart';
import 'specialist_profile_widgets.dart';

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

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(specialistProfileProvider);
    final bundle = state.bundle;
    final theme = Theme.of(context);

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
        color: DashboardColors.primary,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: context.dashPadding,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              SpecialistProfileHeaderCard(
                fullName: bundle.fullName,
                email: bundle.email,
                specialization: bundle.specialization,
                profileImageUrl: bundle.profileImageUrl,
              ),
              SizedBox(height: context.dashSpacing),
              Text(
                'Professional Information',
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w700,
                  color: DashboardColors.textPrimary,
                ),
              ),
              SizedBox(height: context.dashSpacing * 0.5),
              SpecialistProfessionalInfoCard(
                professional: bundle.professional,
                phone: bundle.phone,
              ),
              SizedBox(height: context.dashSpacing * 1.1),
              Text(
                'Statistics',
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w700,
                  color: DashboardColors.textPrimary,
                ),
              ),
              SizedBox(height: context.dashSpacing * 0.5),
              DashboardSummaryGrid(
                cards: [
                  DashboardSummaryCard(
                    label: 'Active Patients',
                    value: '${bundle.stats.activePatients}',
                    icon: Icons.people_outline_rounded,
                    iconBackground: DashboardColors.blueSoft,
                    iconColor: const Color(0xFF3B82F6),
                    onTap: () => context.push(AppRoutes.specialistPatients),
                  ),
                  DashboardSummaryCard(
                    label: 'Treatment Plans',
                    value: '${bundle.stats.treatmentPlans}',
                    icon: Icons.assignment_outlined,
                    iconBackground: DashboardColors.amberSoft,
                    iconColor: DashboardColors.warning,
                    onTap: () => context.push(AppRoutes.specialistTreatmentPlans),
                  ),
                  DashboardSummaryCard(
                    label: 'Pending Reviews',
                    value: '${bundle.stats.pendingReviews}',
                    icon: Icons.rate_review_outlined,
                    iconBackground: DashboardColors.purpleSoft,
                    iconColor: DashboardColors.primary,
                    onTap: () => context.push(AppRoutes.specialistPendingReviews),
                  ),
                  DashboardSummaryCard(
                    label: 'Reports',
                    value: '${bundle.stats.reports}',
                    icon: Icons.description_outlined,
                    iconBackground: DashboardColors.tealSoft,
                    iconColor: DashboardColors.accent,
                    onTap: () => context.push(AppRoutes.specialistReports),
                  ),
                ],
              ),
              SizedBox(height: context.dashSpacing * 1.1),
              Text(
                'Actions',
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w700,
                  color: DashboardColors.textPrimary,
                ),
              ),
              SizedBox(height: context.dashSpacing * 0.5),
              OutlinedButton.icon(
                onPressed: () => context.push(AppRoutes.specialistEditProfile),
                icon: const Icon(Icons.edit_outlined),
                label: const Text('Edit Profile'),
                style: OutlinedButton.styleFrom(
                  foregroundColor: DashboardColors.primary,
                  side: const BorderSide(color: DashboardColors.primary),
                  padding: EdgeInsets.symmetric(
                    vertical: context.dashSpacing * 0.65,
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                ),
              ),
              SizedBox(height: context.dashSpacing * 0.5),
              ElevatedButton.icon(
                onPressed: () => SpecialistNavigation.logout(context, ref),
                icon: const Icon(Icons.logout_rounded),
                label: const Text('Logout'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: DashboardColors.primary,
                  foregroundColor: Colors.white,
                  padding: EdgeInsets.symmetric(
                    vertical: context.dashSpacing * 0.65,
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                ),
              ),
              SizedBox(height: context.dashSpacing),
            ],
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
