import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../../../core/constants/dashboard_colors.dart';
import '../../../../l10n/app_localizations.dart';
import '../../../dashboard/widgets/dashboard_components.dart';
import '../../../dashboard/widgets/dashboard_layout.dart';
import '../../models/support_request_models.dart';
import '../support_request_localization_utils.dart';
import 'support_request_status_chip.dart';
import 'support_request_thread_widgets.dart';

class SupportRequestTicketHeader extends StatelessWidget {
  const SupportRequestTicketHeader({
    super.key,
    required this.request,
    this.showRequesterInfo = false,
    this.adminStatusActions,
  });

  final SupportRequestItem request;
  final bool showRequesterInfo;
  final Widget? adminStatusActions;

  String _formatDate(DateTime? date, AppLocalizations l10n) {
    if (date == null) return l10n.supportRequestDateUnavailable;
    return DateFormat.yMMMd().add_jm().format(date);
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final theme = Theme.of(context);
    final createdLabel = _formatDate(request.createdAt, l10n);
    final activityLabel = _formatDate(request.lastMessageAt, l10n);
    final resolvedLabel = request.resolvedAt != null
        ? _formatDate(request.resolvedAt, l10n)
        : null;
    final categoryLabel = localizedSupportRequestCategoryLabel(l10n, request.category);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          request.subject,
          style: theme.textTheme.titleLarge?.copyWith(
            fontWeight: FontWeight.w700,
            color: DashboardColors.textPrimary,
            height: 1.25,
          ),
        ),
        SizedBox(height: context.dashSpacing * 0.35),
        Wrap(
          crossAxisAlignment: WrapCrossAlignment.center,
          spacing: 8,
          runSpacing: 6,
          children: [
            Text(
              categoryLabel,
              style: theme.textTheme.bodyMedium?.copyWith(
                fontWeight: FontWeight.w600,
                color: DashboardColors.brandCyan,
              ),
            ),
            SupportRequestStatusChip(status: request.status),
          ],
        ),
        if (showRequesterInfo &&
            (request.specialist.fullName.isNotEmpty ||
                (request.specialist.email?.trim().isNotEmpty ?? false))) ...[
          SizedBox(height: context.dashSpacing * 0.55),
          if (request.specialist.fullName.isNotEmpty)
            Text(
              request.specialist.fullName,
              style: theme.textTheme.bodyMedium?.copyWith(
                fontWeight: FontWeight.w600,
                color: DashboardColors.textPrimary,
              ),
            ),
          if (request.specialist.email != null &&
              request.specialist.email!.trim().isNotEmpty)
            Text(
              request.specialist.email!.trim(),
              style: theme.textTheme.bodySmall?.copyWith(
                color: DashboardColors.textSecondary,
              ),
              softWrap: true,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
        ],
        SizedBox(height: context.dashSpacing * 0.55),
        _MetaLine(label: l10n.supportRequestCreatedLabel, value: createdLabel),
        _MetaLine(label: l10n.supportRequestLastActivityLabel, value: activityLabel),
        if (resolvedLabel != null)
          _MetaLine(label: l10n.supportRequestResolvedDateLabel, value: resolvedLabel),
        if (adminStatusActions != null) ...[
          SizedBox(height: context.dashSpacing * 0.65),
          Divider(height: 1, color: DashboardColors.border.withValues(alpha: 0.85)),
          SizedBox(height: context.dashSpacing * 0.55),
          adminStatusActions!,
        ],
      ],
    );
  }
}

class _MetaLine extends StatelessWidget {
  const _MetaLine({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Padding(
      padding: EdgeInsets.only(bottom: context.dashSpacing * 0.2),
      child: Text.rich(
        TextSpan(
          children: [
            TextSpan(
              text: label,
              style: theme.textTheme.bodySmall?.copyWith(
                color: DashboardColors.textSecondary,
                fontWeight: FontWeight.w600,
              ),
            ),
            TextSpan(
              text: ' · $value',
              style: theme.textTheme.bodySmall?.copyWith(
                color: DashboardColors.textSecondary,
              ),
            ),
          ],
        ),
        softWrap: true,
      ),
    );
  }
}

class SupportRequestAdminStatusActions extends StatelessWidget {
  const SupportRequestAdminStatusActions({
    super.key,
    required this.request,
    required this.isSubmitting,
    required this.onMarkInProgress,
    required this.onMarkResolved,
  });

  final SupportRequestItem request;
  final bool isSubmitting;
  final VoidCallback onMarkInProgress;
  final VoidCallback onMarkResolved;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final theme = Theme.of(context);

    if (request.isResolved) {
      return const SizedBox.shrink();
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              '${l10n.supportRequestRequestStatusLabel}: ',
              style: theme.textTheme.bodySmall?.copyWith(
                color: DashboardColors.textSecondary,
              ),
            ),
            Expanded(
              child: Text(
                localizedSupportRequestStatusLabel(l10n, request.status),
                style: theme.textTheme.bodySmall?.copyWith(
                  fontWeight: FontWeight.w600,
                  color: DashboardColors.textPrimary,
                ),
              ),
            ),
          ],
        ),
        SizedBox(height: context.dashSpacing * 0.45),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: [
            if (request.status == SupportRequestStatus.pending)
              FilledButton(
                onPressed: isSubmitting ? null : onMarkInProgress,
                child: Text(l10n.supportRequestMarkInProgress),
              ),
            if (request.status == SupportRequestStatus.pending ||
                request.status == SupportRequestStatus.inProgress)
              OutlinedButton(
                onPressed: isSubmitting ? null : onMarkResolved,
                child: Text(l10n.supportRequestMarkResolved),
              ),
          ],
        ),
      ],
    );
  }
}

class SupportRequestConversationPanel extends StatelessWidget {
  const SupportRequestConversationPanel({
    super.key,
    required this.messages,
    required this.currentUserRole,
    required this.footer,
  });

  final List<SupportRequestMessage> messages;
  final String currentUserRole;
  final Widget footer;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final theme = Theme.of(context);

    return DecoratedBox(
      decoration: BoxDecoration(
        color: DashboardColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: DashboardColors.border.withValues(alpha: 0.85)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Padding(
            padding: EdgeInsets.fromLTRB(
              context.dashSpacing * 0.85,
              context.dashSpacing * 0.75,
              context.dashSpacing * 0.85,
              context.dashSpacing * 0.35,
            ),
            child: Text(
              l10n.supportRequestConversationTitle,
              style: theme.textTheme.titleSmall?.copyWith(
                fontWeight: FontWeight.w700,
                color: DashboardColors.textPrimary,
              ),
            ),
          ),
          Padding(
            padding: EdgeInsets.symmetric(horizontal: context.dashSpacing * 0.85),
            child: SupportRequestThread(
              messages: messages,
              currentUserRole: currentUserRole,
            ),
          ),
          footer,
        ],
      ),
    );
  }
}

class SupportRequestResolvedNotice extends StatelessWidget {
  const SupportRequestResolvedNotice({
    super.key,
    required this.resolvedAt,
  });

  final DateTime? resolvedAt;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final theme = Theme.of(context);
    final dateLabel = resolvedAt == null
        ? null
        : DateFormat.yMMMd().add_jm().format(resolvedAt!);
    final statusLabel = localizedSupportRequestStatusLabel(
      l10n,
      SupportRequestStatus.resolved,
    );

    return Container(
      width: double.infinity,
      padding: EdgeInsets.symmetric(
        horizontal: context.dashSpacing * 0.85,
        vertical: context.dashSpacing * 0.65,
      ),
      decoration: BoxDecoration(
        color: DashboardColors.success.withValues(alpha: 0.06),
        border: Border(
          top: BorderSide(color: DashboardColors.success.withValues(alpha: 0.18)),
        ),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(
            Icons.check_circle_outline_rounded,
            size: 18,
            color: DashboardColors.success,
          ),
          SizedBox(width: context.dashSpacing * 0.35),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  dateLabel == null ? statusLabel : '$statusLabel · $dateLabel',
                  style: theme.textTheme.bodySmall?.copyWith(
                    fontWeight: FontWeight.w700,
                    color: const Color(0xFF15803D),
                  ),
                ),
                SizedBox(height: 2),
                Text(
                  l10n.supportRequestResolvedReadOnly,
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: DashboardColors.textSecondary,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class SupportRequestReplySection extends StatelessWidget {
  const SupportRequestReplySection({
    super.key,
    required this.controller,
    required this.isSubmitting,
    required this.attachmentFilename,
    required this.onPickAttachment,
    required this.onClearAttachment,
    required this.onSend,
  });

  final TextEditingController controller;
  final bool isSubmitting;
  final String? attachmentFilename;
  final VoidCallback onPickAttachment;
  final VoidCallback onClearAttachment;
  final VoidCallback onSend;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final theme = Theme.of(context);

    return Container(
      width: double.infinity,
      padding: EdgeInsets.fromLTRB(
        context.dashSpacing * 0.85,
        context.dashSpacing * 0.65,
        context.dashSpacing * 0.85,
        context.dashSpacing * 0.85,
      ),
      decoration: BoxDecoration(
        color: DashboardColors.background.withValues(alpha: 0.72),
        border: Border(
          top: BorderSide(color: DashboardColors.border.withValues(alpha: 0.75)),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            l10n.supportRequestReply,
            style: theme.textTheme.labelLarge?.copyWith(
              fontWeight: FontWeight.w700,
              color: DashboardColors.textPrimary,
            ),
          ),
          SizedBox(height: context.dashSpacing * 0.45),
          TextField(
            controller: controller,
            maxLines: 4,
            maxLength: supportRequestMessageMaxLength,
            enabled: !isSubmitting,
            decoration: InputDecoration(
              labelText: l10n.supportRequestReplyLabel,
              hintText: l10n.supportRequestReplyHint,
              filled: true,
              fillColor: DashboardColors.surface,
            ),
          ),
          if (attachmentFilename != null)
            ListTile(
              contentPadding: EdgeInsets.zero,
              title: Text(
                attachmentFilename!,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              trailing: IconButton(
                onPressed: isSubmitting ? null : onClearAttachment,
                icon: const Icon(Icons.close_rounded),
              ),
            )
          else
            Align(
              alignment: AlignmentDirectional.centerStart,
              child: TextButton.icon(
                onPressed: isSubmitting ? null : onPickAttachment,
                icon: const Icon(Icons.attach_file_rounded),
                label: Text(l10n.supportRequestAddAttachment),
              ),
            ),
          SizedBox(height: context.dashSpacing * 0.35),
          BrandGradientButton(
            onPressed: isSubmitting ? null : onSend,
            icon: isSubmitting ? null : Icons.send_rounded,
            label: isSubmitting ? l10n.supportRequestSending : l10n.supportRequestReply,
          ),
        ],
      ),
    );
  }
}
