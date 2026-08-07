import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../../../core/constants/dashboard_colors.dart';
import '../../../../core/routes/app_routes.dart';
import '../../../../l10n/app_localizations.dart';
import '../../../dashboard/widgets/dashboard_components.dart';
import '../../../dashboard/widgets/dashboard_layout.dart';
import '../../../dashboard/widgets/dashboard_surface_card.dart';
import '../../../dashboard/widgets/parent_dashboard_cards.dart';
import '../../../dashboard/widgets/parent_page_scaffold.dart';
import '../../models/complaint_models.dart';
import '../../providers/parent_complaints_provider.dart';
import '../complaint_localization_utils.dart';
import '../widgets/complaint_status_chip.dart';

class ParentComplaintsScreen extends ConsumerStatefulWidget {
  const ParentComplaintsScreen({super.key});

  @override
  ConsumerState<ParentComplaintsScreen> createState() =>
      _ParentComplaintsScreenState();
}

class _ParentComplaintsScreenState extends ConsumerState<ParentComplaintsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(parentComplaintsProvider.notifier).loadComplaints();
    });
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final state = ref.watch(parentComplaintsProvider);
    final theme = Theme.of(context);

    Widget body;
    if (state.isLoading && state.complaints.isEmpty) {
      body = const Center(child: DashboardLoadingCard());
    } else {
      body = RefreshIndicator(
        color: DashboardColors.brandCyan,
        onRefresh: () =>
            ref.read(parentComplaintsProvider.notifier).loadComplaints(),
        child: ListView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: context.dashPadding,
          children: [
            if (state.errorMessage != null) ...[
              DashboardErrorCard(
                message: state.errorMessage!,
                onRetry: () =>
                    ref.read(parentComplaintsProvider.notifier).loadComplaints(),
              ),
              SizedBox(height: context.dashSpacing * 0.75),
            ],
            SizedBox(
              width: double.infinity,
              child: BrandGradientButton(
                onPressed: () => context.push(AppRoutes.parentComplaintNew),
                icon: Icons.report_outlined,
                label: l10n.complaintMoreReportSpecialist,
              ),
            ),
            SizedBox(height: context.dashSpacing),
            if (state.complaints.isEmpty)
              _EmptyComplaintsCard(l10n: l10n)
            else
              ...state.complaints.map(
                (complaint) => Padding(
                  padding: EdgeInsets.only(bottom: context.dashSpacing * 0.55),
                  child: _ComplaintListCard(
                    complaint: complaint,
                    onTap: () => context.push(
                      AppRoutes.parentComplaintDetail(complaint.id),
                    ),
                  ),
                ),
              ),
          ],
        ),
      );
    }

    return ParentPageScaffold(
      title: l10n.complaintHistoryTitle,
      showBackButton: true,
      body: body,
    );
  }
}

class _ComplaintListCard extends StatelessWidget {
  const _ComplaintListCard({required this.complaint, required this.onTap});

  final ComplaintItem complaint;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final theme = Theme.of(context);
    final dateLabel = complaint.createdAt == null
        ? l10n.complaintDateUnavailable
        : DateFormat.yMMMd().format(complaint.createdAt!);

    return DashboardSurfaceCard(
      onTap: onTap,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  localizedComplaintCategoryLabel(l10n, complaint.category),
                  style: theme.textTheme.titleSmall?.copyWith(
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
              ComplaintStatusChip(status: complaint.status),
            ],
          ),
          SizedBox(height: context.dashSpacing * 0.35),
          Text(
            l10n.complaintHistoryChildSpecialist(
              complaint.patient.fullName,
              complaint.specialist.fullName,
            ),
            style: theme.textTheme.bodyMedium,
          ),
          SizedBox(height: context.dashSpacing * 0.25),
          Text(
            dateLabel,
            style: theme.textTheme.bodySmall?.copyWith(
              color: DashboardColors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }
}

class _EmptyComplaintsCard extends StatelessWidget {
  const _EmptyComplaintsCard({required this.l10n});

  final AppLocalizations l10n;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      width: double.infinity,
      padding: EdgeInsets.all(context.dashSpacing * 1.1),
      decoration: BoxDecoration(
        color: DashboardColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: DashboardColors.border),
      ),
      child: Column(
        children: [
          Text(
            l10n.complaintHistoryEmptyTitle,
            textAlign: TextAlign.center,
            style: theme.textTheme.titleSmall?.copyWith(
              fontWeight: FontWeight.w700,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.35),
          Text(
            l10n.complaintHistoryEmptyMessage,
            textAlign: TextAlign.center,
            style: theme.textTheme.bodyMedium?.copyWith(
              color: DashboardColors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }
}
