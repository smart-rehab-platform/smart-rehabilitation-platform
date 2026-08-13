import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../../../core/constants/dashboard_colors.dart';
import '../../../../l10n/app_localizations.dart';
import '../../models/session_requests_models.dart';
import '../../providers/session_requests_provider.dart';
import '../../widgets/dashboard_layout.dart';
import '../../widgets/parent_dashboard_cards.dart';
import 'parent_sessions_localization_utils.dart';

class ParentSessionRequestsSection extends ConsumerWidget {
  const ParentSessionRequestsSection({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = AppLocalizations.of(context)!;
    final state = ref.watch(sessionRequestsProvider);
    final theme = Theme.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Row(
          children: [
            Expanded(
              child: Text(
                l10n.parentSessionsMyRequests,
                style: theme.textTheme.titleSmall?.copyWith(
                  fontWeight: FontWeight.w800,
                  color: DashboardColors.textPrimary,
                ),
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: DashboardColors.brandSoft,
                borderRadius: BorderRadius.circular(999),
              ),
              child: Text(
                '${state.requests.length}',
                style: theme.textTheme.labelMedium?.copyWith(
                  color: DashboardColors.brandCyan,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ),
          ],
        ),
        SizedBox(height: context.dashSpacing * 0.55),
        if (state.isLoading)
          const Center(child: DashboardLoadingCard())
        else if (state.errorMessage != null) ...[
          DashboardErrorCard(
            message: mapParentSessionRequestsError(l10n, state.errorMessage!),
            onRetry: () => ref.read(sessionRequestsProvider.notifier).refresh(),
          ),
        ] else if (state.requests.isEmpty)
          const _EmptySessionRequestsCard()
        else
          ...state.requests.map(
            (request) => Padding(
              padding: EdgeInsets.only(bottom: context.dashSpacing * 0.55),
              child: _SessionRequestCard(request: request),
            ),
          ),
      ],
    );
  }
}

class _EmptySessionRequestsCard extends StatelessWidget {
  const _EmptySessionRequestsCard();

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final theme = Theme.of(context);

    return Container(
      width: double.infinity,
      padding: EdgeInsets.all(context.dashSpacing * 1.1),
      decoration: BoxDecoration(
        color: DashboardColors.surface,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(
          color: DashboardColors.border.withValues(alpha: 0.8),
        ),
      ),
      child: Column(
        children: [
          Icon(
            Icons.inbox_outlined,
            size: context.dashSpacing * 1.8,
            color: DashboardColors.textMuted,
          ),
          SizedBox(height: context.dashSpacing * 0.45),
          Text(
            l10n.parentSessionsNoRequestsTitle,
            style: theme.textTheme.titleSmall?.copyWith(
              fontWeight: FontWeight.w700,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.2),
          Text(
            l10n.parentSessionsNoRequestsMessage,
            textAlign: TextAlign.center,
            style: theme.textTheme.bodyMedium?.copyWith(
              color: DashboardColors.textSecondary,
              height: 1.45,
            ),
          ),
        ],
      ),
    );
  }
}

class _SessionRequestCard extends StatelessWidget {
  const _SessionRequestCard({required this.request});

  final SessionRequestItem request;

  String _formatDate(DateTime? date) {
    if (date == null) {
      return '—';
    }
    return DateFormat('EEE, MMM d, yyyy').format(date);
  }

  String _formatCreatedDate(DateTime? date) {
    if (date == null) {
      return '—';
    }
    return DateFormat('MMM d, yyyy').format(date);
  }

  String _formatTime(DateTime? date) {
    if (date == null) {
      return '—';
    }
    return DateFormat('h:mm a').format(date);
  }

  _RequestStatusVisual _statusVisual(AppLocalizations l10n) {
    final label = localizedSessionRequestStatus(l10n, request.status);
    switch (request.status) {
      case SessionRequestStatus.approved:
        return (
          label: label,
          background: const Color(0xFFEAF8EE),
          foreground: const Color(0xFF2E7D32),
          border: const Color(0xFF2E7D32).withValues(alpha: 0.18),
          icon: Icons.check_circle_outline_rounded,
        );
      case SessionRequestStatus.rejected:
        return (
          label: label,
          background: const Color(0xFFFDECEC),
          foreground: const Color(0xFFD32F2F),
          border: const Color(0xFFD32F2F).withValues(alpha: 0.18),
          icon: Icons.cancel_outlined,
        );
      case SessionRequestStatus.pending:
      default:
        return (
          label: label,
          background: const Color(0xFFFFF8E1),
          foreground: const Color(0xFFF9A825),
          border: const Color(0xFFF9A825).withValues(alpha: 0.22),
          icon: Icons.hourglass_top_rounded,
        );
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final theme = Theme.of(context);
    final statusVisual = _statusVisual(l10n);
    final approvedSession = request.approvedSession;

    return Container(
      width: double.infinity,
      padding: EdgeInsets.all(context.dashSpacing * 0.8),
      decoration: BoxDecoration(
        color: DashboardColors.surface,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(
          color: DashboardColors.border.withValues(alpha: 0.75),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 18,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Text(
                  request.patientName ?? l10n.entityPatient,
                  style: theme.textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
              _RequestStatusChip(visual: statusVisual),
            ],
          ),
          SizedBox(height: context.dashSpacing * 0.35),
          Text(
            localizedSessionRequestReason(l10n, request),
            style: theme.textTheme.bodyMedium?.copyWith(
              color: DashboardColors.textSecondary,
              fontWeight: FontWeight.w600,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.45),
          Wrap(
            spacing: context.dashSpacing * 0.25,
            runSpacing: context.dashSpacing * 0.15,
            children: [
              _RequestMetaItem(
                icon: Icons.calendar_today_outlined,
                label: _formatDate(request.preferredDate),
              ),
              Text(
                '•',
                style: theme.textTheme.bodySmall?.copyWith(
                  color: DashboardColors.textMuted,
                ),
              ),
              _RequestMetaItem(
                icon: Icons.wb_twilight_outlined,
                label: localizedPreferredTimePeriod(
                  l10n,
                  request.preferredTimePeriod,
                ),
              ),
            ],
          ),
          SizedBox(height: context.dashSpacing * 0.35),
          _RequestMetaItem(
            icon: Icons.schedule_rounded,
            label: l10n.parentSessionsRequestedOn(
              _formatCreatedDate(request.createdAt),
            ),
          ),
          if (request.notes != null && request.notes!.trim().isNotEmpty) ...[
            SizedBox(height: context.dashSpacing * 0.45),
            Text(
              request.notes!.trim(),
              style: theme.textTheme.bodySmall?.copyWith(
                color: DashboardColors.textSecondary,
                height: 1.45,
              ),
            ),
          ],
          if (request.status == SessionRequestStatus.rejected &&
              request.rejectionReason != null &&
              request.rejectionReason!.trim().isNotEmpty) ...[
            SizedBox(height: context.dashSpacing * 0.55),
            Container(
              width: double.infinity,
              padding: EdgeInsets.all(context.dashSpacing * 0.55),
              decoration: BoxDecoration(
                color: const Color(0xFFFDECEC),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(
                  color: const Color(0xFFD32F2F).withValues(alpha: 0.15),
                ),
              ),
              child: Text(
                request.rejectionReason!.trim(),
                style: theme.textTheme.bodySmall?.copyWith(
                  color: const Color(0xFFD32F2F),
                  height: 1.45,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ],
          if (request.status == SessionRequestStatus.approved &&
              approvedSession != null) ...[
            SizedBox(height: context.dashSpacing * 0.55),
            Container(
              width: double.infinity,
              padding: EdgeInsets.all(context.dashSpacing * 0.55),
              decoration: BoxDecoration(
                color: const Color(0xFFEAF8EE),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(
                  color: const Color(0xFF2E7D32).withValues(alpha: 0.15),
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    l10n.parentSessionsScheduledAt(
                      _formatDate(approvedSession.scheduledAt),
                      _formatTime(approvedSession.scheduledAt),
                    ),
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: const Color(0xFF2E7D32),
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  if (approvedSession.durationMinutes != null) ...[
                    SizedBox(height: context.dashSpacing * 0.2),
                    Text(
                      l10n.specialistSessionDurationMinutes(
                        approvedSession.durationMinutes!,
                      ),
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: const Color(0xFF2E7D32),
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                  if (approvedSession.locationOrLink != null &&
                      approvedSession.locationOrLink!.trim().isNotEmpty) ...[
                    SizedBox(height: context.dashSpacing * 0.2),
                    Text(
                      approvedSession.locationOrLink!.trim(),
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: const Color(0xFF2E7D32),
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }
}

typedef _RequestStatusVisual = ({
  String label,
  Color background,
  Color foreground,
  Color border,
  IconData icon,
});

class _RequestStatusChip extends StatelessWidget {
  const _RequestStatusChip({required this.visual});

  final _RequestStatusVisual visual;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: visual.background,
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: visual.border),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(visual.icon, size: 14, color: visual.foreground),
          const SizedBox(width: 4),
          Text(
            visual.label,
            style: Theme.of(context).textTheme.labelSmall?.copyWith(
              color: visual.foreground,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }
}

class _RequestMetaItem extends StatelessWidget {
  const _RequestMetaItem({required this.icon, required this.label});

  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 14, color: DashboardColors.textMuted),
        SizedBox(width: context.dashSpacing * 0.12),
        Text(
          label,
          style: theme.textTheme.bodySmall?.copyWith(
            color: DashboardColors.textSecondary,
            fontWeight: FontWeight.w600,
          ),
        ),
      ],
    );
  }
}
