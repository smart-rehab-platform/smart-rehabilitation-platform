import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../../../core/constants/dashboard_colors.dart';
import '../../../../core/routes/app_routes.dart';
import '../../../../l10n/app_localizations.dart';
import '../../../dashboard/widgets/dashboard_components.dart';
import '../../../dashboard/widgets/parent_dashboard_cards.dart';
import '../../../dashboard/widgets/dashboard_layout.dart';
import '../../../dashboard/widgets/dashboard_surface_card.dart';
import '../../../dashboard/widgets/specialist_page_scaffold.dart';
import '../../models/support_request_models.dart';
import '../../providers/specialist_support_requests_provider.dart';
import '../support_request_localization_utils.dart';
import '../widgets/support_request_status_chip.dart';

class SpecialistSupportRequestsScreen extends ConsumerStatefulWidget {
  const SpecialistSupportRequestsScreen({super.key});

  @override
  ConsumerState<SpecialistSupportRequestsScreen> createState() =>
      _SpecialistSupportRequestsScreenState();
}

class _SpecialistSupportRequestsScreenState
    extends ConsumerState<SpecialistSupportRequestsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(specialistSupportRequestsProvider.notifier).loadRequests();
    });
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final state = ref.watch(specialistSupportRequestsProvider);
    final notifier = ref.read(specialistSupportRequestsProvider.notifier);
    final theme = Theme.of(context);

    Widget body;
    if (state.isLoading && state.items.isEmpty) {
      body = Center(
        child: DashboardLoadingCard(message: l10n.supportRequestLoading),
      );
    } else {
      body = RefreshIndicator(
        color: DashboardColors.brandCyan,
        onRefresh: notifier.refresh,
        child: ListView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: context.dashPadding,
          children: [
            if (state.errorMessage != null) ...[
              DashboardErrorCard(
                message: mapSupportRequestError(l10n, state.errorMessage!),
                onRetry: notifier.loadRequests,
              ),
              SizedBox(height: context.dashSpacing * 0.75),
            ],
            SizedBox(
              width: double.infinity,
              child: BrandGradientButton(
                onPressed: () => context.push(AppRoutes.specialistSupportRequestNew),
                icon: Icons.add_comment_outlined,
                label: l10n.supportRequestNewRequest,
              ),
            ),
            SizedBox(height: context.dashSpacing * 0.75),
            _FilterRow(state: state, notifier: notifier),
            SizedBox(height: context.dashSpacing * 0.75),
            if (state.items.isEmpty)
              DashboardSurfaceCard(
                child: Text(
                  state.hasActiveFilters
                      ? l10n.supportRequestNoMatch
                      : l10n.supportRequestEmpty,
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: DashboardColors.textSecondary,
                  ),
                ),
              )
            else
              ...state.items.map(
                (item) => Padding(
                  padding: EdgeInsets.only(bottom: context.dashSpacing * 0.55),
                  child: _SupportRequestListCard(
                    item: item,
                    onTap: () => context.push(
                      AppRoutes.specialistSupportRequestDetail(item.id),
                    ),
                  ),
                ),
              ),
          ],
        ),
      );
    }

    return SpecialistPageScaffold(
      title: l10n.supportRequestTitle,
      showBackButton: true,
      body: body,
    );
  }
}

class _FilterRow extends StatelessWidget {
  const _FilterRow({required this.state, required this.notifier});

  final SpecialistSupportRequestsState state;
  final SpecialistSupportRequestsNotifier notifier;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: [
        if (state.hasActiveFilters)
          ActionChip(
            label: Text(l10n.adminClearFilters),
            onPressed: notifier.clearFilters,
          ),
        FilterChip(
          label: Text(
            state.selectedStatus == null
                ? l10n.supportRequestAllStatuses
                : localizedSupportRequestStatusLabel(l10n, state.selectedStatus!),
          ),
          selected: state.selectedStatus != null,
          onSelected: (_) => _pickStatus(context),
        ),
        FilterChip(
          label: Text(
            state.selectedCategory == null
                ? l10n.supportRequestAllCategories
                : localizedSupportRequestCategoryLabel(
                    l10n,
                    state.selectedCategory!,
                  ),
          ),
          selected: state.selectedCategory != null,
          onSelected: (_) => _pickCategory(context),
        ),
      ],
    );
  }

  Future<void> _pickStatus(BuildContext context) async {
    final l10n = AppLocalizations.of(context)!;
    final picked = await showModalBottomSheet<SupportRequestStatus?>(
      context: context,
      builder: (context) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              title: Text(l10n.supportRequestAllStatuses),
              onTap: () => Navigator.pop(context, null),
            ),
            ...SupportRequestStatus.values.map(
              (status) => ListTile(
                title: Text(localizedSupportRequestStatusLabel(l10n, status)),
                onTap: () => Navigator.pop(context, status),
              ),
            ),
          ],
        ),
      ),
    );
    if (!context.mounted) return;
    notifier.setStatusFilter(picked);
  }

  Future<void> _pickCategory(BuildContext context) async {
    final l10n = AppLocalizations.of(context)!;
    final picked = await showModalBottomSheet<SupportRequestCategory?>(
      context: context,
      builder: (context) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              title: Text(l10n.supportRequestAllCategories),
              onTap: () => Navigator.pop(context, null),
            ),
            ...SupportRequestCategory.values.map(
              (category) => ListTile(
                title: Text(localizedSupportRequestCategoryLabel(l10n, category)),
                onTap: () => Navigator.pop(context, category),
              ),
            ),
          ],
        ),
      ),
    );
    if (!context.mounted) return;
    notifier.setCategoryFilter(picked);
  }
}

class _SupportRequestListCard extends StatelessWidget {
  const _SupportRequestListCard({required this.item, required this.onTap});

  final SupportRequestItem item;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final theme = Theme.of(context);
    final createdLabel = item.createdAt == null
        ? l10n.supportRequestDateUnavailable
        : DateFormat.yMMMd().format(item.createdAt!);
    final activityLabel = item.lastMessageAt == null
        ? l10n.supportRequestDateUnavailable
        : DateFormat.yMMMd().add_jm().format(item.lastMessageAt!);

    return DashboardSurfaceCard(
      onTap: onTap,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  item.subject,
                  style: theme.textTheme.titleSmall?.copyWith(
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
              SupportRequestStatusChip(status: item.status),
            ],
          ),
          SizedBox(height: context.dashSpacing * 0.35),
          Text(
            localizedSupportRequestCategoryLabel(l10n, item.category),
            style: theme.textTheme.bodySmall?.copyWith(
              color: DashboardColors.textSecondary,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.25),
          Text(
            l10n.supportRequestLastActivity(activityLabel),
            style: theme.textTheme.labelSmall?.copyWith(
              color: DashboardColors.textMuted,
            ),
          ),
          Text(
            l10n.supportRequestCreatedDate(createdLabel),
            style: theme.textTheme.labelSmall?.copyWith(
              color: DashboardColors.textMuted,
            ),
          ),
        ],
      ),
    );
  }
}
