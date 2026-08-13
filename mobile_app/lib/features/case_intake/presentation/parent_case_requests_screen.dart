import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/constants/dashboard_colors.dart';
import '../../../core/routes/app_routes.dart';
import '../../../l10n/app_localizations.dart';
import '../../dashboard/widgets/dashboard_layout.dart';
import '../../dashboard/widgets/dashboard_components.dart';
import '../../dashboard/widgets/parent_dashboard_cards.dart';
import '../../dashboard/widgets/parent_page_scaffold.dart';
import '../presentation/parent_case_intake_localization_utils.dart';
import '../providers/parent_case_intake_provider.dart';
import '../widgets/case_request_card.dart';

class ParentCaseRequestsScreen extends ConsumerStatefulWidget {
  const ParentCaseRequestsScreen({super.key});

  @override
  ConsumerState<ParentCaseRequestsScreen> createState() =>
      _ParentCaseRequestsScreenState();
}

class _ParentCaseRequestsScreenState
    extends ConsumerState<ParentCaseRequestsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(parentCaseIntakeProvider.notifier).loadRequests();
    });
  }

  void _openNewRequest() {
    context.push(AppRoutes.parentCaseRequestNew);
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final state = ref.watch(parentCaseIntakeProvider);
    final theme = Theme.of(context);

    Widget body;
    if (state.isLoading && state.requests.isEmpty) {
      body = const Center(child: DashboardLoadingCard());
    } else {
      body = RefreshIndicator(
        onRefresh: () =>
            ref.read(parentCaseIntakeProvider.notifier).refreshRequests(),
        color: DashboardColors.brandCyan,
        child: ListView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: context.dashPadding,
          children: [
            if (state.errorMessage != null) ...[
              DashboardErrorCard(
                message: mapParentCaseIntakeProviderError(
                  l10n,
                  state.errorMessage!,
                ),
                onRetry: () =>
                    ref.read(parentCaseIntakeProvider.notifier).loadRequests(),
              ),
              SizedBox(height: context.dashSpacing * 0.75),
            ],
            Text(
              l10n.parentCaseRequestsListDisclaimer,
              style: theme.textTheme.bodyMedium?.copyWith(
                color: DashboardColors.textSecondary,
              ),
            ),
            SizedBox(height: context.dashSpacing * 0.75),
            SizedBox(
              width: double.infinity,
              child: BrandGradientButton(
                onPressed: _openNewRequest,
                icon: Icons.add_rounded,
                label: l10n.parentDashboardCaseIntakeSubmitNew,
              ),
            ),
            SizedBox(height: context.dashSpacing),
            if (state.isRefreshing)
              const Padding(
                padding: EdgeInsets.only(bottom: 12),
                child: LinearProgressIndicator(),
              ),
            if (state.requests.isEmpty)
              _EmptyCaseRequestsCard(onSubmit: _openNewRequest, l10n: l10n)
            else
              ...state.requests.map(
                (request) => Padding(
                  padding: EdgeInsets.only(bottom: context.dashSpacing * 0.55),
                  child: CaseRequestCard(
                    request: request,
                    onTap: () => context.push(
                      AppRoutes.parentCaseRequestDetail(request.id),
                    ),
                  ),
                ),
              ),
          ],
        ),
      );
    }

    return ParentPageScaffold(
      title: l10n.navCaseRequests,
      showBackButton: true,
      body: body,
    );
  }
}

class _EmptyCaseRequestsCard extends StatelessWidget {
  const _EmptyCaseRequestsCard({required this.onSubmit, required this.l10n});

  final VoidCallback onSubmit;
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
            l10n.parentCaseRequestsEmptyTitle,
            textAlign: TextAlign.center,
            style: theme.textTheme.titleSmall?.copyWith(
              fontWeight: FontWeight.w700,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.35),
          Text(
            l10n.parentCaseRequestsEmptyMessage,
            textAlign: TextAlign.center,
            style: theme.textTheme.bodyMedium?.copyWith(
              color: DashboardColors.textSecondary,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.75),
          OutlinedButton(
            onPressed: onSubmit,
            style: brandOutlinedButtonStyle(),
            child: Text(l10n.parentDashboardCaseIntakeSubmitNew),
          ),
        ],
      ),
    );
  }
}
