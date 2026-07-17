import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/admin_dashboard_colors.dart';
import '../../../../core/constants/api_constants.dart';
import '../../../dashboard/widgets/admin_page_scaffold.dart';
import '../../../dashboard/widgets/admin_ui_components.dart';
import '../../../dashboard/widgets/dashboard_bottom_nav.dart';
import '../../../dashboard/widgets/dashboard_layout.dart';
import '../../models/matching_specialist_model.dart';
import '../../providers/admin_matching_specialists_provider.dart';

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
    final theme = Theme.of(context);
    return showDialog<bool>(
      context: context,
      barrierDismissible: false,
      builder: (dialogContext) {
        return AlertDialog(
          title: const Text('Assign Specialist'),
          content: Text.rich(
            TextSpan(
              style: theme.textTheme.bodyMedium?.copyWith(
                color: AdminDashboardColors.textSecondary,
              ),
              children: [
                const TextSpan(text: 'Are you sure you want to assign\n'),
                TextSpan(
                  text: specialist.displayName,
                  style: theme.textTheme.bodyMedium?.copyWith(
                    fontWeight: FontWeight.w800,
                    color: AdminDashboardColors.textPrimary,
                  ),
                ),
                const TextSpan(text: '\nto this case?'),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(dialogContext).pop(false),
              child: const Text('Cancel'),
            ),
            FilledButton(
              onPressed: () => Navigator.of(dialogContext).pop(true),
              child: const Text('Assign'),
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

    final message =
        actionResult.result?.message ??
        actionResult.errorMessage ??
        'Specialist assigned successfully';

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
          const SnackBar(
            content: Text(
              'Please wait while the specialist is being assigned.',
            ),
          ),
        );
      },
      child: AdminPageScaffold(
        title: 'Choose Specialist',
        showBackButton: true,
        currentNav: DashboardNavItem.more,
        onBackPressed: assigning
            ? () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text(
                      'Please wait while the specialist is being assigned.',
                    ),
                  ),
                );
              }
            : null,
        body: state.isLoading
            ? const AdminLoadingCard(message: 'Loading matching specialists...')
            : state.errorMessage != null && state.specialists.isEmpty
            ? ListView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: context.dashPadding,
                children: [
                  AdminErrorCard(
                    message: state.errorMessage!,
                    onRetry: notifier.retry,
                  ),
                  SizedBox(height: context.dashSpacing),
                  OutlinedButton(
                    onPressed: () => context.pop(),
                    child: const Text('Back'),
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
                          'No matching specialists available.',
                          style: Theme.of(context).textTheme.titleSmall
                              ?.copyWith(fontWeight: FontWeight.w800),
                        ),
                        SizedBox(height: context.dashSpacing * 0.4),
                        Text(
                          'There are currently no active specialists linked to this category.',
                          style: Theme.of(context).textTheme.bodyMedium
                              ?.copyWith(
                                color: AdminDashboardColors.textSecondary,
                              ),
                        ),
                        SizedBox(height: context.dashSpacing),
                        SizedBox(
                          width: double.infinity,
                          child: OutlinedButton(
                            onPressed: assigning ? null : () => context.pop(),
                            child: const Text('Back'),
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
                          'Select the most suitable specialist for this case.',
                          style: Theme.of(context).textTheme.bodyMedium
                              ?.copyWith(
                                color: AdminDashboardColors.textSecondary,
                              ),
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
                            'The selected specialist will be notified after assignment.',
                            style: Theme.of(context).textTheme.bodySmall
                                ?.copyWith(
                                  color: AdminDashboardColors.textMuted,
                                ),
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
                                ? const Row(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      SizedBox(
                                        width: 18,
                                        height: 18,
                                        child: CircularProgressIndicator(
                                          strokeWidth: 2,
                                          color: Colors.white,
                                        ),
                                      ),
                                      SizedBox(width: 10),
                                      Text('Assigning...'),
                                    ],
                                  )
                                : const Text('Continue'),
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
    final theme = Theme.of(context);
    final imageUrl = ApiConstants.resolveProfileImageUrl(
      specialist.profileImageUrl,
    );
    final borderColor = isSelected
        ? AdminDashboardColors.primary
        : AdminDashboardColors.border;
    final background = isSelected
        ? AdminDashboardColors.blueSoft
        : AdminDashboardColors.surface;

    final years = specialist.yearsOfExperience;
    final license = specialist.licenseNumber?.trim();
    final bio = specialist.bio?.trim();

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: AdminDecorations.cardRadius,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 180),
          curve: Curves.easeOut,
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: background,
            borderRadius: AdminDecorations.cardRadius,
            border: Border.all(color: borderColor, width: isSelected ? 2 : 1),
            boxShadow: AdminDecorations.cardShadow(
              isSelected
                  ? AdminDashboardColors.primary
                  : AdminDashboardColors.border,
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
                    backgroundColor: AdminDashboardColors.slateSoft,
                    backgroundImage: imageUrl != null
                        ? CachedNetworkImageProvider(imageUrl)
                        : null,
                    child: imageUrl == null
                        ? const Icon(
                            Icons.badge_outlined,
                            color: AdminDashboardColors.primary,
                          )
                        : null,
                  ),
                  SizedBox(width: context.dashSpacing * 0.65),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          specialist.displayName,
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
                              color: AdminDashboardColors.textSecondary,
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
                      color: AdminDashboardColors.primary,
                    ),
                ],
              ),
              SizedBox(height: context.dashSpacing * 0.75),
              Row(
                children: [
                  Expanded(
                    child: _MetricChip(
                      text: years == null
                          ? '— Years'
                          : years == 1
                          ? '1 Year'
                          : '$years Years',
                    ),
                  ),
                  SizedBox(width: context.dashSpacing * 0.35),
                  Expanded(
                    child: _MetricChip(
                      text: specialist.activeCasesCount == 1
                          ? '1 Active Patient'
                          : '${specialist.activeCasesCount} Active Patients',
                    ),
                  ),
                  SizedBox(width: context.dashSpacing * 0.35),
                  Expanded(
                    child: _MetricChip(
                      text: specialist.currentCaseRequestsCount == 1
                          ? '1 Current Request'
                          : '${specialist.currentCaseRequestsCount} Current Requests',
                    ),
                  ),
                ],
              ),
              if (license != null && license.isNotEmpty) ...[
                SizedBox(height: context.dashSpacing * 0.55),
                Text(
                  'License: $license',
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: theme.textTheme.labelMedium?.copyWith(
                    color: AdminDashboardColors.textMuted,
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
                    color: AdminDashboardColors.textSecondary,
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
        color: AdminDashboardColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AdminDashboardColors.border),
      ),
      child: Text(
        text,
        maxLines: 3,
        overflow: TextOverflow.ellipsis,
        textAlign: TextAlign.center,
        style: theme.textTheme.labelLarge?.copyWith(
          fontWeight: FontWeight.w800,
          color: AdminDashboardColors.primary,
          height: 1.2,
        ),
      ),
    );
  }
}
