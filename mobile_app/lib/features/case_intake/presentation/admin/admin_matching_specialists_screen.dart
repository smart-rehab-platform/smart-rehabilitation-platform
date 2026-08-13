import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/dashboard_colors.dart';
import '../../../../core/constants/api_constants.dart';
import '../../../../l10n/app_localizations.dart';
import '../../../dashboard/widgets/admin_navigation.dart';
import '../../../dashboard/widgets/admin_page_scaffold.dart';
import '../../../dashboard/widgets/admin_ui_components.dart';
import '../../../dashboard/widgets/dashboard_layout.dart';
import '../../models/matching_specialist_model.dart';
import '../../providers/admin_matching_specialists_provider.dart';
import '../admin_case_intake_localization_utils.dart';

class AdminMatchingSpecialistsScreen extends ConsumerStatefulWidget {
  const AdminMatchingSpecialistsScreen({super.key, required this.requestId});

  final String requestId;

  @override
  ConsumerState<AdminMatchingSpecialistsScreen> createState() =>
      _AdminMatchingSpecialistsScreenState();
}

class _AdminMatchingSpecialistsScreenState
    extends ConsumerState<AdminMatchingSpecialistsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref
          .read(adminMatchingSpecialistsProvider(widget.requestId).notifier)
          .initialize();
    });
  }

  Future<bool?> _showConfirmDialog(MatchingSpecialist specialist) {
    return showDialog<bool>(
      context: context,
      barrierDismissible: false,
      builder: (dialogContext) {
        final dialogL10n = AppLocalizations.of(dialogContext)!;
        return AlertDialog(
          title: Text(dialogL10n.adminAssignmentsAssignSpecialist),
          content: Text(dialogL10n.adminMatchingConfirmBody),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(dialogContext).pop(false),
              child: Text(dialogL10n.commonCancel),
            ),
            FilledButton(
              onPressed: () => Navigator.of(dialogContext).pop(true),
              child: Text(dialogL10n.adminAssignmentsAssignSpecialist),
            ),
          ],
        );
      },
    );
  }

  Future<void> _onContinuePressed(MatchingSpecialist specialist) async {
    final state = ref.read(adminMatchingSpecialistsProvider(widget.requestId));
    if (state.isAssigning) {
      return;
    }

    final confirmed = await _showConfirmDialog(specialist);
    if (confirmed != true || !mounted) {
      return;
    }

    final actionResult = await ref
        .read(adminMatchingSpecialistsProvider(widget.requestId).notifier)
        .assignSelectedSpecialist();
    if (!mounted) {
      return;
    }

    final l10n = AppLocalizations.of(context)!;
    final rawMessage =
        actionResult.result?.message ?? actionResult.errorMessage;
    final message = rawMessage != null
        ? mapAdminMatchingSpecialistsAssignError(l10n, rawMessage)
        : l10n.adminMatchingAssignedSuccess;

    if (actionResult.outcome == AssignSpecialistOutcome.success) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(message)));
      context.pop(true);
      return;
    }

    ScaffoldMessenger.of(
      context,
    ).showSnackBar(SnackBar(content: Text(message)));

    if (actionResult.outcome == AssignSpecialistOutcome.staleRequest) {
      context.pop(true);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final state = ref.watch(adminMatchingSpecialistsProvider(widget.requestId));
    final notifier = ref.read(
      adminMatchingSpecialistsProvider(widget.requestId).notifier,
    );
    final selected = state.selectedSpecialist;
    final assigning = state.isAssigning;

    return PopScope(
      canPop: !assigning,
      onPopInvokedWithResult: (didPop, result) {
        if (didPop || !assigning) {
          return;
        }
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(l10n.adminMatchingWaitForAssignment)),
        );
      },
      child: AdminPageScaffold(
        title: l10n.adminMatchingChooseSpecialist,
        showBackButton: true,
        currentNav: AdminNavigation.listScreenNav(context),
        onBackPressed: assigning
            ? () {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text(l10n.adminMatchingWaitForAssignment)),
                );
              }
            : null,
        body: state.isLoading
            ? AdminLoadingCard(message: l10n.adminMatchingLoadingSpecialists)
            : state.errorMessage != null && state.specialists.isEmpty
            ? ListView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: context.dashPadding,
                children: [
                  AdminErrorCard(
                    message: mapAdminMatchingSpecialistsError(
                      l10n,
                      state.errorMessage!,
                    ),
                    onRetry: notifier.retry,
                  ),
                  SizedBox(height: context.dashSpacing),
                  OutlinedButton(
                    onPressed: () => context.pop(),
                    child: Text(l10n.commonBack),
                  ),
                ],
              )
            : state.specialists.isEmpty
            ? ListView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: context.dashPadding,
                children: [
                  AdminSurfaceCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          l10n.adminMatchingNoSpecialists,
                          style: Theme.of(context).textTheme.titleSmall
                              ?.copyWith(fontWeight: FontWeight.w800),
                        ),
                        SizedBox(height: context.dashSpacing * 0.4),
                        Text(
                          l10n.adminCaseAssignmentNoActiveSpecialists,
                          style: Theme.of(context).textTheme.bodyMedium
                              ?.copyWith(color: DashboardColors.textSecondary),
                        ),
                        SizedBox(height: context.dashSpacing),
                        SizedBox(
                          width: double.infinity,
                          child: OutlinedButton(
                            onPressed: assigning ? null : () => context.pop(),
                            child: Text(l10n.commonBack),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              )
            : Column(
                children: [
                  Expanded(
                    child: ListView(
                      padding: context.dashPadding,
                      children: [
                        Text(
                          l10n.adminMatchingSelectSpecialist,
                          style: Theme.of(context).textTheme.bodyMedium
                              ?.copyWith(color: DashboardColors.textSecondary),
                        ),
                        SizedBox(height: context.dashSpacing),
                        ...state.specialists.map((specialist) {
                          final isSelected =
                              specialist.id == state.selectedSpecialistId;
                          return Padding(
                            padding: EdgeInsets.only(
                              bottom: context.dashSpacing * 0.75,
                            ),
                            child: _MatchingSpecialistCard(
                              specialist: specialist,
                              isSelected: isSelected,
                              onTap: assigning
                                  ? null
                                  : () => notifier.select(specialist.id),
                            ),
                          );
                        }),
                        if (selected != null) ...[
                          SizedBox(height: context.dashSpacing * 0.35),
                          Text(
                            l10n.adminCaseAssignmentNotifySpecialist,
                            style: Theme.of(context).textTheme.bodySmall
                                ?.copyWith(color: DashboardColors.textMuted),
                          ),
                          SizedBox(height: context.dashSpacing * 4),
                        ],
                      ],
                    ),
                  ),
                  if (selected != null)
                    SafeArea(
                      top: false,
                      child: Padding(
                        padding: EdgeInsets.fromLTRB(
                          context.dashPadding.left,
                          8,
                          context.dashPadding.right,
                          12,
                        ),
                        child: SizedBox(
                          width: double.infinity,
                          child: FilledButton(
                            onPressed: assigning
                                ? null
                                : () => _onContinuePressed(selected),
                            child: assigning
                                ? Row(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      const SizedBox(
                                        width: 18,
                                        height: 18,
                                        child: CircularProgressIndicator(
                                          strokeWidth: 2,
                                          color: Colors.white,
                                        ),
                                      ),
                                      const SizedBox(width: 10),
                                      Text(l10n.adminMatchingAssigning),
                                    ],
                                  )
                                : Text(l10n.commonContinue),
                          ),
                        ),
                      ),
                    ),
                ],
              ),
      ),
    );
  }
}

class _MatchingSpecialistCard extends StatelessWidget {
  const _MatchingSpecialistCard({
    required this.specialist,
    required this.isSelected,
    this.onTap,
  });

  final MatchingSpecialist specialist;
  final bool isSelected;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final theme = Theme.of(context);
    final imageUrl = ApiConstants.resolveProfileImageUrl(
      specialist.profileImageUrl,
    );
    final borderColor = isSelected
        ? DashboardColors.brandCyan
        : DashboardColors.border;
    final background = isSelected
        ? DashboardColors.blueSoft
        : DashboardColors.surface;

    final years = specialist.yearsOfExperience;
    final license = specialist.licenseNumber?.trim();
    final bio = specialist.bio?.trim();

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: DashboardDecorations.cardRadius,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 180),
          curve: Curves.easeOut,
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: background,
            borderRadius: DashboardDecorations.cardRadius,
            border: Border.all(color: borderColor, width: isSelected ? 2 : 1),
            boxShadow: DashboardDecorations.cardShadow(
              isSelected ? DashboardColors.brandCyan : DashboardColors.border,
            ),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  CircleAvatar(
                    radius: 28,
                    backgroundColor: DashboardColors.purpleSoft,
                    backgroundImage: imageUrl != null
                        ? CachedNetworkImageProvider(imageUrl)
                        : null,
                    child: imageUrl == null
                        ? const Icon(
                            Icons.badge_outlined,
                            color: DashboardColors.brandCyan,
                          )
                        : null,
                  ),
                  SizedBox(width: context.dashSpacing * 0.65),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          specialist.fullName?.trim().isNotEmpty == true
                              ? specialist.fullName!.trim()
                              : l10n.roleSpecialist,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: theme.textTheme.titleSmall?.copyWith(
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                        if (specialist.specialization?.trim().isNotEmpty ==
                            true) ...[
                          SizedBox(height: context.dashSpacing * 0.2),
                          Text(
                            specialist.specialization!.trim(),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                            style: theme.textTheme.bodyMedium?.copyWith(
                              color: DashboardColors.textSecondary,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                  if (isSelected)
                    const Icon(
                      Icons.check_circle_rounded,
                      color: DashboardColors.brandCyan,
                    ),
                ],
              ),
              SizedBox(height: context.dashSpacing * 0.75),
              Row(
                children: [
                  Expanded(
                    child: _MetricChip(
                      text: formatAdminMatchingSpecialistYears(l10n, years),
                    ),
                  ),
                  SizedBox(width: context.dashSpacing * 0.35),
                  Expanded(
                    child: _MetricChip(
                      text: formatAdminMatchingSpecialistActivePatients(
                        l10n,
                        specialist.activeCasesCount,
                      ),
                    ),
                  ),
                  SizedBox(width: context.dashSpacing * 0.35),
                  Expanded(
                    child: _MetricChip(
                      text: formatAdminMatchingSpecialistCurrentRequests(
                        l10n,
                        specialist.currentCaseRequestsCount,
                      ),
                    ),
                  ),
                ],
              ),
              if (license != null && license.isNotEmpty) ...[
                SizedBox(height: context.dashSpacing * 0.55),
                Text(
                  l10n.adminMatchingSpecialistsLicense(license),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: theme.textTheme.labelMedium?.copyWith(
                    color: DashboardColors.textMuted,
                  ),
                ),
              ],
              if (bio != null && bio.isNotEmpty) ...[
                SizedBox(height: context.dashSpacing * 0.35),
                Text(
                  bio,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: DashboardColors.textSecondary,
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

class _MetricChip extends StatelessWidget {
  const _MetricChip({required this.text});

  final String text;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 10),
      decoration: BoxDecoration(
        color: DashboardColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: DashboardColors.border),
      ),
      child: Text(
        text,
        maxLines: 3,
        overflow: TextOverflow.ellipsis,
        textAlign: TextAlign.center,
        style: theme.textTheme.labelLarge?.copyWith(
          fontWeight: FontWeight.w800,
          color: DashboardColors.brandCyan,
          height: 1.2,
        ),
      ),
    );
  }
}
